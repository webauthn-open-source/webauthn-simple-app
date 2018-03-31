/* eslint-disable strict */

(function() {
    // Useful constants for working with COSE key objects
    const cose_kty = 1;
    const cose_kty_ec2 = 2;
    const cose_alg = 3;
    const cose_alg_ECDSA_w_SHA256 = -7;
    const cose_alg_ECDSA_w_SHA512 = -36;
    const cose_crv = -1;
    const cose_crv_P256 = 1;
    const cose_crv_x = -2;
    const cose_crv_y = -3;

    window.addEventListener("load", function(event) {
        console.log("I'm loaded.");
        // check for secure context
        var eNotSupported;
        if (!window.isSecureContext) {
            eNotSupported = new CustomEvent("webauthn-not-supported", { detail: "This web page was not loaded in a secure context (https). Please try loading the page again using https or make sure you are using a browser with secure context support." });
            document.dispatchEvent(eNotSupported);
            console.log("webAuthnApp: not in a secure context, application not loading");
            return null;
        }

        // check for navigator.credentials.create
        if (typeof navigator.credentials !== "object" || typeof navigator.credentials.create !== "function") {
            eNotSupported = new CustomEvent("webauthn-not-supported", { detail: "WebAuthn is not currently supported by this browser. See this webpage for a list of supported browsers: <a href=https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#Browser_compatibility>Web Authentication: Browser Compatibility</a>" });
            document.dispatchEvent(eNotSupported);
            console.log("webAuthnApp: WebAuthn interface not supported, application not loading");
            return null;
        }

        // Chrome 65 & 66 have navigator.credentials.create but it doesn't actually work unless you launch with a flag
        function getChromeVersion() {
            var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
            return raw ? parseInt(raw[2], 10) : false;
        }

        var chromeVersion = getChromeVersion();
        if (chromeVersion && getChromeVersion() < 67) {
            eNotSupported = new CustomEvent("webauthn-not-supported", { detail: "WebAuthn is not currently supported by this browser. See this webpage for a list of supported browsers: <a href=https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#Browser_compatibility>Web Authentication: Browser Compatibility</a>" });
            document.dispatchEvent(eNotSupported);
            console.log("webAuthnApp: WebAuthn interface not supported, Chrome must be version 67 or higher");
            return null;
        }
    });

    // TODO:
    // ClientPreference class
    // ServerMsg class
    // ServerResponse class

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
        this.alg = config.alg || cose_alg_ECDSA_w_SHA256;
        this.binaryEncoding = config.binaryEncoding;
        // TODO: relying party name
        this.appName = config.appName || window.location.hostname;
        this.username = config.username;
        this.debug = function() {};
    }

    WebAuthnApp.prototype.debug = function() {
        this.debug = console.log;
    };

    WebAuthnApp.prototype.register = function() {
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
                console.log("newCred", newCred);
                var eRegDone = new CustomEvent("webauthn-user-presence-done");
                document.dispatchEvent(eRegDone);

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
            });
    };

    WebAuthnApp.prototype.login = function() {
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
                var eLoginComplete = new CustomEvent("webauthn-login-complete", { detail: new WebAuthnResult(err) });
                document.dispatchEvent(eLoginComplete);
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

        console.log("GET OPTIONS:", options);

        var eRegStart = new CustomEvent("webauthn-user-presence-start");
        document.dispatchEvent(eRegStart);

        return navigator.credentials.get(options);
    };

    WebAuthnApp.prototype.getRegisterChallenge = function() {
        var sendData = {
            username: this.username
        };

        return this.send(
            this.registerChallengeMethod,
            this.registerChallengeEndpoint,
            sendData
        );
    };

    WebAuthnApp.prototype.sendRegisterResponse = function(pkCred) {
        let encoding = "base64";
        printHex("attestationObject", pkCred.response.attestationObject);
        printHex("clientDataJSON", pkCred.response.clientDataJSON);
        var msg = {
            binaryEncoding: encoding,
            username: this.username,
            id: encodeBuffer(pkCred.rawId, encoding),
            response: {
                attestationObject: encodeBuffer(pkCred.response.attestationObject, encoding),
                clientDataJSON: encodeBuffer(pkCred.response.clientDataJSON, encoding)
            }
        };

        console.log("msg", msg);

        return this.send(
            this.registerResponseMethod,
            this.registerResponseEndpoint,
            msg
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
        console.log("ASSERTION:", assn);
        var encoding = "base64";

        var msg = {
            binaryEncoding: encoding,
            username: this.username,
            id: encodeBuffer(assn.rawId, encoding),
            response: {
                clientDataJSON: encodeBuffer(assn.response.clientDataJSON, encoding),
                authenticatorData: encodeBuffer(assn.response.authenticatorData, encoding),
                signature: encodeBuffer(assn.response.signature, encoding),
                userHandle: encodeBuffer(assn.response.userHandle, encoding)
            }
        };

        console.log("msg", msg);

        return this.send(
            this.loginResponseMethod,
            this.loginResponseEndpoint,
            msg
        );
    };

    WebAuthnApp.prototype.send = function(method, url, data) {
        // TODO: maybe some day upgrade to fetch(); have to change the mock in the tests too
        return new Promise(function(resolve, reject) {
            var json = JSON.stringify(data);
            console.log("SENDING:", json);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.onload = function() {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (err) {
                    console.log("Invalid JSON response from server");
                    console.log(xhr.responseText);
                    err.message = "Invalid JSON response from server";
                    return reject(err);
                }
                if (xhr.readyState == 4 && xhr.status == "200") {
                    return resolve({
                        status: xhr.status,
                        response: response
                    });
                }

                return resolve(response);
            };
            xhr.onerror = function() {
                return reject(new Error("post to URL failed:" + url));
            };
            xhr.send(json);
        });
    };

    // utility functions
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function decodeString(str, encoding) {
        function isHex(str) {
            return !str.match(/[^\da-f]+/gi);
        }

        function hex2ab(str) {
            return new Uint8Array(str.match(/[\da-f]{2}/gi).map(function(h) {
                return parseInt(h, 16);
            })).buffer;
        }

        function isBase64(str) {
            return !!str.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/g);
        }

        function base64_2ab(str) {
            var u8a = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
            printHex("base64_2ab", u8a.buffer);
            return u8a.buffer;
        }

        if (encoding === "hex" || isHex(str)) return hex2ab(str);
        if (encoding === "base64" || isBase64(str)) return base64_2ab(str);
        throw new TypeError("format of string unknown: " + str);
    }

    function encodeBuffer(ab, encoding) {
        if (encoding === "hex") return Array.prototype.map.call(new Uint8Array(ab), (x) => ("00" + x.toString(16)).slice(-2)).join("");
        if (encoding === "base64") return btoa(String.fromCharCode.apply(null, new Uint8Array(ab)));
        throw new TypeError("unknown encoding in encodeBuffer: " + encoding);
    }

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
