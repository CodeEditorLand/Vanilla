import "vs/css!./media/sidebysideeditor";
import { Dimension } from "vs/base/browser/dom";
import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { CancellationToken } from "vs/base/common/cancellation";
import { URI } from "vs/base/common/uri";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { AbstractEditorWithViewState } from "vs/workbench/browser/parts/editor/editorWithViewState";
import { IEditorControl, IEditorOpenContext, IEditorPane, IEditorPaneSelection, IEditorPaneWithSelection, SideBySideEditor as Side } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { SideBySideEditorInput } from "vs/workbench/common/editor/sideBySideEditorInput";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
interface ISideBySideEditorViewState {
    primary: object;
    secondary: object;
    focus: Side.PRIMARY | Side.SECONDARY | undefined;
    ratio: number | undefined;
}
interface ISideBySideEditorOptions extends IEditorOptions {
    /**
     * Whether the editor options should apply to
     * the primary or secondary side.
     *
     * If a target side is provided, that side will
     * also receive keyboard focus unless focus is
     * to be preserved.
     */
    target?: Side.PRIMARY | Side.SECONDARY;
}
export declare class SideBySideEditor extends AbstractEditorWithViewState<ISideBySideEditorViewState> implements IEditorPaneWithSelection {
    private readonly configurationService;
    static readonly ID: string;
    static SIDE_BY_SIDE_LAYOUT_SETTING: string;
    private static readonly VIEW_STATE_PREFERENCE_KEY;
    private get minimumPrimaryWidth();
    private get maximumPrimaryWidth();
    private get minimumPrimaryHeight();
    private get maximumPrimaryHeight();
    private get minimumSecondaryWidth();
    private get maximumSecondaryWidth();
    private get minimumSecondaryHeight();
    private get maximumSecondaryHeight();
    set minimumWidth(value: number);
    set maximumWidth(value: number);
    set minimumHeight(value: number);
    set maximumHeight(value: number);
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private _boundarySashes;
    private onDidCreateEditors;
    private _onDidChangeSizeConstraints;
    readonly onDidChangeSizeConstraints: any;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: any;
    private primaryEditorPane;
    private secondaryEditorPane;
    private primaryEditorContainer;
    private secondaryEditorContainer;
    private splitview;
    private readonly splitviewDisposables;
    private readonly editorDisposables;
    private orientation;
    private dimension;
    private lastFocusedSide;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    private registerListeners;
    private onConfigurationUpdated;
    private recreateSplitview;
    private getSplitViewRatio;
    protected createEditor(parent: HTMLElement): void;
    private createSplitView;
    getTitle(): string;
    setInput(input: SideBySideEditorInput, options: ISideBySideEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private loadViewState;
    private createEditors;
    private doCreateEditor;
    private onDidFocusChange;
    getSelection(): IEditorPaneSelection | undefined;
    setOptions(options: ISideBySideEditorOptions | undefined): void;
    protected setEditorVisible(visible: boolean): void;
    clearInput(): void;
    focus(): void;
    private getLastFocusedEditorPane;
    layout(dimension: Dimension): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private layoutPane;
    getControl(): IEditorControl | undefined;
    getPrimaryEditorPane(): IEditorPane | undefined;
    getSecondaryEditorPane(): IEditorPane | undefined;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected computeEditorViewState(resource: URI): ISideBySideEditorViewState | undefined;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    updateStyles(): void;
    dispose(): void;
    private disposeEditors;
}
export {};
