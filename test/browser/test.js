/* globals chai, sinon, fido2Helpers
   defaultRoutes, Msg, ServerResponse,
   CreationOptionsRequest, CreationOptions,
   CredentialAttestation,
   GetOptionsRequest, GetOptions,
   CredentialAssertion,
   WebAuthnOptions
 */

"use strict";

var assert = chai.assert;
mocha.setup("bdd");

function serverMock() {
    var server;
    beforeEach(function() {
        server = sinon.fakeServer.create();
        server.respondImmediately = true;
    });
    afterEach(function() {
        server.restore();
    });
    function serverFake(url, data) {
        server.respondWith("POST", url, [200, {
            "Content-Type": "application/json"
        }, JSON.stringify([data])]);
    }

    return serverFake;
}

var cleanUpListeners = [];
function removeAllListeners() {
    for (let listener of cleanUpListeners) {
        document.removeEventListener(listener.type, listener.catchEventFn);
    }
    cleanUpListeners = [];
}

function catchEvent(type, cb) {
    if (typeof cb !== "function") {
        throw new Error("test error: didn't specify callback");
    }

    return new Promise(function (resolve) {
        document.addEventListener(type, catchEventFn);
        cleanUpListeners.push({ type,
            catchEventFn });
        function catchEventFn(event) {
            if (event.type === type) {
                if (cb(event)) { // eslint-disable-line callback-return
                    // console.log("catchEvent done");
                    resolve();
                }
            }
        }
    });
}

/**** TESTING POLYFILL *******/
var sc = Object.getOwnPropertyDescriptor(window, "isSecureContext");
if (sc) {
    if (sc.set || sc.writable) window.isSecureContext = true;
}

try {
    window.isSecureContext = true;
} catch (err) {
    // ignore error
}

if (!window.PublicKeyCredential) {
    window.PublicKeyCredential = function PublicKeyCredential() {}; // eslint-disable-line func-names
    window.PublicKeyCredential.prototype = {};
}

if (!window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = function isUserVerifyingPlatformAuthenticatorAvailable() {}; // eslint-disable-line func-names
}

if (!navigator.credentials) {
    navigator.credentials = {};
}

if (!navigator.credentials.create) {
    navigator.credentials.create = function create() {}; // eslint-disable-line func-names
}

if (!navigator.credentials.get) {
    navigator.credentials.get = function get() {}; // eslint-disable-line func-names
}
/**** END TESTING POLYFILL *******/

describe.skip("debug", function() {
    it("isSecureContext", () => {
        assert.isTrue(window.isSecureContext);
    });

    it("has PublicKeyCredential", () => {
        assert.isFunction(window.PublicKeyCredential);
    });

    it("has PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable", () => {
        assert.isFunction(window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
    });

    it("instanceof", () => {
        var testCred = fido2Helpers.functions.cloneObject(fido2Helpers.lib.makeCredentialAttestationU2fResponse);
        Object.setPrototypeOf(testCred, window.PublicKeyCredential.prototype);
        assert.isTrue(testCred instanceof window.PublicKeyCredential);
    });
});

describe("WebAuthnApp", function() {
    afterEach(function() {
        removeAllListeners();
    });

    var webauthnApp;
    beforeEach(function() {
        webauthnApp = new window.WebAuthnApp();
    });

    it("exists", function() {
        assert.isFunction(window.WebAuthnApp);
    });

    it("is constructor", function() {
        assert.isObject(webauthnApp);
    });

    describe("loading", function() {
        it("is null in insecure context");
        it("is null where WebAuthn API doesn't exist");
    });

    describe("events", function() {
        it("debug on send");
        it("debug on receive");
        it("on load");
    });

    describe("config", function() {
        it("can change endpoints");
        it("can change methods");
        it("can set send callback");
        it("can set receive callback");
    });

    describe("send", function() {
        var serverFake = serverMock();
        class TestMsg extends ServerResponse {
            constructor() {
                super();

                this.propList = this.propList.concat([
                    "id",
                    "comment"
                ]);
            }

            validate() {}
        }

        it("returns promise", function() {
            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });
            var p = webauthnApp.send("POST", "/foo", msg, TestMsg);
            assert.instanceOf(p, Promise);
        });

        it("delivers generic message", function() {
            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });
            return webauthnApp.send("POST", "/foo", msg, TestMsg);
        });

        it("resolves to Msg on success", function() {
            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });
            return webauthnApp
                .send("POST", "/foo", msg, TestMsg)
                .then(function(res) {
                    assert.instanceOf(res, Msg);
                    assert.strictEqual(res.id, 42);
                    assert.strictEqual(res.comment, "hello from outer space");
                    assert.strictEqual(res.status, "ok");
                });
        });

        it("resolves to Error on failure", function(done) {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });
            webauthnApp.send("POST", "/bar", msg, TestMsg)
                .then(function() {
                    done(new Error("should not have resolved"));
                })
                .catch(function(res) {
                    assert.instanceOf(res, Error);
                    assert.strictEqual(res.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });

        it("fires send event", function() {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });

            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var p = catchEvent("webauthn-debug", eventHandler);
            function eventHandler(event) {
                if (event.detail.subtype !== "send") {
                    return false;
                }
                var data = event.detail.data;
                assert.instanceOf(data, TestMsg);
                assert.strictEqual(data.id, 12);
                return true;
            }
            webauthnApp.send("POST", "/foo", msg, TestMsg);
            return p;
        });

        it("fires send-raw event", function() {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });

            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var p = catchEvent("webauthn-debug", function (event) {
                if (event.detail.subtype !== "send-raw") {
                    return;
                }
                var data = event.detail.data;
                assert.isString(data);
                return true;
            });
            webauthnApp.send("POST", "/foo", msg, TestMsg);
            return p;
        });

        it("fires response-raw event on success", function() {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });

            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var p = catchEvent("webauthn-debug", function (event) {
                if (event.detail.subtype !== "response-raw") {
                    return;
                }

                var data = event.detail.data;
                assert.isObject(data);
                assert.isNumber(data.status);
                assert.isString(data.body);
                return true;
            });
            webauthnApp.send("POST", "/foo", msg, TestMsg);
            return p;
        });

        it("fires response event on success", function() {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });

            serverFake("/foo", {
                status: "ok",
                id: 42,
                comment: "hello from outer space"
            });

            var p = catchEvent("webauthn-debug", function (event) {
                if (event.detail.subtype !== "response") {
                    return;
                }

                var data = event.detail.data;
                assert.isObject(data);
                assert.isNumber(data.status);
                assert.instanceOf(data.body, ServerResponse);
                return true;
            });
            webauthnApp.send("POST", "/foo", msg, TestMsg);
            return p;
        });

        it("fires send-error event on failure", function() {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });

            // XXX: no server fake, request will fail

            var p = catchEvent("webauthn-debug", function (event) {
                if (event.detail.subtype !== "send-error") {
                    return;
                }

                var data = event.detail.data;
                assert.instanceOf(data, Error);
                return true;
            });
            webauthnApp.send("POST", "/foo", msg, TestMsg).catch(() => {});
            return p;
        });
    });

    describe("getRegisterChallenge", function() {
        var serverFake = serverMock();
        var sendSpy;
        beforeEach(function() {
            sendSpy = sinon.spy(webauthnApp, "send");
        });
        afterEach(function() {
            webauthnApp.send.restore();
        });

        it("can get register challenge", function() {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";
            return webauthnApp
                .getRegisterChallenge()
                .then(function() {
                    assert.strictEqual(sendSpy.callCount, 1);
                    assert.deepEqual(
                        sendSpy.args[0],
                        [
                            "POST",
                            "/webauthn/register/challenge",
                            CreationOptionsRequest.from({
                                username: "adam",
                                displayName: "adam"
                            }),
                            CreationOptions
                        ]
                    );
                });
        });

        it("resolves to correct result", function() {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";
            return webauthnApp.getRegisterChallenge()
                .then(function(res) {
                    assert.instanceOf(res, CreationOptions);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.challenge, "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==");
                });
        });
        it("rejects if username not set", function(done) {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.getRegisterChallenge()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "expected 'username' to be 'string', got: undefined");
                    done();
                });
        });

        it("rejects on server error", function(done) {
            // XXX: no server fake
            webauthnApp.username = "adam";
            webauthnApp.getRegisterChallenge()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });

    describe("sendRegisterResponse", function() {
        var serverFake = serverMock();
        var testCred;
        var sendSpy;
        beforeEach(function() {
            sendSpy = sinon.spy(webauthnApp, "send");
            // fake a PublicKeyCredential
            testCred = fido2Helpers.functions.cloneObject(fido2Helpers.lib.makeCredentialAttestationU2fResponse);
            Object.setPrototypeOf(testCred, window.PublicKeyCredential.prototype);
            // ArrayBuffers don't get copied
            testCred.response = fido2Helpers.lib.makeCredentialAttestationU2fResponse.response;
        });
        afterEach(function() {
            webauthnApp.send.restore();
        });

        it("can get register challenge", function() {
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);
            webauthnApp.username = "adam";
            return webauthnApp
                .sendRegisterResponse(testCred)
                .then(function() {
                    assert.strictEqual(sendSpy.callCount, 1);
                    assert.strictEqual(sendSpy.args[0][0], "POST");
                    assert.strictEqual(sendSpy.args[0][1], "/webauthn/register/response");
                    assert.instanceOf(sendSpy.args[0][2], CredentialAttestation);
                    assert.strictEqual(sendSpy.args[0][3], ServerResponse);
                });
        });

        it("resolves to correct result", function() {
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);
            webauthnApp.username = "adam";
            return webauthnApp.sendRegisterResponse(testCred)
                .then(function(res) {
                    assert.instanceOf(res, ServerResponse);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.errorMessage, "");
                });
        });

        it("rejects if pkCred not passed in", function() {
            assert.throws(function() {
                webauthnApp.sendRegisterResponse();
            }, Error, "expected 'pkCred' to be instance of PublicKeyCredential");
        });

        it("rejects on server error", function(done) {
            // XXX: no server fake
            webauthnApp.username = "adam";
            webauthnApp.sendRegisterResponse(testCred)
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });

        it("rejects on server msg failed", function(done) {
            serverFake("/webauthn/register/response", fido2Helpers.server.errorServerResponse);
            webauthnApp.username = "adam";
            webauthnApp.sendRegisterResponse(testCred)
                .then(function(res) {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "out of memory");
                    done();
                });
        });
    });

    describe("getLoginChallenge", function() {
        var serverFake = serverMock();
        var sendSpy;
        beforeEach(function() {
            sendSpy = sinon.spy(webauthnApp, "send");
        });
        afterEach(function() {
            webauthnApp.send.restore();
        });

        it("can get register challenge", function() {
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";
            return webauthnApp
                .getLoginChallenge()
                .then(function() {
                    assert.strictEqual(sendSpy.callCount, 1);
                    assert.deepEqual(
                        sendSpy.args[0],
                        [
                            "POST",
                            "/webauthn/login/challenge",
                            GetOptionsRequest.from({
                                username: "adam",
                                displayName: "adam"
                            }),
                            GetOptions
                        ]
                    );
                });
        });

        it("resolves to correct result", function() {
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";
            return webauthnApp.getLoginChallenge()
                .then(function(res) {
                    assert.instanceOf(res, GetOptions);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.challenge, "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==");
                });
        });

        it("rejects if username not set", function(done) {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.getLoginChallenge()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "expected 'username' to be 'string', got: undefined");
                    done();
                });
        });

        it("rejects on server error", function(done) {
            // XXX: no server fake
            webauthnApp.username = "adam";
            webauthnApp.getLoginChallenge()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });

    describe("sendLoginResponse", function() {
        var serverFake = serverMock();
        var testCred;
        var sendSpy;
        beforeEach(function() {
            sendSpy = sinon.spy(webauthnApp, "send");
            // fake a PublicKeyCredential
            testCred = fido2Helpers.functions.cloneObject(fido2Helpers.lib.assertionResponse);
            Object.setPrototypeOf(testCred, window.PublicKeyCredential.prototype);
            // ArrayBuffers don't get copied
            testCred.response = fido2Helpers.lib.assertionResponse.response;
        });
        afterEach(function() {
            webauthnApp.send.restore();
        });

        it("can get register challenge", function() {
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);
            webauthnApp.username = "adam";
            return webauthnApp
                .sendLoginResponse(testCred)
                .then(function() {
                    assert.strictEqual(sendSpy.callCount, 1);
                    assert.strictEqual(sendSpy.args[0][0], "POST");
                    assert.strictEqual(sendSpy.args[0][1], "/webauthn/login/response");
                    assert.instanceOf(sendSpy.args[0][2], CredentialAssertion);
                    assert.strictEqual(sendSpy.args[0][3], ServerResponse);
                });
        });

        it("resolves to correct result", function() {
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);
            webauthnApp.username = "adam";
            return webauthnApp.sendLoginResponse(testCred)
                .then(function(res) {
                    assert.instanceOf(res, ServerResponse);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.errorMessage, "");
                });
        });

        it("rejects if assn not passed in", function() {
            assert.throws(function() {
                webauthnApp.sendLoginResponse();
            }, Error, "expected 'assn' to be instance of PublicKeyCredential");
        });

        it("rejects on server error", function(done) {
            // XXX: no server fake
            webauthnApp.username = "adam";
            webauthnApp.sendLoginResponse(testCred)
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });

        it("rejects on server msg failed", function(done) {
            serverFake("/webauthn/login/response", fido2Helpers.server.errorServerResponse);
            webauthnApp.username = "adam";
            webauthnApp.sendLoginResponse(testCred)
                .then(function(res) {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "out of memory");
                    done();
                });
        });

    });

    describe("webAuthnCreate", function() {
        var opts = CreationOptions.from(fido2Helpers.functions.cloneObject(fido2Helpers.server.basicCreationOptions));
        var result = fido2Helpers.lib.makeCredentialAttestationU2fResponse;
        var createSpy;
        beforeEach(function() {
            createSpy = sinon.stub(navigator.credentials, "create");
            createSpy.returns(Promise.resolve(result));
        });
        afterEach(function() {
            navigator.credentials.create.restore();
        });

        it("passes with basic options", function() {
            return webauthnApp.webAuthnCreate(opts);
        });

        it("returns promise", function() {
            var p = webauthnApp.webAuthnCreate(opts);
            assert.instanceOf(p, Promise);
        });

        it("throws when argument isn't CreationOptions", function() {
            assert.throws(function() {
                webauthnApp.webAuthnCreate({});
            }, Error, "expected 'options' to be instance of CreationOptions");
        });

        it("calls navigator.credentials.create", function() {
            return webauthnApp.webAuthnCreate(opts)
                .then(function(res) {
                    assert.strictEqual(createSpy.callCount, 1);
                    assert.strictEqual(createSpy.args[0].length, 1);
                    assert.isObject(createSpy.args[0][0]);
                    var pk = createSpy.args[0][0].publicKey;
                    assert.isObject(pk);
                    assert.strictEqual(Object.keys(pk).length, 4);
                    assert.instanceOf(pk.challenge, ArrayBuffer);
                    assert.isArray(pk.pubKeyCredParams);
                    assert.isObject(pk.rp);
                    assert.isObject(pk.user);
                    assert.strictEqual(res, result);
                });
        });

        it("fires user presence start event", function() {
            var p = catchEvent("webauthn-user-presence-start", () => true);
            webauthnApp.webAuthnCreate(opts);
            return p;
        });

        it("fires user user presence end event on success", function() {
            var p = catchEvent("webauthn-user-presence-done", () => true);
            webauthnApp.webAuthnCreate(opts);
            return p;
        });

        it("fires user user presence end event on failure", function() {
            var err = new Error("out of memory");
            createSpy.returns(Promise.reject(err));
            var p = catchEvent("webauthn-user-presence-done", () => true);
            webauthnApp.webAuthnCreate(opts).catch(() => {});
            return p;
        });

        it("fires debug event for options", function() {
            function eventHandler(event) {
                if (event.detail.subtype !== "create-options") {
                    return false;
                }
                var data = event.detail.data;
                assert.isObject(data);
                assert.isObject(data.publicKey);
                assert.strictEqual(Object.keys(data.publicKey).length, 4);
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnCreate(opts);
            return p;
        });

        it("fires debug event for results", function() {
            function eventHandler(event) {
                if (event.detail.subtype !== "create-result") {
                    // wait for next event
                    return false;
                }
                var data = event.detail.data;
                assert.isObject(data);
                assert.isObject(data.response);
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnCreate(opts);
            return p;
        });

        it("fires debug event for error", function() {
            var err = new Error("out of memory");
            createSpy.returns(Promise.reject(err));

            function eventHandler(event) {
                if (event.detail.subtype !== "create-failed") {
                    // wait for next event
                    return false;
                }
                var data = event.detail.data;
                assert.instanceOf(data, Error);
                assert.strictEqual(data.message, "out of memory");
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnCreate(opts).catch(() => {});
            return p;
        });
    });

    describe("webAuthnGet", function() {
        var opts = GetOptions.from(fido2Helpers.functions.cloneObject(fido2Helpers.server.basicGetOptions));
        var result = fido2Helpers.lib.assertionResponse;
        var createSpy;
        beforeEach(function() {
            createSpy = sinon.stub(navigator.credentials, "get");
            createSpy.returns(Promise.resolve(result));
        });
        afterEach(function() {
            navigator.credentials.get.restore();
        });

        it("passes with basic options", function() {
            return webauthnApp.webAuthnGet(opts);
        });

        it("returns promise", function() {
            var p = webauthnApp.webAuthnGet(opts);
            assert.instanceOf(p, Promise);
        });

        it("throws when argument isn't GetOptions", function() {
            assert.throws(function() {
                webauthnApp.webAuthnGet({});
            }, Error, "expected 'options' to be instance of GetOptions");
        });

        it("calls navigator.credentials.get", function() {
            return webauthnApp.webAuthnGet(opts)
                .then(function(res) {
                    assert.strictEqual(createSpy.callCount, 1);
                    assert.strictEqual(createSpy.args[0].length, 1);
                    assert.isObject(createSpy.args[0][0]);
                    var pk = createSpy.args[0][0].publicKey;
                    assert.isObject(pk);
                    assert.strictEqual(Object.keys(pk).length, 1);
                    assert.instanceOf(pk.challenge, ArrayBuffer);
                    assert.strictEqual(res, result);
                });
        });

        it("fires user presence start event", function() {
            var p = catchEvent("webauthn-user-presence-start", () => true);
            webauthnApp.webAuthnGet(opts);
            return p;
        });

        it("fires user user presence end event on success", function() {
            var p = catchEvent("webauthn-user-presence-done", () => true);
            webauthnApp.webAuthnGet(opts);
            return p;
        });

        it("fires user user presence end event on failure", function() {
            var err = new Error("out of memory");
            createSpy.returns(Promise.reject(err));
            var p = catchEvent("webauthn-user-presence-done", () => true);
            webauthnApp.webAuthnGet(opts).catch(() => {});
            return p;
        });

        it("fires debug event for options", function() {
            function eventHandler(event) {
                if (event.detail.subtype !== "get-options") {
                    // wait for next event
                    return false;
                }
                var data = event.detail.data;
                assert.isObject(data);
                assert.isObject(data.publicKey);
                assert.strictEqual(Object.keys(data.publicKey).length, 1);
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnGet(opts);
            return p;
        });

        it("fires debug event for results", function() {
            function eventHandler(event) {
                if (event.detail.subtype !== "get-result") {
                    // wait for next event
                    return false;
                }
                var data = event.detail.data;
                assert.isObject(data);
                assert.isObject(data.response);
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnGet(opts);
            return p;
        });

        it("fires debug event for error", function() {
            var err = new Error("out of memory");
            createSpy.returns(Promise.reject(err));

            function eventHandler(event) {
                if (event.detail.subtype !== "get-failed") {
                    // wait for next event
                    return false;
                }
                var data = event.detail.data;
                assert.instanceOf(data, Error);
                assert.strictEqual(data.message, "out of memory");
                return true;
            }

            var p = catchEvent("webauthn-debug", eventHandler);
            webauthnApp.webAuthnGet(opts).catch(() => {});
            return p;
        });
    });

    describe("register", function() {
        var serverFake = serverMock();
        var createMock;
        beforeEach(function() {
            var testCred = fido2Helpers.functions.cloneObject(fido2Helpers.lib.makeCredentialAttestationU2fResponse);
            Object.setPrototypeOf(testCred, window.PublicKeyCredential.prototype);
            testCred.response = fido2Helpers.lib.makeCredentialAttestationU2fResponse.response;
            createMock = sinon.stub(navigator.credentials, "create");
            createMock.returns(Promise.resolve(testCred));
        });

        afterEach(function() {
            navigator.credentials.create.restore();
        });

        it("returns promise", function() {
            var p = webauthnApp.register().catch(() => {});
            assert.instanceOf(p, Promise);
        });

        it("can complete registration", function() {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            return webauthnApp.register();
        });

        it("resolves to true", function() {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            return webauthnApp.register()
                .then(function(res) {
                    assert.isObject(res);
                    assert.instanceOf(res, ServerResponse);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.errorMessage, "");
                });
        });

        it("fails on failed option request", function(done) {
            // options
            // serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            webauthnApp.register()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                });
        });

        it("fails on failed cred create", function(done) {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.basicCreationOptions);

            // get
            createMock.returns(Promise.reject(new Error("hamsters too tired")));

            return webauthnApp.register()
                .then(function(res) {
                    console.log("res", res);
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "hamsters too tired");
                    done();
                });
        });

        it("fails on failed result", function(done) {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            // serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            webauthnApp.register()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                });
        });

        it("fails on status: failed from server", function(done) {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.errorServerResponse);

            webauthnApp.register()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "out of memory");
                    done();
                });
        });

        it("fires webauthn-register-start", function() {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-register-start", () => true);
            webauthnApp.register();
            return p;
        });

        it("fires webauthn-register-done on success", function() {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-register-done", () => true);
            webauthnApp.register();
            return p;
        });

        it("fires webauthn-register-error", function() {
            // options
            // serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-register-error", function(err) {
                assert.instanceOf(err.detail, Error);
                assert.strictEqual(err.detail.message, "server returned status: 404");
                return true;
            });
            webauthnApp.register().catch(() => {});
            return p;
        });

        it("fires webauthn-register-success", function() {
            // options
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/register/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-register-success", () => true);
            webauthnApp.register();
            return p;
        });
    });

    describe("login", function() {
        var serverFake = serverMock();
        var getMock;
        beforeEach(function() {
            var testCred = fido2Helpers.functions.cloneObject(fido2Helpers.lib.assertionResponse);
            Object.setPrototypeOf(testCred, window.PublicKeyCredential.prototype);
            testCred.response = fido2Helpers.lib.assertionResponse.response;
            getMock = sinon.stub(navigator.credentials, "get");
            getMock.returns(Promise.resolve(testCred));
        });

        afterEach(function() {
            navigator.credentials.get.restore();
        });

        it("returns promise", function() {
            var p = webauthnApp.login().catch(() => {});
            assert.instanceOf(p, Promise);
        });

        it("can complete login", function() {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            return webauthnApp.login();
        });

        it("resolves to true", function() {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            return webauthnApp.login()
                .then(function(res) {
                    assert.isObject(res);
                    assert.instanceOf(res, ServerResponse);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.errorMessage, "");
                });
        });

        it("fails on failed option request", function(done) {
            // options
            // serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            webauthnApp.login()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                });
        });

        it("fails on failed cred get", function(done) {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.basicCreationOptions);

            // get
            getMock.returns(Promise.reject(new Error("hamsters too tired")));

            return webauthnApp.login()
                .then(function(res) {
                    console.log("res", res);
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "hamsters too tired");
                    done();
                });
        });

        it("fails on failed result", function(done) {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            // serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            webauthnApp.login()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                });
        });

        it("fails on status: failed from server", function(done) {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.errorServerResponse);

            webauthnApp.login()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "out of memory");
                    done();
                });
        });

        it("fires webauthn-login-start", function() {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-login-start", () => true);
            webauthnApp.login();
            return p;
        });

        it("fires webauthn-login-done on success", function() {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-login-done", () => true);
            webauthnApp.login();
            return p;
        });

        it("fires webauthn-login-error", function() {
            // options
            // serverFake("/webauthn/login/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-login-error", function(err) {
                assert.instanceOf(err.detail, Error);
                assert.strictEqual(err.detail.message, "server returned status: 404");
                return true;
            });
            webauthnApp.login().catch(() => {});
            return p;
        });

        it("fires webauthn-login-success", function() {
            // options
            serverFake("/webauthn/login/challenge", fido2Helpers.server.basicGetOptions);
            webauthnApp.username = "adam";

            // result
            serverFake("/webauthn/login/response", fido2Helpers.server.successServerResponse);

            var p = catchEvent("webauthn-login-success", () => true);
            webauthnApp.login();
            return p;
        });
    });
});
