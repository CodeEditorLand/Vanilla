import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable, IReference } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IDebugVisualization, IDebugVisualizationContext, IDebugVisualizationTreeItem, IExpression, MainThreadDebugVisualization } from "vs/workbench/contrib/debug/common/debug";
import { VisualizedExpression } from "vs/workbench/contrib/debug/common/debugModel";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare const IDebugVisualizerService: any;
interface VisualizerHandle {
    id: string;
    extensionId: ExtensionIdentifier;
    provideDebugVisualizers(context: IDebugVisualizationContext, token: CancellationToken): Promise<IDebugVisualization[]>;
    resolveDebugVisualizer(viz: IDebugVisualization, token: CancellationToken): Promise<MainThreadDebugVisualization>;
    executeDebugVisualizerCommand(id: number): Promise<void>;
    disposeDebugVisualizers(ids: number[]): void;
}
interface VisualizerTreeHandle {
    getTreeItem(element: IDebugVisualizationContext): Promise<IDebugVisualizationTreeItem | undefined>;
    getChildren(element: number): Promise<IDebugVisualizationTreeItem[]>;
    disposeItem(element: number): void;
    editItem?(item: number, value: string): Promise<IDebugVisualizationTreeItem | undefined>;
}
export declare class DebugVisualizer {
    private readonly handle;
    private readonly viz;
    get name(): any;
    get iconPath(): any;
    get iconClass(): any;
    constructor(handle: VisualizerHandle, viz: IDebugVisualization);
    resolve(token: CancellationToken): Promise<any>;
    execute(): Promise<void>;
}
export interface IDebugVisualizerService {
    _serviceBrand: undefined;
    /**
     * Gets visualizers applicable for the given Expression.
     */
    getApplicableFor(expression: IExpression, token: CancellationToken): Promise<IReference<DebugVisualizer[]>>;
    /**
     * Registers a new visualizer (called from the main thread debug service)
     */
    register(handle: VisualizerHandle): IDisposable;
    /**
     * Registers a new visualizer tree.
     */
    registerTree(treeId: string, handle: VisualizerTreeHandle): IDisposable;
    /**
     * Sets that a certa tree should be used for the visualized node
     */
    getVisualizedNodeFor(treeId: string, expr: IExpression): Promise<VisualizedExpression | undefined>;
    /**
     * Gets children for a visualized tree node.
     */
    getVisualizedChildren(treeId: string, treeElementId: number): Promise<IExpression[]>;
    /**
     * Gets children for a visualized tree node.
     */
    editTreeItem(treeId: string, item: IDebugVisualizationTreeItem, newValue: string): Promise<void>;
}
export declare class DebugVisualizerService implements IDebugVisualizerService {
    private readonly contextKeyService;
    private readonly extensionService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly handles;
    private readonly trees;
    private readonly didActivate;
    private registrations;
    constructor(contextKeyService: IContextKeyService, extensionService: IExtensionService, logService: ILogService);
    /** @inheritdoc */
    getApplicableFor(variable: IExpression, token: CancellationToken): Promise<IReference<DebugVisualizer[]>>;
    /** @inheritdoc */
    register(handle: VisualizerHandle): IDisposable;
    /** @inheritdoc */
    registerTree(treeId: string, handle: VisualizerTreeHandle): IDisposable;
    /** @inheritdoc */
    getVisualizedNodeFor(treeId: string, expr: IExpression): Promise<VisualizedExpression | undefined>;
    /** @inheritdoc */
    getVisualizedChildren(treeId: string, treeElementId: number): Promise<IExpression[]>;
    /** @inheritdoc */
    editTreeItem(treeId: string, treeItem: IDebugVisualizationTreeItem, newValue: string): Promise<void>;
    private getVariableContext;
    private processExtensionRegistration;
}
export {};
