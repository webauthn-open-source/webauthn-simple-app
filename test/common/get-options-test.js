/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("GetOptions", function() {
    const {
        GetOptions,
        ServerResponse
    } = GlobalWebAuthnClasses;

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

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on empty challenge", function() {
            testArgs.challenge = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be base64url format, got:");
        });

        it("throws on wrong type challenge", function() {
            testArgs.challenge = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: object");
        });

        it("throws on wrong type timeout", function() {
            testArgs.timeout = "beer";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be 'number', got: string");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on NaN timeout", function() {
            testArgs.timeout = NaN;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on float timeout", function() {
            testArgs.timeout = 3.14159;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on wrong type rpId", function() {
            testArgs.rpId = [];
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rpId' to be 'string', got: object");
        });

        it("throws on empty rpId", function() {
            testArgs.rpId = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rpId' to be non-empty string");
        });

        it("throws on wrong type allowCredentials", function() {
            testArgs.allowCredentials = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'allowCredentials' to be 'Array', got: 42");
        });

        it("throws on missing allowCredentials[0].type", function() {
            delete testArgs.allowCredentials[0].type;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on wrong type allowCredentials[0].type", function() {
            testArgs.allowCredentials[0].type = -7;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing allowCredentials[0].id", function() {
            delete testArgs.allowCredentials[0].id;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on wrong type allowCredentials[0].id", function() {
            testArgs.allowCredentials[0].id = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: object");
        });

        it("throws on wrong type allowCredentials[0].transports", function() {
            testArgs.allowCredentials[0].transports = "usb";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: usb");
        });

        it("throws on invalid transport", function() {
            testArgs.allowCredentials[0].transports = ["foo"];
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: foo");
        });

        it("throws on wrong type userVerification", function() {
            testArgs.userVerification = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid userVerification", function() {
            testArgs.userVerification = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type extensions", function() {
            testArgs.extensions = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: foo");
        });

        it("passes with rawChallenge", function() {
            testArgs.rawChallenge = "AAAA";
            var msg = GetOptions.from(testArgs);

            msg.validate();
        });

        it("passes with undefined rawChallenge", function() {
            testArgs.rawChallenge = undefined;
            var msg = GetOptions.from(testArgs);

            msg.validate();
        });

        it("throws on non-string rawChallenge", function() {
            testArgs.rawChallenge = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawChallenge' to be 'string', got: number");
        });

        it("throws on non-base64url rawChallenge", function() {
            testArgs.rawChallenge = "!!!";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawChallenge' to be base64url format, got: !!!");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            assert.isString(msg.challenge);
            msg.allowCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.challenge, ArrayBuffer);
            msg.allowCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
        });

        it("decodes rawChallenge", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.rawChallenge = "AAAA";
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.rawChallenge, ArrayBuffer);
            assert.strictEqual(msg.rawChallenge.byteLength, 3);
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.challenge, ArrayBuffer);
            msg.allowCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
            msg.encodeBinaryProperties();
            assert.isString(msg.challenge);
            msg.allowCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
        });

        it("encodes rawChallenge", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.decodeBinaryProperties();
            msg.rawChallenge = new Uint8Array([0x00, 0x00, 0x00]).buffer;
            msg.encodeBinaryProperties();
            assert.strictEqual(msg.rawChallenge, "AAAA");
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[GetOptions] {
    status: "ok",
    challenge: [ArrayBuffer] (64 bytes)
        B0 FE 0C 8B 0A 1D 8E B7 82 F3 EF 34 20 C8 DC C9
        63 65 A3 F6 35 48 95 E6 16 04 0D 06 29 67 8D D7
        F7 D1 64 6C 8C 50 E1 0D 89 9F 63 8F B8 BA 1A B6
        1C 58 D8 44 46 D7 76 BE 95 8E EB F3 D9 7B D3 8C,
    timeout: 60000,
    rpId: "My RP",
    allowCredentials: [
        {
            type: "public-key",
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
            transports: [
                "usb",
                "nfc",
                "ble",
            ],
        },
    ],
    userVerification: "discouraged",
    extensions: {
    },
}`
            );
        });
    });
});

