/* globals chai, assert, fido2Helpers, Msg */
import {
    Msg,
    ServerResponse
} from "../../index.js";

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

        assert.deepEqual(msg.propList, ["status", "errorMessage", "debugInfo"]);
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

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: foobar");
        });

        it("throws on ok with errorMessage", function() {
            var msg = ServerResponse.from({
                status: "ok",
                errorMessage: "there is no error"
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "errorMessage must be empty string when status is 'ok'");
        });

        it("throws on failed with empty errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
                errorMessage: ""
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "errorMessage must be non-zero length when status is 'failed'");
        });

        it("throws on failed without errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'errorMessage' to be 'string', got: undefined");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });
            msg.encodeBinaryProperties();
        });
    });

    describe("attestation debugInfo", function() {
        var debugInfo;
        beforeEach(function() {
            debugInfo =
            {
                clientData: {
                    challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                    origin: "https://localhost:8443",
                    type: "webauthn.create",
                    tokenBinding: undefined,
                    rawClientDataJson: new ArrayBuffer(),
                    rawId: new ArrayBuffer()
                },
                authnrData: {
                    fmt: "none",
                    rawAuthnrData: new ArrayBuffer(),
                    rpIdHash: new ArrayBuffer(),
                    flags: new Set(["UP", "AT"]),
                    counter: 0,
                    aaguid: new ArrayBuffer(),
                    credIdLen: 162,
                    credId: new ArrayBuffer(),
                    credentialPublicKeyCose: new ArrayBuffer(),
                    credentialPublicKeyJwk: {
                        kty: "EC",
                        alg: "ECDSA_w_SHA256",
                        crv: "P-256",
                        x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                        y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                    },
                    credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                },
                audit: {
                    validExpectations: true,
                    validRequest: true,
                    complete: true,
                    warning: new Map(),
                    info: new Map([
                        ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                        ["fido-u2f-transports", new Set(["usb"])],
                        ["attestation-type", "basic"],
                    ]),
                }
            };
        });

        it("is included", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.isObject(msg.debugInfo);
            assert.isObject(msg.debugInfo.clientData);
            assert.isObject(msg.debugInfo.authnrData);
        });

        it("validates", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            msg.validate();
        });

        it("encodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
        });

        it("decodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
        });
    });

    describe.skip("assertion debugInfo", function() {
        var debugInfo;
        beforeEach(function() {
            debugInfo =
            {
                clientData: {
                    challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                    origin: "https://localhost:8443",
                    type: "webauthn.create",
                    tokenBinding: undefined,
                    rawClientDataJson: new ArrayBuffer(),
                    rawId: new ArrayBuffer()
                },
                authnrData: {
                    fmt: "none",
                    rawAuthnrData: new ArrayBuffer(),
                    rpIdHash: new ArrayBuffer(),
                    flags: new Set(["UP", "AT"]),
                    counter: 0,
                    aaguid: new ArrayBuffer(),
                    credIdLen: 162,
                    credId: new ArrayBuffer(),
                    credentialPublicKeyCose: new ArrayBuffer(),
                    credentialPublicKeyJwk: {
                        kty: "EC",
                        alg: "ECDSA_w_SHA256",
                        crv: "P-256",
                        x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                        y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                    },
                    credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                }
            };
        });

        it("is included", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.isObject(msg.debugInfo);
            assert.isObject(msg.debugInfo.clientData);
            assert.isObject(msg.debugInfo.authnrData);
        });

        it("validates", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            msg.validate();
        });

        it("encodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
        });

        it("decodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
        });
    });


    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string for attestation", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: {
                    clientData: {
                        challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                        origin: "https://localhost:8443",
                        type: "webauthn.create",
                        tokenBinding: undefined,
                        rawClientDataJson: new ArrayBuffer(),
                        rawId: new ArrayBuffer()
                    },
                    authnrData: {
                        fmt: "none",
                        rawAuthnrData: new ArrayBuffer(),
                        rpIdHash: new ArrayBuffer(),
                        flags: new Set(["UP", "AT"]),
                        counter: 0,
                        aaguid: new ArrayBuffer(),
                        credIdLen: 162,
                        credId: new ArrayBuffer(),
                        credentialPublicKeyCose: new ArrayBuffer(),
                        credentialPublicKeyJwk: {
                            kty: "EC",
                            alg: "ECDSA_w_SHA256",
                            crv: "P-256",
                            x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                            y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                        },
                        credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                    },
                    audit: {
                        validExpectations: true,
                        validRequest: true,
                        complete: true,
                        warning: new Map(),
                        info: new Map([
                            ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                            ["fido-u2f-transports", new Set(["usb"])],
                            ["attestation-type", "basic"],
                        ]),
                    }
                }
            });
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[ServerResponse] {
    status: "ok",
    debugInfo: {
        clientData: {
            challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
            origin: "https://localhost:8443",
            type: "webauthn.create",
            tokenBinding: undefined,
            rawClientDataJson: [ArrayBuffer] (0 bytes),
            rawId: [ArrayBuffer] (0 bytes),
        },
        authnrData: {
            fmt: "none",
            rawAuthnrData: [ArrayBuffer] (0 bytes),
            rpIdHash: [ArrayBuffer] (0 bytes),
            flags: [
                "UP",
                "AT",
            ],
            counter: 0,
            aaguid: [ArrayBuffer] (0 bytes),
            credIdLen: 162,
            credId: [ArrayBuffer] (0 bytes),
            credentialPublicKeyCose: [ArrayBuffer] (0 bytes),
            credentialPublicKeyJwk: {
                kty: "EC",
                alg: "ECDSA_w_SHA256",
                crv: "P-256",
                x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM=",
            },
            credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----
                MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC
                FZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==
                -----END PUBLIC KEY-----
                ",
        },
        audit: {
            validExpectations: true,
            validRequest: true,
            complete: true,
            warning: {
            },
            info: {
            },
        },
    },
}`
            );
        });

        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string for assertion", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: {
                    clientData: {
                        challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                        origin: "https://localhost:8443",
                        type: "webauthn.create",
                        tokenBinding: undefined,
                        rawClientDataJson: new ArrayBuffer(),
                        rawId: new ArrayBuffer()
                    },
                    authnrData: {
                        fmt: "none",
                        rawAuthnrData: new ArrayBuffer(),
                        rpIdHash: new ArrayBuffer(),
                        flags: new Set(["UP", "AT"]),
                        counter: 0,
                        aaguid: new ArrayBuffer(),
                        credIdLen: 162,
                        credId: new ArrayBuffer(),
                        credentialPublicKeyCose: new ArrayBuffer(),
                        credentialPublicKeyJwk: {
                            kty: "EC",
                            alg: "ECDSA_w_SHA256",
                            crv: "P-256",
                            x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                            y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                        },
                        credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                    },
                    audit: {
                        validExpectations: true,
                        validRequest: true,
                        complete: true,
                        warning: new Map(),
                        info: new Map([
                            ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                            ["fido-u2f-transports", new Set(["usb"])],
                            ["attestation-type", "basic"],
                        ]),
                    }
                }
            });
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[ServerResponse] {
    status: "ok",
    debugInfo: {
        clientData: {
            challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
            origin: "https://localhost:8443",
            type: "webauthn.create",
            tokenBinding: undefined,
            rawClientDataJson: [ArrayBuffer] (0 bytes),
            rawId: [ArrayBuffer] (0 bytes),
        },
        authnrData: {
            fmt: "none",
            rawAuthnrData: [ArrayBuffer] (0 bytes),
            rpIdHash: [ArrayBuffer] (0 bytes),
            flags: [
                "UP",
                "AT",
            ],
            counter: 0,
            aaguid: [ArrayBuffer] (0 bytes),
            credIdLen: 162,
            credId: [ArrayBuffer] (0 bytes),
            credentialPublicKeyCose: [ArrayBuffer] (0 bytes),
            credentialPublicKeyJwk: {
                kty: "EC",
                alg: "ECDSA_w_SHA256",
                crv: "P-256",
                x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM=",
            },
            credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----
                MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC
                FZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==
                -----END PUBLIC KEY-----
                ",
        },
        audit: {
            validExpectations: true,
            validRequest: true,
            complete: true,
            warning: {
            },
            info: {
            },
        },
    },
}`
            );
        });
    });
});
