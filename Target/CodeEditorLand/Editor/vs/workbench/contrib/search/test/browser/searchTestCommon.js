var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ModelService } from "../../../../../editor/common/services/modelService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.js";
import { NotebookEditorWidgetService } from "../../../notebook/browser/services/notebookEditorServiceImpl.js";
import { SearchResult } from "../../browser/searchModel.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IFileMatch } from "../../../../services/search/common/search.js";
import { TestEditorGroupsService, TestEditorService } from "../../../../test/browser/workbenchTestServices.js";
function createFileUriFromPathFromRoot(path) {
  const rootName = getRootName();
  if (path) {
    return URI.file(`${rootName}${path}`);
  } else {
    if (isWindows) {
      return URI.file(`${rootName}/`);
    } else {
      return URI.file(rootName);
    }
  }
}
__name(createFileUriFromPathFromRoot, "createFileUriFromPathFromRoot");
function getRootName() {
  if (isWindows) {
    return "c:";
  } else {
    return "";
  }
}
__name(getRootName, "getRootName");
function stubModelService(instantiationService, addDisposable) {
  instantiationService.stub(IThemeService, new TestThemeService());
  const config = new TestConfigurationService();
  config.setUserConfiguration("search", { searchOnType: true });
  instantiationService.stub(IConfigurationService, config);
  const modelService = instantiationService.createInstance(ModelService);
  addDisposable(modelService);
  return modelService;
}
__name(stubModelService, "stubModelService");
function stubNotebookEditorService(instantiationService, addDisposable) {
  instantiationService.stub(IEditorGroupsService, new TestEditorGroupsService());
  instantiationService.stub(IContextKeyService, new MockContextKeyService());
  const es = new TestEditorService();
  addDisposable(es);
  instantiationService.stub(IEditorService, es);
  const notebookEditorWidgetService = instantiationService.createInstance(NotebookEditorWidgetService);
  addDisposable(notebookEditorWidgetService);
  return notebookEditorWidgetService;
}
__name(stubNotebookEditorService, "stubNotebookEditorService");
function addToSearchResult(searchResult, allRaw, searchInstanceID = "") {
  searchResult.add(allRaw, searchInstanceID, false);
}
__name(addToSearchResult, "addToSearchResult");
export {
  addToSearchResult,
  createFileUriFromPathFromRoot,
  getRootName,
  stubModelService,
  stubNotebookEditorService
};
//# sourceMappingURL=searchTestCommon.js.map
