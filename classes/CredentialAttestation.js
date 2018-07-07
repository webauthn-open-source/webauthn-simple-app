import {
    checkFormat,
    checkOptionalFormat,
    checkOptionalType,
    checkType
} from "../lib/input-validation.js";

import {
    coerceToArrayBuffer,
    coerceToBase64Url
} from "../lib/utils.js";

import { Msg } from "./Msg.js";

/**
 * This is the `PublicKeyCredential` that was the result of the `create()` call.
 * @extends {Msg}
 */
export class CredentialAttestation extends Msg {
    constructor() {
        super();

        this.propList = [
            "rawId",
            "id",
            "response",
            "getClientExtensionResults"
        ];
    }

    static from(obj) {
        obj = super.from(obj);

        // original response object is probably read-only
        if (typeof obj.response === "object") {
            var origResponse = obj.response;

            obj.response = {
                clientDataJSON: origResponse.clientDataJSON,
                attestationObject: origResponse.attestationObject,
            };
        }

        return obj;
    }

    validate() {
        checkFormat(this, "rawId", "base64url");
        checkOptionalFormat(this, "id", "base64url");
        checkType(this, "response", Object);
        checkFormat(this.response, "attestationObject", "base64url");
        checkFormat(this.response, "clientDataJSON", "base64url");
        checkOptionalType(this, "getClientExtensionResults", Object);
    }

    decodeBinaryProperties() {
        this.rawId = coerceToArrayBuffer(this.rawId, "rawId");
        if (this.id) this.id = coerceToArrayBuffer(this.id, "id");
        this.response.attestationObject = coerceToArrayBuffer(this.response.attestationObject, "response.attestationObject");
        this.response.clientDataJSON = coerceToArrayBuffer(this.response.clientDataJSON, "response.clientDataJSON");
    }

    encodeBinaryProperties() {
        this.rawId = coerceToBase64Url(this.rawId, "rawId");
        if (this.id) this.id = coerceToBase64Url(this.id, "id");
        this.response.attestationObject = coerceToBase64Url(this.response.attestationObject, "response.attestationObject");
        this.response.clientDataJSON = coerceToBase64Url(this.response.clientDataJSON, "response.clientDataJSON");
    }
}
