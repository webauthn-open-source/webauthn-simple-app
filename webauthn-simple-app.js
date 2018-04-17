/* globals
   defaultRoutes, Msg, ServerResponse,
   CreationOptionsRequest, CreationOptions,
   CredentialAttestation,
   GetOptionsRequest, GetOptions,
   CredentialAssertion,
   WebAuthnOptions
 */

"use strict";

// messages for sending / receiving
// registration:
// 1a. client >>> CreationOptionsRequest >>> server
// 1b. client <<< CreationOptions <<< server
// 2a. client >>> CredentialAttestation >>> server
// 2b. client <<< ServerResponse <<< server
// authentication:
// 1a. client >>> GetOptionsRequest >>> server
// 1b. client <<< GetOptions <<< server
// 2a. client >>> CredentialAssertion >>> server
// 2b. client <<< ServerResponse <<< server
(function() {
    /**
     * Virtual class for messages that serves as the base
     * for all other messages.
     */
    class Msg {
        constructor() {
            /** @type {Array} The list of "official" properties that are managed for this object and sent over the wire. */
            this.propList = [];
        }

        /**
         * Converts the `Msg` to an `Object` containing all the properties in `propList` that have been defined on the `Msg`
         * @return {Object} An `Object` that contains all the properties to be sent over the wire.
         */
        toObject() {
            var obj = {};
            copyPropList(this, obj, this.propList);
            return obj;
        }

        /**
         * Converts the `Msg` to a JSON string containing all the properties in `propList` that have been defined on the `Msg`
         * @return {String} A JSON `String` that contains all the properties to be sent over the wire.
         */
        toString() {
            return JSON.stringify(this.toObject());
        }

        /**
         * Converts the `Msg` to a human-readable string. Useful for debugging messages as they are being sent / received.
         * @return {String} The human-readable message, probably multiple lines.
         */
        toHumanString() {
            return JSON.stringify(this.toObject(), undefined, 4);
        }

        /**
         * Ensures that all the required properties in the object are defined, and all defined properties are of the correct format.
         * @throws {Error} If any required field is undefined, or any defined field is of the wrong format.
         */
        validate() {
            throw new Error("not implemented");
        }

        /**
         * Any fields that are known to be encoded as `base64url` are decoded to an `ArrayBuffer`
         */
        decodeBinaryProperties() {
            throw new Error("not implemented");
        }

        /**
         * Any fields that are known to be encoded as an `ArrayBuffer` are encoded as `base64url`
         */
        encodeBinaryProperties() {
            throw new Error("not implemented");
        }

        /**
         * Creates a new `Msg` object from the specified parameter. Note that the resulting `Msg` is not validated
         * and all fields are their original values (call {@link decodeBinaryProperties} to convert fields to ArrayBuffers)
         * if needed.
         * @param  {String|Object} json The JSON encoded string, or already parsed JSON message in an `Object`
         * @return {Msg}      The newly created message from the Object.
         */
        static from(json) {
            var obj;
            if (typeof json === "string") {
                try {
                    obj = JSON.parse(json);
                } catch (err) {
                    throw new TypeError("error parsing JSON string");
                }
            }

            if (typeof json === "object") {
                obj = json;
            }

            if (typeof obj !== "object") {
                throw new TypeError("could not coerce 'json' argument to an object");
            }

            var msg = new this.prototype.constructor();
            copyPropList(obj, msg, msg.propList);

            if (obj.preferences) {
                msg.preferences = WebAuthnOptions.from(obj.preferences);
            }

            return msg;
        }
    }

    /**
     * Generic {@link Msg} from server to indicate success or failure. Used by
     * itself for simple responses, or extended for more complex responses.
     * @extends {Msg}
     */
    class ServerResponse extends Msg {
        constructor() {
            super();

            this.propList = [
                "status",
                "errorMessage"
            ];
        }

        validate() {
            switch (this.status) {
                case "ok":
                    if (this.errorMessage === undefined) {
                        this.errorMessage = "";
                    }

                    // if status is "ok", errorMessage must be ""
                    checkTrue(this.errorMessage === "", "errorMessage must be empty string when status is 'ok'");
                    break;

                case "failed":
                    // if status is "failed", errorMessage must be non-zero-length string
                    checkType(this, "errorMessage", "string");
                    checkTrue(
                        this.errorMessage.length > 0,
                        "errorMessage must be non-zero length when status is 'failed'"
                    );
                    break;

                // status is string, either "ok" or "failed"
                default:
                    throw new Error("'expected 'status' to be 'string', got: " + this.status);
            }
        }

        decodeBinaryProperties() {}

        encodeBinaryProperties() {}
    }

    /**
     * A {@link Msg} object that the browser sends to the server to request
     * the options to be used for the WebAuthn `create()` call.
     * @extends {Msg}
     */
    class CreationOptionsRequest extends Msg {
        constructor() {
            super();

            this.propList = [
                "username",
                "displayName",
                "authenticatorSelection",
                "attestation"
            ];
        }

        validate() {
            checkFormat(this, "username", "non-empty-string");
            checkFormat(this, "displayName", "non-empty-string");
            checkAuthenticatorSelection(this);
            checkAttestation(this);
        }

        decodeBinaryProperties() {}

        encodeBinaryProperties() {}
    }

    /**
     * The options to be used for WebAuthn `create()`
     * @extends {ServerResponse}
     */
    class CreationOptions extends ServerResponse {
        constructor() {
            super();

            this.propList = this.propList.concat([
                "rp",
                "user",
                "challenge",
                "pubKeyCredParams",
                "timeout",
                "excludeCredentials",
                "authenticatorSelection",
                "attestation",
                "extensions"
            ]);
        }

        validate() {
            super.validate();

            // check types
            checkType(this, "rp", Object);
            checkFormat(this.rp, "name", "non-empty-string");
            checkOptionalFormat(this.rp, "id", "non-empty-string");
            checkOptionalFormat(this.rp, "icon", "non-empty-string");

            checkType(this, "user", Object);
            checkFormat(this.user, "name", "non-empty-string");
            checkFormat(this.user, "id", "base64url");
            checkFormat(this.user, "displayName", "non-empty-string");
            checkOptionalFormat(this.user, "icon", "non-empty-string");

            checkFormat(this, "challenge", "base64url");
            checkType(this, "pubKeyCredParams", Array);
            this.pubKeyCredParams.forEach(function(cred) {
                checkType(cred, "alg", "number");
                checkTrue(cred.type === "public-key", "credential type must be 'public-key'");
            });
            checkOptionalFormat(this, "timeout", "positive-integer");
            checkOptionalType(this, "excludeCredentials", Array);
            if (this.excludeCredentials) checkCredentialDescriptorList(this.excludeCredentials);

            checkAuthenticatorSelection(this);
            checkAttestation(this);

            checkOptionalType(this, "extensions", Object);
        }

        decodeBinaryProperties() {
            if (this.user.id) {
                this.user.id = coerceToArrayBuffer(this.user.id, "user.id");
            }

            this.challenge = coerceToArrayBuffer(this.challenge, "challenge");

            if (this.excludeCredentials) {
                this.excludeCredentials.forEach(function (cred, idx) {
                    cred.id = coerceToArrayBuffer(cred.id, "excludeCredentials[" + idx + "].id");
                });
            }
        }

        encodeBinaryProperties() {
            if (this.user.id) {
                this.user.id = coerceToBase64Url(this.user.id, "user.id");
            }

            this.challenge = coerceToBase64Url(this.challenge, "challenge");

            if (this.excludeCredentials) {
                this.excludeCredentials.forEach(function (cred, idx) {
                    cred.id = coerceToBase64Url(cred.id, "excludeCredentials[" + idx + "].id");
                });
            }
        }
    }

    /**
     * This is the `PublicKeyCredential` that was the result of the `create()` call.
     * @extends {Msg}
     */
    class CredentialAttestation extends Msg {
        constructor() {
            super();

            this.propList = [
                "rawId",
                "response"
            ];
        }

        validate() {
            checkFormat(this, "rawId", "base64url");
            checkType(this, "response", Object);
            checkFormat(this.response, "attestationObject", "base64url");
            checkFormat(this.response, "clientDataJSON", "base64url");
        }

        decodeBinaryProperties() {
            this.rawId = coerceToArrayBuffer(this.rawId, "rawId");
            this.response.attestationObject = coerceToArrayBuffer(this.response.attestationObject, "response.attestationObject");
            this.response.clientDataJSON = coerceToArrayBuffer(this.response.clientDataJSON, "response.clientDataJSON");
        }

        encodeBinaryProperties() {
            this.rawId = coerceToBase64Url(this.rawId, "rawId");
            this.response.attestationObject = coerceToBase64Url(this.response.attestationObject, "response.attestationObject");
            this.response.clientDataJSON = coerceToBase64Url(this.response.clientDataJSON, "response.clientDataJSON");
        }
    }

    /**
     * A {@link Msg} object that the browser sends to the server to request
     * the options to be used for the WebAuthn `get()` call.
     * @extends {Msg}
     */
    class GetOptionsRequest extends Msg {
        constructor() {
            super();

            this.propList = [
                "username",
                "displayName"
            ];
        }

        validate() {
            checkFormat(this, "username", "non-empty-string");
            checkFormat(this, "displayName", "non-empty-string");
        }

        decodeBinaryProperties() {}

        encodeBinaryProperties() {}
    }

    /**
     * The options to be used for WebAuthn `get()`
     * @extends {ServerResponse}
     */
    class GetOptions extends ServerResponse {
        constructor() {
            super();

            this.propList = this.propList.concat([
                "challenge",
                "timeout",
                "rpId",
                "allowCredentials",
                "userVerification",
                "extensions"
            ]);
        }

        validate() {
            super.validate();
            checkFormat(this, "challenge", "base64url");
            checkOptionalFormat(this, "timeout", "positive-integer");
            checkOptionalFormat(this, "rpId", "non-empty-string");
            checkOptionalType(this, "allowCredentials", Array);
            if (this.allowCredentials) checkCredentialDescriptorList(this.allowCredentials);
            if (this.userVerification) checkUserVerification(this.userVerification);
            checkOptionalType(this, "extensions", Object);
        }

        decodeBinaryProperties() {
            this.challenge = coerceToArrayBuffer(this.challenge, "challenge");
            if (this.allowCredentials) {
                this.allowCredentials.forEach(function (cred) {
                    cred.id = coerceToArrayBuffer(cred.id, "cred.id");
                });
            }
        }

        encodeBinaryProperties() {
            this.challenge = coerceToBase64Url(this.challenge, "challenge");
            if (this.allowCredentials) {
                this.allowCredentials.forEach(function (cred, idx) {
                    cred.id = coerceToBase64Url(cred.id, "allowCredentials[" + idx + "].id");
                });
            }
        }
    }

    /**
     * This is the `PublicKeyCredential` that was the result of the `get()` call.
     * @extends {Msg}
     */
    class CredentialAssertion extends Msg {
        constructor() {
            super();

            this.propList = [
                "rawId",
                "response"
            ];
        }

        validate() {
            checkFormat(this, "rawId", "base64url");
            checkType(this, "response", Object);
            checkFormat(this.response, "authenticatorData", "base64url");
            checkFormat(this.response, "clientDataJSON", "base64url");
            checkFormat(this.response, "signature", "base64url");
            checkOptionalFormat(this.response, "userHandle", "nullable-string");
        }

        decodeBinaryProperties() {
            this.rawId = coerceToArrayBuffer(this.rawId, "rawId");
            this.response.clientDataJSON = coerceToArrayBuffer(this.response.clientDataJSON, "response.clientDataJSON");
            this.response.signature = coerceToArrayBuffer(this.response.signature, "response.signature");
            this.response.authenticatorData = coerceToArrayBuffer(this.response.authenticatorData, "response.authenticatorData");
        }

        encodeBinaryProperties() {
            this.rawId = coerceToBase64Url(this.rawId, "rawId");
            this.response.clientDataJSON = coerceToBase64Url(this.response.clientDataJSON, "response.clientDataJSON");
            this.response.signature = coerceToBase64Url(this.response.signature, "response.signature");
            this.response.authenticatorData = coerceToBase64Url(this.response.authenticatorData, "response.authenticatorData");
        }
    }

    class WebAuthnOptions extends Msg {
        constructor() {
            super();

            this.propList = [
                "timeout"
            ];
        }

        merge(dst, preferDst) {
            var i;
            for (i = 0; i < this.propList.length; i++) {
                var prop = this.propList[i];
                // copy property if it isn't set
                if (this[prop] === undefined) this[prop] = dst[prop];
                // if the destination is set and we prefer that, copy it over
                if (preferDst && dst[prop] !== undefined) this[prop] = dst[prop];
            }
        }
    }

    // these get defined different depending on whether we're running in a browser or node.js
    var exp, coerceToBase64Url, coerceToArrayBuffer;

    // running in node.js
    if (typeof module === "object" && module.exports) {
        exp = module.exports;
        coerceToBase64Url = function(thing, name) {
            name = name || "''";

            // Array to Uint8Array
            if (Array.isArray(thing)) {
                thing = Uint8Array.from(thing);
            }

            // Uint8Array, etc. to ArrayBuffer
            if (typeof thing === "object" &&
                thing.buffer instanceof ArrayBuffer &&
                !(thing instanceof Buffer)) {
                thing = thing.buffer;
            }

            // ArrayBuffer to Buffer
            if (thing instanceof ArrayBuffer && !(thing instanceof Buffer)) {
                thing = new Buffer(thing);
            }

            // Buffer to base64 string
            if (thing instanceof Buffer) {
                thing = thing.toString("base64");
            }

            if (typeof thing !== "string") {
                throw new Error(`could not coerce '${name}' to string`);
            }

            // base64 to base64url
            // NOTE: "=" at the end of challenge is optional, strip it off here so that it's compatible with client
            thing = thing.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, "");

            return thing;
        };

        coerceToArrayBuffer = function(buf, name) {
            name = name || "''";

            if (typeof buf === "string") {
                // base64url to base64
                buf = buf.replace(/-/g, "+").replace(/_/g, "/");
                // base64 to Buffer
                buf = Buffer.from(buf, "base64");
            }

            // Buffer or Array to Uint8Array
            if (buf instanceof Buffer || Array.isArray(buf)) {
                buf = new Uint8Array(buf);
            }

            // Uint8Array to ArrayBuffer
            if (buf instanceof Uint8Array) {
                buf = buf.buffer;
            }

            // error if none of the above worked
            if (!(buf instanceof ArrayBuffer)) {
                throw new TypeError(`could not coerce '${name}' to ArrayBuffer`);
            }

            return buf;
        };
    }

    // running in browser
    try {
        if (window) exp = window;
        coerceToBase64Url = function(thing, name) {
            // Array or ArrayBuffer to Uint8Array
            if (Array.isArray(thing)) {
                thing = Uint8Array.from(thing);
            }

            if (thing instanceof ArrayBuffer) {
                thing = new Uint8Array(thing);
            }

            // Uint8Array to base64
            if (thing instanceof Uint8Array) {
                var str = "";
                var len = thing.byteLength;

                for (var i = 0; i < len; i++) {
                    str += String.fromCharCode(thing[i]);
                }
                thing = window.btoa(str);
            }

            if (typeof thing !== "string") {
                throw new Error("could not coerce '" + name + "' to string");
            }

            // base64 to base64url
            // NOTE: "=" at the end of challenge is optional, strip it off here
            thing = thing.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, "");

            return thing;
        };

        coerceToArrayBuffer = function(thing, name) {
            if (typeof thing === "string") {
                // base64url to base64
                thing = thing.replace(/-/g, "+").replace(/_/g, "/");

                // base64 to Uint8Array
                var str = window.atob(thing);
                var bytes = new Uint8Array(str.length);
                for (var i = 0; i < str.length; i++) {
                    bytes[i] = str.charCodeAt(i);
                }
                thing = bytes;
            }

            // Array to Uint8Array
            if (Array.isArray(thing)) {
                thing = new Uint8Array(thing);
            }

            // Uint8Array to ArrayBuffer
            if (thing instanceof Uint8Array) {
                thing = thing.buffer;
            }

            // error if none of the above worked
            if (!(thing instanceof ArrayBuffer)) {
                throw new TypeError("could not coerce '" + name + "' to ArrayBuffer");
            }

            return thing;
        };
    } catch (err) {
        // ignore
    }

    function copyProp(src, dst, prop) {
        if (src[prop] !== undefined) dst[prop] = src[prop];
    }

    function copyPropList(src, dst, propList) {
        var i;
        for (i = 0; i < propList.length; i++) {
            copyProp(src, dst, propList[i]);
        }
    }

    function checkType(obj, prop, type) {
        switch (typeof type) {
            case "string":
                if (typeof obj[prop] !== type) {
                    throw new Error("expected '" + prop + "' to be '" + type + "', got: " + typeof obj[prop]);
                }
                break;

            case "function":
                if (!(obj[prop] instanceof type)) {
                    throw new Error("expected '" + prop + "' to be '" + type.name + "', got: " + obj[prop]);
                }
                break;

            default:
                throw new Error("internal error: checkType received invalid type");
        }
    }

    function checkOptionalType(obj, prop, type) {
        if (obj === undefined || obj[prop] === undefined) return;

        checkType(obj, prop, type);
    }

    function checkFormat(obj, prop, format) {
        switch (format) {
            case "non-empty-string":
                checkType(obj, prop, "string");
                checkTrue(
                    obj[prop].length > 0,
                    "expected '" + prop + "' to be non-empty string"
                );
                break;
            case "base64url":
                checkType(obj, prop, "string");
                checkTrue(
                    isBase64Url(obj[prop]),
                    "expected '" + prop + "' to be base64url format, got: " + obj[prop]
                );
                break;
            case "positive-integer":
                checkType(obj, prop, "number");
                var n = obj[prop];
                checkTrue(
                    n >>> 0 === parseFloat(n),
                    "expected '" + prop + "' to be positive integer"
                );
                break;
            case "nullable-string":
                var t = typeof obj[prop];
                checkTrue(
                    ["null", "string", "undefined"].includes(t),
                    "expected '" + prop + "' to be null or string"
                );
                break;
            default:
                throw new Error("internal error: unknown format");
        }
    }

    function checkOptionalFormat(obj, prop, format) {
        if (obj === undefined || obj[prop] === undefined) return;

        checkFormat(obj, prop, format);
    }

    function isBase64Url(str) {
        return !!str.match(/^[A-Za-z0-9\-_]+={0,2}$/);
    }

    function checkTrue(truthy, msg) {
        if (!truthy) {
            throw Error(msg);
        }
    }

    function checkUserVerification(val) {
        checkTrue(
            ["required", "preferred", "discouraged"].includes(val),
            "userVerification must be 'required', 'preferred' or 'discouraged'"
        );
    }

    function checkAuthenticatorSelection(obj) {
        checkOptionalType(obj, "authenticatorSelection", Object);
        if (obj.authenticatorSelection && obj.authenticatorSelection.authenticatorAttachment) {
            checkTrue(
                ["platform", "cross-platform"].includes(obj.authenticatorSelection.authenticatorAttachment),
                "authenticatorAttachment must be either 'platform' or 'cross-platform'"
            );
        }
        if (obj.authenticatorSelection && obj.authenticatorSelection.userVerification) {
            checkUserVerification(obj.authenticatorSelection.userVerification);

        }
        checkOptionalType(obj.authenticatorSelection, "requireResidentKey", "boolean");
    }

    function checkCredentialDescriptorList(arr) {
        arr.forEach(function(cred) {
            checkFormat(cred, "id", "base64url");
            checkTrue(cred.type === "public-key", "credential type must be 'public-key'");
            checkOptionalType(cred, "transports", Array);
            if (cred.transports) cred.transports.forEach(function(trans) {
                checkTrue(
                    ["usb", "nfc", "ble"].includes(trans),
                    "expected transport to be 'usb', 'nfc', or 'ble', got: " + trans
                );
            });
        });
    }

    function checkAttestation(obj) {
        if (obj.attestation) checkTrue(
            ["direct", "none", "indirect"].includes(obj.attestation),
            "expected attestation to be 'direct', 'none', or 'indirect'"
        );
    }

    // exports
    exp.defaultRoutes = {
        attestationOptions: "/attestation/options",
        attestationResult: "/attestation/result",
        assertionOptions: "/assertion/options",
        assertionResult: "/assertion/result"
    };
    exp.coerceToBase64Url = coerceToBase64Url;
    exp.coerceToArrayBuffer = coerceToArrayBuffer;
    exp.Msg = Msg;
    exp.ServerResponse = ServerResponse;
    exp.CreationOptionsRequest = CreationOptionsRequest;
    exp.CreationOptions = CreationOptions;
    exp.CredentialAttestation = CredentialAttestation;
    exp.GetOptionsRequest = GetOptionsRequest;
    exp.GetOptions = GetOptions;
    exp.CredentialAssertion = CredentialAssertion;
    exp.WebAuthnOptions = WebAuthnOptions;
}());

// WebAuthnApp class, only loaded in browser
(function() {
    // Useful constants for working with COSE key objects
    const coseAlgECDSAWithSHA256 = -7;

    try {
        if (!window) return null;
    } catch (err) {
        if (err instanceof ReferenceError &&
            err.message === "window is not defined") {
            return null;
        }
        throw err;
    }


    window.addEventListener("load", function(event) {
        console.log("I'm loaded.");
        // check for secure context
        var eNotSupported;
        if (!window.isSecureContext) {
            fireNotSupported("This web page was not loaded in a secure context (https). Please try loading the page again using https or make sure you are using a browser with secure context support.");
            return null;
        }

        // check for WebAuthn CR features
        if (typeof window.PublicKeyCredential !== "function" && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
            fireNotSupported("WebAuthn is not currently supported by this browser. See this webpage for a list of supported browsers: <a href=https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#Browser_compatibility>Web Authentication: Browser Compatibility</a>");
            return null;
        }
    });

    function fireEvent(type, data) {
        var e = new CustomEvent(type, { detail: data });
        document.dispatchEvent(e);
    }

    function fireNotSupported(reason) {
        fireEvent("webauthn-not-supported", reason);
        fireDebug("not-supported", reason);
    }

    function fireDebug(subtype, data) {
        fireEvent("webauthn-debug", {
            subtype: subtype,
            data: data
        });
    }

    function WebAuthnResult(opt) {
        var success = true;
        var msg = opt;
        var err = null;

        if (opt instanceof Error) {
            success = false;
            msg = opt.message;
            err = opt;
        }

        return {
            success: success,
            msg: msg,
            err: err
        };
    }

    function WebAuthnApp(config) {

        // configure or defaults
        config = config || {};
        this.registerChallengeEndpoint = config.registerChallengeEndpoint || "/webauthn/register/challenge";
        this.registerResponseEndpoint = config.registerResponseEndpoint || "/webauthn/register/response";
        this.loginChallengeEndpoint = config.loginChallengeEndpoint || "/webauthn/login/challenge";
        this.loginResponseEndpoint = config.loginResponseEndpoint || "/webauthn/login/response";
        this.registerChallengeMethod = config.registerChallengeMethod || "POST";
        this.registerResponseMethod = config.registerResponseMethod || "POST";
        this.loginChallengeMethod = config.loginChallengeMethod || "POST";
        this.loginResponseMethod = config.loginResponseMethod || "POST";
        this.timeout = config.timeout || 60000; // one minute
        this.alg = config.alg || coseAlgECDSAWithSHA256;
        this.binaryEncoding = config.binaryEncoding;
        // TODO: relying party name
        this.appName = config.appName || window.location.hostname;
        this.username = config.username;
        this.debug = function() {};
    }

    WebAuthnApp.prototype.register = function() {
        fireDebug("webauthn-register-start");
        var self = this;
        // get challenge
        return this.getRegisterChallenge()
            .then(function(serverMsg) {
                console.log("serverMsg", serverMsg);
                if (serverMsg.status != 200) {
                    throw new Error("Server responded with status: " + serverMsg.errorMsg);
                }
                if (!serverMsg.response || !serverMsg.response.challenge) {
                    throw new Error("Malformatted server response: " + serverMsg);
                }

                // call webauthn
                return self.webAuthnCreate(serverMsg.response);
            })
            .then(function(newCred) {
                fireEvent("webauthn-user-presence-done");
                fireDebug("create-result", newCred);

                // send response
                return self.sendRegisterResponse(newCred);
            })
            .then(function(msg) {
                console.log("RESPONSE:", msg);

                var result = new WebAuthnResult("You are now registered.");
                console.log("result");
                var eRegComplete = new CustomEvent("webauthn-register-complete", { detail: result });
                document.dispatchEvent(eRegComplete);

                // console.log("msg.status !== 200", msg.status !== 200);
                // console.log("!msg.response.success", !msg.response.success);
                if (msg.status != 200 || !msg.response.success) {
                    throw new Error("registration failed: " + msg.errorMsg);
                }

                return msg;
            })
            .catch(function(err) {
                console.log("REGISTER FAILED!\n", err);
                var eRegComplete = new CustomEvent("webauthn-register-complete", { detail: new WebAuthnResult(err) });
                document.dispatchEvent(eRegComplete);
            })
            .finally(function() {
                fireDebug("webauthn-register-done");
            });
    };

    WebAuthnApp.prototype.login = function() {
        fireDebug("webauthn-login-start");
        var self = this;
        // get challenge
        return this.getLoginChallenge()
            .then(function(serverMsg) {
                console.log("serverMsg", serverMsg);
                if (serverMsg.status != 200) {
                    throw new Error("Server responded with status: " + serverMsg.errorMsg);
                }
                if (!serverMsg.response || !serverMsg.response.challenge) {
                    throw new Error("Malformatted server response: " + serverMsg);
                }

                // call webauthn
                return self.webAuthnGet(serverMsg.response);
            })
            .then(function(assn) {
                var eRegDone = new CustomEvent("webauthn-user-presence-done");
                document.dispatchEvent(eRegDone);

                // send response
                return self.sendLoginResponse(assn);
            })
            .then(function(msg) {
                console.log("RESPONSE:", msg);

                var eLoginComplete = new CustomEvent("webauthn-login-complete", { detail: new WebAuthnResult("You are now logged in.") });
                document.dispatchEvent(eLoginComplete);

                if (msg.status != 200 || !msg.response.success) {
                    throw new Error("registration failed: " + msg.errorMsg);
                }

                return msg;
            })
            .catch(function(err) {
                console.log("LOGIN FAILED!\n", err);
                fireDebug("");
                var eLoginComplete = new CustomEvent("webauthn-login-complete", { detail: new WebAuthnResult(err) });
                document.dispatchEvent(eLoginComplete);
            })
            .finally(function() {
                fireDebug("webauthn-login-done");
            });
    };

    WebAuthnApp.prototype.webAuthnCreate = function(serverResponse) {
        console.log("server response", serverResponse);
        var options = {
            publicKey: {
                rp: {
                    id: serverResponse.serverDomain,
                    name: serverResponse.serverName || this.appName,
                    icon: serverResponse.serverIcon || this.icon
                },
                user: {
                    id: str2ab(serverResponse.userId || serverResponse.username || this.username),
                    name: serverResponse.username || this.username,
                    displayName: serverResponse.displayName || serverResponse.username || this.username,
                    icon: serverResponse.userIcon
                },
                challenge: decodeString(serverResponse.challenge, serverResponse.binaryEncoding || this.binaryEncoding),
                pubKeyCredParams: [{
                    type: "public-key",
                    alg: serverResponse.alg || this.alg
                }],
                timeout: serverResponse.timeout || this.timeout,
                attestation: serverResponse.attestation || this.attestation || "indirect"
                // excludeCredentials
                // authenticatorSelection
                // extensions
            }
        };
        // TODO: other options (excludeCredentials, extensions, algorithmList instead of alg, etc)\

        console.log("credentials.create options:", options);
        printHex("challenge", options.publicKey.challenge);
        printHex("user.id", options.publicKey.user.id);

        var eRegStart = new CustomEvent("webauthn-user-presence-start");
        document.dispatchEvent(eRegStart);

        return navigator.credentials.create(options);
    };

    WebAuthnApp.prototype.webAuthnGet = function(serverResponse) {
        var idList = serverResponse.credIdList;
        console.log("idList before", idList);
        idList = idList.map((id) => ({
            type: "public-key",
            id: decodeString(id, serverResponse.binaryEncoding || this.binaryEncoding)
        }));

        console.log("ID LIST", idList);
        var options = {
            publicKey: {
                challenge: decodeString(serverResponse.challenge, serverResponse.binaryEncoding || this.binaryEncoding),
                timeout: serverResponse.timeout || this.timeout,
                // rpId
                allowCredentials: idList
                // userVerfification
                // extensions
            }
        };

        fireEvent("webauthn-user-presence-start");
        fireDebug("user-presence-start", options);
        return navigator.credentials.get(options);
    };

    WebAuthnApp.prototype.getRegisterChallenge = function() {
        var sendData = CreationOptionsRequest.from({
            username: this.username,
            displayName: this.displayName || this.username
        });

        return this.send(
            this.registerChallengeMethod,
            this.registerChallengeEndpoint,
            sendData,
            CreationOptions
        );
    };

    WebAuthnApp.prototype.sendRegisterResponse = function(pkCred) {
        let encoding = "base64";
        // console.log("pkCred");
        // printHex("attestationObject", pkCred.response.attestationObject);
        // printHex("clientDataJSON", pkCred.response.clientDataJSON);
        var msg = {
            binaryEncoding: encoding,
            username: this.username,
            rawId: encodeBuffer(pkCred.rawId, encoding),
            id: encodeBuffer(pkCred.rawId, encoding),
            response: {
                attestationObject: encodeBuffer(pkCred.response.attestationObject, encoding),
                clientDataJSON: encodeBuffer(pkCred.response.clientDataJSON, encoding)
            }
        };
        msg = CredentialAttestation.from(msg);

        return this.send(
            this.registerResponseMethod,
            this.registerResponseEndpoint,
            msg,
            ServerResponse
        );
    };

    WebAuthnApp.prototype.getLoginChallenge = function() {
        var sendData = {
            username: this.username
        };

        return this.send(
            this.loginChallengeMethod,
            this.loginChallengeEndpoint,
            sendData
        );
    };

    WebAuthnApp.prototype.sendLoginResponse = function(assn) {
        var encoding = "base64";

        var msg = {
            binaryEncoding: encoding,
            username: this.username,
            rawId: encodeBuffer(assn.rawId, encoding),
            id: encodeBuffer(assn.rawId, encoding),
            response: {
                clientDataJSON: encodeBuffer(assn.response.clientDataJSON, encoding),
                authenticatorData: encodeBuffer(assn.response.authenticatorData, encoding),
                signature: encodeBuffer(assn.response.signature, encoding),
                userHandle: encodeBuffer(assn.response.userHandle, encoding)
            }
        };

        return this.send(
            this.loginResponseMethod,
            this.loginResponseEndpoint,
            msg
        );
    };

    WebAuthnApp.prototype.send = function(method, url, data, responseConstructor) {
        // check args
        if (method !== "POST") {
            return Promise.reject(new Error("why not POST your data?"));
        }

        if (typeof url !== "string") {
            return Promise.reject(new Error("expected 'url' to be 'string', got: " + typeof url));
        }

        if (!(data instanceof Msg)) {
            return Promise.reject(new Error("expected 'data' to be instance of 'Msg'"));
        }

        if (typeof responseConstructor !== "function") {
            return Promise.reject(new Error("expected 'responseConstructor' to be 'function', got: " + typeof responseConstructor));
        }

        // validate the data we're sending
        try {
            data.validate();
        } catch (err) {
            console.log("validation error", err);
            return Promise.reject(err);
        }

        // TODO: maybe some day upgrade to fetch(); have to change the mock in the tests too
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            function rejectWithFailed(errorMessage) {
                return reject(new Error(errorMessage));
            }

            xhr.open(method, url, true);
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.onload = function() {
                fireDebug("response-raw", {
                    status: xhr.status,
                    body: xhr.responseText
                });

                if (xhr.status !== 200) {
                    return rejectWithFailed("server returned status: " + xhr.status);
                }

                if (xhr.readyState !== 4) {
                    return rejectWithFailed("server returned ready state: " + xhr.readyState);
                }

                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (err) {
                    return rejectWithFailed("error parsing JSON response: '" + xhr.responseText + "'");
                }

                var msg = responseConstructor.from(response[0]);

                if (msg.status === "failed") {
                    return rejectWithFailed(msg.errorMessage);
                }

                try {
                    msg.validate();
                } catch (err) {
                    return rejectWithFailed(err.message);
                }

                fireDebug("response-validated", {
                    status: xhr.status,
                    body: xhr.responseText
                });
                return resolve(msg);
            };
            xhr.onerror = function() {
                fireDebug("response", new Error("failed due to unspecified error"));
                return rejectWithFailed("POST to URL failed:" + url);
            };
            fireDebug("send", data);
            xhr.send(data.toString());
        });
    };

    function printHex(msg, buf) {
        // if the buffer was a TypedArray (e.g. Uint8Array), grab its buffer and use that
        if (ArrayBuffer.isView(buf) && buf.buffer instanceof ArrayBuffer) {
            buf = buf.buffer;
        }

        // check the arguments
        if ((typeof msg != "string") ||
            (typeof buf != "object")) {
            console.log("Bad args to printHex");
            return;
        }
        if (!(buf instanceof ArrayBuffer)) {
            console.log("Attempted printHex with non-ArrayBuffer:", buf);
            return;
        }
        // print the buffer as a 16 byte long hex string
        var arr = new Uint8Array(buf);
        var len = buf.byteLength;
        var i, str = "";
        console.log(msg);
        for (i = 0; i < len; i++) {
            var hexch = arr[i].toString(16);
            hexch = (hexch.length == 1) ? ("0" + hexch) : hexch;
            str += hexch.toUpperCase() + " ";
            if (i && !((i + 1) % 16)) {
                console.log(str);
                str = "";
            }
        }
        // print the remaining bytes
        if ((i) % 16) {
            console.log(str);
        }
    }

    // global class
    window.WebAuthnApp = WebAuthnApp;
}());
