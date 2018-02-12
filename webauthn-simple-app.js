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

    function webauthnApp(config) {
        // check for secure context
        if (!window.isSecureContext) {
            console.log("webauthnApp: not in a secure context, application not loading");
            return null;
        }

        // check for navigator.credentials.create
        if (typeof navigator.credentials.create !== "function") {
            console.log("webauthnApp: WebAuthn interface not supported, application not loading");
            return null;
        }

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
        this.registerSuccessRedirect = config.registerSuccessRedirect || null;
        this.registerFailureRedirect = config.registerFailureRedirect || null;
        this.loginSuccessRedirect = config.loginSuccessRedirect || null;
        this.loginFailureRedirect = config.loginFailureRedirect || null;
        this.alg = config.alg || cose_alg_ECDSA_w_SHA256;
        this.binaryEncoding = config.binaryEncoding;
        // TODO: relying party name
        this.appName = config.appName || window.location.hostname;
        this.username = config.username;
        this.debug = function() {};
    }

    webauthnApp.prototype.debug = function() {
        this.debug = console.log;
    };

    webauthnApp.prototype.register = function() {
        var self = this;
        // get challenge
        return this.getRegisterChallenge()
            .then(function(serverMsg) {
                if (serverMsg.status != 200) {
                    throw new Error("Server responded with status: " + serverMsg.status);
                }
                if (!serverMsg.response || !serverMsg.response.challenge) {
                    throw new Error("Malformatted server response: " + serverMsg);
                }

                // call webauthn
                return self.webauthnCreate(serverMsg.response);
            })
            .then(function(newCred) {
                console.log ("newCred", newCred);
                // send response
                return self.sendRegisterResponse(newCred);
            });
    };

    webauthnApp.prototype.login = function() {
        // get challenge
        return this.getLoginChallenge()
            .then(function() {
                // call webauthn
                return this.webauthnGet();
            })
            .then(function() {
                // send response
                return this.sendLoginResponse();
            });
    };

    webauthnApp.prototype.webauthnCreate = function(serverResponse) {
        var options = {};
        options.publicKey = {};
        options.publicKey.rp = {};
        options.publicKey.rp.name = serverResponse.appName || this.appName;
        options.publicKey.rp.icon = serverResponse.icon || this.icon;
        options.publicKey.user = {};
        options.publicKey.user.id = str2ab(serverResponse.userId || serverResponse.username || this.username);
        options.publicKey.user.name = serverResponse.username || this.username;
        options.publicKey.user.displayName = serverResponse.displayName || serverResponse.username || this.username;
        options.publicKey.user.icon = serverResponse.icon || this.icon;
        options.publicKey.challenge = decodeString(serverResponse.challenge, this.binaryEncoding);
        options.publicKey.pubKeyCredParams = []
        options.publicKey.pubKeyCredParams[0] = {};
        options.publicKey.pubKeyCredParams[0].type = "public-key";
        options.publicKey.pubKeyCredParams[0].alg = serverResponse.alg || this.alg;
        options.publicKey.timeout = serverResponse.timeout || this.timeout;
        // TODO: other options (excludeCredentials, extensions, algorithmList instead of alg, etc)\

        console.log("credentials.create options:", options);
        printHex("challenge", options.publicKey.challenge);
        printHex("user.id", options.publicKey.user.id);

        return navigator.credentials.create(options);
    };
    webauthnApp.prototype.webauthnGet = function() {};
    webauthnApp.prototype.getRegisterChallenge = function() {
        var sendData = {
            user: this.username
        };

        return this.send(this.registerChallengeMethod,
            this.registerChallengeEndpoint,
            sendData);
    };

    webauthnApp.prototype.sendRegisterResponse = function(pkCred) {
        var msg = {}
        msg.binaryEncoding = "hex";
        msg.username = this.username;
        msg.id = encodeString(pkCred.rawId);
        msg.response = {};
        msg.response.attestationObject = encodeString(pkCred.response.attestationObject, msg.binaryEncoding);
        msg.response.clientDataJSON = encodeString(pkCred.response.clientDataJSON, msg.binaryEncoding);

        console.log ("msg", msg);

        return this.send(this.registerResponseMethod,
            this.registerResponseEndpoint,
            msg);
    };

    webauthnApp.prototype.getLoginChallenge = function() {};
    webauthnApp.prototype.sendLoginResponse = function() {};

    webauthnApp.prototype.send = function(method, url, data) {
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
                } else {
                    return resolve(response);
                }
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
                return parseInt(h, 16)
            })).buffer;
        }

        if (encoding === "hex" || isHex(str)) return hex2ab(str);
        throw new TypeError ("format of string unknown: " + str);
    }

    function encodeString(ab, encoding) {
        return Array.prototype.map.call(new Uint8Array(ab), x => ('00' + x.toString(16)).slice(-2)).join('');
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

    function copyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function getWebAuthnConfigurationFromForm() {
        var config = {};

        function getValue(id) {
            var e = document.getElementById(id);
            if (!e) return;
            if (e.value === "") return;
            return e.value;
        }

        config.username = getValue("username");
        config.timeout = getValue("timeout");
        config.appName = getValue("appName");
        config.registerSuccessRedirect = getValue("registerSuccessRedirect");
        config.registerFailureRedirect = getValue("registerFailureRedirect");
        console.log("CONFIG:", config);

        return config;
    }

    // static functions
    function webAuthnRegisterOnSubmit() {
        console.log("webAuthnRegisterOnSubmit");

        // get configuration
        var config = getWebAuthnConfigurationFromForm();

        // get registration challenge
        new WebAuthnApp(config).register()
            .then(() => {
                console.log("registration done");
            })
            .catch((err) => {
                console.log("Registration error:", err);
            })

        return false;
    }

    function webAuthnLoginOnSubmit() {
        console.log("webAuthnLoginOnSubmit");
        return false;
    }

    // global class
    window.WebAuthnApp = webauthnApp;

    // static methods
    window.WebAuthnApp.webAuthnRegisterOnSubmit = webAuthnRegisterOnSubmit;
    window.WebAuthnApp.webAuthnLoginOnSubmit = webAuthnLoginOnSubmit;
})();