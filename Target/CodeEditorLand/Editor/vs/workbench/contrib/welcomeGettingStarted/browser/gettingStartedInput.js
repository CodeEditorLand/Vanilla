import"vs/css!./media/gettingStarted";import{Schemas as r}from"../../../../../vs/base/common/network.js";import{URI as o}from"../../../../../vs/base/common/uri.js";import{localize as i}from"../../../../../vs/nls.js";import"../../../../../vs/platform/editor/common/editor.js";import"../../../../../vs/workbench/common/editor.js";import{EditorInput as d}from"../../../../../vs/workbench/common/editor/editorInput.js";const s="workbench.editors.gettingStartedInput";class t extends d{static ID=s;static RESOURCE=o.from({scheme:r.walkThrough,authority:"vscode_getting_started_page"});get typeId(){return t.ID}get editorId(){return this.typeId}toUntyped(){return{resource:t.RESOURCE,options:{override:t.ID,pinned:!1}}}get resource(){return t.RESOURCE}matches(e){return super.matches(e)?!0:e instanceof t?e.selectedCategory===this.selectedCategory:!1}constructor(e){super(),this.selectedCategory=e.selectedCategory,this.selectedStep=e.selectedStep,this.showTelemetryNotice=!!e.showTelemetryNotice}getName(){return i("getStarted","Welcome")}selectedCategory;selectedStep;showTelemetryNotice}export{t as GettingStartedInput,s as gettingStartedInputTypeId};