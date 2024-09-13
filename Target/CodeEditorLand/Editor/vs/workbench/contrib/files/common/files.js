var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import {
  ILanguageService
} from "../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import {
  ContextKeyExpr,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { InputFocusedContextKey } from "../../../../platform/contextkey/common/contextkeys.js";
import {
  FileChangeType,
  IFileService
} from "../../../../platform/files/common/files.js";
import {
  EditorResourceAccessor,
  SideBySideEditor
} from "../../../common/editor.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
const VIEWLET_ID = "workbench.view.explorer";
const VIEW_ID = "workbench.explorer.fileView";
const ExplorerViewletVisibleContext = new RawContextKey(
  "explorerViewletVisible",
  true,
  {
    type: "boolean",
    description: localize(
      "explorerViewletVisible",
      "True when the EXPLORER viewlet is visible."
    )
  }
);
const FoldersViewVisibleContext = new RawContextKey(
  "foldersViewVisible",
  true,
  {
    type: "boolean",
    description: localize(
      "foldersViewVisible",
      "True when the FOLDERS view (the file tree within the explorer view container) is visible."
    )
  }
);
const ExplorerFolderContext = new RawContextKey(
  "explorerResourceIsFolder",
  false,
  {
    type: "boolean",
    description: localize(
      "explorerResourceIsFolder",
      "True when the focused item in the EXPLORER is a folder."
    )
  }
);
const ExplorerResourceReadonlyContext = new RawContextKey(
  "explorerResourceReadonly",
  false,
  {
    type: "boolean",
    description: localize(
      "explorerResourceReadonly",
      "True when the focused item in the EXPLORER is read-only."
    )
  }
);
const ExplorerResourceNotReadonlyContext = ExplorerResourceReadonlyContext.toNegated();
const ExplorerResourceAvailableEditorIdsContext = new RawContextKey("explorerResourceAvailableEditorIds", "");
const ExplorerRootContext = new RawContextKey(
  "explorerResourceIsRoot",
  false,
  {
    type: "boolean",
    description: localize(
      "explorerResourceIsRoot",
      "True when the focused item in the EXPLORER is a root folder."
    )
  }
);
const ExplorerResourceCut = new RawContextKey(
  "explorerResourceCut",
  false,
  {
    type: "boolean",
    description: localize(
      "explorerResourceCut",
      "True when an item in the EXPLORER has been cut for cut and paste."
    )
  }
);
const ExplorerResourceMoveableToTrash = new RawContextKey(
  "explorerResourceMoveableToTrash",
  false,
  {
    type: "boolean",
    description: localize(
      "explorerResourceMoveableToTrash",
      "True when the focused item in the EXPLORER can be moved to trash."
    )
  }
);
const FilesExplorerFocusedContext = new RawContextKey(
  "filesExplorerFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "filesExplorerFocus",
      "True when the focus is inside the EXPLORER view."
    )
  }
);
const OpenEditorsFocusedContext = new RawContextKey(
  "openEditorsFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "openEditorsFocus",
      "True when the focus is inside the OPEN EDITORS view."
    )
  }
);
const ExplorerFocusedContext = new RawContextKey(
  "explorerViewletFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "explorerViewletFocus",
      "True when the focus is inside the EXPLORER viewlet."
    )
  }
);
const ExplorerCompressedFocusContext = new RawContextKey(
  "explorerViewletCompressedFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "explorerViewletCompressedFocus",
      "True when the focused item in the EXPLORER view is a compact item."
    )
  }
);
const ExplorerCompressedFirstFocusContext = new RawContextKey(
  "explorerViewletCompressedFirstFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "explorerViewletCompressedFirstFocus",
      "True when the focus is inside a compact item's first part in the EXPLORER view."
    )
  }
);
const ExplorerCompressedLastFocusContext = new RawContextKey(
  "explorerViewletCompressedLastFocus",
  true,
  {
    type: "boolean",
    description: localize(
      "explorerViewletCompressedLastFocus",
      "True when the focus is inside a compact item's last part in the EXPLORER view."
    )
  }
);
const ViewHasSomeCollapsibleRootItemContext = new RawContextKey(
  "viewHasSomeCollapsibleItem",
  false,
  {
    type: "boolean",
    description: localize(
      "viewHasSomeCollapsibleItem",
      "True when a workspace in the EXPLORER view has some collapsible root child."
    )
  }
);
const FilesExplorerFocusCondition = ContextKeyExpr.and(
  FoldersViewVisibleContext,
  FilesExplorerFocusedContext,
  ContextKeyExpr.not(InputFocusedContextKey)
);
const ExplorerFocusCondition = ContextKeyExpr.and(
  FoldersViewVisibleContext,
  ExplorerFocusedContext,
  ContextKeyExpr.not(InputFocusedContextKey)
);
const TEXT_FILE_EDITOR_ID = "workbench.editors.files.textFileEditor";
const FILE_EDITOR_INPUT_ID = "workbench.editors.files.fileEditorInput";
const BINARY_FILE_EDITOR_ID = "workbench.editors.files.binaryFileEditor";
const BINARY_TEXT_FILE_MODE = "code-text-binary";
var SortOrder = /* @__PURE__ */ ((SortOrder2) => {
  SortOrder2["Default"] = "default";
  SortOrder2["Mixed"] = "mixed";
  SortOrder2["FilesFirst"] = "filesFirst";
  SortOrder2["Type"] = "type";
  SortOrder2["Modified"] = "modified";
  SortOrder2["FoldersNestsFiles"] = "foldersNestsFiles";
  return SortOrder2;
})(SortOrder || {});
var UndoConfirmLevel = /* @__PURE__ */ ((UndoConfirmLevel2) => {
  UndoConfirmLevel2["Verbose"] = "verbose";
  UndoConfirmLevel2["Default"] = "default";
  UndoConfirmLevel2["Light"] = "light";
  return UndoConfirmLevel2;
})(UndoConfirmLevel || {});
var LexicographicOptions = /* @__PURE__ */ ((LexicographicOptions2) => {
  LexicographicOptions2["Default"] = "default";
  LexicographicOptions2["Upper"] = "upper";
  LexicographicOptions2["Lower"] = "lower";
  LexicographicOptions2["Unicode"] = "unicode";
  return LexicographicOptions2;
})(LexicographicOptions || {});
let TextFileContentProvider = class extends Disposable {
  constructor(textFileService, fileService, languageService, modelService) {
    super();
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
  }
  static {
    __name(this, "TextFileContentProvider");
  }
  fileWatcherDisposable = this._register(
    new MutableDisposable()
  );
  static async open(resource, scheme, label, editorService, options) {
    await editorService.openEditor({
      original: {
        resource: TextFileContentProvider.resourceToTextFile(
          scheme,
          resource
        )
      },
      modified: { resource },
      label,
      options
    });
  }
  static resourceToTextFile(scheme, resource) {
    return resource.with({
      scheme,
      query: JSON.stringify({
        scheme: resource.scheme,
        query: resource.query
      })
    });
  }
  static textFileToResource(resource) {
    const { scheme, query } = JSON.parse(resource.query);
    return resource.with({ scheme, query });
  }
  async provideTextContent(resource) {
    if (!resource.query) {
      return null;
    }
    const savedFileResource = TextFileContentProvider.textFileToResource(resource);
    const codeEditorModel = await this.resolveEditorModel(resource);
    if (!this.fileWatcherDisposable.value) {
      const disposables = new DisposableStore();
      this.fileWatcherDisposable.value = disposables;
      disposables.add(
        this.fileService.onDidFilesChange((changes) => {
          if (changes.contains(
            savedFileResource,
            FileChangeType.UPDATED
          )) {
            this.resolveEditorModel(
              resource,
              false
            );
          }
        })
      );
      if (codeEditorModel) {
        disposables.add(
          Event.once(codeEditorModel.onWillDispose)(
            () => this.fileWatcherDisposable.clear()
          )
        );
      }
    }
    return codeEditorModel;
  }
  async resolveEditorModel(resource, createAsNeeded = true) {
    const savedFileResource = TextFileContentProvider.textFileToResource(resource);
    const content = await this.textFileService.readStream(savedFileResource);
    let codeEditorModel = this.modelService.getModel(resource);
    if (codeEditorModel) {
      this.modelService.updateModel(codeEditorModel, content.value);
    } else if (createAsNeeded) {
      const textFileModel = this.modelService.getModel(savedFileResource);
      let languageSelector;
      if (textFileModel) {
        languageSelector = this.languageService.createById(
          textFileModel.getLanguageId()
        );
      } else {
        languageSelector = this.languageService.createByFilepathOrFirstLine(
          savedFileResource
        );
      }
      codeEditorModel = this.modelService.createModel(
        content.value,
        languageSelector,
        resource
      );
    }
    return codeEditorModel;
  }
};
TextFileContentProvider = __decorateClass([
  __decorateParam(0, ITextFileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService)
], TextFileContentProvider);
class OpenEditor {
  constructor(_editor, _group) {
    this._editor = _editor;
    this._group = _group;
    this.id = OpenEditor.COUNTER++;
  }
  static {
    __name(this, "OpenEditor");
  }
  id;
  static COUNTER = 0;
  get editor() {
    return this._editor;
  }
  get group() {
    return this._group;
  }
  get groupId() {
    return this._group.id;
  }
  getId() {
    return `openeditor:${this.groupId}:${this.id}`;
  }
  isPreview() {
    return !this._group.isPinned(this.editor);
  }
  isSticky() {
    return this._group.isSticky(this.editor);
  }
  getResource() {
    return EditorResourceAccessor.getOriginalUri(this.editor, {
      supportSideBySide: SideBySideEditor.PRIMARY
    });
  }
}
export {
  BINARY_FILE_EDITOR_ID,
  BINARY_TEXT_FILE_MODE,
  ExplorerCompressedFirstFocusContext,
  ExplorerCompressedFocusContext,
  ExplorerCompressedLastFocusContext,
  ExplorerFocusCondition,
  ExplorerFocusedContext,
  ExplorerFolderContext,
  ExplorerResourceAvailableEditorIdsContext,
  ExplorerResourceCut,
  ExplorerResourceMoveableToTrash,
  ExplorerResourceNotReadonlyContext,
  ExplorerResourceReadonlyContext,
  ExplorerRootContext,
  ExplorerViewletVisibleContext,
  FILE_EDITOR_INPUT_ID,
  FilesExplorerFocusCondition,
  FilesExplorerFocusedContext,
  FoldersViewVisibleContext,
  LexicographicOptions,
  OpenEditor,
  OpenEditorsFocusedContext,
  SortOrder,
  TEXT_FILE_EDITOR_ID,
  TextFileContentProvider,
  UndoConfirmLevel,
  VIEWLET_ID,
  VIEW_ID,
  ViewHasSomeCollapsibleRootItemContext
};
//# sourceMappingURL=files.js.map
