import {
    checkAttestation,
    checkAuthenticatorSelection,
    checkCredentialDescriptorList,
    checkFormat,
    checkOptionalFormat,
    checkOptionalType,
    checkTrue,
    checkType
} from "../lib/input-validation.js";

import {
    coerceToArrayBuffer,
    coerceToBase64Url
} from "../lib/utils.js";

import { ServerResponse } from "./ServerResponse.js";

/**
 * The options to be used for WebAuthn `create()`
 * @extends {ServerResponse}
 */
export class CreateOptions extends ServerResponse {
    constructor() {
        super();

        this.propList = this.propList.concat([
            "rp",
            "user",
            "challenge",
            "pubKeyCredParams",
            "timeout",
            "excludeCredentials",
            "authenticatorSelection",
            "attestation",
            "extensions",
            "rawChallenge"
        ]);
    }

    validate() {
        super.validate();

        // check types
        checkType(this, "rp", Object);
        checkFormat(this.rp, "name", "non-empty-string");
        checkOptionalFormat(this.rp, "id", "non-empty-string");
        checkOptionalFormat(this.rp, "icon", "non-empty-string");

        checkType(this, "user", Object);
        checkFormat(this.user, "name", "non-empty-string");
        checkFormat(this.user, "id", "base64url");
        checkFormat(this.user, "displayName", "non-empty-string");
        checkOptionalFormat(this.user, "icon", "non-empty-string");

        checkFormat(this, "challenge", "base64url");
        checkType(this, "pubKeyCredParams", Array);
        this.pubKeyCredParams.forEach((cred) => {
            checkType(cred, "alg", "number");
            checkTrue(cred.type === "public-key", "credential type must be 'public-key'");
        });
        checkOptionalFormat(this, "timeout", "positive-integer");
        checkOptionalType(this, "excludeCredentials", Array);
        if (this.excludeCredentials) checkCredentialDescriptorList(this.excludeCredentials);

        checkAuthenticatorSelection(this);
        checkAttestation(this);

        checkOptionalType(this, "extensions", Object);
        checkOptionalFormat(this, "rawChallenge", "base64url");
    }

    decodeBinaryProperties() {
        if (this.user && this.user.id) {
            this.user.id = coerceToArrayBuffer(this.user.id, "user.id");
        }

        this.challenge = coerceToArrayBuffer(this.challenge, "challenge");
        if (this.rawChallenge) {
            this.rawChallenge = coerceToArrayBuffer(this.rawChallenge, "rawChallenge");
        }

        if (this.excludeCredentials) {
            this.excludeCredentials.forEach((cred, idx) => {
                cred.id = coerceToArrayBuffer(cred.id, "excludeCredentials[" + idx + "].id");
            });
        }
    }

    encodeBinaryProperties() {
        if (this.user && this.user.id) {
            this.user.id = coerceToBase64Url(this.user.id, "user.id");
        }

        this.challenge = coerceToBase64Url(this.challenge, "challenge");
        if (this.rawChallenge) {
            this.rawChallenge = coerceToBase64Url(this.rawChallenge, "rawChallenge");
        }

        if (this.excludeCredentials) {
            this.excludeCredentials.forEach((cred, idx) => {
                cred.id = coerceToBase64Url(cred.id, "excludeCredentials[" + idx + "].id");
            });
        }
    }
}
