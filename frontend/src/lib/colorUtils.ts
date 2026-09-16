// Color option values are free-typed in the admin (e.g. "gree" instead of
// "green"), so a naive CSS backgroundColor would silently render blank/black
// for a typo with no indication anything's wrong.
export function isValidCssColor(value: string): boolean {
    if (typeof CSS !== 'undefined' && CSS.supports) {
        return CSS.supports('background-color', value);
    }
    return true;
}
