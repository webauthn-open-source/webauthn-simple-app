/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("CredentialAssertion", function() {
    const {
        CredentialAssertion,
        Msg
    } = GlobalWebAuthnClasses;

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

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got:");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("allows missing id", function() {
            delete testArgs.id;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("throws on empty id", function() {
            testArgs.id = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got:");
        });

        it("throws on wrong type id", function() {
            testArgs.id = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });


        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing authenticatorData", function() {
            delete testArgs.response.authenticatorData;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: undefined");
        });

        it("throws on emtpy authenticatorData", function() {
            testArgs.response.authenticatorData = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be base64url format, got: ");
        });

        it("throws on wrong type authenticatorData", function() {
            testArgs.response.authenticatorData = /foo/;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: object");
        });

        it("throws on missing clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on empty clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on wrong type clientDataJSON", function() {
            testArgs.response.clientDataJSON = [];
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: object");
        });

        it("throws on missing signature", function() {
            delete testArgs.response.signature;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: undefined");
        });

        it("throws on empty signature", function() {
            testArgs.response.signature = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be base64url format, got: ");
        });

        it("throws on wrong type signature", function() {
            testArgs.response.signature = {};
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: object");
        });

        it("passes on missing userHandle", function() {
            delete testArgs.response.userHandle;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on null userHandle", function() {
            testArgs.response.userHandle = null;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on empty userHandle", function() {
            testArgs.response.userHandle = "";
            var msg = CredentialAssertion.from(testArgs);
            msg.validate();
        });

        it("throws on wrong type userHandle", function() {
            testArgs.response.userHandle = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'userHandle' to be null or string");
        });

        it("throws on null getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = null;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: null");
        });

        it("throws on string getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = "foo";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: foo");
        });

        it("allows empty Object getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = {};
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("allows complex Object getClientExtensionResults", function() {
            var exts = {
                foo: "bar",
                alice: {
                    goes: {
                        down: {
                            the: {
                                hole: "after the rabbit"
                            }
                        }
                    }
                },
                arr: ["a", { b: "c" }, 1, 2, 3]
            };

            testArgs.getClientExtensionResults = exts;
            var msg = CredentialAssertion.from(testArgs);
            assert.deepEqual(msg.getClientExtensionResults, exts);

            msg.validate();
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            assert.isString(msg.rawId);
            assert.isString(msg.response.clientDataJSON);
            assert.isString(msg.response.signature);
            assert.isString(msg.response.authenticatorData);
            // assert.isNull(msg.response.userHandle);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.rawId, ArrayBuffer);
            assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            assert.instanceOf(msg.response.signature, ArrayBuffer);
            assert.instanceOf(msg.response.authenticatorData, ArrayBuffer);
            assert.instanceOf(msg.response.userHandle, ArrayBuffer);
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.rawId, ArrayBuffer);
            assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            assert.instanceOf(msg.response.signature, ArrayBuffer);
            assert.instanceOf(msg.response.authenticatorData, ArrayBuffer);
            assert.instanceOf(msg.response.userHandle, ArrayBuffer);
            msg.encodeBinaryProperties();
            assert.isString(msg.rawId);
            assert.isString(msg.response.clientDataJSON);
            assert.isString(msg.response.signature);
            assert.isString(msg.response.authenticatorData);
            assert.isNull(msg.response.userHandle);
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CredentialAssertion] {
    rawId: [ArrayBuffer] (162 bytes)
        00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
        CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
        33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
        EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
        28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
        4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
        AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
        27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
        67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
        46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
        05 1B,
    id: [ArrayBuffer] (162 bytes)
        00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
        CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
        33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
        EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
        28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
        4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
        AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
        27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
        67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
        46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
        05 1B,
    response: {
        clientDataJSON: [ArrayBuffer] (206 bytes)
            7B 22 63 68 61 6C 6C 65 6E 67 65 22 3A 22 65 61
            54 79 55 4E 6E 79 50 44 44 64 4B 38 53 4E 45 67
            54 45 55 76 7A 31 51 38 64 79 6C 6B 6A 6A 54 69
            6D 59 64 35 58 37 51 41 6F 2D 46 38 5F 5A 31 6C
            73 4A 69 33 42 69 6C 55 70 46 5A 48 6B 49 43 4E
            44 57 59 38 72 39 69 76 6E 54 67 57 37 2D 58 5A
            43 33 71 51 22 2C 22 63 6C 69 65 6E 74 45 78 74
            65 6E 73 69 6F 6E 73 22 3A 7B 7D 2C 22 68 61 73
            68 41 6C 67 6F 72 69 74 68 6D 22 3A 22 53 48 41
            2D 32 35 36 22 2C 22 6F 72 69 67 69 6E 22 3A 22
            68 74 74 70 73 3A 2F 2F 6C 6F 63 61 6C 68 6F 73
            74 3A 38 34 34 33 22 2C 22 74 79 70 65 22 3A 22
            77 65 62 61 75 74 68 6E 2E 67 65 74 22 7D,
        authenticatorData: [ArrayBuffer] (37 bytes)
            49 96 0D E5 88 0E 8C 68 74 34 17 0F 64 76 60 5B
            8F E4 AE B9 A2 86 32 C7 99 5C F3 BA 83 1D 97 63
            01 00 00 01 6B,
        signature: [ArrayBuffer] (72 bytes)
            30 46 02 21 00 FA 74 5D C1 D1 9A 1A 2C 0D 2B EF
            CA 32 45 DA 0C 35 1D 1B 37 DD D9 8B 87 05 FF BE
            61 14 01 FA A5 02 21 00 B6 34 50 8B 2B 87 4D EE
            FD FE 32 28 EC 33 C0 3E 82 8F 7F C6 58 B2 62 8A
            84 D3 F7 9F 34 B3 56 BB,
        userHandle: [ArrayBuffer] (0 bytes),
    },
}`
            );
        });
    });
});
