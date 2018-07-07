import {
    ab2str,
    coerceToArrayBuffer,
    coerceToBase64Url,
    mapToObj,
    str2ab
} from "../lib/utils.js";

import {
    checkOptionalType,
    checkTrue,
    checkType
} from "../lib/input-validation.js";

import { Msg } from "./Msg.js";

/**
 * Generic {@link Msg} from server to indicate success or failure. Used by
 * itself for simple responses, or extended for more complex responses.
 * @extends {Msg}
 */
export class ServerResponse extends Msg {
    constructor() {
        super();

        this.propList = [
            "status",
            "errorMessage",
            "debugInfo"
        ];
    }

    validate() {
        switch (this.status) {
            case "ok":
                if (this.errorMessage === undefined) {
                    this.errorMessage = "";
                }

                // if status is "ok", errorMessage must be ""
                checkTrue(this.errorMessage === "", "errorMessage must be empty string when status is 'ok'");
                checkOptionalType(this, "debugInfo", "object");
                break;

            case "failed":
                // if status is "failed", errorMessage must be non-zero-length string
                checkType(this, "errorMessage", "string");
                checkTrue(
                    this.errorMessage.length > 0,
                    "errorMessage must be non-zero length when status is 'failed'"
                );
                checkOptionalType(this, "debugInfo", "object");
                break;

                // status is string, either "ok" or "failed"
            default:
                throw new Error("'expected 'status' to be 'string', got: " + this.status);
        }
    }

    decodeBinaryProperties() {
        function decodeAb(obj, key) {
            obj[key] = coerceToArrayBuffer(obj[key], key);
        }

        function decodeOptionalAb(obj, key) {
            if (obj[key] !== undefined) decodeAb(obj, key);
        }

        function objToMap(o) {
            var m = new Map();
            Object.keys(o).forEach((k) => {
                m.set(k, o[k]);
            });
            return m;
        }

        if (typeof this.debugInfo === "object") {
            decodeAb(this.debugInfo.clientData, "rawId");
            decodeAb(this.debugInfo.authnrData, "rawAuthnrData");
            decodeAb(this.debugInfo.authnrData, "rpIdHash");
            decodeOptionalAb(this.debugInfo.authnrData, "aaguid");
            decodeOptionalAb(this.debugInfo.authnrData, "credId");
            decodeOptionalAb(this.debugInfo.authnrData, "credentialPublicKeyCose");
            decodeOptionalAb(this.debugInfo.authnrData, "sig");
            decodeOptionalAb(this.debugInfo.authnrData, "attCert");

            this.debugInfo.clientData.rawClientDataJson = str2ab(this.debugInfo.clientData.rawClientDataJson);
            this.debugInfo.authnrData.flags = new Set([...this.debugInfo.authnrData.flags]);
            this.debugInfo.audit.warning = objToMap(this.debugInfo.audit.warning);
            this.debugInfo.audit.info = objToMap(this.debugInfo.audit.info);
        }
    }

    encodeBinaryProperties() {
        function encodeAb(obj, key) {
            obj[key] = coerceToBase64Url(obj[key], key);
        }

        function encodeOptionalAb(obj, key) {
            if (obj[key] !== undefined) encodeAb(obj, key);
        }

        if (typeof this.debugInfo === "object") {
            encodeAb(this.debugInfo.clientData, "rawId");
            encodeAb(this.debugInfo.authnrData, "rawAuthnrData");
            encodeAb(this.debugInfo.authnrData, "rpIdHash");
            encodeOptionalAb(this.debugInfo.authnrData, "aaguid");
            encodeOptionalAb(this.debugInfo.authnrData, "credId");
            encodeOptionalAb(this.debugInfo.authnrData, "credentialPublicKeyCose");
            encodeOptionalAb(this.debugInfo.authnrData, "sig");
            encodeOptionalAb(this.debugInfo.authnrData, "attCert");

            this.debugInfo.clientData.rawClientDataJson = ab2str(this.debugInfo.clientData.rawClientDataJson, "clientData.rawClientDataJson");
            this.debugInfo.authnrData.flags = [...this.debugInfo.authnrData.flags];
            this.debugInfo.audit.warning = mapToObj(this.debugInfo.audit.warning);
            this.debugInfo.audit.info = mapToObj(this.debugInfo.audit.info);
        }
    }
}
