import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { type IDisposable, type IReference } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { type IDebugVisualization, type IDebugVisualizationContext, type IDebugVisualizationTreeItem, type IExpression, type MainThreadDebugVisualization } from "./debug.js";
import { VisualizedExpression } from "./debugModel.js";
export declare const IDebugVisualizerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDebugVisualizerService>;
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
    get name(): string;
    get iconPath(): {
        light?: import("../../../workbench.web.main.internal.js").URI;
        dark: import("../../../workbench.web.main.internal.js").URI;
    } | undefined;
    get iconClass(): string | undefined;
    constructor(handle: VisualizerHandle, viz: IDebugVisualization);
    resolve(token: CancellationToken): Promise<MainThreadDebugVisualization>;
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
