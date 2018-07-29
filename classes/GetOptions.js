import {
    checkCredentialDescriptorList,
    checkFormat,
    checkOptionalFormat,
    checkOptionalType,
    checkUserVerification
} from "../lib/input-validation.js";

import {
    coerceToArrayBuffer,
    coerceToBase64Url
} from "../lib/utils.js";

import { ServerResponse } from "./ServerResponse.js";

/**
 * The options to be used for WebAuthn `get()`
 * @extends {ServerResponse}
 */
export class GetOptions extends ServerResponse {
    constructor() {
        super();

        this.propList = this.propList.concat([
            "challenge",
            "timeout",
            "rpId",
            "allowCredentials",
            "userVerification",
            "extensions",
            "rawChallenge"
        ]);
    }

    validate() {
        super.validate();
        checkFormat(this, "challenge", "base64url");
        checkOptionalFormat(this, "timeout", "positive-integer");
        checkOptionalFormat(this, "rpId", "non-empty-string");
        checkOptionalType(this, "allowCredentials", Array);
        if (this.allowCredentials) checkCredentialDescriptorList(this.allowCredentials);
        if (this.userVerification) checkUserVerification(this.userVerification);
        checkOptionalType(this, "extensions", Object);
        checkOptionalFormat(this, "rawChallenge", "base64url");
    }

    decodeBinaryProperties() {
        this.challenge = coerceToArrayBuffer(this.challenge, "challenge");
        if (this.rawChallenge) {
            this.rawChallenge = coerceToArrayBuffer(this.rawChallenge, "rawChallenge");
        }

        if (this.allowCredentials) {
            this.allowCredentials.forEach((cred) => {
                cred.id = coerceToArrayBuffer(cred.id, "cred.id");
            });
        }
    }

    encodeBinaryProperties() {
        this.challenge = coerceToBase64Url(this.challenge, "challenge");
        if (this.rawChallenge) {
            this.rawChallenge = coerceToBase64Url(this.rawChallenge, "rawChallenge");
        }

        if (this.allowCredentials) {
            this.allowCredentials.forEach((cred, idx) => {
                cred.id = coerceToBase64Url(cred.id, "allowCredentials[" + idx + "].id");
            });
        }
    }
}
