import { type Event } from "../../../base/common/event.js";
import type { IDisposable } from "../../../base/common/lifecycle.js";
import type { ILanguageExtensionPoint } from "./language.js";
export declare const Extensions: {
    ModesRegistry: string;
};
export declare class EditorModesRegistry {
    private readonly _languages;
    private readonly _onDidChangeLanguages;
    readonly onDidChangeLanguages: Event<void>;
    constructor();
    registerLanguage(def: ILanguageExtensionPoint): IDisposable;
    getLanguages(): ReadonlyArray<ILanguageExtensionPoint>;
}
export declare const ModesRegistry: EditorModesRegistry;
export declare const PLAINTEXT_LANGUAGE_ID = "plaintext";
export declare const PLAINTEXT_EXTENSION = ".txt";
