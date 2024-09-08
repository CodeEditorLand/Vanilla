/**
 * @param {string} injectPath
 */
export function initialize(injectPath: string): Promise<void>;
/**
 * @param {string | number} specifier
 * @param {any} context
 * @param {(arg0: any, arg1: any) => any} nextResolve
 */
export function resolve(specifier: string | number, context: any, nextResolve: (arg0: any, arg1: any) => any): Promise<any>;
