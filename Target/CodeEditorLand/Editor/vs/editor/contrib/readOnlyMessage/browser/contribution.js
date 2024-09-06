import{MarkdownString as i}from"../../../../../vs/base/common/htmlContent.js";import{Disposable as n}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorContributionInstantiation as d,registerEditorContribution as s}from"../../../../../vs/editor/browser/editorExtensions.js";import{EditorOption as a}from"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/editorCommon.js";import{MessageController as l}from"../../../../../vs/editor/contrib/message/browser/messageController.js";import*as e from"../../../../../vs/nls.js";class r extends n{constructor(o){super();this.editor=o;this._register(this.editor.onDidAttemptReadOnlyEdit(()=>this._onDidAttemptReadOnlyEdit()))}static ID="editor.contrib.readOnlyMessageController";_onDidAttemptReadOnlyEdit(){const o=l.get(this.editor);if(o&&this.editor.hasModel()){let t=this.editor.getOptions().get(a.readOnlyMessage);t||(this.editor.isSimpleWidget?t=new i(e.localize("editor.simple.readonly","Cannot edit in read-only input")):t=new i(e.localize("editor.readonly","Cannot edit in read-only editor"))),o.showMessage(t,this.editor.getPosition())}}}s(r.ID,r,d.BeforeFirstInteraction);export{r as ReadOnlyMessageController};