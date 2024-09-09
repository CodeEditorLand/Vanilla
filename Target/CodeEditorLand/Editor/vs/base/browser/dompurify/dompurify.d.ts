export default purify;
export const version: string;
export const isSupported: any;
/**
 * Sanitize
 * Public method providing core sanitation functionality
 *
 * @param {String|Node} dirty string or DOM node
 * @param {Object} configuration object
 */
export function sanitize(dirty: string | any, ...args: any[]): any;
/**
 * Public method to set the configuration once
 * setConfig
 *
 * @param {Object} cfg configuration object
 */
export function setConfig(cfg: Object): void;
/**
 * Public method to remove the configuration
 * clearConfig
 *
 */
export function clearConfig(): void;
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
export function isValidAttribute(tag: string, attr: string, value: string): boolean;
/**
 * AddHook
 * Public method to add DOMPurify hooks
 *
 * @param {String} entryPoint entry point for the hook to add
 * @param {Function} hookFunction function to execute
 */
export function addHook(entryPoint: string, hookFunction: Function): void;
/**
 * RemoveHook
 * Public method to remove a DOMPurify hook at a given entryPoint
 * (pops it from the stack of hooks if more are present)
 *
 * @param {String} entryPoint entry point for the hook to remove
 * @return {Function} removed(popped) hook
 */
export function removeHook(entryPoint: string): Function;
/**
 * RemoveHooks
 * Public method to remove all DOMPurify hooks at a given entryPoint
 *
 * @param  {String} entryPoint entry point for the hooks to remove
 */
export function removeHooks(entryPoint: string): void;
/**
 * RemoveAllHooks
 * Public method to remove all DOMPurify hooks
 *
 */
export function removeAllHooks(): void;
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
