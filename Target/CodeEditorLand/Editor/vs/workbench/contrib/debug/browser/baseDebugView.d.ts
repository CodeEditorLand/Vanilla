import { ActionBar } from "vs/base/browser/ui/actionbar/actionbar";
import { HighlightedLabel, IHighlight } from "vs/base/browser/ui/highlightedlabel/highlightedLabel";
import { IInputValidationOptions } from "vs/base/browser/ui/inputbox/inputBox";
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { FuzzyScore } from "vs/base/common/filters";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { LinkDetector } from "vs/workbench/contrib/debug/browser/linkDetector";
import { IDebugService, IExpression, IExpressionValue } from "vs/workbench/contrib/debug/common/debug";
import { Variable } from "vs/workbench/contrib/debug/common/debugModel";
import { IDebugVisualizerService } from "vs/workbench/contrib/debug/common/debugVisualizers";
export interface IRenderValueOptions {
    showChanged?: boolean;
    maxValueLength?: number;
    /** If set, a hover will be shown on the element. Requires a disposable store for usage. */
    hover?: false | {
        commands: {
            id: string;
            args: unknown[];
        }[];
        commandService: ICommandService;
    };
    colorize?: boolean;
    linkDetector?: LinkDetector;
}
export interface IVariableTemplateData {
    expression: HTMLElement;
    name: HTMLElement;
    type: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
}
export declare function renderViewTree(container: HTMLElement): HTMLElement;
export declare function renderExpressionValue(store: DisposableStore, expressionOrValue: IExpressionValue | string, container: HTMLElement, options: IRenderValueOptions, hoverService: IHoverService): void;
export declare function renderVariable(store: DisposableStore, commandService: ICommandService, hoverService: IHoverService, variable: Variable, data: IVariableTemplateData, showChanged: boolean, highlights: IHighlight[], linkDetector?: LinkDetector, displayType?: boolean): void;
export interface IInputBoxOptions {
    initialValue: string;
    ariaLabel: string;
    placeholder?: string;
    validationOptions?: IInputValidationOptions;
    onFinish: (value: string, success: boolean) => void;
}
export interface IExpressionTemplateData {
    expression: HTMLElement;
    name: HTMLSpanElement;
    type: HTMLSpanElement;
    value: HTMLSpanElement;
    inputBoxContainer: HTMLElement;
    actionBar?: ActionBar;
    elementDisposable: DisposableStore;
    templateDisposable: IDisposable;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
    currentElement: IExpression | undefined;
}
export declare abstract class AbstractExpressionDataSource<Input, Element extends IExpression> implements IAsyncDataSource<Input, Element> {
    protected debugService: IDebugService;
    protected debugVisualizer: IDebugVisualizerService;
    constructor(debugService: IDebugService, debugVisualizer: IDebugVisualizerService);
    abstract hasChildren(element: Input | Element): boolean;
    getChildren(element: Input | Element): Promise<Element[]>;
    protected abstract doGetChildren(element: Input | Element): Promise<Element[]>;
}
export declare abstract class AbstractExpressionsRenderer<T = IExpression> implements ITreeRenderer<T, FuzzyScore, IExpressionTemplateData> {
    protected debugService: IDebugService;
    private readonly contextViewService;
    protected readonly hoverService: IHoverService;
    constructor(debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService);
    abstract get templateId(): string;
    renderTemplate(container: HTMLElement): IExpressionTemplateData;
    abstract renderElement(node: ITreeNode<T, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected renderExpressionElement(element: IExpression, node: ITreeNode<T, FuzzyScore>, data: IExpressionTemplateData): void;
    renderInputBox(nameElement: HTMLElement, valueElement: HTMLElement, inputBoxContainer: HTMLElement, options: IInputBoxOptions): IDisposable;
    protected abstract renderExpression(expression: T, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected abstract getInputBoxOptions(expression: IExpression, settingValue: boolean): IInputBoxOptions | undefined;
    protected renderActionBar?(actionBar: ActionBar, expression: IExpression, data: IExpressionTemplateData): void;
    disposeElement(node: ITreeNode<T, FuzzyScore>, index: number, templateData: IExpressionTemplateData): void;
    disposeTemplate(templateData: IExpressionTemplateData): void;
}