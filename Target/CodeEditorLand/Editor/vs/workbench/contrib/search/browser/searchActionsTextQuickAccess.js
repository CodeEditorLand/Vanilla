import"../../../../../vs/editor/common/editorCommon.js";import*as c from"../../../../../vs/nls.js";import{Action2 as n,registerAction2 as s}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as a}from"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IQuickInputService as m}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{TEXT_SEARCH_QUICK_ACCESS_PREFIX as u}from"../../../../../vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess.js";import{category as S}from"../../../../../vs/workbench/contrib/search/browser/searchActionsBase.js";import"../../../../../vs/workbench/contrib/search/browser/searchModel.js";import{getSelectionTextFromEditor as l}from"../../../../../vs/workbench/contrib/search/browser/searchView.js";import*as d from"../../../../../vs/workbench/contrib/search/common/constants.js";import{IEditorService as f}from"../../../../../vs/workbench/services/editor/common/editorService.js";s(class extends n{constructor(){super({id:d.SearchCommandIds.QuickTextSearchActionId,title:c.localize2("quickTextSearch","Quick Search"),category:S,f1:!0})}async run(r,i){const e=r.get(m),o=p(r)??"";e.quickAccess.show(u+o,{preserveValue:!!o})}});function p(t){const r=t.get(f),i=t.get(a),e=r.activeTextEditorControl;return!e||!e.hasTextFocus()||!i.getValue("editor.find.seedSearchStringFromSelection")?null:l(!1,e)}
