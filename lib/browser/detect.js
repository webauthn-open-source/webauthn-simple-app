export function isBrowser() {
    try {
        if (!window) return false;
    } catch (err) {
        return false;
    }
    return true;
}
