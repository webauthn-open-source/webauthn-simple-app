"use strict";

const assert = require("chai").assert;
const {
    Msg,
    ServerResponse,
    CreationOptionsRequest,
    CreationOptions,
    CredentialAttestation,
    GetOptionsRequest,
    GetOptions,
    CredentialAssertion,
    WebAuthnOptions
} = require("../../webauthn-simple-app");

describe("WebAuthnApp", function() {
    it("is running on node", function() {
        assert.throws(() => {
            assert.isUndefined(window);
        }, ReferenceError, "window is not defined");
    });

    it("can load", function() {
        assert.isFunction(Msg);
        assert.isFunction(ServerResponse);
        assert.isFunction(CreationOptionsRequest);
        assert.isFunction(CreationOptions);
        assert.isFunction(CredentialAttestation);
        assert.isFunction(GetOptionsRequest);
        assert.isFunction(GetOptions);
        assert.isFunction(CredentialAssertion);
    });
});
