import { ContributedNotebookRendererEntrypoint, RendererMessagingSpec } from "vs/workbench/contrib/notebook/common/notebookCommon";
declare const NotebookEditorContribution: Readonly<{
    type: "type";
    displayName: "displayName";
    selector: "selector";
    priority: "priority";
}>;
export interface INotebookEditorContribution {
    readonly [NotebookEditorContribution.type]: string;
    readonly [NotebookEditorContribution.displayName]: string;
    readonly [NotebookEditorContribution.selector]?: readonly {
        filenamePattern?: string;
        excludeFileNamePattern?: string;
    }[];
    readonly [NotebookEditorContribution.priority]?: string;
}
declare const NotebookRendererContribution: Readonly<{
    id: "id";
    displayName: "displayName";
    mimeTypes: "mimeTypes";
    entrypoint: "entrypoint";
    hardDependencies: "dependencies";
    optionalDependencies: "optionalDependencies";
    requiresMessaging: "requiresMessaging";
}>;
export interface INotebookRendererContribution {
    readonly [NotebookRendererContribution.id]?: string;
    readonly [NotebookRendererContribution.displayName]: string;
    readonly [NotebookRendererContribution.mimeTypes]?: readonly string[];
    readonly [NotebookRendererContribution.entrypoint]: ContributedNotebookRendererEntrypoint;
    readonly [NotebookRendererContribution.hardDependencies]: readonly string[];
    readonly [NotebookRendererContribution.optionalDependencies]: readonly string[];
    readonly [NotebookRendererContribution.requiresMessaging]: RendererMessagingSpec;
}
export declare const notebooksExtensionPoint: any;
export declare const notebookRendererExtensionPoint: any;
export declare const notebookPreloadExtensionPoint: any;
export {};
