/**
 * `<`, `>` and the two Unicode line separators. `</script>` in the data would
 * end the element early, and U+2028 / U+2029 are valid in JSON but illegal raw
 * in a script body — both break the page silently rather than erroring, which
 * is why this lives in one function instead of an escape per call site.
 *
 * Built from a pattern string rather than a regex literal so the two separators
 * appear as escapes: they are invisible in an editor, and a literal pair here
 * would not survive a careless copy-paste of this line.
 */
const SCRIPT_UNSAFE = new RegExp('[<>\\u2028\\u2029]', 'g');

function toUnicodeEscape(char: string): string {
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

/** JSON safe to embed inside a `<script>` element. */
export function escapeForScript(value: unknown): string {
  return JSON.stringify(value).replace(SCRIPT_UNSAFE, toUnicodeEscape);
}

/** Escapes a string for use inside a double-quoted HTML attribute. */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
