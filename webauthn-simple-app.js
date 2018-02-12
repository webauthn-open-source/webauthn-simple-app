// .config
// .register
// .login

(function() {
    function webauthnApp() {
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

        this.registerChallengeEndpoint = "/webauthn/register/challenge";
        this.registerResponseEndpoint = "/webauthn/register/response";
        this.loginChallengeEndpoint = "/webauthn/login/challenge";
        this.loginResponseEndpoint = "/webauthn/login/response";
        this.registerChallengeMethod = "POST";
        this.registerResponseMethod = "POST";
        this.loginChallengeMethod = "POST";
        this.loginResponseMethod = "POST";
        this.timeout = 60000; // one minute
        this.debug = function() {};
        this.appName = "example.com";
    }

    webauthnApp.prototype.debug = function() {
        this.debug = console.log;
    };

    webauthnApp.prototype.register = function() {
        // get challenge
        return this.webauthnGetRegisterChallenge()
            .then(function() {
                // call webauthn
                return this.webauthnCreate();
            })
            .then(function() {
                // send response
                return this.webauthnSendRegisterResponse();
            });
    };

    webauthnApp.prototype.login = function() {
        // get challenge
        return this.webauthnGetLoginChallenge()
            .then(function() {
                // call webauthn
                return this.webauthnGet();
            })
            .then(function() {
                // send response
                return this.webauthnSendLoginResponse();
            });
    };

    webauthnApp.prototype.addEventListener = function() {};
    webauthnApp.prototype.webauthnCreate = function() {};
    webauthnApp.prototype.webauthnGet = function() {};
    webauthnApp.prototype.getRegisterChallenge = function(user) {
        var sendData = {
            user: user
        };
        return this.send(this.registerChallengeMethod,
            this.registerChallengeEndpoint,
            sendData);
    };
    webauthnApp.prototype.sendRegisterResponse = function() {};
    webauthnApp.prototype.getLoginChallenge = function() {};
    webauthnApp.prototype.sendLoginResponse = function() {};

    webauthnApp.prototype.send = function(method, url, data) {
        return new Promise(function(resolve, reject) {
            var json = JSON.stringify(data);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.onload = function() {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (err) {
                    console.log ("Invalid JSON response from server");
                    console.log (xhr.responseText);
                    err.message = "Invalid JSON response from server";
                    return reject(err);
                }
                if (xhr.readyState == 4 && xhr.status == "200") {
                    console.log("SUCCESS!:", response);
                    return resolve({
                        status: xhr.status,
                        response: response
                    });
                } else {
                    console.log("SUCCESS?:", response);
                    return resolve(response);
                }
            };
            xhr.onerror = function() {
                return reject(new Error("post to URL failed:" + url));
            };
            xhr.send(json);
        });
    };

    window.WebAuthnApp = webauthnApp;
})();