/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("CredentialAttestation", function() {
    const {
        CredentialAttestation,
        Msg
    } = GlobalWebAuthnClasses;

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

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty id", function() {
            testArgs.id = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on non-base64url id", function() {
            testArgs.id = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on base64 id", function() {
            testArgs.id = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on wrong type id", function() {
            testArgs.id = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("allows on missing id", function() {
            delete testArgs.id;
            var msg = CredentialAttestation.from(testArgs);

            msg.validate();
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on non-base64url rawId", function() {
            testArgs.rawId = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on base64 rawId", function() {
            testArgs.rawId = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing response.attestationObject", function() {
            delete testArgs.response.attestationObject;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: undefined");
        });

        it("throws on wrong type response.attestationObject", function() {
            testArgs.response.attestationObject = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: number");
        });

        it("throws on empty response.attestationObject", function() {
            testArgs.response.attestationObject = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on non-base64url response.attestationObject", function() {
            testArgs.response.attestationObject = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on base64 response.attestationObject", function() {
            testArgs.response.attestationObject = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on missing response.clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on wrong type response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: number");
        });

        it("throws on empty response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on non-base64url response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on base64 response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on null getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = null;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: null");
        });

        it("throws on string getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = "foo";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: foo");
        });

        it("allows empty Object getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = {};
            var msg = CredentialAttestation.from(testArgs);

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
            var msg = CredentialAttestation.from(testArgs);
            assert.deepEqual(msg.getClientExtensionResults, exts);

            msg.validate();
        });

        describe("decodeBinaryProperties", function() {
            it("decodes correct fields", function() {
                var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
                assert.isString(msg.rawId);
                assert.isString(msg.id);
                assert.isString(msg.response.attestationObject);
                assert.isString(msg.response.clientDataJSON);
                msg.decodeBinaryProperties();
                assert.instanceOf(msg.rawId, ArrayBuffer);
                assert.instanceOf(msg.id, ArrayBuffer);
                assert.instanceOf(msg.response.attestationObject, ArrayBuffer);
                assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            });
        });

        describe("encodeBinaryProperties", function() {
            it("encodes correct fields", function() {
                var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
                msg.decodeBinaryProperties();
                assert.instanceOf(msg.rawId, ArrayBuffer);
                assert.instanceOf(msg.id, ArrayBuffer);
                assert.instanceOf(msg.response.attestationObject, ArrayBuffer);
                assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
                msg.encodeBinaryProperties();
                assert.isString(msg.rawId);
                assert.isString(msg.id);
                assert.isString(msg.response.attestationObject);
                assert.isString(msg.response.clientDataJSON);
            });
        });

        describe("toHumanString", function() {
            // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
            it("creates correct string", function() {
                var msg = CredentialAttestation.from(testArgs);
                var str = msg.toHumanString();
                assert.isString(str);
                assert.strictEqual(
                    str,
                    // eslint-disable-next-line
`[CredentialAttestation] {
    rawId: [ArrayBuffer] (162 bytes)
        00 08 A2 DD 5E AC 1A 86 A8 CD 6E D3 6C D6 98 94
        96 89 E5 BA FC 4E B0 5F 45 79 E8 7D 93 BA 97 6B
        2E 73 76 B9 B6 DF D7 16 E1 64 14 0F F9 79 A6 D4
        F3 44 B5 3D 6D 26 E0 86 7B F4 14 B6 91 03 BB 65
        CB B2 DA F7 F4 11 28 35 F0 64 CB 1B 59 A8 E5 84
        A4 21 DA 8B D8 9E 38 7A 0B 7E EA B7 23 EC D7 9D
        48 4C 31 6B FB AE C5 46 01 B4 73 67 49 0A 83 9A
        DA 14 01 F3 3D 2D 25 8B 97 AE 41 8C A5 59 34 65
        29 F5 AA 37 DE 63 12 75 57 D0 43 46 C7 CD EE BD
        25 54 2F 2C 17 FC 39 38 99 52 A2 6C 3A E2 A6 A6
        A5 1C,
    id: [ArrayBuffer] (162 bytes)
        00 08 A2 DD 5E AC 1A 86 A8 CD 6E D3 6C D6 98 94
        96 89 E5 BA FC 4E B0 5F 45 79 E8 7D 93 BA 97 6B
        2E 73 76 B9 B6 DF D7 16 E1 64 14 0F F9 79 A6 D4
        F3 44 B5 3D 6D 26 E0 86 7B F4 14 B6 91 03 BB 65
        CB B2 DA F7 F4 11 28 35 F0 64 CB 1B 59 A8 E5 84
        A4 21 DA 8B D8 9E 38 7A 0B 7E EA B7 23 EC D7 9D
        48 4C 31 6B FB AE C5 46 01 B4 73 67 49 0A 83 9A
        DA 14 01 F3 3D 2D 25 8B 97 AE 41 8C A5 59 34 65
        29 F5 AA 37 DE 63 12 75 57 D0 43 46 C7 CD EE BD
        25 54 2F 2C 17 FC 39 38 99 52 A2 6C 3A E2 A6 A6
        A5 1C,
    response: {
        clientDataJSON: [ArrayBuffer] (209 bytes)
            7B 22 63 68 61 6C 6C 65 6E 67 65 22 3A 22 33 33
            45 48 61 76 2D 6A 5A 31 76 39 71 77 48 37 38 33
            61 55 2D 6A 30 41 52 78 36 72 35 6F 2D 59 48 68
            2D 77 64 37 43 36 6A 50 62 64 37 57 68 36 79 74
            62 49 5A 6F 73 49 49 41 43 65 68 77 66 39 2D 73
            36 68 58 68 79 53 48 4F 2D 48 48 55 6A 45 77 5A
            53 32 39 77 22 2C 22 63 6C 69 65 6E 74 45 78 74
            65 6E 73 69 6F 6E 73 22 3A 7B 7D 2C 22 68 61 73
            68 41 6C 67 6F 72 69 74 68 6D 22 3A 22 53 48 41
            2D 32 35 36 22 2C 22 6F 72 69 67 69 6E 22 3A 22
            68 74 74 70 73 3A 2F 2F 6C 6F 63 61 6C 68 6F 73
            74 3A 38 34 34 33 22 2C 22 74 79 70 65 22 3A 22
            77 65 62 61 75 74 68 6E 2E 63 72 65 61 74 65 22
            7D,
        attestationObject: [ArrayBuffer] (325 bytes)
            A3 63 66 6D 74 64 6E 6F 6E 65 67 61 74 74 53 74
            6D 74 A0 68 61 75 74 68 44 61 74 61 59 01 26 49
            96 0D E5 88 0E 8C 68 74 34 17 0F 64 76 60 5B 8F
            E4 AE B9 A2 86 32 C7 99 5C F3 BA 83 1D 97 63 41
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
            00 00 00 00 00 A2 00 08 A2 DD 5E AC 1A 86 A8 CD
            6E D3 6C D6 98 94 96 89 E5 BA FC 4E B0 5F 45 79
            E8 7D 93 BA 97 6B 2E 73 76 B9 B6 DF D7 16 E1 64
            14 0F F9 79 A6 D4 F3 44 B5 3D 6D 26 E0 86 7B F4
            14 B6 91 03 BB 65 CB B2 DA F7 F4 11 28 35 F0 64
            CB 1B 59 A8 E5 84 A4 21 DA 8B D8 9E 38 7A 0B 7E
            EA B7 23 EC D7 9D 48 4C 31 6B FB AE C5 46 01 B4
            73 67 49 0A 83 9A DA 14 01 F3 3D 2D 25 8B 97 AE
            41 8C A5 59 34 65 29 F5 AA 37 DE 63 12 75 57 D0
            43 46 C7 CD EE BD 25 54 2F 2C 17 FC 39 38 99 52
            A2 6C 3A E2 A6 A6 A5 1C A5 01 02 03 26 20 01 21
            58 20 BB 11 CD DD 6E 9E 86 9D 15 59 72 9A 30 D8
            9E D4 9F 36 31 52 42 15 96 12 71 AB BB E2 8D 7B
            73 1F 22 58 20 DB D6 39 13 2E 2E E5 61 96 5B 83
            05 30 A6 A0 24 F1 09 88 88 F3 13 55 05 15 92 11
            84 C8 6A CA C3,
    },
}`
                );
            });
        });
    });
});
