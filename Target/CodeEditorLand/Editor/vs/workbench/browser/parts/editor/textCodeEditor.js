import{localize as i}from"../../../../nls.js";import{assertIsDefined as r}from"../../../../base/common/types.js";import{applyTextEditorOptions as d}from"../../../common/editor/editorOptions.js";import{IContextKeyService as n}from"../../../../platform/contextkey/common/contextkey.js";import{isEqual as s}from"../../../../base/common/resources.js";import{CodeEditorWidget as p}from"../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import{ScrollType as u}from"../../../../editor/common/editorCommon.js";import{AbstractTextEditor as l}from"./textEditor.js";class U extends l{editorControl=void 0;get scopedContextKeyService(){return this.editorControl?.invokeWithinContext(t=>t.get(n))}getTitle(){return this.input?this.input.getName():i("textEditor","Text Editor")}createEditorControl(t,e){this.editorControl=this._register(this.instantiationService.createInstance(p,t,e,this.getCodeEditorWidgetOptions()))}getCodeEditorWidgetOptions(){return Object.create(null)}updateEditorControlOptions(t){this.editorControl?.updateOptions(t)}getMainControl(){return this.editorControl}getControl(){return this.editorControl}computeEditorViewState(t){if(!this.editorControl)return;const e=this.editorControl.getModel();if(!e)return;const o=e.uri;if(o&&s(o,t))return this.editorControl.saveViewState()??void 0}setOptions(t){super.setOptions(t),t&&d(t,r(this.editorControl),u.Smooth)}focus(){super.focus(),this.editorControl?.focus()}hasFocus(){return this.editorControl?.hasTextFocus()||super.hasFocus()}setEditorVisible(t){super.setEditorVisible(t),t?this.editorControl?.onVisible():this.editorControl?.onHide()}layout(t){this.editorControl?.layout(t)}}export{U as AbstractTextCodeEditor};
