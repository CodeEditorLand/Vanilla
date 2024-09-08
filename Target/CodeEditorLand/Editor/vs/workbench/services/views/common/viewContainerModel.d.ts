import { ViewContainer, IViewDescriptor, IViewContainerModel, IAddedViewDescriptorRef, IViewDescriptorRef, IAddedViewDescriptorState } from '../../../common/views.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../../base/common/uri.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
export declare function getViewsStateStorageId(viewContainerStorageId: string): string;
export declare class ViewContainerModel extends Disposable implements IViewContainerModel {
    readonly viewContainer: ViewContainer;
    private readonly contextKeyService;
    private readonly contextKeys;
    private viewDescriptorItems;
    private viewDescriptorsState;
    private _title;
    get title(): string;
    private _icon;
    get icon(): URI | ThemeIcon | undefined;
    private _keybindingId;
    get keybindingId(): string | undefined;
    private _onDidChangeContainerInfo;
    readonly onDidChangeContainerInfo: Event<{
        title?: boolean;
        icon?: boolean;
        keybindingId?: boolean;
    }>;
    get allViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidChangeAllViewDescriptors;
    readonly onDidChangeAllViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    get activeViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidChangeActiveViewDescriptors;
    readonly onDidChangeActiveViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    get visibleViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidAddVisibleViewDescriptors;
    readonly onDidAddVisibleViewDescriptors: Event<IAddedViewDescriptorRef[]>;
    private _onDidRemoveVisibleViewDescriptors;
    readonly onDidRemoveVisibleViewDescriptors: Event<IViewDescriptorRef[]>;
    private _onDidMoveVisibleViewDescriptors;
    readonly onDidMoveVisibleViewDescriptors: Event<{
        from: IViewDescriptorRef;
        to: IViewDescriptorRef;
    }>;
    private readonly logger;
    constructor(viewContainer: ViewContainer, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, loggerService: ILoggerService);
    private updateContainerInfo;
    private isEqualIcon;
    isVisible(id: string): boolean;
    setVisible(id: string, visible: boolean): void;
    private updateVisibility;
    private updateViewDescriptorItemVisibility;
    isCollapsed(id: string): boolean;
    setCollapsed(id: string, collapsed: boolean): void;
    getSize(id: string): number | undefined;
    setSizes(newSizes: readonly {
        id: string;
        size: number;
    }[]): void;
    move(from: string, to: string): void;
    add(addedViewDescriptorStates: IAddedViewDescriptorState[]): void;
    remove(viewDescriptors: IViewDescriptor[]): void;
    private onDidChangeContext;
    private broadCastAddedVisibleViewDescriptors;
    private broadCastRemovedVisibleViewDescriptors;
    private broadCastMovedViewDescriptors;
    private updateState;
    private isViewDescriptorVisible;
    private isViewDescriptorVisibleWhenActive;
    private find;
    private findAndIgnoreIfNotFound;
    private compareViewDescriptors;
    private getViewOrder;
    private getGroupOrderResult;
}
