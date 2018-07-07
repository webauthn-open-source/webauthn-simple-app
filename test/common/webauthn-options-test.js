/* globals chai, assert, fido2Helpers, Msg */
import {
    Msg,
    WebAuthnOptions
} from "../../index.js";

describe("WebAuthnOptions", function() {
    it("is loaded", function() {
        assert.isFunction(WebAuthnOptions);
    });

    it("is Msg class", function() {
        var msg = new WebAuthnOptions();
        assert.instanceOf(msg, Msg);
    });

    describe("merge", function() {
        it("dst over src", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, true);

            assert.strictEqual(src.timeout, 2);
        });

        it("src over dst", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 1);
        });

        it("sets missing values", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 2);
        });

        it("allows empty", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({});

            src.merge(dst, false);

            assert.isUndefined(src.timeout);
        });
    });
});
