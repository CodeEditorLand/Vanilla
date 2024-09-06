import { IRange } from "vs/editor/common/core/range";
import { IQuickAccessTextEditorContext } from "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess";
import { AbstractGotoLineQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IKeyMods } from "vs/platform/quickinput/common/quickInput";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class GotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    protected readonly onDidActiveTextEditorControlChange: any;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
    private get configuration();
    protected get activeTextEditorControl(): any;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
}
