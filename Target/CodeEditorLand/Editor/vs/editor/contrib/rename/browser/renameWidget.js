var k=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var x=(p,e,t,i)=>{for(var n=i>1?void 0:i?D(e,t):e,a=p.length-1,o;a>=0;a--)(o=p[a])&&(n=(i?o(e,t,n):o(n))||n);return i&&n&&k(e,t,n),n},b=(p,e)=>(t,i)=>e(t,i,p);import*as s from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as T}from"../../../../../vs/base/browser/keyboardEvent.js";import*as P from"../../../../../vs/base/browser/ui/aria/aria.js";import"../../../../../vs/base/browser/ui/hover/hover.js";import{getBaseLayerHoverDelegate as A}from"../../../../../vs/base/browser/ui/hover/hoverDelegate2.js";import{getDefaultHoverDelegate as M}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{renderIcon as S}from"../../../../../vs/base/browser/ui/iconLabel/iconLabels.js";import"../../../../../vs/base/browser/ui/list/list.js";import{List as V}from"../../../../../vs/base/browser/ui/list/listWidget.js";import*as K from"../../../../../vs/base/common/arrays.js";import{DeferredPromise as O,raceCancellation as q}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as $}from"../../../../../vs/base/common/cancellation.js";import{Codicon as w}from"../../../../../vs/base/common/codicons.js";import{Emitter as z}from"../../../../../vs/base/common/event.js";import{KeyCode as f}from"../../../../../vs/base/common/keyCodes.js";import{DisposableStore as C,toDisposable as W}from"../../../../../vs/base/common/lifecycle.js";import{StopWatch as G}from"../../../../../vs/base/common/stopwatch.js";import{assertType as l,isDefined as U}from"../../../../../vs/base/common/types.js";import"vs/css!./renameWidget";import*as X from"../../../../../vs/editor/browser/config/domFontInfo.js";import{ContentWidgetPositionPreference as v}from"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as N}from"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/config/fontInfo.js";import"../../../../../vs/editor/common/core/dimension.js";import{Position as Y}from"../../../../../vs/editor/common/core/position.js";import{Range as R}from"../../../../../vs/editor/common/core/range.js";import{ScrollType as j}from"../../../../../vs/editor/common/editorCommon.js";import{NewSymbolNameTag as J,NewSymbolNameTriggerKind as B}from"../../../../../vs/editor/common/languages.js";import*as h from"../../../../../vs/nls.js";import{IContextKeyService as Q,RawContextKey as F}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IKeybindingService as Z}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{ILogService as ee}from"../../../../../vs/platform/log/common/log.js";import{getListStyles as te}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{editorWidgetBackground as ie,inputBackground as H,inputBorder as ne,inputForeground as oe,quickInputListFocusBackground as se,quickInputListFocusForeground as ae,widgetBorder as de,widgetShadow as re}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as le}from"../../../../../vs/platform/theme/common/themeService.js";const ue=!1,he=new F("renameInputVisible",!1,h.localize("renameInputVisible","Whether the rename input widget is visible")),st=new F("renameInputFocused",!1,h.localize("renameInputFocused","Whether the rename input widget is focused"));let y=class{constructor(e,t,i,n,a,o){this._editor=e;this._acceptKeybindings=t;this._themeService=i;this._keybindingService=n;this._logService=o;this._visibleContextKey=he.bindTo(a),this._isEditingRenameCandidate=!1,this._nRenameSuggestionsInvocations=0,this._hadAutomaticRenameSuggestionsInvocation=!1,this._candidates=new Set,this._beforeFirstInputFieldEditSW=new G,this._inputWithButton=new pe,this._disposables.add(this._inputWithButton),this._editor.addContentWidget(this),this._disposables.add(this._editor.onDidChangeConfiguration(u=>{u.hasChanged(N.fontInfo)&&this._updateFont()})),this._disposables.add(i.onDidColorThemeChange(this._updateStyles,this))}allowEditorOverflow=!0;_domNode;_inputWithButton;_renameCandidateListView;_label;_nPxAvailableAbove;_nPxAvailableBelow;_position;_currentName;_isEditingRenameCandidate;_candidates;_visible;_beforeFirstInputFieldEditSW;_timeBeforeFirstInputFieldEdit;_nRenameSuggestionsInvocations;_hadAutomaticRenameSuggestionsInvocation;_renameCandidateProvidersCts;_renameCts;_visibleContextKey;_disposables=new C;dispose(){this._disposables.dispose(),this._editor.removeContentWidget(this)}getId(){return"__renameInputWidget"}getDomNode(){return this._domNode||(this._domNode=document.createElement("div"),this._domNode.className="monaco-editor rename-box",this._domNode.appendChild(this._inputWithButton.domNode),this._renameCandidateListView=this._disposables.add(new E(this._domNode,{fontInfo:this._editor.getOption(N.fontInfo),onFocusChange:e=>{this._inputWithButton.input.value=e,this._isEditingRenameCandidate=!1},onSelectionChange:()=>{this._isEditingRenameCandidate=!1,this.acceptInput(!1)}})),this._disposables.add(this._inputWithButton.onDidInputChange(()=>{this._renameCandidateListView?.focusedCandidate!==void 0&&(this._isEditingRenameCandidate=!0),this._timeBeforeFirstInputFieldEdit??=this._beforeFirstInputFieldEditSW.elapsed(),this._renameCandidateProvidersCts?.token.isCancellationRequested===!1&&this._renameCandidateProvidersCts.cancel(),this._renameCandidateListView?.clearFocus()})),this._label=document.createElement("div"),this._label.className="rename-label",this._domNode.appendChild(this._label),this._updateFont(),this._updateStyles(this._themeService.getColorTheme())),this._domNode}_updateStyles(e){if(!this._domNode)return;const t=e.getColor(re),i=e.getColor(de);this._domNode.style.backgroundColor=String(e.getColor(ie)??""),this._domNode.style.boxShadow=t?` 0 0 8px 2px ${t}`:"",this._domNode.style.border=i?`1px solid ${i}`:"",this._domNode.style.color=String(e.getColor(oe)??"");const n=e.getColor(ne);this._inputWithButton.domNode.style.backgroundColor=String(e.getColor(H)??""),this._inputWithButton.input.style.backgroundColor=String(e.getColor(H)??""),this._inputWithButton.domNode.style.borderWidth=n?"1px":"0px",this._inputWithButton.domNode.style.borderStyle=n?"solid":"none",this._inputWithButton.domNode.style.borderColor=n?.toString()??"none"}_updateFont(){if(this._domNode===void 0)return;l(this._label!==void 0,"RenameWidget#_updateFont: _label must not be undefined given _domNode is defined"),this._editor.applyFontInfo(this._inputWithButton.input);const e=this._editor.getOption(N.fontInfo);this._label.style.fontSize=`${this._computeLabelFontSize(e.fontSize)}px`}_computeLabelFontSize(e){return e*.8}getPosition(){if(!this._visible||!this._editor.hasModel()||!this._editor.getDomNode())return null;const e=s.getClientArea(this.getDomNode().ownerDocument.body),t=s.getDomNodePagePosition(this._editor.getDomNode()),i=this._getTopForPosition();this._nPxAvailableAbove=i+t.top,this._nPxAvailableBelow=e.height-this._nPxAvailableAbove;const n=this._editor.getOption(N.lineHeight),{totalHeight:a}=c.getLayoutInfo({lineHeight:n}),o=this._nPxAvailableBelow>a*6?[v.BELOW,v.ABOVE]:[v.ABOVE,v.BELOW];return{position:this._position,preference:o}}beforeRender(){const[e,t]=this._acceptKeybindings;return this._label.innerText=h.localize({key:"label",comment:['placeholders are keybindings, e.g "F2 to Rename, Shift+F2 to Preview"']},"{0} to Rename, {1} to Preview",this._keybindingService.lookupKeybinding(e)?.getLabel(),this._keybindingService.lookupKeybinding(t)?.getLabel()),this._domNode.style.minWidth="200px",null}afterRender(e){if(this._trace("invoking afterRender, position: ",e?"not null":"null"),e===null){this.cancelInput(!0,"afterRender (because position is null)");return}if(!this._editor.hasModel()||!this._editor.getDomNode())return;l(this._renameCandidateListView),l(this._nPxAvailableAbove!==void 0),l(this._nPxAvailableBelow!==void 0);const t=s.getTotalHeight(this._inputWithButton.domNode),i=s.getTotalHeight(this._label);let n;e===v.BELOW?n=this._nPxAvailableBelow:n=this._nPxAvailableAbove,this._renameCandidateListView.layout({height:n-i-t,width:s.getTotalWidth(this._inputWithButton.domNode)})}_currentAcceptInput;_currentCancelInput;_requestRenameCandidatesOnce;acceptInput(e){this._trace("invoking acceptInput"),this._currentAcceptInput?.(e)}cancelInput(e,t){this._trace(`invoking cancelInput, caller: ${t}, _currentCancelInput: ${this._currentAcceptInput?"not undefined":"undefined"}`),this._currentCancelInput?.(e)}focusNextRenameSuggestion(){this._renameCandidateListView?.focusNext()||(this._inputWithButton.input.value=this._currentName)}focusPreviousRenameSuggestion(){this._renameCandidateListView?.focusPrevious()||(this._inputWithButton.input.value=this._currentName)}getInput(e,t,i,n,a){const{start:o,end:u}=this._getSelection(e,t);this._renameCts=a;const r=new C;this._nRenameSuggestionsInvocations=0,this._hadAutomaticRenameSuggestionsInvocation=!1,n===void 0?this._inputWithButton.button.style.display="none":(this._inputWithButton.button.style.display="flex",this._requestRenameCandidatesOnce=n,this._requestRenameCandidates(t,!1),r.add(s.addDisposableListener(this._inputWithButton.button,"click",()=>this._requestRenameCandidates(t,!0))),r.add(s.addDisposableListener(this._inputWithButton.button,s.EventType.KEY_DOWN,_=>{const m=new T(_);(m.equals(f.Enter)||m.equals(f.Space))&&(m.stopPropagation(),m.preventDefault(),this._requestRenameCandidates(t,!0))}))),this._isEditingRenameCandidate=!1,this._domNode.classList.toggle("preview",i),this._position=new Y(e.startLineNumber,e.startColumn),this._currentName=t,this._inputWithButton.input.value=t,this._inputWithButton.input.setAttribute("selectionStart",o.toString()),this._inputWithButton.input.setAttribute("selectionEnd",u.toString()),this._inputWithButton.input.size=Math.max((e.endColumn-e.startColumn)*1.1,20),this._beforeFirstInputFieldEditSW.reset(),r.add(W(()=>{this._renameCts=void 0,a.dispose(!0)})),r.add(W(()=>{this._renameCandidateProvidersCts!==void 0&&(this._renameCandidateProvidersCts.dispose(!0),this._renameCandidateProvidersCts=void 0)})),r.add(W(()=>this._candidates.clear()));const d=new O;return d.p.finally(()=>{r.dispose(),this._hide()}),this._currentCancelInput=_=>(this._trace("invoking _currentCancelInput"),this._currentAcceptInput=void 0,this._currentCancelInput=void 0,this._renameCandidateListView?.clearCandidates(),d.complete(_),!0),this._currentAcceptInput=_=>{this._trace("invoking _currentAcceptInput"),l(this._renameCandidateListView!==void 0);const m=this._renameCandidateListView.nCandidates;let g,I;const L=this._renameCandidateListView.focusedCandidate;if(L!==void 0?(this._trace("using new name from renameSuggestion"),g=L,I={k:"renameSuggestion"}):(this._trace("using new name from inputField"),g=this._inputWithButton.input.value,I=this._isEditingRenameCandidate?{k:"userEditedRenameSuggestion"}:{k:"inputField"}),g===t||g.trim().length===0){this.cancelInput(!0,"_currentAcceptInput (because newName === value || newName.trim().length === 0)");return}this._currentAcceptInput=void 0,this._currentCancelInput=void 0,this._renameCandidateListView.clearCandidates(),d.complete({newName:g,wantsPreview:i&&_,stats:{source:I,nRenameSuggestions:m,timeBeforeFirstInputFieldEdit:this._timeBeforeFirstInputFieldEdit,nRenameSuggestionsInvocations:this._nRenameSuggestionsInvocations,hadAutomaticRenameSuggestionsInvocation:this._hadAutomaticRenameSuggestionsInvocation}})},r.add(a.token.onCancellationRequested(()=>this.cancelInput(!0,"cts.token.onCancellationRequested"))),ue||r.add(this._editor.onDidBlurEditorWidget(()=>this.cancelInput(!this._domNode?.ownerDocument.hasFocus(),"editor.onDidBlurEditorWidget"))),this._show(),d.p}_requestRenameCandidates(e,t){if(this._requestRenameCandidatesOnce!==void 0&&(this._renameCandidateProvidersCts!==void 0&&this._renameCandidateProvidersCts.dispose(!0),l(this._renameCts),this._inputWithButton.buttonState!=="stop")){this._renameCandidateProvidersCts=new $;const i=t?B.Invoke:B.Automatic,n=this._requestRenameCandidatesOnce(i,this._renameCandidateProvidersCts.token);if(n.length===0){this._inputWithButton.setSparkleButton();return}t||(this._hadAutomaticRenameSuggestionsInvocation=!0),this._nRenameSuggestionsInvocations+=1,this._inputWithButton.setStopButton(),this._updateRenameCandidates(n,e,this._renameCts.token)}}_getSelection(e,t){l(this._editor.hasModel());const i=this._editor.getSelection();let n=0,a=t.length;return!R.isEmpty(i)&&!R.spansMultipleLines(i)&&R.containsRange(e,i)&&(n=Math.max(0,i.startColumn-e.startColumn),a=Math.min(e.endColumn,i.endColumn)-e.startColumn),{start:n,end:a}}_show(){this._trace("invoking _show"),this._editor.revealLineInCenterIfOutsideViewport(this._position.lineNumber,j.Smooth),this._visible=!0,this._visibleContextKey.set(!0),this._editor.layoutContentWidget(this),setTimeout(()=>{this._inputWithButton.input.focus(),this._inputWithButton.input.setSelectionRange(parseInt(this._inputWithButton.input.getAttribute("selectionStart")),parseInt(this._inputWithButton.input.getAttribute("selectionEnd")))},100)}async _updateRenameCandidates(e,t,i){const n=(...d)=>this._trace("_updateRenameCandidates",...d);n("start");const a=await q(Promise.allSettled(e),i);if(this._inputWithButton.setSparkleButton(),a===void 0){n("returning early - received updateRenameCandidates results - undefined");return}const o=a.flatMap(d=>d.status==="fulfilled"&&U(d.value)?d.value:[]);n(`received updateRenameCandidates results - total (unfiltered) ${o.length} candidates.`);const u=K.distinct(o,d=>d.newSymbolName);n(`distinct candidates - ${u.length} candidates.`);const r=u.filter(({newSymbolName:d})=>d.trim().length>0&&d!==this._inputWithButton.input.value&&d!==t&&!this._candidates.has(d));if(n(`valid distinct candidates - ${o.length} candidates.`),r.forEach(d=>this._candidates.add(d.newSymbolName)),r.length<1){n("returning early - no valid distinct candidates");return}n("setting candidates"),this._renameCandidateListView.setCandidates(r),n("asking editor to re-layout"),this._editor.layoutContentWidget(this)}_hide(){this._trace("invoked _hide"),this._visible=!1,this._visibleContextKey.reset(),this._editor.layoutContentWidget(this)}_getTopForPosition(){const e=this._editor.getVisibleRanges();let t;return e.length>0?t=e[0].startLineNumber:(this._logService.warn("RenameWidget#_getTopForPosition: this should not happen - visibleRanges is empty"),t=Math.max(1,this._position.lineNumber-5)),this._editor.getTopForLineNumber(this._position.lineNumber)-this._editor.getTopForLineNumber(t)}_trace(...e){this._logService.trace("RenameWidget",...e)}};y=x([b(2,le),b(3,Z),b(4,Q),b(5,ee)],y);class E{_listContainer;_listWidget;_lineHeight;_availableHeight;_minimumWidth;_typicalHalfwidthCharacterWidth;_disposables;constructor(e,t){this._disposables=new C,this._availableHeight=0,this._minimumWidth=0,this._lineHeight=t.fontInfo.lineHeight,this._typicalHalfwidthCharacterWidth=t.fontInfo.typicalHalfwidthCharacterWidth,this._listContainer=document.createElement("div"),this._listContainer.className="rename-box rename-candidate-list-container",e.appendChild(this._listContainer),this._listWidget=E._createListWidget(this._listContainer,this._candidateViewHeight,t.fontInfo),this._listWidget.onDidChangeFocus(i=>{i.elements.length===1&&t.onFocusChange(i.elements[0].newSymbolName)},this._disposables),this._listWidget.onDidChangeSelection(i=>{i.elements.length===1&&t.onSelectionChange()},this._disposables),this._disposables.add(this._listWidget.onDidBlur(i=>{this._listWidget.setFocus([])})),this._listWidget.style(te({listInactiveFocusForeground:ae,listInactiveFocusBackground:se}))}dispose(){this._listWidget.dispose(),this._disposables.dispose()}layout({height:e,width:t}){this._availableHeight=e,this._minimumWidth=t}setCandidates(e){this._listWidget.splice(0,0,e);const t=this._pickListHeight(this._listWidget.length),i=this._pickListWidth(e);this._listWidget.layout(t,i),this._listContainer.style.height=`${t}px`,this._listContainer.style.width=`${i}px`,P.status(h.localize("renameSuggestionsReceivedAria","Received {0} rename suggestions",e.length))}clearCandidates(){this._listContainer.style.height="0px",this._listContainer.style.width="0px",this._listWidget.splice(0,this._listWidget.length,[])}get nCandidates(){return this._listWidget.length}get focusedCandidate(){if(this._listWidget.length===0)return;const e=this._listWidget.getSelectedElements()[0];if(e!==void 0)return e.newSymbolName;const t=this._listWidget.getFocusedElements()[0];if(t!==void 0)return t.newSymbolName}focusNext(){if(this._listWidget.length===0)return!1;const e=this._listWidget.getFocus();if(e.length===0)return this._listWidget.focusFirst(),this._listWidget.reveal(0),!0;if(e[0]===this._listWidget.length-1)return this._listWidget.setFocus([]),this._listWidget.reveal(0),!1;{this._listWidget.focusNext();const t=this._listWidget.getFocus()[0];return this._listWidget.reveal(t),!0}}focusPrevious(){if(this._listWidget.length===0)return!1;const e=this._listWidget.getFocus();if(e.length===0){this._listWidget.focusLast();const t=this._listWidget.getFocus()[0];return this._listWidget.reveal(t),!0}else{if(e[0]===0)return this._listWidget.setFocus([]),!1;{this._listWidget.focusPrevious();const t=this._listWidget.getFocus()[0];return this._listWidget.reveal(t),!0}}}clearFocus(){this._listWidget.setFocus([])}get _candidateViewHeight(){const{totalHeight:e}=c.getLayoutInfo({lineHeight:this._lineHeight});return e}_pickListHeight(e){const t=this._candidateViewHeight*e;return Math.min(t,this._availableHeight,this._candidateViewHeight*7)}_pickListWidth(e){const t=Math.ceil(Math.max(...e.map(n=>n.newSymbolName.length))*this._typicalHalfwidthCharacterWidth);return Math.max(this._minimumWidth,25+t+10)}static _createListWidget(e,t,i){const n=new class{getTemplateId(o){return"candidate"}getHeight(o){return t}},a=new class{templateId="candidate";renderTemplate(o){return new c(o,i)}renderElement(o,u,r){r.populate(o)}disposeTemplate(o){o.dispose()}};return new V("NewSymbolNameCandidates",e,n,[a],{keyboardSupport:!1,mouseSupport:!0,multipleSelectionSupport:!1})}}class pe{_buttonState;_domNode;_inputNode;_buttonNode;_buttonHover;_buttonGenHoverText;_buttonCancelHoverText;_sparkleIcon;_stopIcon;_onDidInputChange=new z;onDidInputChange=this._onDidInputChange.event;_disposables=new C;get domNode(){return this._domNode||(this._domNode=document.createElement("div"),this._domNode.className="rename-input-with-button",this._domNode.style.display="flex",this._domNode.style.flexDirection="row",this._domNode.style.alignItems="center",this._inputNode=document.createElement("input"),this._inputNode.className="rename-input",this._inputNode.type="text",this._inputNode.style.border="none",this._inputNode.setAttribute("aria-label",h.localize("renameAriaLabel","Rename input. Type new name and press Enter to commit.")),this._domNode.appendChild(this._inputNode),this._buttonNode=document.createElement("div"),this._buttonNode.className="rename-suggestions-button",this._buttonNode.setAttribute("tabindex","0"),this._buttonGenHoverText=h.localize("generateRenameSuggestionsButton","Generate new name suggestions"),this._buttonCancelHoverText=h.localize("cancelRenameSuggestionsButton","Cancel"),this._buttonHover=A().setupManagedHover(M("element"),this._buttonNode,this._buttonGenHoverText),this._disposables.add(this._buttonHover),this._domNode.appendChild(this._buttonNode),this._disposables.add(s.addDisposableListener(this.input,s.EventType.INPUT,()=>this._onDidInputChange.fire())),this._disposables.add(s.addDisposableListener(this.input,s.EventType.KEY_DOWN,e=>{const t=new T(e);(t.keyCode===f.LeftArrow||t.keyCode===f.RightArrow)&&this._onDidInputChange.fire()})),this._disposables.add(s.addDisposableListener(this.input,s.EventType.CLICK,()=>this._onDidInputChange.fire())),this._disposables.add(s.addDisposableListener(this.input,s.EventType.FOCUS,()=>{this.domNode.style.outlineWidth="1px",this.domNode.style.outlineStyle="solid",this.domNode.style.outlineOffset="-1px",this.domNode.style.outlineColor="var(--vscode-focusBorder)"})),this._disposables.add(s.addDisposableListener(this.input,s.EventType.BLUR,()=>{this.domNode.style.outline="none"}))),this._domNode}get input(){return l(this._inputNode),this._inputNode}get button(){return l(this._buttonNode),this._buttonNode}get buttonState(){return this._buttonState}setSparkleButton(){this._buttonState="sparkle",this._sparkleIcon??=S(w.sparkle),s.clearNode(this.button),this.button.appendChild(this._sparkleIcon),this.button.setAttribute("aria-label","Generating new name suggestions"),this._buttonHover?.update(this._buttonGenHoverText),this.input.focus()}setStopButton(){this._buttonState="stop",this._stopIcon??=S(w.primitiveSquare),s.clearNode(this.button),this.button.appendChild(this._stopIcon),this.button.setAttribute("aria-label","Cancel generating new name suggestions"),this._buttonHover?.update(this._buttonCancelHoverText),this.input.focus()}dispose(){this._disposables.dispose()}}class c{static _PADDING=2;_domNode;_icon;_label;constructor(e,t){this._domNode=document.createElement("div"),this._domNode.className="rename-box rename-candidate",this._domNode.style.display="flex",this._domNode.style.columnGap="5px",this._domNode.style.alignItems="center",this._domNode.style.height=`${t.lineHeight}px`,this._domNode.style.padding=`${c._PADDING}px`;const i=document.createElement("div");i.style.display="flex",i.style.alignItems="center",i.style.width=i.style.height=`${t.lineHeight*.8}px`,this._domNode.appendChild(i),this._icon=S(w.sparkle),this._icon.style.display="none",i.appendChild(this._icon),this._label=document.createElement("div"),X.applyFontInfo(this._label,t),this._domNode.appendChild(this._label),e.appendChild(this._domNode)}populate(e){this._updateIcon(e),this._updateLabel(e)}_updateIcon(e){const t=!!e.tags?.includes(J.AIGenerated);this._icon.style.display=t?"inherit":"none"}_updateLabel(e){this._label.innerText=e.newSymbolName}static getLayoutInfo({lineHeight:e}){return{totalHeight:e+c._PADDING*2}}dispose(){}}export{st as CONTEXT_RENAME_INPUT_FOCUSED,he as CONTEXT_RENAME_INPUT_VISIBLE,y as RenameWidget};
