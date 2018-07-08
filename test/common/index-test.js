/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("index", function() {
    it("imported", function() {
        assert.isDefined(GlobalWebAuthnClasses);
    });

    it("has CreateOptions", function() {
        assert.isFunction(GlobalWebAuthnClasses.CreateOptions);
    });

    it("has CreateOptionsRequest", function() {
        assert.isFunction(GlobalWebAuthnClasses.CreateOptionsRequest);
    });

    it("has CredentialAssertion", function() {
        assert.isFunction(GlobalWebAuthnClasses.CredentialAssertion);
    });

    it("has CredentialAttestation", function() {
        assert.isFunction(GlobalWebAuthnClasses.CredentialAttestation);
    });

    it("has GetOptions", function() {
        assert.isFunction(GlobalWebAuthnClasses.GetOptions);
    });

    it("has GetOptionsRequest", function() {
        assert.isFunction(GlobalWebAuthnClasses.GetOptionsRequest);
    });

    it("has Msg", function() {
        assert.isFunction(GlobalWebAuthnClasses.Msg);
    });

    it("has ServerResponse", function() {
        assert.isFunction(GlobalWebAuthnClasses.ServerResponse);
    });

    it("has WebAuthnHelpers", function() {
        assert.isObject(GlobalWebAuthnClasses.WebAuthnHelpers);
    });

    describe("WebAuthnHelpers", function() {
        it("has utils", function() {
            // XXX isObject fails
            assert.isDefined(GlobalWebAuthnClasses.WebAuthnHelpers.utils);
        });

        describe("utils", function() {
            it("has coerceToBase64Url", function() {
                assert.isFunction(GlobalWebAuthnClasses.WebAuthnHelpers.utils.coerceToBase64Url);
            });

            it("has coerceToArrayBuffer", function() {
                assert.isFunction(GlobalWebAuthnClasses.WebAuthnHelpers.utils.coerceToArrayBuffer);
            });
        });
    });
});
