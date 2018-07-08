/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

const {
    Msg,
    ServerResponse,
    CreateOptionsRequest,
    CreateOptions,
    CredentialAttestation,
    GetOptionsRequest,
    GetOptions,
    CredentialAssertion,
    WebAuthnHelpers,
    WebAuthnApp
} = GlobalWebAuthnClasses;

const {
    isNode,
    isBrowser,
    coerceToBase64Url,
    coerceToArrayBuffer
} = WebAuthnHelpers.utils;

describe("node", function() {
    it("is running on node", function() {
        assert.throws(() => {
            assert.isUndefined(window);
        }, ReferenceError, "window is not defined");
    });

    it("can load", function() {
        assert.isFunction(Msg);
        assert.isFunction(ServerResponse);
        assert.isFunction(CreateOptionsRequest);
        assert.isFunction(CreateOptions);
        assert.isFunction(CredentialAttestation);
        assert.isFunction(GetOptionsRequest);
        assert.isFunction(GetOptions);
        assert.isFunction(CredentialAssertion);
        assert.isUndefined(WebAuthnApp);
    });

    describe("utils", function() {
        describe("coerceToArrayBuffer", function() {
            it("can coerce Buffer to ArrayBuffer", function() {
                var ab = Buffer.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]);
                var res = coerceToArrayBuffer(ab);
                assert.instanceOf(res, ArrayBuffer);
                var expectedAb = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
            });

            it("coerceToArrayBuffer doesn't return Buffer", function() {
                var b64url = "AAECAwQFBgcJCgsMDQ4_-A";
                var res = coerceToArrayBuffer(b64url);
                assert.instanceOf(res, ArrayBuffer);
                assert.notInstanceOf(res, Buffer);
            });
        });

        describe("coerceToBase64Url", function() {
            it("can coerce Buffer to base64", function() {
                var ab = Uint8Array.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
                ]).buffer;
                var res = coerceToBase64Url(ab);
                assert.isString(res);
                assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
            });
        });

        describe("isNode", function() {
            it("returns true", function() {
                assert.isTrue(isNode());
            });
        });

        describe("isBrowser", function() {
            it("returns false", function() {
                assert.isFalse(isBrowser());
            });

        });
    });
});
