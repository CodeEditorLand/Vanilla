import{Disposable as r}from"../../../../base/common/lifecycle.js";import{MouseTargetType as n}from"../../../browser/editorBrowser.js";import{EditorContributionInstantiation as s,registerEditorContribution as p}from"../../../browser/editorExtensions.js";import{EditorOption as d}from"../../../common/config/editorOptions.js";import"../../../common/editorCommon.js";class t extends r{constructor(o){super();this._editor=o;this._register(this._editor.onMouseDown(i=>{const e=this._editor.getOption(d.stopRenderingLineAfter);e>=0&&i.target.type===n.CONTENT_TEXT&&i.target.position.column>=e&&this._editor.updateOptions({stopRenderingLineAfter:-1})}))}static ID="editor.contrib.longLinesHelper";static get(o){return o.getContribution(t.ID)}}p(t.ID,t,s.BeforeFirstInteraction);
