export declare const LANGUAGE_DEFAULT = "en";
export interface IProcessEnvironment {
    [key: string]: string | undefined;
}
/**
 * This interface is intentionally not identical to node.js
 * process because it also works in sandboxed environments
 * where the process object is implemented differently. We
 * define the properties here that we need for `platform`
 * to work and nothing else.
 */
export interface INodeProcess {
    platform: string;
    arch: string;
    env: IProcessEnvironment;
    versions?: {
        node?: string;
        electron?: string;
        chrome?: string;
    };
    type?: string;
    cwd: () => string;
}
export declare enum Platform {
    Web = 0,
    Mac = 1,
    Linux = 2,
    Windows = 3
}
export type PlatformName = "Web" | "Windows" | "Mac" | "Linux";
export declare function PlatformToString(platform: Platform): PlatformName;
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isLinuxSnap: boolean;
export declare const isNative: boolean;
export declare const isElectron: boolean;
export declare const isWeb: boolean;
export declare const isWebWorker: boolean;
export declare const webWorkerOrigin: any;
export declare const isIOS: boolean;
export declare const isMobile: boolean;
/**
 * Whether we run inside a CI environment, such as
 * GH actions or Azure Pipelines.
 */
export declare const isCI: boolean;
export declare const platform: Platform;
export declare const userAgent: string | undefined;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese or de for German)
 */
export declare const language: string;
export declare namespace Language {
    function value(): string;
    function isDefaultVariant(): boolean;
    function isDefault(): boolean;
}
/**
 * Desktop: The OS locale or the locale specified by --locale or `argv.json`.
 * Web: matches `platformLocale`.
 *
 * The UI is not necessarily shown in the provided locale.
 */
export declare const locale: string | undefined;
/**
 * This will always be set to the OS/browser's locale regardless of
 * what was specified otherwise. The format of the string is all
 * lower case (e.g. zh-tw for Traditional Chinese). The UI is not
 * necessarily shown in the provided locale.
 */
export declare const platformLocale: string;
/**
 * The translations that are available through language packs.
 */
export declare const translationsConfigFile: string | undefined;
export declare const setTimeout0IsFaster: boolean;
/**
 * See https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#:~:text=than%204%2C%20then-,set%20timeout%20to%204,-.
 *
 * Works similarly to `setTimeout(0)` but doesn't suffer from the 4ms artificial delay
 * that browsers set when the nesting level is > 5.
 */
export declare const setTimeout0: (callback: () => void) => void;
export declare enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3
}
export declare const OS: OperatingSystem;
export declare function isLittleEndian(): boolean;
export declare const isChrome: boolean;
export declare const isFirefox: boolean;
export declare const isSafari: boolean;
export declare const isEdge: boolean;
export declare const isAndroid: boolean;
export declare function isBigSurOrNewer(osVersion: string): boolean;
