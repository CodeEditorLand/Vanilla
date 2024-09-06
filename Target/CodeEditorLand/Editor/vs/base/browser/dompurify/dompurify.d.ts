declare function unapply(func: any): (thisArg: any, ...args: any[]) => any;
declare function unconstruct(func: any): (...args: any[]) => any;
declare function addToSet(set: any, array: any, transformCaseFunc: any): any;
declare function clone(object: any): any;
declare function lookupGetter(object: any, prop: any): (thisArg: any, ...args: any[]) => any;
declare function createDOMPurify(...args: any[]): {
    (root: any): any;
    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    version: string;
    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    removed: any[];
    isSupported: any;
    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    sanitize(dirty: string | any, ...args: any[]): any;
    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    setConfig(cfg: Object): void;
    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    clearConfig(): void;
    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    isValidAttribute(tag: string, attr: string, value: string): boolean;
    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    addHook(entryPoint: string, hookFunction: Function): void;
    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    removeHook(entryPoint: string): Function;
    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    removeHooks(entryPoint: string): void;
    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    removeAllHooks(): void;
};
declare const entries: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): [string, T][];
    (o: {}): [string, any][];
};
declare const setPrototypeOf: (o: any, proto: object | null) => any;
declare const isFrozen: (o: any) => boolean;
declare const getPrototypeOf: (o: any) => any;
declare const getOwnPropertyDescriptor: (o: any, p: PropertyKey) => PropertyDescriptor | undefined;
declare let freeze: {
    <T extends Function>(f: T): T;
    <T extends {
        [idx: string]: U | null | undefined | object;
    }, U extends string | bigint | number | boolean | symbol>(o: T): Readonly<T>;
    <T>(o: T): Readonly<T>;
};
declare let seal: <T>(o: T) => T;
declare let create: {
    (o: object | null): any;
    (o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
};
declare let apply: any;
declare let construct: any;
declare function arrayForEach(thisArg: any, ...args: any[]): any;
declare function arrayPop(thisArg: any, ...args: any[]): any;
declare function arrayPush(thisArg: any, ...args: any[]): any;
declare function stringToLowerCase(thisArg: any, ...args: any[]): any;
declare function stringToString(thisArg: any, ...args: any[]): any;
declare function stringMatch(thisArg: any, ...args: any[]): any;
declare function stringReplace(thisArg: any, ...args: any[]): any;
declare function stringIndexOf(thisArg: any, ...args: any[]): any;
declare function stringTrim(thisArg: any, ...args: any[]): any;
declare function regExpTest(thisArg: any, ...args: any[]): any;
declare function typeErrorCreate(...args: any[]): any;
declare const html$1: readonly string[];
declare const svg$1: readonly string[];
declare const svgFilters: readonly string[];
declare const svgDisallowed: readonly string[];
declare const mathMl$1: readonly string[];
declare const mathMlDisallowed: readonly string[];
declare const text: readonly string[];
declare const html: readonly string[];
declare const svg: readonly string[];
declare const mathMl: readonly string[];
declare const xml: readonly string[];
declare const MUSTACHE_EXPR: RegExp;
declare const ERB_EXPR: RegExp;
declare const TMPLIT_EXPR: RegExp;
declare const DATA_ATTR: RegExp;
declare const ARIA_ATTR: RegExp;
declare const IS_ALLOWED_URI: RegExp;
declare const IS_SCRIPT_OR_DATA: RegExp;
declare const ATTR_WHITESPACE: RegExp;
declare const DOCTYPE_NAME: RegExp;
declare var EXPRESSIONS: Readonly<{
    __proto__: null;
    MUSTACHE_EXPR: RegExp;
    ERB_EXPR: RegExp;
    TMPLIT_EXPR: RegExp;
    DATA_ATTR: RegExp;
    ARIA_ATTR: RegExp;
    IS_ALLOWED_URI: RegExp;
    IS_SCRIPT_OR_DATA: RegExp;
    ATTR_WHITESPACE: RegExp;
    DOCTYPE_NAME: RegExp;
}>;
declare function getGlobal(): any;
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
declare function _createTrustedTypesPolicy(trustedTypes: TrustedTypePolicyFactory | null, purifyHostElement: HTMLScriptElement): TrustedTypePolicy | null;
declare function purify(root: any): {
    (root: any): any;
    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    version: string;
    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    removed: any[];
    isSupported: any;
    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    sanitize(dirty: string | any, ...args: any[]): any;
    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    setConfig(cfg: Object): void;
    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    clearConfig(): void;
    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    isValidAttribute(tag: string, attr: string, value: string): boolean;
    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    addHook(entryPoint: string, hookFunction: Function): void;
    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    removeHook(entryPoint: string): Function;
    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    removeHooks(entryPoint: string): void;
    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    removeAllHooks(): void;
};
declare namespace purify {
    let version: string;
    let removed: any[];
    let isSupported: any;
    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    function sanitize(dirty: string | any, ...args: any[]): any;
    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    function setConfig(cfg: Object): void;
    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    function clearConfig(): void;
    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    function isValidAttribute(tag: string, attr: string, value: string): boolean;
    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    function addHook(entryPoint: string, hookFunction: Function): void;
    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    function removeHook(entryPoint: string): Function;
    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    function removeHooks(entryPoint: string): void;
    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    function removeAllHooks(): void;
}
