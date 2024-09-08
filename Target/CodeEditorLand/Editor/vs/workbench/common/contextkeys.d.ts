import type { URI } from "../../base/common/uri.js";
import { ILanguageService } from "../../editor/common/languages/language.js";
import { IModelService } from "../../editor/common/services/model.js";
import { IContextKeyService, RawContextKey, type IContextKey } from "../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../platform/files/common/files.js";
import type { IEditorResolverService } from "../services/editor/common/editorResolverService.js";
import type { EditorInput } from "./editor/editorInput.js";
export declare const WorkbenchStateContext: RawContextKey<string>;
export declare const WorkspaceFolderCountContext: RawContextKey<number>;
export declare const OpenFolderWorkspaceSupportContext: RawContextKey<boolean>;
export declare const EnterMultiRootWorkspaceSupportContext: RawContextKey<boolean>;
export declare const EmptyWorkspaceSupportContext: RawContextKey<boolean>;
export declare const DirtyWorkingCopiesContext: RawContextKey<boolean>;
export declare const RemoteNameContext: RawContextKey<string>;
export declare const VirtualWorkspaceContext: RawContextKey<string>;
export declare const TemporaryWorkspaceContext: RawContextKey<boolean>;
export declare const IsMainWindowFullscreenContext: RawContextKey<boolean>;
export declare const IsAuxiliaryWindowFocusedContext: RawContextKey<boolean>;
export declare const HasWebFileSystemAccess: RawContextKey<boolean>;
export declare const EmbedderIdentifierContext: RawContextKey<string | undefined>;
export declare const ActiveEditorDirtyContext: RawContextKey<boolean>;
export declare const ActiveEditorPinnedContext: RawContextKey<boolean>;
export declare const ActiveEditorFirstInGroupContext: RawContextKey<boolean>;
export declare const ActiveEditorLastInGroupContext: RawContextKey<boolean>;
export declare const ActiveEditorStickyContext: RawContextKey<boolean>;
export declare const ActiveEditorReadonlyContext: RawContextKey<boolean>;
export declare const ActiveCompareEditorCanSwapContext: RawContextKey<boolean>;
export declare const ActiveEditorCanToggleReadonlyContext: RawContextKey<boolean>;
export declare const ActiveEditorCanRevertContext: RawContextKey<boolean>;
export declare const ActiveEditorCanSplitInGroupContext: RawContextKey<boolean>;
export declare const ActiveEditorContext: RawContextKey<string | null>;
export declare const ActiveEditorAvailableEditorIdsContext: RawContextKey<string>;
export declare const TextCompareEditorVisibleContext: RawContextKey<boolean>;
export declare const TextCompareEditorActiveContext: RawContextKey<boolean>;
export declare const SideBySideEditorActiveContext: RawContextKey<boolean>;
export declare const EditorGroupEditorsCountContext: RawContextKey<number>;
export declare const ActiveEditorGroupEmptyContext: RawContextKey<boolean>;
export declare const ActiveEditorGroupIndexContext: RawContextKey<number>;
export declare const ActiveEditorGroupLastContext: RawContextKey<boolean>;
export declare const ActiveEditorGroupLockedContext: RawContextKey<boolean>;
export declare const MultipleEditorGroupsContext: RawContextKey<boolean>;
export declare const SingleEditorGroupsContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const MultipleEditorsSelectedInGroupContext: RawContextKey<boolean>;
export declare const TwoEditorsSelectedInGroupContext: RawContextKey<boolean>;
export declare const SelectedEditorsInGroupFileOrUntitledResourceContextKey: RawContextKey<boolean>;
export declare const EditorPartMultipleEditorGroupsContext: RawContextKey<boolean>;
export declare const EditorPartSingleEditorGroupsContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const EditorPartMaximizedEditorGroupContext: RawContextKey<boolean>;
export declare const IsAuxiliaryEditorPartContext: RawContextKey<boolean>;
export declare const EditorsVisibleContext: RawContextKey<boolean>;
export declare const InEditorZenModeContext: RawContextKey<boolean>;
export declare const IsMainEditorCenteredLayoutContext: RawContextKey<boolean>;
export declare const SplitEditorsVertically: RawContextKey<boolean>;
export declare const MainEditorAreaVisibleContext: RawContextKey<boolean>;
export declare const EditorTabsVisibleContext: RawContextKey<boolean>;
export declare const SideBarVisibleContext: RawContextKey<boolean>;
export declare const SidebarFocusContext: RawContextKey<boolean>;
export declare const ActiveViewletContext: RawContextKey<string>;
export declare const StatusBarFocused: RawContextKey<boolean>;
export declare const TitleBarStyleContext: RawContextKey<string>;
export declare const TitleBarVisibleContext: RawContextKey<boolean>;
export declare const BannerFocused: RawContextKey<boolean>;
export declare const NotificationFocusedContext: RawContextKey<boolean>;
export declare const NotificationsCenterVisibleContext: RawContextKey<boolean>;
export declare const NotificationsToastsVisibleContext: RawContextKey<boolean>;
export declare const ActiveAuxiliaryContext: RawContextKey<string>;
export declare const AuxiliaryBarFocusContext: RawContextKey<boolean>;
export declare const AuxiliaryBarVisibleContext: RawContextKey<boolean>;
export declare const ActivePanelContext: RawContextKey<string>;
export declare const PanelFocusContext: RawContextKey<boolean>;
export declare const PanelPositionContext: RawContextKey<string>;
export declare const PanelAlignmentContext: RawContextKey<string>;
export declare const PanelVisibleContext: RawContextKey<boolean>;
export declare const PanelMaximizedContext: RawContextKey<boolean>;
export declare const FocusedViewContext: RawContextKey<string>;
export declare function getVisbileViewContextKey(viewId: string): string;
export declare class ResourceContextKey {
    private readonly _contextKeyService;
    private readonly _fileService;
    private readonly _languageService;
    private readonly _modelService;
    static readonly Scheme: RawContextKey<string>;
    static readonly Filename: RawContextKey<string>;
    static readonly Dirname: RawContextKey<string>;
    static readonly Path: RawContextKey<string>;
    static readonly LangId: RawContextKey<string>;
    static readonly Resource: RawContextKey<string>;
    static readonly Extension: RawContextKey<string>;
    static readonly HasResource: RawContextKey<boolean>;
    static readonly IsFileSystemResource: RawContextKey<boolean>;
    private readonly _disposables;
    private _value;
    private readonly _resourceKey;
    private readonly _schemeKey;
    private readonly _filenameKey;
    private readonly _dirnameKey;
    private readonly _pathKey;
    private readonly _langIdKey;
    private readonly _extensionKey;
    private readonly _hasResource;
    private readonly _isFileSystemResource;
    constructor(_contextKeyService: IContextKeyService, _fileService: IFileService, _languageService: ILanguageService, _modelService: IModelService);
    dispose(): void;
    private _setLangId;
    set(value: URI | null | undefined): void;
    private uriToPath;
    reset(): void;
    get(): URI | undefined;
}
export declare function applyAvailableEditorIds(contextKey: IContextKey<string>, editor: EditorInput | undefined | null, editorResolverService: IEditorResolverService): void;