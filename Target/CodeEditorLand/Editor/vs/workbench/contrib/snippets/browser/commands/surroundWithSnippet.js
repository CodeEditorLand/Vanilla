import"../../../../../../vs/editor/browser/editorBrowser.js";import"../../../../../../vs/editor/common/core/position.js";import{EditorContextKeys as a}from"../../../../../../vs/editor/common/editorContextKeys.js";import"../../../../../../vs/editor/common/model.js";import{SnippetController2 as l}from"../../../../../../vs/editor/contrib/snippet/browser/snippetController2.js";import{localize2 as d}from"../../../../../../vs/nls.js";import{IClipboardService as S}from"../../../../../../vs/platform/clipboard/common/clipboardService.js";import{ContextKeyExpr as u}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as f}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{SnippetEditorAction as g}from"../../../../../../vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions.js";import{pickSnippet as I}from"../../../../../../vs/workbench/contrib/snippets/browser/snippetPicker.js";import"../../../../../../vs/workbench/contrib/snippets/browser/snippetsFile.js";import{ISnippetsService as x}from"../snippets.js";async function v(m,e,t,p){const{lineNumber:i,column:s}=t;e.tokenization.tokenizeIfCheap(i);const n=e.getLanguageIdAtPosition(i,s);return(await m.getSnippets(n,{includeNoPrefixSnippets:!0,includeDisabledSnippets:p})).filter(r=>r.usesSelection)}class c extends g{static options={id:"editor.action.surroundWithSnippet",title:d("label","Surround with Snippet...")};constructor(){super({...c.options,precondition:u.and(a.writable,a.hasNonEmptySelection),f1:!0})}async runEditorCommand(e,t){if(!t.hasModel())return;const p=e.get(f),i=e.get(x),s=e.get(S),n=await v(i,t.getModel(),t.getPosition(),!0);if(!n.length)return;const o=await p.invokeFunction(I,n);if(!o)return;let r;o.needsClipboard&&(r=await s.readText()),t.focus(),l.get(t)?.insert(o.codeSnippet,{clipboardText:r}),i.updateUsageTimestamp(o)}}export{c as SurroundWithSnippetEditorAction,v as getSurroundableSnippets};
