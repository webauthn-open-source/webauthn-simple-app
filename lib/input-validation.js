export function checkType(obj, prop, type) {
    switch (typeof type) {
        case "string":
            if (typeof obj[prop] !== type) {
                throw new Error("expected '" + prop + "' to be '" + type + "', got: " + typeof obj[prop]);
            }
            break;

        case "function":
            if (!(obj[prop] instanceof type)) {
                throw new Error("expected '" + prop + "' to be '" + type.name + "', got: " + obj[prop]);
            }
            break;

        default:
            throw new Error("internal error: checkType received invalid type");
    }
}

export function checkOptionalType(obj, prop, type) {
    if (obj === undefined || obj[prop] === undefined) return;

    checkType(obj, prop, type);
}

export function checkFormat(obj, prop, format) {
    switch (format) {
        case "non-empty-string":
            checkType(obj, prop, "string");
            checkTrue(
                obj[prop].length > 0,
                "expected '" + prop + "' to be non-empty string"
            );
            break;
        case "base64url":
            checkType(obj, prop, "string");
            checkTrue(
                isBase64Url(obj[prop]),
                "expected '" + prop + "' to be base64url format, got: " + obj[prop]
            );
            break;
        case "positive-integer":
            checkType(obj, prop, "number");
            var n = obj[prop];
            checkTrue(
                n >>> 0 === parseFloat(n),
                "expected '" + prop + "' to be positive integer"
            );
            break;
        case "nullable-base64":
            var t = typeof obj[prop];
            if (obj[prop] === null) t = "null";
            checkTrue(
                ["null", "string", "undefined"].includes(t),
                "expected '" + prop + "' to be null or string"
            );
            if (!obj[prop]) return;
            checkTrue(
                isBase64Url(obj[prop]),
                "expected '" + prop + "' to be base64url format, got: " + obj[prop]
            );
            break;
        default:
            throw new Error("internal error: unknown format");
    }
}

export function checkOptionalFormat(obj, prop, format) {
    if (obj === undefined || obj[prop] === undefined) return;

    checkFormat(obj, prop, format);
}

export function isBase64Url(str) {
    return !!str.match(/^[A-Za-z0-9\-_]+={0,2}$/);
}

export function checkTrue(truthy, msg) {
    if (!truthy) {
        throw Error(msg);
    }
}

export function checkUserVerification(val) {
    checkTrue(
        ["required", "preferred", "discouraged"].includes(val),
        "userVerification must be 'required', 'preferred' or 'discouraged'"
    );
}

export function checkAuthenticatorSelection(obj) {
    checkOptionalType(obj, "authenticatorSelection", Object);
    if (obj.authenticatorSelection && obj.authenticatorSelection.authenticatorAttachment) {
        checkTrue(
            ["platform", "cross-platform"].includes(obj.authenticatorSelection.authenticatorAttachment),
            "authenticatorAttachment must be either 'platform' or 'cross-platform'"
        );
    }
    if (obj.authenticatorSelection && obj.authenticatorSelection.userVerification) {
        checkUserVerification(obj.authenticatorSelection.userVerification);

    }
    checkOptionalType(obj.authenticatorSelection, "requireResidentKey", "boolean");
}

export function checkCredentialDescriptorList(arr) {
    arr.forEach((cred) => {
        checkFormat(cred, "id", "base64url");
        checkTrue(cred.type === "public-key", "credential type must be 'public-key'");
        checkOptionalType(cred, "transports", Array);
        if (cred.transports) cred.transports.forEach((trans) => {
            checkTrue(
                ["usb", "nfc", "ble"].includes(trans),
                "expected transport to be 'usb', 'nfc', or 'ble', got: " + trans
            );
        });
    });
}

export function checkAttestation(obj) {
    if (obj.attestation) checkTrue(
        ["direct", "none", "indirect"].includes(obj.attestation),
        "expected attestation to be 'direct', 'none', or 'indirect'"
    );
}
