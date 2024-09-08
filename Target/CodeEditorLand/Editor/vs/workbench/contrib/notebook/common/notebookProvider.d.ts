import * as glob from "../../../../base/common/glob.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import type { RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { type INotebookExclusiveDocumentFilter, type TransientOptions } from "./notebookCommon.js";
type NotebookSelector = string | glob.IRelativePattern | INotebookExclusiveDocumentFilter;
export interface NotebookEditorDescriptor {
    readonly extension?: ExtensionIdentifier;
    readonly id: string;
    readonly displayName: string;
    readonly selectors: readonly {
        filenamePattern?: string;
        excludeFileNamePattern?: string;
    }[];
    readonly priority: RegisteredEditorPriority;
    readonly providerDisplayName: string;
}
export declare class NotebookProviderInfo {
    readonly extension?: ExtensionIdentifier;
    readonly id: string;
    readonly displayName: string;
    readonly priority: RegisteredEditorPriority;
    readonly providerDisplayName: string;
    private _selectors;
    get selectors(): NotebookSelector[];
    private _options;
    get options(): TransientOptions;
    constructor(descriptor: NotebookEditorDescriptor);
    update(args: {
        selectors?: NotebookSelector[];
        options?: TransientOptions;
    }): void;
    matches(resource: URI): boolean;
    static selectorMatches(selector: NotebookSelector, resource: URI): boolean;
    static possibleFileEnding(selectors: NotebookSelector[]): string | undefined;
    private static _possibleFileEnding;
}
export {};
