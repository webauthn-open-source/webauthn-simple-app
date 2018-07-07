import {
    coerceToArrayBuffer as browserCoerceToArrayBuffer,
    coerceToBase64Url as browserCoerceToBase64Url
} from "./browser/utils.js";

import {
    coerceToArrayBuffer as nodeCoerceToArrayBuffer,
    coerceToBase64Url as nodeCoerceToBase64Url
} from "./node/utils.js";

import { isBrowser } from "./browser/detect.js";
import { isNode } from "./node/detect.js";

var coerceToArrayBuffer, coerceToBase64Url;
if (isBrowser()) {
    coerceToArrayBuffer = browserCoerceToArrayBuffer;
    coerceToBase64Url = browserCoerceToBase64Url;
}

if (isNode()) {
    coerceToArrayBuffer = nodeCoerceToArrayBuffer;
    coerceToBase64Url = nodeCoerceToBase64Url;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function stringifyObj(obj, depth) {
    var str = "";

    // opening bracket
    str += "{\n";
    depth++;

    // print all properties
    for (let key of Object.keys(obj)) {
        // add key
        str += indent(depth) + key + ": ";
        // add value
        str += stringifyType(obj, key, depth) + ",\n";
    }

    // closing bracket
    depth--;
    str += indent(depth) + "}";

    return str;
}

function stringifyArr(arr, depth) {
    var str = "";

    // opening brace
    str += "[\n";
    depth++;

    // print all properties
    for (let i = 0; i < arr.length; i++) {
        // add value
        str += indent(depth) + stringifyType(arr, i, depth) + ",\n";
    }

    // closing brace
    depth--;
    str += indent(depth) + "]";

    return str;
}

function stringifyType(obj, key, depth) {
    // handle native types
    switch (typeof obj[key]) {
        case "object": break;
        case "undefined": return "undefined";
            // case "string": return "\"" + obj[key].replace(/\n/g, "\\n\"\n" + indent(depth + 1) + "\"") + "\"";
        case "string": return "\"" + obj[key].replace(/\n/g, "\n" + indent(depth + 1)) + "\"";
        case "number": return obj[key].toString();
        case "boolean": return obj[key].toString();
        case "symbol": return obj[key].toString();
        default:
            throw new TypeError("unknown type in stringifyType: " + typeof obj[key]);
    }

    // handle objects
    switch (true) {
        case obj[key] instanceof ArrayBuffer:
            return abToHumanStr(obj[key], (depth + 1));
        case obj[key] instanceof Array:
            return stringifyArr(obj[key], depth);
        case obj[key] instanceof Set:
            return stringifyArr([...obj[key]], depth);
        case obj[key] instanceof Map:
            return stringifyObj(mapToObj(obj[key]), depth);
        default:
            return stringifyObj(obj[key], depth);
    }
}

function indent(depth) {
    var ret = "";

    for (let i = 0; i < depth * 4; i++) {
        ret += " ";
    }

    return ret;
}

// printHex
function abToHumanStr(buf, depth) {
    var ret = "";

    // if the buffer was a TypedArray (e.g. Uint8Array), grab its buffer and use that
    if (ArrayBuffer.isView(buf) && buf.buffer instanceof ArrayBuffer) {
        buf = buf.buffer;
    }

    // check the arguments
    if ((typeof depth != "number") ||
        (typeof buf != "object")) {
        throw new TypeError("Bad args to abToHumanStr");
    }
    if (!(buf instanceof ArrayBuffer)) {
        throw new TypeError("Attempted abToHumanStr with non-ArrayBuffer:", buf);
    }
    // print the buffer as a 16 byte long hex string
    var arr = new Uint8Array(buf);
    var len = buf.byteLength;
    var i, str = "";
    ret += `[ArrayBuffer] (${buf.byteLength} bytes)\n`;
    for (i = 0; i < len; i++) {
        var hexch = arr[i].toString(16);
        hexch = (hexch.length == 1) ? ("0" + hexch) : hexch;
        str += hexch.toUpperCase() + " ";
        if (i && !((i + 1) % 16)) {
            ret += indent(depth) + str.replace(/.$/, "\n");
            str = "";
        }
    }
    // print the remaining bytes
    if ((i) % 16) {
        ret += indent(depth) + str.replace(/.$/, "\n");
    }

    // remove final newline
    ret = ret.replace(/\n$/, "");

    return ret;
}

function mapToObj(mapObj) {
    var m = {};
    mapObj.forEach((v, k) => {
        m[k] = v;
    });
    return m;
}

function copyProp(src, dst, prop) {
    if (src[prop] !== undefined) dst[prop] = src[prop];
}

function copyPropList(src, dst, propList) {
    var i;
    for (i = 0; i < propList.length; i++) {
        copyProp(src, dst, propList[i]);
    }
}

export {
    coerceToArrayBuffer,
    coerceToBase64Url,
    isBrowser,
    isNode,
    ab2str,
    str2ab,
    stringifyObj,
    stringifyArr,
    stringifyType,
    indent,
    abToHumanStr,
    mapToObj,
    copyProp,
    copyPropList
};
