/**
 * @returns {string[]}
 */
export function getUNCHostAllowlist(): string[];
/**
 * @param {string | string[]} allowedHost
 */
export function addUNCHostToAllowlist(allowedHost: string | string[]): void;
/**
 * @param {string | undefined | null} maybeUNCPath
 * @returns {string | undefined}
 */
export function getUNCHost(maybeUNCPath: string | undefined | null): string | undefined;
export function disableUNCAccessRestrictions(): void;
export function isUNCAccessRestrictionsDisabled(): boolean;
