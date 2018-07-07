export function isNode() {
    if (typeof module === "object" && module.exports) return true;
    return false;
}
