import {
    copyPropList,
    stringifyObj,
} from "../lib/utils.js";

/**
 * Virtual class for messages that serves as the base
 * for all other messages.
 */
export class Msg {
    constructor() {
        /** @type {Array} The list of "official" properties that are managed for this object and sent over the wire. */
        this.propList = [];
    }

    /**
     * Converts the `Msg` to an `Object` containing all the properties in `propList` that have been defined on the `Msg`
     * @return {Object} An `Object` that contains all the properties to be sent over the wire.
     */
    toObject() {
        var obj = {};
        copyPropList(this, obj, this.propList);
        return obj;
    }

    /**
     * Converts the `Msg` to a JSON string containing all the properties in `propList` that have been defined on the `Msg`
     * @return {String} A JSON `String` that contains all the properties to be sent over the wire.
     */
    toString() {
        return JSON.stringify(this.toObject());
    }

    /**
     * Converts the `Msg` to a human-readable string. Useful for debugging messages as they are being sent / received.
     * @return {String} The human-readable message, probably multiple lines.
     */
    toHumanString() {
        var constructMe = Object.getPrototypeOf(this).constructor;
        var retObj = constructMe.from(this);
        retObj.decodeBinaryProperties();
        retObj = retObj.toObject();
        var ret = `[${constructMe.name}] ` + stringifyObj(retObj, 0);
        return ret;
    }

    /**
     * Converts the provided `obj` to this class and then returns a human
     * readable form of the object as interpreted by that class.
     * @param  {Object} obj Any object
     * @return {String}     A human-readable string as interpreteed by this class.
     */
    static toHumanString(obj) {
        var retObj = this.from(obj);
        retObj.decodeBinaryProperties();
        retObj = retObj.toObject();
        var ret = `[${this.name}] ` + stringifyObj(retObj, 0);
        return ret;
    }

    /**
     * Converts the `Msg` to a human-readable string (via {@link toHumanString}) and then replaces whitespace (" " and "\n") with
     * HTML compatible interpetations of whitespace ("&nbsp;" and "<br>").
     * @return {String} The HTML compatible representation of this Msg that should be easy for people to read
     */
    toHumanHtml() {
        return this.toHumanString().replace(/ /g, "&nbsp;").replace(/\n/g, "<br>");
    }

    /**
     * Ensures that all the required properties in the object are defined, and all defined properties are of the correct format.
     * @throws {Error} If any required field is undefined, or any defined field is of the wrong format.
     */
    validate() {
        throw new Error("not implemented");
    }

    /**
     * Any fields that are known to be encoded as `base64url` are decoded to an `ArrayBuffer`
     */
    decodeBinaryProperties() {
        // throw new Error("not implemented");
    }

    /**
     * Any fields that are known to be encoded as an `ArrayBuffer` are encoded as `base64url`
     */
    encodeBinaryProperties() {
        // throw new Error("not implemented");
    }

    /**
     * Creates a new `Msg` object from the specified parameter. Note that the resulting `Msg` is not validated
     * and all fields are their original values (call {@link decodeBinaryProperties} to convert fields to ArrayBuffers)
     * if needed.
     * @param  {String|Object} json The JSON encoded string, or already parsed JSON message in an `Object`
     * @return {Msg}      The newly created message from the Object.
     */
    static from(json) {
        var obj;
        if (typeof json === "string") {
            try {
                obj = JSON.parse(json);
            } catch (err) {
                throw new TypeError("error parsing JSON string");
            }
        }

        if (typeof json === "object") {
            obj = json;
        }

        if (typeof obj !== "object") {
            throw new TypeError("could not coerce 'json' argument to an object: '" + json + "'");
        }

        var msg = new this.prototype.constructor();
        copyPropList(obj, msg, msg.propList);

        // if (obj.preferences) {
        //     msg.preferences = WebAuthnOptions.from(obj.preferences);
        // }

        return msg;
    }
}
