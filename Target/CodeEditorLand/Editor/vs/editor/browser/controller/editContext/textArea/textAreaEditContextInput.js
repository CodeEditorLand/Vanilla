var M=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var A=(c,s,e,i)=>{for(var o=i>1?void 0:i?O(s,e):s,a=c.length-1,d;a>=0;a--)(d=c[a])&&(o=(i?d(s,e,o):d(o))||o);return i&&o&&M(s,e,o),o},x=(c,s)=>(e,i)=>s(e,i,c);import*as T from"../../../../../base/browser/browser.js";import*as m from"../../../../../base/browser/dom.js";import{DomEmitter as h}from"../../../../../base/browser/event.js";import{StandardKeyboardEvent as E}from"../../../../../base/browser/keyboardEvent.js";import{inputLatency as C}from"../../../../../base/browser/performance.js";import{RunOnceScheduler as b}from"../../../../../base/common/async.js";import{Emitter as u,Event as L}from"../../../../../base/common/event.js";import{KeyCode as y}from"../../../../../base/common/keyCodes.js";import{Disposable as w,MutableDisposable as U}from"../../../../../base/common/lifecycle.js";import{Mimes as I}from"../../../../../base/common/mime.js";import{OperatingSystem as D}from"../../../../../base/common/platform.js";import*as N from"../../../../../base/common/strings.js";import{IAccessibilityService as W}from"../../../../../platform/accessibility/common/accessibility.js";import{ILogService as B}from"../../../../../platform/log/common/log.js";import"../../../../common/core/position.js";import{Selection as G}from"../../../../common/core/selection.js";import{InMemoryClipboardMetadataManager as F}from"../clipboardUtils.js";import{_debugComposition as S,TextAreaState as _}from"./textAreaEditContextState.js";var K;(s=>s.Tap="-monaco-textarea-synthetic-tap")(K||={});class k{_lastTypeTextLength;constructor(){this._lastTypeTextLength=0}handleCompositionUpdate(s){s=s||"";const e={text:s,replacePrevCharCnt:this._lastTypeTextLength,replaceNextCharCnt:0,positionDelta:0};return this._lastTypeTextLength=s.length,e}}let f=class extends w{constructor(e,i,o,a,d,g){super();this._host=e;this._textArea=i;this._OS=o;this._browser=a;this._accessibilityService=d;this._logService=g;this._asyncTriggerCut=this._register(new b(()=>this._onCut.fire(),0)),this._textAreaState=_.EMPTY,this._selectionChangeListener=null,this._accessibilityService.isScreenReaderOptimized()&&this.writeNativeTextAreaContent("ctor"),this._register(L.runAndSubscribe(this._accessibilityService.onDidChangeScreenReaderOptimized,()=>{this._accessibilityService.isScreenReaderOptimized()&&!this._asyncFocusGainWriteScreenReaderContent.value?this._asyncFocusGainWriteScreenReaderContent.value=this._register(new b(()=>this.writeNativeTextAreaContent("asyncFocusGain"),0)):this._asyncFocusGainWriteScreenReaderContent.clear()})),this._hasFocus=!1,this._currentComposition=null;let l=null;this._register(this._textArea.onKeyDown(t=>{const n=new E(t);(n.keyCode===y.KEY_IN_COMPOSITION||this._currentComposition&&n.keyCode===y.Backspace)&&n.stopPropagation(),n.equals(y.Escape)&&n.preventDefault(),l=n,this._onKeyDown.fire(n)})),this._register(this._textArea.onKeyUp(t=>{const n=new E(t);this._onKeyUp.fire(n)})),this._register(this._textArea.onCompositionStart(t=>{S&&console.log("[compositionstart]",t);const n=new k;if(this._currentComposition){this._currentComposition=n;return}if(this._currentComposition=n,this._OS===D.Macintosh&&l&&l.equals(y.KEY_IN_COMPOSITION)&&this._textAreaState.selectionStart===this._textAreaState.selectionEnd&&this._textAreaState.selectionStart>0&&this._textAreaState.value.substr(this._textAreaState.selectionStart-1,1)===t.data&&(l.code==="ArrowRight"||l.code==="ArrowLeft")){S&&console.log("[compositionstart] Handling long press case on macOS + arrow key",t),n.handleCompositionUpdate("x"),this._onCompositionStart.fire({data:t.data});return}if(this._browser.isAndroid){this._onCompositionStart.fire({data:t.data});return}this._onCompositionStart.fire({data:t.data})})),this._register(this._textArea.onCompositionUpdate(t=>{S&&console.log("[compositionupdate]",t);const n=this._currentComposition;if(!n)return;if(this._browser.isAndroid){const p=_.readFromTextArea(this._textArea,this._textAreaState),v=_.deduceAndroidCompositionInput(this._textAreaState,p);this._textAreaState=p,this._onType.fire(v),this._onCompositionUpdate.fire(t);return}const r=n.handleCompositionUpdate(t.data);this._textAreaState=_.readFromTextArea(this._textArea,this._textAreaState),this._onType.fire(r),this._onCompositionUpdate.fire(t)})),this._register(this._textArea.onCompositionEnd(t=>{S&&console.log("[compositionend]",t);const n=this._currentComposition;if(!n)return;if(this._currentComposition=null,this._browser.isAndroid){const p=_.readFromTextArea(this._textArea,this._textAreaState),v=_.deduceAndroidCompositionInput(this._textAreaState,p);this._textAreaState=p,this._onType.fire(v),this._onCompositionEnd.fire();return}const r=n.handleCompositionUpdate(t.data);this._textAreaState=_.readFromTextArea(this._textArea,this._textAreaState),this._onType.fire(r),this._onCompositionEnd.fire()})),this._register(this._textArea.onInput(t=>{if(S&&console.log("[input]",t),this._textArea.setIgnoreSelectionChangeTime("received input event"),this._currentComposition)return;const n=_.readFromTextArea(this._textArea,this._textAreaState),r=_.deduceInput(this._textAreaState,n,this._OS===D.Macintosh);r.replacePrevCharCnt===0&&r.text.length===1&&(N.isHighSurrogate(r.text.charCodeAt(0))||r.text.charCodeAt(0)===127)||(this._textAreaState=n,(r.text!==""||r.replacePrevCharCnt!==0||r.replaceNextCharCnt!==0||r.positionDelta!==0)&&this._onType.fire(r))})),this._register(this._textArea.onCut(t=>{this._textArea.setIgnoreSelectionChangeTime("received cut event"),this._ensureClipboardGetsEditorSelection(t),this._asyncTriggerCut.schedule()})),this._register(this._textArea.onCopy(t=>{this._ensureClipboardGetsEditorSelection(t)})),this._register(this._textArea.onPaste(t=>{if(this._textArea.setIgnoreSelectionChangeTime("received paste event"),t.preventDefault(),!t.clipboardData)return;let[n,r]=P.getTextData(t.clipboardData);n&&(r=r||F.INSTANCE.get(n),this._onPaste.fire({text:n,metadata:r}))})),this._register(this._textArea.onFocus(()=>{const t=this._hasFocus;this._setHasFocus(!0),this._accessibilityService.isScreenReaderOptimized()&&this._browser.isSafari&&!t&&this._hasFocus&&(this._asyncFocusGainWriteScreenReaderContent.value||(this._asyncFocusGainWriteScreenReaderContent.value=new b(()=>this.writeNativeTextAreaContent("asyncFocusGain"),0)),this._asyncFocusGainWriteScreenReaderContent.value.schedule())})),this._register(this._textArea.onBlur(()=>{this._currentComposition&&(this._currentComposition=null,this.writeNativeTextAreaContent("blurWithoutCompositionEnd"),this._onCompositionEnd.fire()),this._setHasFocus(!1)})),this._register(this._textArea.onSyntheticTap(()=>{this._browser.isAndroid&&this._currentComposition&&(this._currentComposition=null,this.writeNativeTextAreaContent("tapWithoutCompositionEnd"),this._onCompositionEnd.fire())}))}_onFocus=this._register(new u);onFocus=this._onFocus.event;_onBlur=this._register(new u);onBlur=this._onBlur.event;_onKeyDown=this._register(new u);onKeyDown=this._onKeyDown.event;_onKeyUp=this._register(new u);onKeyUp=this._onKeyUp.event;_onCut=this._register(new u);onCut=this._onCut.event;_onPaste=this._register(new u);onPaste=this._onPaste.event;_onType=this._register(new u);onType=this._onType.event;_onCompositionStart=this._register(new u);onCompositionStart=this._onCompositionStart.event;_onCompositionUpdate=this._register(new u);onCompositionUpdate=this._onCompositionUpdate.event;_onCompositionEnd=this._register(new u);onCompositionEnd=this._onCompositionEnd.event;_onSelectionChangeRequest=this._register(new u);onSelectionChangeRequest=this._onSelectionChangeRequest.event;_asyncTriggerCut;_asyncFocusGainWriteScreenReaderContent=this._register(new U);_textAreaState;get textAreaState(){return this._textAreaState}_selectionChangeListener;_hasFocus;_currentComposition;_initializeFromTest(){this._hasFocus=!0,this._textAreaState=_.readFromTextArea(this._textArea,null)}_installSelectionChangeListener(){let e=0;return m.addDisposableListener(this._textArea.ownerDocument,"selectionchange",i=>{if(C.onSelectionChange(),!this._hasFocus||this._currentComposition||!this._browser.isChrome)return;const o=Date.now(),a=o-e;if(e=o,a<5)return;const d=o-this._textArea.getIgnoreSelectionChangeTime();if(this._textArea.resetSelectionChangeTime(),d<100||!this._textAreaState.selection)return;const g=this._textArea.getValue();if(this._textAreaState.value!==g)return;const l=this._textArea.getSelectionStart(),t=this._textArea.getSelectionEnd();if(this._textAreaState.selectionStart===l&&this._textAreaState.selectionEnd===t)return;const n=this._textAreaState.deduceEditorPosition(l),r=this._host.deduceModelPosition(n[0],n[1],n[2]),p=this._textAreaState.deduceEditorPosition(t),v=this._host.deduceModelPosition(p[0],p[1],p[2]),R=new G(r.lineNumber,r.column,v.lineNumber,v.column);this._onSelectionChangeRequest.fire(R)})}dispose(){super.dispose(),this._selectionChangeListener&&(this._selectionChangeListener.dispose(),this._selectionChangeListener=null)}focusTextArea(){this._setHasFocus(!0),this.refreshFocusState()}isFocused(){return this._hasFocus}refreshFocusState(){this._setHasFocus(this._textArea.hasFocus())}_setHasFocus(e){this._hasFocus!==e&&(this._hasFocus=e,this._selectionChangeListener&&(this._selectionChangeListener.dispose(),this._selectionChangeListener=null),this._hasFocus&&(this._selectionChangeListener=this._installSelectionChangeListener()),this._hasFocus&&this.writeNativeTextAreaContent("focusgain"),this._hasFocus?this._onFocus.fire():this._onBlur.fire())}_setAndWriteTextAreaState(e,i){this._hasFocus||(i=i.collapseSelection()),i.writeToTextArea(e,this._textArea,this._hasFocus),this._textAreaState=i}writeNativeTextAreaContent(e){!this._accessibilityService.isScreenReaderOptimized()&&e==="render"||this._currentComposition||(this._logService.trace(`writeTextAreaState(reason: ${e})`),this._setAndWriteTextAreaState(e,this._host.getScreenReaderContent()))}_ensureClipboardGetsEditorSelection(e){const i=this._host.getDataToCopy(),o={version:1,isFromEmptySelection:i.isFromEmptySelection,multicursorText:i.multicursorText,mode:i.mode};F.INSTANCE.set(this._browser.isFirefox?i.text.replace(/\r\n/g,`
`):i.text,o),e.preventDefault(),e.clipboardData&&P.setTextData(e.clipboardData,i.text,i.html,o)}};f=A([x(4,W),x(5,B)],f);const P={getTextData(c){const s=c.getData(I.text);let e=null;const i=c.getData("vscode-editor-data");if(typeof i=="string")try{e=JSON.parse(i),e.version!==1&&(e=null)}catch{}return s.length===0&&e===null&&c.files.length>0?[Array.prototype.slice.call(c.files,0).map(a=>a.name).join(`
`),null]:[s,e]},setTextData(c,s,e,i){c.setData(I.text,s),typeof e=="string"&&c.setData("text/html",e),c.setData("vscode-editor-data",JSON.stringify(i))}};class ue extends w{constructor(e){super();this._actual=e;this._ignoreSelectionChangeTime=0,this._register(this.onKeyDown(()=>C.onKeyDown())),this._register(this.onBeforeInput(()=>C.onBeforeInput())),this._register(this.onInput(()=>C.onInput())),this._register(this.onKeyUp(()=>C.onKeyUp())),this._register(m.addDisposableListener(this._actual,K.Tap,()=>this._onSyntheticTap.fire()))}onKeyDown=this._register(new h(this._actual,"keydown")).event;onKeyPress=this._register(new h(this._actual,"keypress")).event;onKeyUp=this._register(new h(this._actual,"keyup")).event;onCompositionStart=this._register(new h(this._actual,"compositionstart")).event;onCompositionUpdate=this._register(new h(this._actual,"compositionupdate")).event;onCompositionEnd=this._register(new h(this._actual,"compositionend")).event;onBeforeInput=this._register(new h(this._actual,"beforeinput")).event;onInput=this._register(new h(this._actual,"input")).event;onCut=this._register(new h(this._actual,"cut")).event;onCopy=this._register(new h(this._actual,"copy")).event;onPaste=this._register(new h(this._actual,"paste")).event;onFocus=this._register(new h(this._actual,"focus")).event;onBlur=this._register(new h(this._actual,"blur")).event;get ownerDocument(){return this._actual.ownerDocument}_onSyntheticTap=this._register(new u);onSyntheticTap=this._onSyntheticTap.event;_ignoreSelectionChangeTime;hasFocus(){const e=m.getShadowRoot(this._actual);return e?e.activeElement===this._actual:this._actual.isConnected?m.getActiveElement()===this._actual:!1}setIgnoreSelectionChangeTime(e){this._ignoreSelectionChangeTime=Date.now()}getIgnoreSelectionChangeTime(){return this._ignoreSelectionChangeTime}resetSelectionChangeTime(){this._ignoreSelectionChangeTime=0}getValue(){return this._actual.value}setValue(e,i){const o=this._actual;o.value!==i&&(this.setIgnoreSelectionChangeTime("setValue"),o.value=i)}getSelectionStart(){return this._actual.selectionDirection==="backward"?this._actual.selectionEnd:this._actual.selectionStart}getSelectionEnd(){return this._actual.selectionDirection==="backward"?this._actual.selectionStart:this._actual.selectionEnd}setSelectionRange(e,i,o){const a=this._actual;let d=null;const g=m.getShadowRoot(a);g?d=g.activeElement:d=m.getActiveElement();const l=m.getWindow(d),t=d===a,n=a.selectionStart,r=a.selectionEnd;if(t&&n===i&&r===o){T.isFirefox&&l.parent!==l&&a.focus();return}if(t){this.setIgnoreSelectionChangeTime("setSelectionRange"),a.setSelectionRange(i,o),T.isFirefox&&l.parent!==l&&a.focus();return}try{const p=m.saveParentsScrollTop(a);this.setIgnoreSelectionChangeTime("setSelectionRange"),a.focus(),a.setSelectionRange(i,o),m.restoreParentsScrollTop(a,p)}catch{}}}export{P as ClipboardEventUtils,f as TextAreaInput,K as TextAreaSyntethicEvents,ue as TextAreaWrapper};
