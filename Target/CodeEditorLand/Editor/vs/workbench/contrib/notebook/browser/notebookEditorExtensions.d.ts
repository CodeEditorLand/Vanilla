import type { BrandedService } from "../../../../platform/instantiation/common/instantiation.js";
import type { INotebookEditor, INotebookEditorContribution, INotebookEditorContributionDescription } from "./notebookBrowser.js";
export declare function registerNotebookContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: INotebookEditor, ...services: Services): INotebookEditorContribution;
}): void;
export declare namespace NotebookEditorExtensionsRegistry {
    function getEditorContributions(): INotebookEditorContributionDescription[];
    function getSomeEditorContributions(ids: string[]): INotebookEditorContributionDescription[];
}
