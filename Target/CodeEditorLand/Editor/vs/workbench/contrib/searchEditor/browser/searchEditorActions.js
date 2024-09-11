var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/searchEditor.css";
import { ICodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { EditorsOrder } from "../../../common/editor.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { getSearchView } from "../../search/browser/searchActionsBase.js";
import { SearchResult } from "../../search/browser/searchModel.js";
import { SearchEditor } from "./searchEditor.js";
import { OpenSearchEditorArgs } from "./searchEditor.contribution.js";
import { getOrMakeSearchEditorInput, SearchEditorInput } from "./searchEditorInput.js";
import { serializeSearchResultForEditor } from "./searchEditorSerialization.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { ISearchConfigurationProperties } from "../../../services/search/common/search.js";
const toggleSearchEditorCaseSensitiveCommand = /* @__PURE__ */ __name((accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleCaseSensitive();
  }
}, "toggleSearchEditorCaseSensitiveCommand");
const toggleSearchEditorWholeWordCommand = /* @__PURE__ */ __name((accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleWholeWords();
  }
}, "toggleSearchEditorWholeWordCommand");
const toggleSearchEditorRegexCommand = /* @__PURE__ */ __name((accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleRegex();
  }
}, "toggleSearchEditorRegexCommand");
const toggleSearchEditorContextLinesCommand = /* @__PURE__ */ __name((accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleContextLines();
  }
}, "toggleSearchEditorContextLinesCommand");
const modifySearchEditorContextLinesCommand = /* @__PURE__ */ __name((accessor, increase) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.modifyContextLines(increase);
  }
}, "modifySearchEditorContextLinesCommand");
const selectAllSearchEditorMatchesCommand = /* @__PURE__ */ __name((accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.focusAllResults();
  }
}, "selectAllSearchEditorMatchesCommand");
async function openSearchEditor(accessor) {
  const viewsService = accessor.get(IViewsService);
  const instantiationService = accessor.get(IInstantiationService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    await instantiationService.invokeFunction(openNewSearchEditor, {
      filesToInclude: searchView.searchIncludePattern.getValue(),
      onlyOpenEditors: searchView.searchIncludePattern.onlySearchInOpenEditors(),
      filesToExclude: searchView.searchExcludePattern.getValue(),
      isRegexp: searchView.searchAndReplaceWidget.searchInput?.getRegex(),
      isCaseSensitive: searchView.searchAndReplaceWidget.searchInput?.getCaseSensitive(),
      matchWholeWord: searchView.searchAndReplaceWidget.searchInput?.getWholeWords(),
      useExcludeSettingsAndIgnoreFiles: searchView.searchExcludePattern.useExcludesAndIgnoreFiles(),
      showIncludesExcludes: !!(searchView.searchIncludePattern.getValue() || searchView.searchExcludePattern.getValue() || !searchView.searchExcludePattern.useExcludesAndIgnoreFiles())
    });
  } else {
    await instantiationService.invokeFunction(openNewSearchEditor);
  }
}
__name(openSearchEditor, "openSearchEditor");
const openNewSearchEditor = /* @__PURE__ */ __name(async (accessor, _args = {}, toSide = false) => {
  const editorService = accessor.get(IEditorService);
  const editorGroupsService = accessor.get(IEditorGroupsService);
  const telemetryService = accessor.get(ITelemetryService);
  const instantiationService = accessor.get(IInstantiationService);
  const configurationService = accessor.get(IConfigurationService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const workspaceContextService = accessor.get(IWorkspaceContextService);
  const historyService = accessor.get(IHistoryService);
  const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
  const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
  const activeEditorControl = editorService.activeTextEditorControl;
  let activeModel;
  let selected = "";
  if (activeEditorControl) {
    if (isDiffEditor(activeEditorControl)) {
      if (activeEditorControl.getOriginalEditor().hasTextFocus()) {
        activeModel = activeEditorControl.getOriginalEditor();
      } else {
        activeModel = activeEditorControl.getModifiedEditor();
      }
    } else {
      activeModel = activeEditorControl;
    }
    const selection = activeModel?.getSelection();
    selected = (selection && activeModel?.getModel()?.getValueInRange(selection)) ?? "";
    if (selection?.isEmpty() && configurationService.getValue("search").seedWithNearestWord) {
      const wordAtPosition = activeModel.getModel()?.getWordAtPosition(selection.getStartPosition());
      if (wordAtPosition) {
        selected = wordAtPosition.word;
      }
    }
  } else {
    if (editorService.activeEditor instanceof SearchEditorInput) {
      const active = editorService.activeEditorPane;
      selected = active.getSelected();
    }
  }
  telemetryService.publicLog2("searchEditor/openNewSearchEditor");
  const seedSearchStringFromSelection = _args.location === "new" || configurationService.getValue("editor").find.seedSearchStringFromSelection;
  const args = { query: seedSearchStringFromSelection ? selected : void 0 };
  for (const entry of Object.entries(_args)) {
    const name = entry[0];
    const value = entry[1];
    if (value !== void 0) {
      args[name] = typeof value === "string" ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value) : value;
    }
  }
  const existing = editorService.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).find((id) => id.editor.typeId === SearchEditorInput.ID);
  let editor;
  if (existing && args.location === "reuse") {
    const group = editorGroupsService.getGroup(existing.groupId);
    if (!group) {
      throw new Error("Invalid group id for search editor");
    }
    const input = existing.editor;
    editor = await group.openEditor(input);
    if (selected) {
      editor.setQuery(selected);
    } else {
      editor.selectQuery();
    }
    editor.setSearchConfig(args);
  } else {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { config: args, resultsContents: "", from: "rawData" });
    editor = await editorService.openEditor(input, { pinned: true }, toSide ? SIDE_GROUP : ACTIVE_GROUP);
  }
  const searchOnType = configurationService.getValue("search").searchOnType;
  if (args.triggerSearch === true || args.triggerSearch !== false && searchOnType && args.query) {
    editor.triggerSearch({ focusResults: args.focusResults });
  }
  if (!args.focusResults) {
    editor.focusSearchInput();
  }
}, "openNewSearchEditor");
const createEditorFromSearchResult = /* @__PURE__ */ __name(async (accessor, searchResult, rawIncludePattern, rawExcludePattern, onlySearchInOpenEditors) => {
  if (!searchResult.query) {
    console.error("Expected searchResult.query to be defined. Got", searchResult);
    return;
  }
  const editorService = accessor.get(IEditorService);
  const telemetryService = accessor.get(ITelemetryService);
  const instantiationService = accessor.get(IInstantiationService);
  const labelService = accessor.get(ILabelService);
  const configurationService = accessor.get(IConfigurationService);
  const sortOrder = configurationService.getValue("search").sortOrder;
  telemetryService.publicLog2("searchEditor/createEditorFromSearchResult");
  const labelFormatter = /* @__PURE__ */ __name((uri) => labelService.getUriLabel(uri, { relative: true }), "labelFormatter");
  const { text, matchRanges, config } = serializeSearchResultForEditor(searchResult, rawIncludePattern, rawExcludePattern, 0, labelFormatter, sortOrder);
  config.onlyOpenEditors = onlySearchInOpenEditors;
  const contextLines = configurationService.getValue("search").searchEditor.defaultNumberOfContextLines;
  if (searchResult.isDirty || contextLines === 0 || contextLines === null) {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { resultsContents: text, config, from: "rawData" });
    await editorService.openEditor(input, { pinned: true });
    input.setMatchRanges(matchRanges);
  } else {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "rawData", resultsContents: "", config: { ...config, contextLines } });
    const editor = await editorService.openEditor(input, { pinned: true });
    editor.triggerSearch();
  }
}, "createEditorFromSearchResult");
export {
  createEditorFromSearchResult,
  modifySearchEditorContextLinesCommand,
  openNewSearchEditor,
  openSearchEditor,
  selectAllSearchEditorMatchesCommand,
  toggleSearchEditorCaseSensitiveCommand,
  toggleSearchEditorContextLinesCommand,
  toggleSearchEditorRegexCommand,
  toggleSearchEditorWholeWordCommand
};
//# sourceMappingURL=searchEditorActions.js.map
