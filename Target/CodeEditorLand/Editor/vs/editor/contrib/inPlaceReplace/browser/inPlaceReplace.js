var y=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var h=(c,o,r,e)=>{for(var n=e>1?void 0:e?w(o,r):o,t=c.length-1,d;t>=0;t--)(d=c[t])&&(n=(e?d(o,r,n):d(n))||n);return e&&n&&y(o,r,n),n},v=(c,o)=>(r,e)=>o(r,e,c);import{createCancelablePromise as N,timeout as k}from"../../../../base/common/async.js";import{onUnexpectedError as C}from"../../../../base/common/errors.js";import{KeyCode as b,KeyMod as l}from"../../../../base/common/keyCodes.js";import*as f from"../../../../nls.js";import{KeybindingWeight as g}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{EditorAction as R,EditorContributionInstantiation as x,registerEditorAction as E,registerEditorContribution as D}from"../../../browser/editorExtensions.js";import{Range as A}from"../../../common/core/range.js";import{Selection as L}from"../../../common/core/selection.js";import{EditorContextKeys as m}from"../../../common/editorContextKeys.js";import{ModelDecorationOptions as W}from"../../../common/model/textModel.js";import{IEditorWorkerService as O}from"../../../common/services/editorWorker.js";import{CodeEditorStateFlag as I,EditorState as V}from"../../editorState/browser/editorState.js";import{InPlaceReplaceCommand as U}from"./inPlaceReplaceCommand.js";import"./inPlaceReplace.css";let i=class{static ID="editor.contrib.inPlaceReplaceController";static get(o){return o.getContribution(i.ID)}static DECORATION=W.register({description:"in-place-replace",className:"valueSetReplacement"});editor;editorWorkerService;decorations;currentRequest;decorationRemover;constructor(o,r){this.editor=o,this.editorWorkerService=r,this.decorations=this.editor.createDecorationsCollection()}dispose(){}run(o,r){this.currentRequest?.cancel();const e=this.editor.getSelection(),n=this.editor.getModel();if(!n||!e)return;let t=e;if(t.startLineNumber!==t.endLineNumber)return;const d=new V(this.editor,I.Value|I.Position),u=n.uri;return this.editorWorkerService.canNavigateValueSet(u)?(this.currentRequest=N(a=>this.editorWorkerService.navigateValueSet(u,t,r)),this.currentRequest.then(a=>{if(!a||!a.range||!a.value||!d.validate(this.editor))return;const S=A.lift(a.range);let s=a.range;const p=a.value.length-(t.endColumn-t.startColumn);s={startLineNumber:s.startLineNumber,startColumn:s.startColumn,endLineNumber:s.endLineNumber,endColumn:s.startColumn+a.value.length},p>1&&(t=new L(t.startLineNumber,t.startColumn,t.endLineNumber,t.endColumn+p-1));const P=new U(S,t,a.value);this.editor.pushUndoStop(),this.editor.executeCommand(o,P),this.editor.pushUndoStop(),this.decorations.set([{range:s,options:i.DECORATION}]),this.decorationRemover?.cancel(),this.decorationRemover=k(350),this.decorationRemover.then(()=>this.decorations.clear()).catch(C)}).catch(C)):Promise.resolve(void 0)}};i=h([v(1,O)],i);class q extends R{constructor(){super({id:"editor.action.inPlaceReplace.up",label:f.localize("InPlaceReplaceAction.previous.label","Replace with Previous Value"),alias:"Replace with Previous Value",precondition:m.writable,kbOpts:{kbExpr:m.editorTextFocus,primary:l.CtrlCmd|l.Shift|b.Comma,weight:g.EditorContrib}})}run(o,r){const e=i.get(r);return e?e.run(this.id,!1):Promise.resolve(void 0)}}class K extends R{constructor(){super({id:"editor.action.inPlaceReplace.down",label:f.localize("InPlaceReplaceAction.next.label","Replace with Next Value"),alias:"Replace with Next Value",precondition:m.writable,kbOpts:{kbExpr:m.editorTextFocus,primary:l.CtrlCmd|l.Shift|b.Period,weight:g.EditorContrib}})}run(o,r){const e=i.get(r);return e?e.run(this.id,!0):Promise.resolve(void 0)}}D(i.ID,i,x.Lazy),E(q),E(K);
