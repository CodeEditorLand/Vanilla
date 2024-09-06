var b=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var u=(o,a,i,e)=>{for(var t=e>1?void 0:e?k(a,i):a,r=o.length-1,n;r>=0;r--)(n=o[r])&&(t=(e?n(a,i,t):n(t))||t);return e&&t&&b(a,i,t),t},l=(o,a)=>(i,e)=>a(i,e,o);import{distinct as N}from"../../../../../vs/base/common/arrays.js";import{Event as L}from"../../../../../vs/base/common/event.js";import{Disposable as E}from"../../../../../vs/base/common/lifecycle.js";import{ThemeIcon as f}from"../../../../../vs/base/common/themables.js";import{Constants as A}from"../../../../../vs/base/common/uint.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{Range as h}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/editorCommon.js";import{GlyphMarginLane as I,OverviewRulerLane as S,TrackedRangeStickiness as R}from"../../../../../vs/editor/common/model.js";import{localize as C}from"../../../../../vs/nls.js";import{ILogService as _}from"../../../../../vs/platform/log/common/log.js";import{registerColor as M}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{themeColorFromId as D}from"../../../../../vs/platform/theme/common/themeService.js";import{IUriIdentityService as y}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{debugStackframe as O,debugStackframeFocused as F}from"../../../../../vs/workbench/contrib/debug/browser/debugIcons.js";import{IDebugService as T}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import"vs/css!./media/callStackEditorContribution";const x=M("editor.stackFrameHighlightBackground",{dark:"#ffff0033",light:"#ffff6673",hcDark:"#ffff0033",hcLight:"#ffff6673"},C("topStackFrameLineHighlight","Background color for the highlight of line at the top stack frame position.")),w=M("editor.focusedStackFrameHighlightBackground",{dark:"#7abd7a4d",light:"#cee7ce73",hcDark:"#7abd7a4d",hcLight:"#cee7ce73"},C("focusedStackFrameLineHighlight","Background color for the highlight of line at focused stack frame position.")),g=R.NeverGrowsWhenTypingAtEdges,B={description:"top-stack-frame-margin",glyphMarginClassName:f.asClassName(O),glyphMargin:{position:I.Right},zIndex:9999,stickiness:g,overviewRuler:{position:S.Full,color:D(x)}},U={description:"focused-stack-frame-margin",glyphMarginClassName:f.asClassName(F),glyphMargin:{position:I.Right},zIndex:9999,stickiness:g,overviewRuler:{position:S.Full,color:D(w)}},G={description:"top-stack-frame-decoration",isWholeLine:!0,className:"debug-top-stack-frame-line",stickiness:g},$={description:"focused-stack-frame-decoration",isWholeLine:!0,className:"debug-focused-stack-frame-line",stickiness:g},H=o=>({description:"top-stack-frame-inline-decoration",before:{content:"\uEB8B",inlineClassName:o?"debug-top-stack-frame-column start-of-line":"debug-top-stack-frame-column",inlineClassNameAffectsLetterSpacing:!0}});function K(o,a,i){const e=[],t=new h(o.range.startLineNumber,o.range.startColumn,o.range.startLineNumber,A.MAX_SAFE_SMALL_INTEGER),r=new h(o.range.startLineNumber,o.range.startColumn,o.range.startLineNumber,o.range.startColumn+1),n=o.thread.getTopStackFrame();return o.getId()===n?.getId()?(a&&e.push({options:B,range:r}),e.push({options:G,range:t}),o.range.startColumn>1&&e.push({options:H(i),range:t})):(a&&e.push({options:U,range:r}),e.push({options:$,range:t})),e}let p=class extends E{constructor(i,e,t,r){super();this.editor=i;this.debugService=e;this.uriIdentityService=t;this.logService=r;const n=()=>this.decorations.set(this.createCallStackDecorations());this._register(L.any(this.debugService.getViewModel().onDidFocusStackFrame,this.debugService.getModel().onDidChangeCallStack)(()=>{n()})),this._register(this.editor.onDidChangeModel(c=>{c.newModelUrl&&n()})),n()}decorations=this.editor.createDecorationsCollection();createCallStackDecorations(){const i=this.editor;if(!i.hasModel())return[];const e=this.debugService.getViewModel().focusedStackFrame,t=[];return this.debugService.getModel().getSessions().forEach(r=>{const n=r===e?.thread.session;r.getAllThreads().forEach(c=>{if(c.stopped){const d=c.getCallStack(),m=[];d.length>0&&(e&&!e.equals(d[0])&&m.push(e),m.push(d[0])),m.forEach(s=>{if(s&&this.uriIdentityService.extUri.isEqual(s.source.uri,i.getModel()?.uri)){if(s.range.startLineNumber>i.getModel()?.getLineCount()||s.range.startLineNumber<1){this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${s.range.startLineNumber}`);return}const v=i.getModel().getLineFirstNonWhitespaceColumn(s.range.startLineNumber)>=s.range.startColumn;t.push(...K(s,n,v))}})}})}),N(t,r=>`${r.options.className} ${r.options.glyphMarginClassName} ${r.range.startLineNumber} ${r.range.startColumn}`)}dispose(){super.dispose(),this.decorations.clear()}};p=u([l(1,T),l(2,y),l(3,_)],p);export{p as CallStackEditorContribution,$ as FOCUSED_STACK_FRAME_DECORATION,G as TOP_STACK_FRAME_DECORATION,K as createDecorationsForStackFrame,w as focusedStackFrameColor,H as makeStackFrameColumnDecoration,x as topStackFrameColor};
