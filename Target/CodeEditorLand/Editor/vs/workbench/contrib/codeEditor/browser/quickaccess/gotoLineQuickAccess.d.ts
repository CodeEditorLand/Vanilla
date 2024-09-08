import type { IRange } from "../../../../../editor/common/core/range.js";
import type { IQuickAccessTextEditorContext } from "../../../../../editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js";
import { AbstractGotoLineQuickAccessProvider } from "../../../../../editor/contrib/quickAccess/browser/gotoLineQuickAccess.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { type IKeyMods } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
export declare class GotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    protected readonly onDidActiveTextEditorControlChange: import("../../../../workbench.web.main.internal.js").Event<void>;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
    private get configuration();
    protected get activeTextEditorControl(): import("../../../../../editor/common/editorCommon.js").IEditor | import("../../../../../editor/common/editorCommon.js").IDiffEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
}
