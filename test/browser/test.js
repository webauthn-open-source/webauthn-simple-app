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

                this.propList = [
                    "id",
                    "comment"
                ];
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

        it("resolves to Msg on failure", function(done) {
            var msg = TestMsg.from({
                id: 12,
                comment: "hi there"
            });
            webauthnApp.send("POST", "/bar", msg, TestMsg)
                .then(function() {
                    done(new Error("should not have resolved"));
                })
                .catch(function(res) {
                    assert.instanceOf(res, ServerResponse);
                    assert.strictEqual(res.status, "failed");
                    assert.strictEqual(res.errorMessage, "error parsing JSON response: ''");
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
                .getRegisterChallenge("apowers")
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

        it("rejects if username not set", function(done) {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.getRegisterChallenge("apowers")
                .then(function() {
                    done(new Error("should have rejected"));
                })
                .catch(function(err) {
                    assert.instanceOf(err, Error);
                    assert.strictEqual(err.message, "expected 'username' to be 'string', got: undefined");
                    done();
                });
        });

        it.skip("resolves to correct result", function() {
            serverFake("/webauthn/register/challenge", fido2Helpers.server.basicCreationOptions);
            webauthnApp.username = "adam";
            return webauthnApp.getRegisterChallenge("apowers")
                .then(function(res) {
                    console.log("res", res);
                    assert.fail();
                });
        });
    });

    describe("sendRegisterResponse", function() {
        it("sends result");
        it("fails gracefully");
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
