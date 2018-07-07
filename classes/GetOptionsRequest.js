import { Msg } from "./Msg.js";
import { checkFormat } from "../lib/input-validation.js";

/**
 * A {@link Msg} object that the browser sends to the server to request
 * the options to be used for the WebAuthn `get()` call.
 * @extends {Msg}
 */
export class GetOptionsRequest extends Msg {
    constructor() {
        super();

        this.propList = [
            "username",
            "displayName"
        ];
    }

    validate() {
        checkFormat(this, "username", "non-empty-string");
        checkFormat(this, "displayName", "non-empty-string");
    }

    decodeBinaryProperties() {}

    encodeBinaryProperties() {}
}
