import { CountBadge } from "vs/base/browser/ui/countBadge/countBadge";
import { HighlightedLabel, IHighlight } from "vs/base/browser/ui/highlightedlabel/highlightedLabel";
import { CachedListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { IListAccessibilityProvider } from "vs/base/browser/ui/list/listWidget";
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { FuzzyScore } from "vs/base/common/filters";
import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from "vs/workbench/contrib/debug/browser/baseDebugView";
import { LinkDetector } from "vs/workbench/contrib/debug/browser/linkDetector";
import { IDebugService, IDebugSession, IExpression, IReplElement, IReplElementSource, IReplOptions } from "vs/workbench/contrib/debug/common/debug";
import { Variable } from "vs/workbench/contrib/debug/common/debugModel";
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, ReplOutputElement, ReplVariableElement } from "vs/workbench/contrib/debug/common/replModel";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
interface IReplEvaluationInputTemplateData {
    label: HighlightedLabel;
}
interface IReplGroupTemplateData {
    label: HTMLElement;
    source: SourceWidget;
}
interface IReplEvaluationResultTemplateData {
    value: HTMLElement;
    elementStore: DisposableStore;
}
interface IOutputReplElementTemplateData {
    container: HTMLElement;
    count: CountBadge;
    countContainer: HTMLElement;
    value: HTMLElement;
    source: SourceWidget;
    getReplElementSource(): IReplElementSource | undefined;
    elementListener: IDisposable;
}
interface IRawObjectReplTemplateData {
    container: HTMLElement;
    expression: HTMLElement;
    name: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
    elementStore: DisposableStore;
}
export declare class ReplEvaluationInputsRenderer implements ITreeRenderer<ReplEvaluationInput, FuzzyScore, IReplEvaluationInputTemplateData> {
    static readonly ID = "replEvaluationInput";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplEvaluationInputTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationInput, FuzzyScore>, index: number, templateData: IReplEvaluationInputTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationInputTemplateData): void;
}
export declare class ReplGroupRenderer implements ITreeRenderer<ReplGroup, FuzzyScore, IReplGroupTemplateData> {
    private readonly linkDetector;
    private readonly themeService;
    private readonly instaService;
    static readonly ID = "replGroup";
    constructor(linkDetector: LinkDetector, themeService: IThemeService, instaService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplGroupTemplateData;
    renderElement(element: ITreeNode<ReplGroup, FuzzyScore>, _index: number, templateData: IReplGroupTemplateData): void;
    disposeTemplate(templateData: IReplGroupTemplateData): void;
}
export declare class ReplEvaluationResultsRenderer implements ITreeRenderer<ReplEvaluationResult | Variable, FuzzyScore, IReplEvaluationResultTemplateData> {
    private readonly linkDetector;
    private readonly hoverService;
    static readonly ID = "replEvaluationResult";
    get templateId(): string;
    constructor(linkDetector: LinkDetector, hoverService: IHoverService);
    renderTemplate(container: HTMLElement): IReplEvaluationResultTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationResult | Variable, FuzzyScore>, index: number, templateData: IReplEvaluationResultTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationResultTemplateData): void;
}
export declare class ReplOutputElementRenderer implements ITreeRenderer<ReplOutputElement, FuzzyScore, IOutputReplElementTemplateData> {
    private readonly linkDetector;
    private readonly themeService;
    private readonly instaService;
    static readonly ID = "outputReplElement";
    constructor(linkDetector: LinkDetector, themeService: IThemeService, instaService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IOutputReplElementTemplateData;
    renderElement({ element }: ITreeNode<ReplOutputElement, FuzzyScore>, index: number, templateData: IOutputReplElementTemplateData): void;
    private setElementCount;
    disposeTemplate(templateData: IOutputReplElementTemplateData): void;
    disposeElement(_element: ITreeNode<ReplOutputElement, FuzzyScore>, _index: number, templateData: IOutputReplElementTemplateData): void;
}
export declare class ReplVariablesRenderer extends AbstractExpressionsRenderer<IExpression | ReplVariableElement> {
    private readonly linkDetector;
    private readonly commandService;
    static readonly ID = "replVariable";
    get templateId(): string;
    constructor(linkDetector: LinkDetector, debugService: IDebugService, contextViewService: IContextViewService, commandService: ICommandService, hoverService: IHoverService);
    renderElement(node: ITreeNode<IExpression | ReplVariableElement, FuzzyScore>, _index: number, data: IExpressionTemplateData): void;
    protected renderExpression(expression: IExpression | ReplVariableElement, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions | undefined;
}
export declare class ReplRawObjectsRenderer implements ITreeRenderer<RawObjectReplElement, FuzzyScore, IRawObjectReplTemplateData> {
    private readonly linkDetector;
    private readonly hoverService;
    static readonly ID = "rawObject";
    constructor(linkDetector: LinkDetector, hoverService: IHoverService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IRawObjectReplTemplateData;
    renderElement(node: ITreeNode<RawObjectReplElement, FuzzyScore>, index: number, templateData: IRawObjectReplTemplateData): void;
    disposeTemplate(templateData: IRawObjectReplTemplateData): void;
}
export declare class ReplDelegate extends CachedListVirtualDelegate<IReplElement> {
    private readonly configurationService;
    private readonly replOptions;
    constructor(configurationService: IConfigurationService, replOptions: IReplOptions);
    getHeight(element: IReplElement): number;
    /**
     * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
     */
    protected estimateHeight(element: IReplElement, ignoreValueLength?: boolean): number;
    getTemplateId(element: IReplElement): string;
    hasDynamicHeight(element: IReplElement): boolean;
}
export declare class ReplDataSource implements IAsyncDataSource<IDebugSession, IReplElement> {
    hasChildren(element: IReplElement | IDebugSession): boolean;
    getChildren(element: IReplElement | IDebugSession): Promise<IReplElement[]>;
}
export declare class ReplAccessibilityProvider implements IListAccessibilityProvider<IReplElement> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: IReplElement): string;
}
declare class SourceWidget extends Disposable {
    private readonly hoverService;
    private readonly labelService;
    private readonly el;
    private source?;
    private hover?;
    constructor(container: HTMLElement, editorService: IEditorService, hoverService: IHoverService, labelService: ILabelService);
    setSource(source?: IReplElementSource): void;
}
export {};