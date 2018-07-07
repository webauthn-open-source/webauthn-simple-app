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
 * This is the `PublicKeyCredential` that was the result of the `get()` call.
 * @extends {Msg}
 */
export class CredentialAssertion extends Msg {
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
                authenticatorData: origResponse.authenticatorData,
                signature: origResponse.signature,
                userHandle: origResponse.userHandle,
            };
        }

        return obj;
    }

    validate() {
        checkFormat(this, "rawId", "base64url");
        checkOptionalFormat(this, "id", "base64url");
        checkType(this, "response", Object);
        checkFormat(this.response, "authenticatorData", "base64url");
        checkFormat(this.response, "clientDataJSON", "base64url");
        checkFormat(this.response, "signature", "base64url");
        checkOptionalFormat(this.response, "userHandle", "nullable-base64");
        checkOptionalType(this, "getClientExtensionResults", Object);
    }

    decodeBinaryProperties() {
        this.rawId = coerceToArrayBuffer(this.rawId, "rawId");
        if (this.id) this.id = coerceToArrayBuffer(this.id, "id");
        this.response.clientDataJSON = coerceToArrayBuffer(this.response.clientDataJSON, "response.clientDataJSON");
        this.response.signature = coerceToArrayBuffer(this.response.signature, "response.signature");
        this.response.authenticatorData = coerceToArrayBuffer(this.response.authenticatorData, "response.authenticatorData");
        if (this.response.userHandle) {
            this.response.userHandle = coerceToArrayBuffer(this.response.userHandle, "response.authenticatorData");
        }
        if (this.response.userHandle === null || this.response.userHandle === "") {
            this.response.userHandle = new ArrayBuffer();
        }
    }

    encodeBinaryProperties() {
        this.rawId = coerceToBase64Url(this.rawId, "rawId");
        if (this.id) this.id = coerceToBase64Url(this.id, "id");
        this.response.clientDataJSON = coerceToBase64Url(this.response.clientDataJSON, "response.clientDataJSON");
        this.response.signature = coerceToBase64Url(this.response.signature, "response.signature");
        this.response.authenticatorData = coerceToBase64Url(this.response.authenticatorData, "response.authenticatorData");
        if (this.response.userHandle) {
            if (this.response.userHandle.byteLength > 0) this.response.userHandle = coerceToBase64Url(this.response.userHandle, "response.authenticatorData");
            else this.response.userHandle = null;
        }
    }
}
