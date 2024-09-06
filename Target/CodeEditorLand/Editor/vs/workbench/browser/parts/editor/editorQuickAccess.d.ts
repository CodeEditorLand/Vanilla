import "./media/editorquickaccess.css";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IQuickPick, IQuickPickItemWithResource, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { GroupIdentifier, IEditorIdentifier } from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
interface IEditorQuickPickItem extends IQuickPickItemWithResource, IPickerQuickAccessItem {
    groupId: GroupIdentifier;
}
export declare abstract class BaseEditorQuickAccessProvider extends PickerQuickAccessProvider<IEditorQuickPickItem> {
    protected readonly editorGroupService: IEditorGroupsService;
    protected readonly editorService: IEditorService;
    private readonly modelService;
    private readonly languageService;
    private readonly pickState;
    constructor(prefix: string, editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    provide(picker: IQuickPick<IEditorQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    protected _getPicks(filter: string): Array<IEditorQuickPickItem | IQuickPickSeparator>;
    private doGetEditorPickItems;
    protected abstract doGetEditors(): IEditorIdentifier[];
}
export declare class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export {};
