import{StopWatch as i}from"../../../../base/common/stopwatch.js";import{EditorAction as r,registerEditorAction as n}from"../../../browser/editorExtensions.js";import*as c from"../../../../nls.js";class s extends r{constructor(){super({id:"editor.action.forceRetokenize",label:c.localize("forceRetokenize","Developer: Force Retokenize"),alias:"Developer: Force Retokenize",precondition:void 0})}run(d,o){if(!o.hasModel())return;const e=o.getModel();e.tokenization.resetTokenization();const t=new i;e.tokenization.forceTokenization(e.getLineCount()),t.stop(),console.log(`tokenization took ${t.elapsed()}`)}}n(s);
