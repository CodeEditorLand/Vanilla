import"../../../../../base/common/lifecycle.js";import{isWindows as m}from"../../../../../base/common/platform.js";import{URI as i}from"../../../../../base/common/uri.js";import"../../../../../editor/common/services/model.js";import{ModelService as c}from"../../../../../editor/common/services/modelService.js";import{IConfigurationService as s}from"../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as n}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IContextKeyService as f}from"../../../../../platform/contextkey/common/contextkey.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{MockContextKeyService as p}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{IThemeService as u}from"../../../../../platform/theme/common/themeService.js";import{TestThemeService as d}from"../../../../../platform/theme/test/common/testThemeService.js";import"../../../notebook/browser/services/notebookEditorService.js";import{NotebookEditorWidgetService as I}from"../../../notebook/browser/services/notebookEditorServiceImpl.js";import"../../browser/searchModel.js";import{IEditorGroupsService as S}from"../../../../services/editor/common/editorGroupsService.js";import{IEditorService as l}from"../../../../services/editor/common/editorService.js";import"../../../../services/search/common/search.js";import{TestEditorGroupsService as v,TestEditorService as a}from"../../../../test/browser/workbenchTestServices.js";function B(e){const o=b();return e?i.file(`${o}${e}`):m?i.file(`${o}/`):i.file(o)}function b(){return m?"c:":""}function H(e,o){e.stub(u,new d);const r=new n;r.setUserConfiguration("search",{searchOnType:!0}),e.stub(s,r);const t=e.createInstance(c);return o(t),t}function J(e,o){e.stub(S,new v),e.stub(f,new p);const r=new a;o(r),e.stub(l,r);const t=e.createInstance(I);return o(t),t}function L(e,o,r=""){e.add(o,r,!1)}export{L as addToSearchResult,B as createFileUriFromPathFromRoot,b as getRootName,H as stubModelService,J as stubNotebookEditorService};
