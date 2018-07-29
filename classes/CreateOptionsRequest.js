import {
    checkAttestation,
    checkAuthenticatorSelection,
    checkFormat,
    checkOptionalFormat
} from "../lib/input-validation.js";

import { Msg } from "./Msg.js";

/**
 * A {@link Msg} object that the browser sends to the server to request
 * the options to be used for the WebAuthn `create()` call.
 * @extends {Msg}
 */
export class CreateOptionsRequest extends Msg {
    constructor() {
        super();

        this.propList = [
            "username",
            "displayName",
            "authenticatorSelection",
            "attestation",
            "extraData"
        ];
    }

    validate() {
        checkFormat(this, "username", "non-empty-string");
        checkFormat(this, "displayName", "non-empty-string");
        checkAuthenticatorSelection(this);
        checkAttestation(this);
        checkOptionalFormat(this, "extraData", "base64url");
    }

    decodeBinaryProperties() {}

    encodeBinaryProperties() {}
}
