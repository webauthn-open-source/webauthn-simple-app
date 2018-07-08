/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("GetOptionsRequest", function() {
    const {
        GetOptionsRequest,
        Msg
    } = GlobalWebAuthnClasses;

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

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            msg.encodeBinaryProperties();
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[GetOptionsRequest] {
    username: "bubba",
    displayName: "Bubba Smith",
}`
            );
        });
    });
});
