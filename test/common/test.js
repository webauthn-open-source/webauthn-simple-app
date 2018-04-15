/* globals chai, assert, fido2Helpers
   Msg,
   ServerResponse,
   CreationOptionsRequest, CreationOptionsResponse,
   CredentialAttestation,
   GetOptionsRequest, GetOptionsResponse,
   CredentialAssertion,
   WebAuthnOptions
 */

"use strict";

if (typeof module === "object" && module.exports) {
    // node.js setup
    global.assert = require("chai").assert; // eslint-disable-line global-require
    global.fido2Helpers = require("fido2-helpers"); // eslint-disable-line global-require
    const {
        Msg,
        ServerResponse,
        CreationOptionsRequest,
        CreationOptionsResponse,
        CredentialAttestation,
        GetOptionsRequest,
        GetOptionsResponse,
        CredentialAssertion,
        WebAuthnOptions
    } = require("../../webauthn-simple-app"); // eslint-disable-line global-require
    global.Msg = Msg;
    global.ServerResponse = ServerResponse;
    global.CreationOptionsRequest = CreationOptionsRequest;
    global.CreationOptionsResponse = CreationOptionsResponse;
    global.CredentialAttestation = CredentialAttestation;
    global.GetOptionsRequest = GetOptionsRequest;
    global.GetOptionsResponse = GetOptionsResponse;
    global.CreationOptionsRequest = CreationOptionsRequest;
    global.CredentialAssertion = CredentialAssertion;
    global.WebAuthnOptions = WebAuthnOptions;
} else {
    // browser setup
    window.assert = chai.assert;
    mocha.setup("bdd");
}

describe("ServerResponse", function() {
    it("is loaded", function() {
        assert.isFunction(ServerResponse);
    });

    it("is Msg class", function() {
        var msg = new ServerResponse();
        assert.instanceOf(msg, Msg);
    });

    it("has right properties", function() {
        var msg = new ServerResponse();

        assert.deepEqual(msg.propList, ["status", "errorMessage"]);
    });

    it("converts correctly", function() {
        var inputObj = {
            status: "ok",
            errorMessage: ""
        };
        var msg = ServerResponse.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        it("accepts status ok", function() {
            var msg = ServerResponse.from({
                status: "ok",
                errorMessage: ""
            });

            msg.validate();
        });

        it("accepts status ok with no errorMessage", function() {
            var msg = ServerResponse.from({
                status: "ok",
            });

            msg.validate();
        });

        it("accepts status failed", function() {
            var msg = ServerResponse.from({
                status: "failed",
                errorMessage: "out of beer"
            });

            msg.validate();
        });

        it("throws on bad status", function() {
            var msg = ServerResponse.from({
                status: "foobar",
                errorMessage: ""
            });

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: foobar");
        });

        it("throws on ok with errorMessage", function() {
            var msg = ServerResponse.from({
                status: "ok",
                errorMessage: "there is no error"
            });

            assert.throws(function() {
                msg.validate();
            }, Error, "errorMessage must be empty string when status is 'ok'");
        });

        it("throws on failed with empty errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
                errorMessage: ""
            });

            assert.throws(function() {
                msg.validate();
            }, Error, "errorMessage must be non-zero length when status is 'failed'");
        });

        it("throws on failed without errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'errorMessage' to be 'string', got: undefined");
        });
    });
});

describe("CreationOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(CreationOptionsRequest);
    });

    it("is Msg class", function() {
        var msg = new CreationOptionsRequest();
        assert.instanceOf(msg, Msg);
    });
});

describe("CreationOptionsResponse", function() {
    it("is loaded", function() {
        assert.isFunction(CreationOptionsResponse);
    });

    it("is Msg class", function() {
        var msg = new CreationOptionsResponse();
        assert.instanceOf(msg, Msg);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeCreationOptions);
        });

        it("accepts basic CreationOptionsResponse", function() {
            var msg = CreationOptionsResponse.from(fido2Helpers.server.basicCreationOptions);

            msg.validate();
        });

        it("accepts complete CreationOptionsResponse", function() {
            var msg = CreationOptionsResponse.from(fido2Helpers.server.completeCreationOptions);

            msg.validate();
        });

        it("throws on bad ServerResponse", function() {
            delete testArgs.status;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing rp", function() {
            delete testArgs.rp;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rp' to be 'Object', got: undefined");
        });

        it("throws on missing rp.name", function() {
            delete testArgs.rp.name;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on empty rp.name", function() {
            testArgs.rp.name = "";
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be non-empty string");
        });

        it("throws on non-string rp.name", function() {
            testArgs.rp.name = 42;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: number");
        });

        it("throws on empty rp.id", function() {
            testArgs.rp.id = "";
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be non-empty string");
        });

        it("throws on non-string rp.id", function() {
            testArgs.rp.id = 42;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("throws on empty rp.icon", function() {
            testArgs.rp.icon = "";
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'icon' to be non-empty string");
        });

        it("throws on non-string rp.icon", function() {
            testArgs.rp.icon = 42;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'icon' to be 'string', got: number");
        });

        it("throws on missing user", function() {
            delete testArgs.user;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'user' to be 'Object', got: undefined");
        });

        it("throws on missing user.name", function() {
            delete testArgs.user.name;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on missing user.displayName", function() {
            delete testArgs.user.displayName;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on missing user.id", function() {
            delete testArgs.user.id;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on missing pubKeyCredParams", function() {
            delete testArgs.pubKeyCredParams;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'pubKeyCredParams' to be 'Array', got: undefined");
        });

        it("throws on missing pubKeyCredParams[0].type", function() {
            delete testArgs.pubKeyCredParams[0].type;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing pubKeyCredParams[0].alg", function() {
            delete testArgs.pubKeyCredParams[0].alg;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'alg' to be 'number', got: undefined");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout NaN", function() {
            testArgs.timeout = NaN;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout float", function() {
            testArgs.timeout = 3.14159;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on missing excludeCredentials[0].type", function() {
            delete testArgs.excludeCredentials[0].type;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing excludeCredentials[0].id", function() {
            delete testArgs.excludeCredentials[0].id;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("allows missing excludeCredentials[0].transports", function() {
            delete testArgs.excludeCredentials[0].transports;
            var msg = CreationOptionsResponse.from(testArgs);

            msg.validate();
        });

        it("throws on non-Array excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = 42;
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: 42");
        });

        it("throws on invalid excludeCredentials[0].transports string", function() {
            testArgs.excludeCredentials[0].transports = ["blah"];
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: blah");
        });

        it("throws on invalid excludeCredentials[0].transports type", function() {
            testArgs.excludeCredentials[0].transports = [42];
            var msg = CreationOptionsResponse.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: 42");
        });

        it("allows empty excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = [];
            var msg = CreationOptionsResponse.from(testArgs);

            msg.validate();
        });

        it("authenticatorSelection");
    });
});

describe("CredentialAttestation", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAttestation);
        assert.isFunction(CredentialAttestation.from);
    });

    it("is Msg class", function() {
        var msg = new CredentialAttestation();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
    });
});

describe("GetOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptionsRequest);
        assert.isFunction(GetOptionsRequest.from);
    });

    it("is Msg class", function() {
        var msg = new GetOptionsRequest();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
    });
});

describe("GetOptionsResponse", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptionsResponse);
        assert.isFunction(GetOptionsResponse.from);
    });

    it("is Msg class", function() {
        var msg = new GetOptionsResponse();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
    });
});

describe("CreationOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(CreationOptionsRequest);
        assert.isFunction(CreationOptionsRequest.from);
    });

    it("is Msg class", function() {
        var msg = new CreationOptionsRequest();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
    });
});

describe("CredentialAssertion", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAssertion);
        assert.isFunction(CredentialAssertion.from);
    });

    it("is Msg class", function() {
        var msg = new CredentialAssertion();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
    });
});

describe("WebAuthnOptions", function() {
    it("is loaded", function() {
        assert.isFunction(WebAuthnOptions);
        assert.isFunction(WebAuthnOptions.from);
    });

    it("is Msg class", function() {
        var msg = new WebAuthnOptions();
        assert.isFunction(msg.toObject);
        assert.isFunction(msg.toString);
        assert.isFunction(msg.toPrettyString);
        assert.isFunction(msg.validate);
    });

    describe("merge", function() {
        it("dst over src", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, true);

            assert.strictEqual(src.timeout, 2);
        });

        it("src over dst", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 1);
        });

        it("sets missing values", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 2);
        });

        it("allows empty", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({});

            src.merge(dst, false);

            assert.isUndefined(src.timeout);
        });
    });
});

describe("Msg", function() {
    class TestClass extends Msg {
        constructor() {
            super();

            this.propList = ["username", "displayName"];
        }
    }

    describe("from", function() {

        it("accepts object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("accepts string", function() {
            var json = JSON.stringify({
                username: "adam",
                displayName: "Adam Powers"
            });

            var msg = TestClass.from(json);
            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("throws on no arguments", function() {
            assert.throws(function() {
                TestClass.from();
            }, TypeError, "couldn't coerce 'json' argument to an object");
        });

        it("throws on bad string", function() {
            assert.throws(function() {
                TestClass.from("this is a bad string");
            }, TypeError, "error parsing JSON string");
        });

        it("accepts empty object", function() {
            var msg = TestClass.from({});
            msg.propList = ["username", "displayName"];

            assert.instanceOf(msg, Msg);
            assert.isUndefined(msg.username);
            assert.isUndefined(msg.displayName);
        });
    });

    describe("toObject", function() {
        it("converts to object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var obj = msg.toObject();
            assert.notInstanceOf(obj, Msg);
            assert.strictEqual(obj.username, "adam");
            assert.strictEqual(obj.displayName, "Adam Powers");
        });
    });

    describe("toString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toString();
            assert.isString(str);
            assert.strictEqual(str, "{\"username\":\"adam\",\"displayName\":\"Adam Powers\"}");
        });
    });

    describe("toPrettyString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toPrettyString();
            assert.isString(str);
            assert.strictEqual(str, "{\n    \"username\": \"adam\",\n    \"displayName\": \"Adam Powers\"\n}");
        });
    });
});
