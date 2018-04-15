/* globals chai, assert, fido2Helpers
   defaultRoutes, Msg, ServerResponse,
   CreationOptionsRequest, CreationOptions,
   CredentialAttestation,
   GetOptionsRequest, GetOptions,
   CredentialAssertion,
   WebAuthnOptions
 */

"use strict";

if (typeof module === "object" && module.exports) {
    // node.js setup
    global.assert = require("chai").assert; // eslint-disable-line global-require
    global.fido2Helpers = require("fido2-helpers"); // eslint-disable-line global-require
    const {
        defaultRoutes,
        Msg,
        ServerResponse,
        CreationOptionsRequest,
        CreationOptions,
        CredentialAttestation,
        GetOptionsRequest,
        GetOptions,
        CredentialAssertion,
        WebAuthnOptions
    } = require("../../webauthn-simple-app"); // eslint-disable-line global-require
    global.defaultRoutes = defaultRoutes;
    global.Msg = Msg;
    global.ServerResponse = ServerResponse;
    global.CreationOptionsRequest = CreationOptionsRequest;
    global.CreationOptions = CreationOptions;
    global.CredentialAttestation = CredentialAttestation;
    global.GetOptionsRequest = GetOptionsRequest;
    global.GetOptions = GetOptions;
    global.CreationOptionsRequest = CreationOptionsRequest;
    global.CredentialAssertion = CredentialAssertion;
    global.WebAuthnOptions = WebAuthnOptions;
} else {
    // browser setup
    window.assert = chai.assert;
    mocha.setup("bdd");
}

describe("defaultRoutes", function() {
    it("is object", function() {
        assert.isObject(defaultRoutes);
    });

    it("has attestationOptions", function() {
        assert.isString(defaultRoutes.attestationOptions);
        assert.strictEqual(defaultRoutes.attestationOptions, "/attestation/options");
    });
    it("has attestationResult", function() {
        assert.isString(defaultRoutes.attestationResult);
        assert.strictEqual(defaultRoutes.attestationResult, "/attestation/result");
    });

    it("has assertionOptions", function() {
        assert.isString(defaultRoutes.assertionOptions);
        assert.strictEqual(defaultRoutes.assertionOptions, "/assertion/options");
    });

    it("has assertionResult", function() {
        assert.isString(defaultRoutes.assertionResult);
        assert.strictEqual(defaultRoutes.assertionResult, "/assertion/result");
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

    it("converts correctly", function() {
        var inputObj = {
            username: "adam",
            displayName: "AdamPowers"
        };
        var msg = CreationOptionsRequest.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.creationOptionsRequest);
        });

        it("passes with basic args", function() {
            var msg = CreationOptionsRequest.from(testArgs);
            msg.validate();
        });

        it("throws on missing username", function() {
            delete testArgs.username;
            var msg = CreationOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = CreationOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = CreationOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = CreationOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });
    });
});

describe("CreationOptions", function() {
    it("is loaded", function() {
        assert.isFunction(CreationOptions);
    });

    it("is ServerResponse class", function() {
        var msg = new CreationOptions();
        assert.instanceOf(msg, ServerResponse);
    });

    it("converts correctly", function() {
        var msg = CreationOptions.from(fido2Helpers.server.completeCreationOptions);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.completeCreationOptions);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeCreationOptions);
        });

        it("accepts basic CreationOptions", function() {
            var msg = CreationOptions.from(fido2Helpers.server.basicCreationOptions);

            msg.validate();
        });

        it("accepts complete CreationOptions", function() {
            var msg = CreationOptions.from(fido2Helpers.server.completeCreationOptions);

            msg.validate();
        });

        it("throws on bad ServerResponse", function() {
            delete testArgs.status;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing rp", function() {
            delete testArgs.rp;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rp' to be 'Object', got: undefined");
        });

        it("throws on missing rp.name", function() {
            delete testArgs.rp.name;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on empty rp.name", function() {
            testArgs.rp.name = "";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be non-empty string");
        });

        it("throws on non-string rp.name", function() {
            testArgs.rp.name = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: number");
        });

        it("throws on empty rp.id", function() {
            testArgs.rp.id = "";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be non-empty string");
        });

        it("throws on non-string rp.id", function() {
            testArgs.rp.id = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("throws on empty rp.icon", function() {
            testArgs.rp.icon = "";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'icon' to be non-empty string");
        });

        it("throws on non-string rp.icon", function() {
            testArgs.rp.icon = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'icon' to be 'string', got: number");
        });

        it("throws on missing user", function() {
            delete testArgs.user;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'user' to be 'Object', got: undefined");
        });

        it("throws on missing user.name", function() {
            delete testArgs.user.name;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on missing user.displayName", function() {
            delete testArgs.user.displayName;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on missing user.id", function() {
            delete testArgs.user.id;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on missing pubKeyCredParams", function() {
            delete testArgs.pubKeyCredParams;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'pubKeyCredParams' to be 'Array', got: undefined");
        });

        it("throws on missing pubKeyCredParams[0].type", function() {
            delete testArgs.pubKeyCredParams[0].type;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing pubKeyCredParams[0].alg", function() {
            delete testArgs.pubKeyCredParams[0].alg;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'alg' to be 'number', got: undefined");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout NaN", function() {
            testArgs.timeout = NaN;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout float", function() {
            testArgs.timeout = 3.14159;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on missing excludeCredentials[0].type", function() {
            delete testArgs.excludeCredentials[0].type;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing excludeCredentials[0].id", function() {
            delete testArgs.excludeCredentials[0].id;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("allows missing excludeCredentials[0].transports", function() {
            delete testArgs.excludeCredentials[0].transports;
            var msg = CreationOptions.from(testArgs);

            msg.validate();
        });

        it("throws on non-Array excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: 42");
        });

        it("throws on invalid excludeCredentials[0].transports string", function() {
            testArgs.excludeCredentials[0].transports = ["blah"];
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: blah");
        });

        it("throws on invalid excludeCredentials[0].transports type", function() {
            testArgs.excludeCredentials[0].transports = [42];
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: 42");
        });

        it("allows empty excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = [];
            var msg = CreationOptions.from(testArgs);

            msg.validate();
        });

        it("throws on wrong type authenticatorSelection", function() {
            testArgs.authenticatorSelection = "hi";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'authenticatorSelection' to be 'Object', got: hi");
        });

        it("throws on wrong type authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on invalid authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = "beer";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on wrong type authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = 42;
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = "bob";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type authenticatorSelection.requireResidentKey", function() {
            testArgs.authenticatorSelection.requireResidentKey = "hi";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'requireResidentKey' to be 'boolean', got: string");
        });

        it("throws on invalid attestation", function() {
            testArgs.attestation = "hi";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected attestation to be 'direct', 'none', or 'indirect'");
        });

        it("throws on invalid extensions", function() {
            testArgs.extensions = "hi";
            var msg = CreationOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: hi");
        });
    });
});

describe("CredentialAttestation", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAttestation);
    });

    it("is Msg class", function() {
        var msg = new CredentialAttestation();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
    });

    describe("validation", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        });

        it("passes with default args", function() {
            var msg = CredentialAttestation.from(testArgs);
            msg.validate();
        });

        it("throws on missing rawId", function() {
            delete testArgs.rawId;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on non-base64url rawId", function() {
            testArgs.rawId = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on base64 rawId", function() {
            testArgs.rawId = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing response.attestationObject", function() {
            delete testArgs.response.attestationObject;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: undefined");
        });

        it("throws on wrong type response.attestationObject", function() {
            testArgs.response.attestationObject = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: number");
        });

        it("throws on empty response.attestationObject", function() {
            testArgs.response.attestationObject = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on non-base64url response.attestationObject", function() {
            testArgs.response.attestationObject = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on base64 response.attestationObject", function() {
            testArgs.response.attestationObject = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on missing response.clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on wrong type response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: number");
        });

        it("throws on empty response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on non-base64url response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on base64 response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });
    });
});

describe("GetOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptionsRequest);
    });

    it("is Msg class", function() {
        var msg = new GetOptionsRequest();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var inputObj = {
            username: "adam",
            displayName: "AdamPowers"
        };
        var msg = GetOptionsRequest.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.getOptionsRequest);
        });

        it("passes with basic args", function() {
            var msg = GetOptionsRequest.from(testArgs);
            msg.validate();
        });

        it("throws on missing username", function() {
            delete testArgs.username;
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });
    });
});

describe("GetOptions", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptions);
    });

    it("is ServerResponse class", function() {
        var msg = new GetOptions();
        assert.instanceOf(msg, ServerResponse);
    });

    it("converts correctly", function() {
        var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.completeGetOptions);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeGetOptions);
        });

        it("allows basic data", function() {
            var msg = GetOptions.from(fido2Helpers.server.basicGetOptions);
            msg.validate();
        });

        it("allows complete data", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.validate();
        });

        it("throws on missing status", function() {
            delete testArgs.status;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on empty challenge", function() {
            testArgs.challenge = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'challenge' to be base64url format, got:");
        });

        it("throws on wrong type challenge", function() {
            testArgs.challenge = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: object");
        });

        it("throws on wrong type timeout", function() {
            testArgs.timeout = "beer";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be 'number', got: string");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on NaN timeout", function() {
            testArgs.timeout = NaN;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on float timeout", function() {
            testArgs.timeout = 3.14159;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on wrong type rpId", function() {
            testArgs.rpId = [];
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rpId' to be 'string', got: object");
        });

        it("throws on empty rpId", function() {
            testArgs.rpId = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rpId' to be non-empty string");
        });

        it("throws on wrong type allowCredentials", function() {
            testArgs.allowCredentials = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'allowCredentials' to be 'Array', got: 42");
        });

        it("throws on missing allowCredentials[0].type", function() {
            delete testArgs.allowCredentials[0].type;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on wrong type allowCredentials[0].type", function() {
            testArgs.allowCredentials[0].type = -7;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing allowCredentials[0].id", function() {
            delete testArgs.allowCredentials[0].id;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on wrong type allowCredentials[0].id", function() {
            testArgs.allowCredentials[0].id = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: object");
        });

        it("throws on wrong type allowCredentials[0].transports", function() {
            testArgs.allowCredentials[0].transports = "usb";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: usb");
        });

        it("throws on invalid transport", function() {
            testArgs.allowCredentials[0].transports = ["foo"];
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: foo");
        });

        it("throws on wrong type userVerification", function() {
            testArgs.userVerification = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid userVerification", function() {
            testArgs.userVerification = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type extensions", function() {
            testArgs.extensions = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: foo");
        });
    });
});

describe("CredentialAssertion", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAssertion);
    });

    it("is Msg class", function() {
        var msg = new CredentialAssertion();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.assertionResponseMsgB64Url);
    });

    describe("validation", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.assertionResponseMsgB64Url);
        });

        it("allows basic data", function() {
            var msg = CredentialAssertion.from(testArgs);
            msg.validate();
        });

        it("throws on missing rawId", function() {
            delete testArgs.rawId;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got:");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing authenticatorData", function() {
            delete testArgs.response.authenticatorData;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: undefined");
        });

        it("throws on emtpy authenticatorData", function() {
            testArgs.response.authenticatorData = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be base64url format, got: ");
        });

        it("throws on wrong type authenticatorData", function() {
            testArgs.response.authenticatorData = /foo/;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: object");
        });

        it("throws on missing clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on empty clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on wrong type clientDataJSON", function() {
            testArgs.response.clientDataJSON = [];
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: object");
        });

        it("throws on missing signature", function() {
            delete testArgs.response.signature;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: undefined");
        });

        it("throws on empty signature", function() {
            testArgs.response.signature = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'signature' to be base64url format, got: ");
        });

        it("throws on wrong type signature", function() {
            testArgs.response.signature = {};
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: object");
        });

        it("passes on missing userhandle", function() {
            delete testArgs.response.userHandle;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on null userhandle", function() {
            delete testArgs.response.userHandle;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on empty userhandle", function() {
            testArgs.response.userHandle = "";
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("throws on wrong type userhandle", function() {
            testArgs.response.userHandle = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(function() {
                msg.validate();
            }, Error, "expected 'userHandle' to be null or string");
        });
    });
});

describe("WebAuthnOptions", function() {
    it("is loaded", function() {
        assert.isFunction(WebAuthnOptions);
    });

    it("is Msg class", function() {
        var msg = new WebAuthnOptions();
        assert.instanceOf(msg, Msg);
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
