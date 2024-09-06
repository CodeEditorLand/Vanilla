import "vs/css!./media/editordroptarget";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
import { IEditorDropTargetDelegate, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
export declare class EditorDropTarget extends Themable {
    private readonly container;
    private readonly delegate;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly instantiationService;
    private _overlay?;
    private counter;
    private readonly editorTransfer;
    private readonly groupTransfer;
    constructor(container: HTMLElement, delegate: IEditorDropTargetDelegate, editorGroupService: IEditorGroupsService, themeService: IThemeService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private get overlay();
    private registerListeners;
    private onDragEnter;
    private onDragLeave;
    private onDragEnd;
    private findTargetGroupView;
    private updateContainer;
    dispose(): void;
    private disposeOverlay;
}
