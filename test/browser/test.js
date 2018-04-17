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

var challenge = {
    challenge: "YWJjZGVmMTIzNDU2" // abcdef123456
};

describe("webauthnApp", function() {
    var webauthnApp;
    beforeEach(function() {
        webauthnApp = new window.WebAuthnApp();
    });

    it("exists", function() {
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
            var p = webauthnApp.send("POST", "/foo", {
                test: "bar"
            });
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
                    console.log("RESULT", res);
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

        it("fires send event");
        it("fires response event on success");
        it("fires response event on failure");
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
                    console.log(err);
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
        var sendSpy;
        beforeEach(function() {
            sendSpy = sinon.spy(webauthnApp, "send");
        });
        afterEach(function() {
            webauthnApp.send.restore();
        });

        it.skip("can get register challenge", function() {
            serverFake("/webauthn/register/response", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";
            return webauthnApp
                .sendRegisterResponse(fido2Helpers.lib.makeCredentialAttestationU2fResponse)
                .then(function() {
                    assert.strictEqual(sendSpy.callCount, 1);
                    assert.deepEqual(
                        sendSpy.args[0],
                        [
                            "POST",
                            "/webauthn/register/response",
                            CreationOptionsRequest.from({
                                username: "adam",
                                displayName: "adam"
                            }),
                            CreationOptions
                        ]
                    );
                });
        });

        it.skip("resolves to correct result", function() {
            serverFake("/webauthn/register/response", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";
            return webauthnApp.sendRegisterResponse()
                .then(function(res) {
                    assert.instanceOf(res, CreationOptions);
                    assert.strictEqual(res.status, "ok");
                    assert.strictEqual(res.challenge, "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==");
                });
        });
        it.skip("rejects if username not set", function(done) {
            serverFake("/webauthn/register/response", fido2Helpers.server.basicCreationOptions);
            webauthnApp.sendRegisterResponse()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "expected 'username' to be 'string', got: undefined");
                    done();
                });
        });

        it.skip("rejects on server error", function(done) {
            // XXX: no server fake
            webauthnApp.username = "adam";
            webauthnApp.sendRegisterResponse()
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    console.log(err);
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "server returned status: 404");
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });

    describe("getLoginChallenge", function() {
        it("gets options");
        it("fails gracefully");
    });

    describe("sendLoginResponse", function() {
        it("sends result");
        it("fails gracefully");
    });

    describe("webAuthnCreate", function() {
        it("calls navigator.credentials.create");
    });

    describe("webAuthnGet", function() {
        it("calls navigator.credentials.get");
    });

    describe("register", function() {
        it("end to end flow");
        it("fails gracefully");
    });

    describe("login", function() {
        it("end to end flow");
        it("fails gracefully");
    });
});
