/* globals chai, assert, fido2Helpers, Msg */
import * as WebAuthnApp from "../../index.js";

describe("index", function() {
    it("imported", function() {
        assert.isDefined(WebAuthnApp);
    });

    it("has CreateOptions", function() {
        assert.isFunction(WebAuthnApp.CreateOptions);
    });

    it("has CreateOptionsRequest", function() {
        assert.isFunction(WebAuthnApp.CreateOptionsRequest);
    });

    it("has CredentialAssertion", function() {
        assert.isFunction(WebAuthnApp.CredentialAssertion);
    });

    it("has CredentialAttestation", function() {
        assert.isFunction(WebAuthnApp.CredentialAttestation);
    });

    it("has GetOptions", function() {
        assert.isFunction(WebAuthnApp.GetOptions);
    });

    it("has GetOptionsRequest", function() {
        assert.isFunction(WebAuthnApp.GetOptionsRequest);
    });

    it("has Msg", function() {
        assert.isFunction(WebAuthnApp.Msg);
    });

    it("has ServerResponse", function() {
        assert.isFunction(WebAuthnApp.ServerResponse);
    });

    it("has WebAuthnApp", function() {
        assert.isFunction(WebAuthnApp.WebAuthnApp);
    });

    it("has WebAuthnHelpers", function() {
        assert.isObject(WebAuthnApp.WebAuthnHelpers);
    });

    describe("WebAuthnHelpers", function() {
        it("has utils", function() {
            // XXX isObject fails
            assert.isDefined(WebAuthnApp.WebAuthnHelpers.utils);
        });

        describe("utils", function() {
            it("has coerceToBase64Url", function() {
                assert.isFunction(WebAuthnApp.WebAuthnHelpers.utils.coerceToBase64Url);
            });

            it("has coerceToArrayBuffer", function() {
                assert.isFunction(WebAuthnApp.WebAuthnHelpers.utils.coerceToArrayBuffer);
            });
        });
    });
});
