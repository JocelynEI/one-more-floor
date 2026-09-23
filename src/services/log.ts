/** Development-only diagnostics: release builds stay silent, but failures are never swallowed in dev. */
export function reportError(scope: string, error: unknown): void {
  if (__DEV__) console.warn(`[${scope}]`, error);
}
