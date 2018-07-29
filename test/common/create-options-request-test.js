/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("CreateOptionsRequest", function() {
    const {
        CreateOptionsRequest,
        Msg
    } = GlobalWebAuthnClasses;

    it("is loaded", function() {
        assert.isFunction(CreateOptionsRequest);
    });

    it("is Msg class", function() {
        var msg = new CreateOptionsRequest();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var inputObj = {
            username: "adam",
            displayName: "AdamPowers"
        };
        var msg = CreateOptionsRequest.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.creationOptionsRequest);
        });

        it("passes with basic args", function() {
            var msg = CreateOptionsRequest.from(testArgs);
            msg.validate();
        });

        it("throws on missing username", function() {
            delete testArgs.username;
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });

        it("passes with extraData", function() {
            testArgs.extraData = "AAAA==";
            var msg = CreateOptionsRequest.from(testArgs);

            msg.validate();
        });

        it("passes with undefined extraData", function() {
            testArgs.extraData = undefined;
            var msg = CreateOptionsRequest.from(testArgs);

            msg.validate();
        });

        it("throws on non-string extraData", function() {
            testArgs.extraData = 42;
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extraData' to be 'string', got: number");
        });

        it("throws on non-base64url extraData", function() {
            testArgs.extraData = "!!!";
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extraData' to be base64url format, got: !!!");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            msg.encodeBinaryProperties();
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CreateOptionsRequest] {
    username: "bubba",
    displayName: "Bubba Smith",
    authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        userVerification: "preferred",
    },
    attestation: "none",
}`
            );
        });
    });
});
