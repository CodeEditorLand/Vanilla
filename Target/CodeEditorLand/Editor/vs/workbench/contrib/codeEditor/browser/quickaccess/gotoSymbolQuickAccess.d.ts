import { CancellationToken } from "vs/base/common/cancellation";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { IRange } from "vs/editor/common/core/range";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IOutlineModelService } from "vs/editor/contrib/documentSymbols/browser/outlineModel";
import { IQuickAccessTextEditorContext } from "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess";
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IKeyMods, IQuickPick, IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IOutlineService } from "vs/workbench/services/outline/browser/outline";
export declare class GotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly outlineService;
    protected readonly onDidActiveTextEditorControlChange: any;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService, outlineService: IOutlineService, outlineModelService: IOutlineModelService);
    private get configuration();
    protected get activeTextEditorControl(): any;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    private static readonly SYMBOL_PICKS_TIMEOUT;
    getSymbolPicks(model: ITextModel, filter: string, options: {
        extraContainerLabel?: string;
    }, disposables: DisposableStore, token: CancellationToken): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    private canPickWithOutlineService;
    private doGetOutlinePicks;
}
