/* globals chai, assert, fido2Helpers, Msg */
import {
    CreateOptions,
    ServerResponse
} from "../../index.js";

describe("CreateOptions", function() {
    it("is loaded", function() {
        assert.isFunction(CreateOptions);
    });

    it("is ServerResponse class", function() {
        var msg = new CreateOptions();
        assert.instanceOf(msg, ServerResponse);
    });

    it("converts correctly", function() {
        var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.completeCreationOptions);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeCreationOptions);
        });

        it("accepts basic CreateOptions", function() {
            var msg = CreateOptions.from(fido2Helpers.server.basicCreationOptions);

            msg.validate();
        });

        it("accepts complete CreateOptions", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);

            msg.validate();
        });

        it("throws on bad ServerResponse", function() {
            delete testArgs.status;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing rp", function() {
            delete testArgs.rp;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rp' to be 'Object', got: undefined");
        });

        it("throws on missing rp.name", function() {
            delete testArgs.rp.name;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on empty rp.name", function() {
            testArgs.rp.name = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be non-empty string");
        });

        it("throws on non-string rp.name", function() {
            testArgs.rp.name = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: number");
        });

        it("throws on empty rp.id", function() {
            testArgs.rp.id = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be non-empty string");
        });

        it("throws on non-string rp.id", function() {
            testArgs.rp.id = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("throws on empty rp.icon", function() {
            testArgs.rp.icon = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'icon' to be non-empty string");
        });

        it("throws on non-string rp.icon", function() {
            testArgs.rp.icon = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'icon' to be 'string', got: number");
        });

        it("throws on missing user", function() {
            delete testArgs.user;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'user' to be 'Object', got: undefined");
        });

        it("throws on missing user.name", function() {
            delete testArgs.user.name;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on missing user.displayName", function() {
            delete testArgs.user.displayName;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on missing user.id", function() {
            delete testArgs.user.id;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on missing pubKeyCredParams", function() {
            delete testArgs.pubKeyCredParams;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'pubKeyCredParams' to be 'Array', got: undefined");
        });

        it("throws on missing pubKeyCredParams[0].type", function() {
            delete testArgs.pubKeyCredParams[0].type;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing pubKeyCredParams[0].alg", function() {
            delete testArgs.pubKeyCredParams[0].alg;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'alg' to be 'number', got: undefined");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout NaN", function() {
            testArgs.timeout = NaN;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout float", function() {
            testArgs.timeout = 3.14159;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on missing excludeCredentials[0].type", function() {
            delete testArgs.excludeCredentials[0].type;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing excludeCredentials[0].id", function() {
            delete testArgs.excludeCredentials[0].id;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("allows missing excludeCredentials[0].transports", function() {
            delete testArgs.excludeCredentials[0].transports;
            var msg = CreateOptions.from(testArgs);

            msg.validate();
        });

        it("throws on non-Array excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: 42");
        });

        it("throws on invalid excludeCredentials[0].transports string", function() {
            testArgs.excludeCredentials[0].transports = ["blah"];
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: blah");
        });

        it("throws on invalid excludeCredentials[0].transports type", function() {
            testArgs.excludeCredentials[0].transports = [42];
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: 42");
        });

        it("allows empty excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = [];
            var msg = CreateOptions.from(testArgs);

            msg.validate();
        });

        it("throws on wrong type authenticatorSelection", function() {
            testArgs.authenticatorSelection = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorSelection' to be 'Object', got: hi");
        });

        it("throws on wrong type authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on invalid authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = "beer";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on wrong type authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = "bob";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type authenticatorSelection.requireResidentKey", function() {
            testArgs.authenticatorSelection.requireResidentKey = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'requireResidentKey' to be 'boolean', got: string");
        });

        it("throws on invalid attestation", function() {
            testArgs.attestation = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected attestation to be 'direct', 'none', or 'indirect'");
        });

        it("throws on invalid extensions", function() {
            testArgs.extensions = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: hi");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            assert.isString(msg.user.id);
            assert.isString(msg.challenge);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.user.id, ArrayBuffer);
            assert.instanceOf(msg.challenge, ArrayBuffer);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.user.id, ArrayBuffer);
            assert.instanceOf(msg.challenge, ArrayBuffer);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
            msg.encodeBinaryProperties();
            assert.isString(msg.user.id);
            assert.isString(msg.challenge);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CreateOptions] {
    status: "ok",
    rp: {
        name: "My RP",
        id: "TXkgUlA=",
        icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg=",
    },
    user: {
        id: [ArrayBuffer] (4 bytes)
            61 64 61 6D,
        displayName: "Adam Powers",
        name: "apowers",
        icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg=",
    },
    challenge: [ArrayBuffer] (64 bytes)
        B0 FE 0C 8B 0A 1D 8E B7 82 F3 EF 34 20 C8 DC C9
        63 65 A3 F6 35 48 95 E6 16 04 0D 06 29 67 8D D7
        F7 D1 64 6C 8C 50 E1 0D 89 9F 63 8F B8 BA 1A B6
        1C 58 D8 44 46 D7 76 BE 95 8E EB F3 D9 7B D3 8C,
    pubKeyCredParams: [
        {
            alg: -7,
            type: "public-key",
        },
    ],
    timeout: 30000,
    excludeCredentials: [
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
    authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        userVerification: "required",
    },
    attestation: "direct",
    extensions: {
    },
}`
            );
        });
    });
});
