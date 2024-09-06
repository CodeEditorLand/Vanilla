import * as glob from "vs/base/common/glob";
import { URI } from "vs/base/common/uri";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { INotebookExclusiveDocumentFilter, TransientOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { RegisteredEditorPriority } from "vs/workbench/services/editor/common/editorResolverService";
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
    get selectors(): any[];
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
