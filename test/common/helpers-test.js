/* globals chai, assert, fido2Helpers, Msg */
import { WebAuthnHelpers } from "../../index.js";
const {
    coerceToBase64Url,
    coerceToArrayBuffer
} = WebAuthnHelpers.utils;

describe("helpers", function() {
    describe("defaultRoutes", function() {
        var defaultRoutes = WebAuthnHelpers.defaultRoutes;
        it("is object", function() {
            // assert.isObject(defaultRoutes);
            assert.isDefined(defaultRoutes);
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

    describe("utils", function() {
        describe("coerceToBase64Url", function() {
            it("exists", function() {
                assert.isFunction(coerceToBase64Url);
            });

            it("coerce ArrayBuffer to base64url", function() {
                var ab = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                var res = coerceToBase64Url(ab);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });

            it("coerce Uint8Array to base64url", function() {
                var buf = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]);
                var res = coerceToBase64Url(buf);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });

            it("coerce Array to base64url", function() {
                var arr = [
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ];
                var res = coerceToBase64Url(arr);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });

            it("coerce base64 to base64url", function() {
                var b64 = "AAECAwQFBgcJCgsMDQ4/+A==";
                var res = coerceToBase64Url(b64);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });

            it("coerce base64url to base64url", function() {
                var b64url = "AAECAwQFBgcJCgsMDQ4_-A";
                var res = coerceToBase64Url(b64url);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });

            it("throws on incompatible: number", function() {
                assert.throws(() => {
                    coerceToBase64Url(42, "test.number");
                }, Error, "could not coerce 'test.number' to string");
            });

            it("throws on incompatible: undefined", function() {
                assert.throws(() => {
                    coerceToBase64Url(undefined, "test.number");
                }, Error, "could not coerce 'test.number' to string");
            });
        });

        describe("coerceToArrayBuffer", function() {
            it("exists", function() {
                assert.isFunction(coerceToArrayBuffer);
            });

            it("coerce base64url to ArrayBuffer", function() {
                var b64url = "AAECAwQFBgcJCgsMDQ4_-A";
                var res = coerceToArrayBuffer(b64url);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("coerce base64 to ArrayBuffer", function() {
                var b64 = "AAECAwQFBgcJCgsMDQ4/+A==";
                var res = coerceToArrayBuffer(b64);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("coerce Array to ArrayBuffer", function() {
                var arr = [
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ];
                var res = coerceToArrayBuffer(arr);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("coerce Uint8Array to ArrayBuffer", function() {
                var buf = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]);
                var res = coerceToArrayBuffer(buf);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("coerce ArrayBuffer to ArrayBuffer", function() {
                var ab = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                var res = coerceToArrayBuffer(ab);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("throws on incompatible: number", function() {
                assert.throws(() => {
                    coerceToArrayBuffer(42, "test.number");
                }, Error, "could not coerce 'test.number' to ArrayBuffer");
            });

            it("throws on incompatible: undefined", function() {
                assert.throws(() => {
                    coerceToArrayBuffer(undefined, "test.number");
                }, Error, "could not coerce 'test.number' to ArrayBuffer");
            });

            it("throws on incompatible: object", function() {
                assert.throws(() => {
                    coerceToArrayBuffer({}, "test.number");
                }, Error, "could not coerce 'test.number' to ArrayBuffer");
            });
        });
    });
});
