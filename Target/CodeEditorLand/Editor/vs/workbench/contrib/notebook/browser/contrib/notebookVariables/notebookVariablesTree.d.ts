import { IListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { IListAccessibilityProvider } from "vs/base/browser/ui/list/listWidget";
import { ITreeNode, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { FuzzyScore } from "vs/base/common/filters";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { WorkbenchObjectTree } from "vs/platform/list/browser/listService";
import { INotebookVariableElement } from "vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesDataSource";
export declare class NotebookVariablesTree extends WorkbenchObjectTree<INotebookVariableElement> {
}
export declare class NotebookVariablesDelegate implements IListVirtualDelegate<INotebookVariableElement> {
    getHeight(element: INotebookVariableElement): number;
    getTemplateId(element: INotebookVariableElement): string;
}
export interface IVariableTemplateData {
    expression: HTMLElement;
    name: HTMLSpanElement;
    value: HTMLSpanElement;
    elementDisposables: DisposableStore;
}
export declare class NotebookVariableRenderer implements ITreeRenderer<INotebookVariableElement, FuzzyScore, IVariableTemplateData> {
    private readonly _hoverService;
    static readonly ID = "variableElement";
    get templateId(): string;
    constructor(_hoverService: IHoverService);
    renderTemplate(container: HTMLElement): IVariableTemplateData;
    renderElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, _index: number, data: IVariableTemplateData): void;
    disposeElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, index: number, templateData: IVariableTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: IVariableTemplateData): void;
}
export declare class NotebookVariableAccessibilityProvider implements IListAccessibilityProvider<INotebookVariableElement> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: INotebookVariableElement): string;
}
