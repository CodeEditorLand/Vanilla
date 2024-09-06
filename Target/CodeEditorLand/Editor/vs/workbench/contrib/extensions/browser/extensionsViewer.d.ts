import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IListService, WorkbenchAsyncDataTree } from "vs/platform/list/browser/listService";
import { IStyleOverride } from "vs/platform/theme/browser/defaultStyles";
import { Delegate } from "vs/workbench/contrib/extensions/browser/extensionsList";
import { IExtension, IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
export declare class ExtensionsGridView extends Disposable {
    private readonly instantiationService;
    readonly element: HTMLElement;
    private readonly renderer;
    private readonly delegate;
    private readonly disposableStore;
    constructor(parent: HTMLElement, delegate: Delegate, instantiationService: IInstantiationService);
    setExtensions(extensions: IExtension[]): void;
    private renderExtension;
}
interface IExtensionData {
    extension: IExtension;
    hasChildren: boolean;
    getChildren: () => Promise<IExtensionData[] | null>;
    parent: IExtensionData | null;
}
export declare class ExtensionsTree extends WorkbenchAsyncDataTree<IExtensionData, IExtensionData> {
    constructor(input: IExtensionData, container: HTMLElement, overrideStyles: IStyleOverride<IListStyles>, contextKeyService: IContextKeyService, listService: IListService, instantiationService: IInstantiationService, configurationService: IConfigurationService, extensionsWorkdbenchService: IExtensionsWorkbenchService);
}
export declare class ExtensionData implements IExtensionData {
    readonly extension: IExtension;
    readonly parent: IExtensionData | null;
    private readonly getChildrenExtensionIds;
    private readonly childrenExtensionIds;
    private readonly extensionsWorkbenchService;
    constructor(extension: IExtension, parent: IExtensionData | null, getChildrenExtensionIds: (extension: IExtension) => string[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    get hasChildren(): boolean;
    getChildren(): Promise<IExtensionData[] | null>;
}
export declare function getExtensions(extensions: string[], extensionsWorkbenchService: IExtensionsWorkbenchService): Promise<IExtension[]>;
export {};
