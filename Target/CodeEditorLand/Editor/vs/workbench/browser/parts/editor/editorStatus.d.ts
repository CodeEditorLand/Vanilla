import "vs/css!./media/editorstatus";
import { Action } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { Action2 } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IExtensionGalleryService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
export declare class EditorStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorGroupService;
    static readonly ID = "workbench.contrib.editorStatus";
    constructor(editorGroupService: IEditorGroupsService);
    private createEditorStatus;
}
export declare class ShowLanguageExtensionsAction extends Action {
    private fileExtension;
    private readonly commandService;
    static readonly ID = "workbench.action.showLanguageExtensions";
    constructor(fileExtension: string, commandService: ICommandService, galleryService: IExtensionGalleryService);
    run(): Promise<void>;
}
export declare class ChangeLanguageAction extends Action2 {
    static readonly ID = "workbench.action.editor.changeLanguageMode";
    constructor();
    run(accessor: ServicesAccessor, languageMode?: string): Promise<void>;
    private configureFileAssociation;
}
export declare class ChangeEOLAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ChangeEncodingAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
