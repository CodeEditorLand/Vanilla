import*as _ from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/keyboardEvent.js";import"../../../../../vs/base/browser/mouseEvent.js";import{alert as G}from"../../../../../vs/base/browser/ui/aria/aria.js";import"../../../../../vs/base/browser/ui/contextview/contextview.js";import"../../../../../vs/base/browser/ui/findinput/findInput.js";import"../../../../../vs/base/browser/ui/findinput/replaceInput.js";import"../../../../../vs/base/browser/ui/inputbox/inputBox.js";import{Orientation as X,Sash as j}from"../../../../../vs/base/browser/ui/sash/sash.js";import{Toggle as Y}from"../../../../../vs/base/browser/ui/toggle/toggle.js";import{Widget as F}from"../../../../../vs/base/browser/ui/widget.js";import{Delayer as J}from"../../../../../vs/base/common/async.js";import{Codicon as I}from"../../../../../vs/base/common/codicons.js";import{onUnexpectedError as T}from"../../../../../vs/base/common/errors.js";import{KeyCode as l,KeyMod as b}from"../../../../../vs/base/common/keyCodes.js";import{toDisposable as Q}from"../../../../../vs/base/common/lifecycle.js";import*as w from"../../../../../vs/base/common/platform.js";import*as ee from"../../../../../vs/base/common/strings.js";import"vs/css!./findWidget";import"../../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{createInstantHoverDelegate as D,getDefaultHoverDelegate as te}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{ThemeIcon as N}from"../../../../../vs/base/common/themables.js";import{assertIsDefined as A}from"../../../../../vs/base/common/types.js";import{OverlayWidgetPositionPreference as ie}from"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as h}from"../../../../../vs/editor/common/config/editorOptions.js";import{Range as oe}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/core/selection.js";import{CONTEXT_FIND_INPUT_FOCUSED as ne,CONTEXT_REPLACE_INPUT_FOCUSED as se,FIND_IDS as f,MATCHES_LIMIT as x}from"../../../../../vs/editor/contrib/find/browser/findModel.js";import"../../../../../vs/editor/contrib/find/browser/findState.js";import*as r from"../../../../../vs/nls.js";import{AccessibilitySupport as re}from"../../../../../vs/platform/accessibility/common/accessibility.js";import"../../../../../vs/platform/contextkey/common/contextkey.js";import{ContextScopedFindInput as ae,ContextScopedReplaceInput as de}from"../../../../../vs/platform/history/browser/contextScopedHistoryWidget.js";import{showHistoryKeybindingHint as V}from"../../../../../vs/platform/history/browser/historyWidgetKeybindingHint.js";import"../../../../../vs/platform/hover/browser/hover.js";import"../../../../../vs/platform/keybinding/common/keybinding.js";import"../../../../../vs/platform/notification/common/notification.js";import{StorageScope as W,StorageTarget as le}from"../../../../../vs/platform/storage/common/storage.js";import{defaultInputBoxStyles as P,defaultToggleStyles as O}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{asCssVariable as L,contrastBorder as he,editorFindMatchForeground as ce,editorFindMatchHighlightBorder as pe,editorFindMatchHighlightForeground as _e,editorFindRangeHighlightBorder as ue,inputActiveOptionBackground as ge,inputActiveOptionBorder as fe,inputActiveOptionForeground as me}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{registerIcon as S,widgetClose as ve}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{isHighContrast as H}from"../../../../../vs/platform/theme/common/theme.js";import{registerThemingParticipant as Ie}from"../../../../../vs/platform/theme/common/themeService.js";const M=S("find-collapsed",I.chevronRight,r.localize("findCollapsedIcon","Icon to indicate that the editor find widget is collapsed.")),Z=S("find-expanded",I.chevronDown,r.localize("findExpandedIcon","Icon to indicate that the editor find widget is expanded.")),be=S("find-selection",I.selection,r.localize("findSelectionIcon","Icon for 'Find in Selection' in the editor find widget.")),Se=S("find-replace",I.replace,r.localize("findReplaceIcon","Icon for 'Replace' in the editor find widget.")),Ee=S("find-replace-all",I.replaceAll,r.localize("findReplaceAllIcon","Icon for 'Replace All' in the editor find widget.")),Ce=S("find-previous-match",I.arrowUp,r.localize("findPreviousMatchIcon","Icon for 'Find Previous' in the editor find widget.")),Ne=S("find-next-match",I.arrowDown,r.localize("findNextMatchIcon","Icon for 'Find Next' in the editor find widget.")),ye=r.localize("label.findDialog","Find / Replace"),we=r.localize("label.find","Find"),Te=r.localize("placeholder.find","Find"),xe=r.localize("label.previousMatchButton","Previous Match"),Le=r.localize("label.nextMatchButton","Next Match"),Re=r.localize("label.toggleSelectionFind","Find in Selection"),Be=r.localize("label.closeButton","Close"),Fe=r.localize("label.replace","Replace"),De=r.localize("placeholder.replace","Replace"),Ae=r.localize("label.replaceButton","Replace"),Ve=r.localize("label.replaceAllButton","Replace All"),We=r.localize("label.toggleReplaceButton","Toggle Replace"),Pe=r.localize("title.matchesCountLimit","Only the first {0} results are highlighted, but all find operations work on the entire text.",x),Oe=r.localize("label.matchesLocation","{0} of {1}"),k=r.localize("label.noResults","No results"),m=419,He=275,Me=He-54;let y=69;const Ze=33,z="ctrlEnterReplaceAll.windows.donotask",K=w.isMacintosh?b.WinCtrl:b.CtrlCmd;class R{afterLineNumber;heightInPx;suppressMouseDown;domNode;constructor(d){this.afterLineNumber=d,this.heightInPx=Ze,this.suppressMouseDown=!1,this.domNode=document.createElement("div"),this.domNode.className="dock-find-viewzone"}}function U(u,d,e){const t=!!d.match(/\n/);if(e&&t&&e.selectionStart>0){u.stopPropagation();return}}function q(u,d,e){const t=!!d.match(/\n/);if(e&&t&&e.selectionEnd<e.value.length){u.stopPropagation();return}}class $ extends F{constructor(e,t,i,a,n,c,g,p,v,o){super();this._hoverService=o;this._codeEditor=e,this._controller=t,this._state=i,this._contextViewProvider=a,this._keybindingService=n,this._contextKeyService=c,this._storageService=p,this._notificationService=v,this._ctrlEnterReplaceAllWarningPrompted=!!p.getBoolean(z,W.PROFILE),this._isVisible=!1,this._isReplaceVisible=!1,this._ignoreChangeEvent=!1,this._updateHistoryDelayer=new J(500),this._register(Q(()=>this._updateHistoryDelayer.cancel())),this._register(this._state.onFindReplaceStateChange(s=>this._onStateChanged(s))),this._buildDomNode(),this._updateButtons(),this._tryUpdateWidgetWidth(),this._findInput.inputBox.layout(),this._register(this._codeEditor.onDidChangeConfiguration(s=>{if(s.hasChanged(h.readOnly)&&(this._codeEditor.getOption(h.readOnly)&&this._state.change({isReplaceRevealed:!1},!1),this._updateButtons()),s.hasChanged(h.layoutInfo)&&this._tryUpdateWidgetWidth(),s.hasChanged(h.accessibilitySupport)&&this.updateAccessibilitySupport(),s.hasChanged(h.find)){const E=this._codeEditor.getOption(h.find).loop;this._state.change({loop:E},!1);const B=this._codeEditor.getOption(h.find).addExtraSpaceOnTop;B&&!this._viewZone&&(this._viewZone=new R(0),this._showViewZone()),!B&&this._viewZone&&this._removeViewZone()}})),this.updateAccessibilitySupport(),this._register(this._codeEditor.onDidChangeCursorSelection(()=>{this._isVisible&&this._updateToggleSelectionFindButton()})),this._register(this._codeEditor.onDidFocusEditorWidget(async()=>{if(this._isVisible){const s=await this._controller.getGlobalBufferTerm();s&&s!==this._state.searchString&&(this._state.change({searchString:s},!1),this._findInput.select())}})),this._findInputFocused=ne.bindTo(c),this._findFocusTracker=this._register(_.trackFocus(this._findInput.inputBox.inputElement)),this._register(this._findFocusTracker.onDidFocus(()=>{this._findInputFocused.set(!0),this._updateSearchScope()})),this._register(this._findFocusTracker.onDidBlur(()=>{this._findInputFocused.set(!1)})),this._replaceInputFocused=se.bindTo(c),this._replaceFocusTracker=this._register(_.trackFocus(this._replaceInput.inputBox.inputElement)),this._register(this._replaceFocusTracker.onDidFocus(()=>{this._replaceInputFocused.set(!0),this._updateSearchScope()})),this._register(this._replaceFocusTracker.onDidBlur(()=>{this._replaceInputFocused.set(!1)})),this._codeEditor.addOverlayWidget(this),this._codeEditor.getOption(h.find).addExtraSpaceOnTop&&(this._viewZone=new R(0)),this._register(this._codeEditor.onDidChangeModel(()=>{this._isVisible&&(this._viewZoneId=void 0)})),this._register(this._codeEditor.onDidScrollChange(s=>{if(s.scrollTopChanged){this._layoutViewZone();return}setTimeout(()=>{this._layoutViewZone()},0)}))}static ID="editor.contrib.findWidget";_codeEditor;_state;_controller;_contextViewProvider;_keybindingService;_contextKeyService;_storageService;_notificationService;_domNode;_cachedHeight=null;_findInput;_replaceInput;_toggleReplaceBtn;_matchesCount;_prevBtn;_nextBtn;_toggleSelectionFind;_closeBtn;_replaceBtn;_replaceAllBtn;_isVisible;_isReplaceVisible;_ignoreChangeEvent;_ctrlEnterReplaceAllWarningPrompted;_findFocusTracker;_findInputFocused;_replaceFocusTracker;_replaceInputFocused;_viewZone;_viewZoneId;_resizeSash;_resized;_updateHistoryDelayer;getId(){return $.ID}getDomNode(){return this._domNode}getPosition(){return this._isVisible?{preference:ie.TOP_RIGHT_CORNER}:null}_onStateChanged(e){if(e.searchString){try{this._ignoreChangeEvent=!0,this._findInput.setValue(this._state.searchString)}finally{this._ignoreChangeEvent=!1}this._updateButtons()}if(e.replaceString&&(this._replaceInput.inputBox.value=this._state.replaceString),e.isRevealed&&(this._state.isRevealed?this._reveal():this._hide(!0)),e.isReplaceRevealed&&(this._state.isReplaceRevealed?!this._codeEditor.getOption(h.readOnly)&&!this._isReplaceVisible&&(this._isReplaceVisible=!0,this._replaceInput.width=_.getTotalWidth(this._findInput.domNode),this._updateButtons(),this._replaceInput.inputBox.layout()):this._isReplaceVisible&&(this._isReplaceVisible=!1,this._updateButtons())),(e.isRevealed||e.isReplaceRevealed)&&(this._state.isRevealed||this._state.isReplaceRevealed)&&this._tryUpdateHeight()&&this._showViewZone(),e.isRegex&&this._findInput.setRegex(this._state.isRegex),e.wholeWord&&this._findInput.setWholeWords(this._state.wholeWord),e.matchCase&&this._findInput.setCaseSensitive(this._state.matchCase),e.preserveCase&&this._replaceInput.setPreserveCase(this._state.preserveCase),e.searchScope&&(this._state.searchScope?this._toggleSelectionFind.checked=!0:this._toggleSelectionFind.checked=!1,this._updateToggleSelectionFindButton()),e.searchString||e.matchesCount||e.matchesPosition){const t=this._state.searchString.length>0&&this._state.matchesCount===0;this._domNode.classList.toggle("no-results",t),this._updateMatchesCount(),this._updateButtons()}(e.searchString||e.currentMatch)&&this._layoutViewZone(),e.updateHistory&&this._delayedUpdateHistory(),e.loop&&this._updateButtons()}_delayedUpdateHistory(){this._updateHistoryDelayer.trigger(this._updateHistory.bind(this)).then(void 0,T)}_updateHistory(){this._state.searchString&&this._findInput.inputBox.addToHistory(),this._state.replaceString&&this._replaceInput.inputBox.addToHistory()}_updateMatchesCount(){this._matchesCount.style.minWidth=y+"px",this._state.matchesCount>=x?this._matchesCount.title=Pe:this._matchesCount.title="",this._matchesCount.firstChild?.remove();let e;if(this._state.matchesCount>0){let t=String(this._state.matchesCount);this._state.matchesCount>=x&&(t+="+");let i=String(this._state.matchesPosition);i==="0"&&(i="?"),e=ee.format(Oe,i,t)}else e=k;this._matchesCount.appendChild(document.createTextNode(e)),G(this._getAriaLabel(e,this._state.currentMatch,this._state.searchString)),y=Math.max(y,this._matchesCount.clientWidth)}_getAriaLabel(e,t,i){if(e===k)return i===""?r.localize("ariaSearchNoResultEmpty","{0} found",e):r.localize("ariaSearchNoResult","{0} found for '{1}'",e,i);if(t){const a=r.localize("ariaSearchNoResultWithLineNum","{0} found for '{1}', at {2}",e,i,t.startLineNumber+":"+t.startColumn),n=this._codeEditor.getModel();return n&&t.startLineNumber<=n.getLineCount()&&t.startLineNumber>=1?`${n.getLineContent(t.startLineNumber)}, ${a}`:a}return r.localize("ariaSearchNoResultWithLineNumNoCurrentMatch","{0} found for '{1}'",e,i)}_updateToggleSelectionFindButton(){const e=this._codeEditor.getSelection(),t=e?e.startLineNumber!==e.endLineNumber||e.startColumn!==e.endColumn:!1,i=this._toggleSelectionFind.checked;this._isVisible&&(i||t)?this._toggleSelectionFind.enable():this._toggleSelectionFind.disable()}_updateButtons(){this._findInput.setEnabled(this._isVisible),this._replaceInput.setEnabled(this._isVisible&&this._isReplaceVisible),this._updateToggleSelectionFindButton(),this._closeBtn.setEnabled(this._isVisible);const e=this._state.searchString.length>0,t=!!this._state.matchesCount;this._prevBtn.setEnabled(this._isVisible&&e&&t&&this._state.canNavigateBack()),this._nextBtn.setEnabled(this._isVisible&&e&&t&&this._state.canNavigateForward()),this._replaceBtn.setEnabled(this._isVisible&&this._isReplaceVisible&&e),this._replaceAllBtn.setEnabled(this._isVisible&&this._isReplaceVisible&&e),this._domNode.classList.toggle("replaceToggled",this._isReplaceVisible),this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);const i=!this._codeEditor.getOption(h.readOnly);this._toggleReplaceBtn.setEnabled(this._isVisible&&i)}_revealTimeouts=[];_reveal(){if(this._revealTimeouts.forEach(e=>{clearTimeout(e)}),this._revealTimeouts=[],!this._isVisible){this._isVisible=!0;const e=this._codeEditor.getSelection();switch(this._codeEditor.getOption(h.find).autoFindInSelection){case"always":this._toggleSelectionFind.checked=!0;break;case"never":this._toggleSelectionFind.checked=!1;break;case"multiline":{const i=!!e&&e.startLineNumber!==e.endLineNumber;this._toggleSelectionFind.checked=i;break}default:break}this._tryUpdateWidgetWidth(),this._updateButtons(),this._revealTimeouts.push(setTimeout(()=>{this._domNode.classList.add("visible"),this._domNode.setAttribute("aria-hidden","false")},0)),this._revealTimeouts.push(setTimeout(()=>{this._findInput.validate()},200)),this._codeEditor.layoutOverlayWidget(this);let t=!0;if(this._codeEditor.getOption(h.find).seedSearchStringFromSelection&&e){const i=this._codeEditor.getDomNode();if(i){const a=_.getDomNodePagePosition(i),n=this._codeEditor.getScrolledVisiblePosition(e.getStartPosition()),c=a.left+(n?n.left:0),g=n?n.top:0;if(this._viewZone&&g<this._viewZone.heightInPx){e.endLineNumber>e.startLineNumber&&(t=!1);const p=_.getTopLeftOffset(this._domNode).left;c>p&&(t=!1);const v=this._codeEditor.getScrolledVisiblePosition(e.getEndPosition());a.left+(v?v.left:0)>p&&(t=!1)}}}this._showViewZone(t)}}_hide(e){this._revealTimeouts.forEach(t=>{clearTimeout(t)}),this._revealTimeouts=[],this._isVisible&&(this._isVisible=!1,this._updateButtons(),this._domNode.classList.remove("visible"),this._domNode.setAttribute("aria-hidden","true"),this._findInput.clearMessage(),e&&this._codeEditor.focus(),this._codeEditor.layoutOverlayWidget(this),this._removeViewZone())}_layoutViewZone(e){if(!this._codeEditor.getOption(h.find).addExtraSpaceOnTop){this._removeViewZone();return}if(!this._isVisible)return;const i=this._viewZone;this._viewZoneId!==void 0||!i||this._codeEditor.changeViewZones(a=>{i.heightInPx=this._getHeight(),this._viewZoneId=a.addZone(i),this._codeEditor.setScrollTop(e||this._codeEditor.getScrollTop()+i.heightInPx)})}_showViewZone(e=!0){if(!this._isVisible||!this._codeEditor.getOption(h.find).addExtraSpaceOnTop)return;this._viewZone===void 0&&(this._viewZone=new R(0));const i=this._viewZone;this._codeEditor.changeViewZones(a=>{if(this._viewZoneId!==void 0){const n=this._getHeight();if(n===i.heightInPx)return;const c=n-i.heightInPx;i.heightInPx=n,a.layoutZone(this._viewZoneId),e&&this._codeEditor.setScrollTop(this._codeEditor.getScrollTop()+c);return}else{let n=this._getHeight();if(n-=this._codeEditor.getOption(h.padding).top,n<=0)return;i.heightInPx=n,this._viewZoneId=a.addZone(i),e&&this._codeEditor.setScrollTop(this._codeEditor.getScrollTop()+n)}})}_removeViewZone(){this._codeEditor.changeViewZones(e=>{this._viewZoneId!==void 0&&(e.removeZone(this._viewZoneId),this._viewZoneId=void 0,this._viewZone&&(this._codeEditor.setScrollTop(this._codeEditor.getScrollTop()-this._viewZone.heightInPx),this._viewZone=void 0))})}_tryUpdateWidgetWidth(){if(!this._isVisible||!this._domNode.isConnected)return;const e=this._codeEditor.getLayoutInfo();if(e.contentWidth<=0){this._domNode.classList.add("hiddenEditor");return}else this._domNode.classList.contains("hiddenEditor")&&this._domNode.classList.remove("hiddenEditor");const i=e.width,a=e.minimap.minimapWidth;let n=!1,c=!1,g=!1;if(this._resized&&_.getTotalWidth(this._domNode)>m){this._domNode.style.maxWidth=`${i-28-a-15}px`,this._replaceInput.width=_.getTotalWidth(this._findInput.domNode);return}if(m+28+a>=i&&(c=!0),m+28+a-y>=i&&(g=!0),m+28+a-y>=i+50&&(n=!0),this._domNode.classList.toggle("collapsed-find-widget",n),this._domNode.classList.toggle("narrow-find-widget",g),this._domNode.classList.toggle("reduced-find-widget",c),!g&&!n&&(this._domNode.style.maxWidth=`${i-28-a-15}px`),this._findInput.layout({collapsedFindWidget:n,narrowFindWidget:g,reducedFindWidget:c}),this._resized){const p=this._findInput.inputBox.element.clientWidth;p>0&&(this._replaceInput.width=p)}else this._isReplaceVisible&&(this._replaceInput.width=_.getTotalWidth(this._findInput.domNode))}_getHeight(){let e=0;return e+=4,e+=this._findInput.inputBox.height+2,this._isReplaceVisible&&(e+=4,e+=this._replaceInput.inputBox.height+2),e+=4,e}_tryUpdateHeight(){const e=this._getHeight();return this._cachedHeight!==null&&this._cachedHeight===e?!1:(this._cachedHeight=e,this._domNode.style.height=`${e}px`,!0)}focusFindInput(){this._findInput.select(),this._findInput.focus()}focusReplaceInput(){this._replaceInput.select(),this._replaceInput.focus()}highlightFindOptions(){this._findInput.highlightFindOptions()}_updateSearchScope(){if(this._codeEditor.hasModel()&&this._toggleSelectionFind.checked){const e=this._codeEditor.getSelections();e.map(t=>{t.endColumn===1&&t.endLineNumber>t.startLineNumber&&(t=t.setEndPosition(t.endLineNumber-1,this._codeEditor.getModel().getLineMaxColumn(t.endLineNumber-1)));const i=this._state.currentMatch;return t.startLineNumber!==t.endLineNumber&&!oe.equalsRange(t,i)?t:null}).filter(t=>!!t),e.length&&this._state.change({searchScope:e},!0)}}_onFindInputMouseDown(e){e.middleButton&&e.stopPropagation()}_onFindInputKeyDown(e){if(e.equals(K|l.Enter))if(this._keybindingService.dispatchEvent(e,e.target)){e.preventDefault();return}else{this._findInput.inputBox.insertAtCursor(`
`),e.preventDefault();return}if(e.equals(l.Tab)){this._isReplaceVisible?this._replaceInput.focus():this._findInput.focusOnCaseSensitive(),e.preventDefault();return}if(e.equals(b.CtrlCmd|l.DownArrow)){this._codeEditor.focus(),e.preventDefault();return}if(e.equals(l.UpArrow))return U(e,this._findInput.getValue(),this._findInput.domNode.querySelector("textarea"));if(e.equals(l.DownArrow))return q(e,this._findInput.getValue(),this._findInput.domNode.querySelector("textarea"))}_onReplaceInputKeyDown(e){if(e.equals(K|l.Enter))if(this._keybindingService.dispatchEvent(e,e.target)){e.preventDefault();return}else{w.isWindows&&w.isNative&&!this._ctrlEnterReplaceAllWarningPrompted&&(this._notificationService.info(r.localize("ctrlEnter.keybindingChanged","Ctrl+Enter now inserts line break instead of replacing all. You can modify the keybinding for editor.action.replaceAll to override this behavior.")),this._ctrlEnterReplaceAllWarningPrompted=!0,this._storageService.store(z,!0,W.PROFILE,le.USER)),this._replaceInput.inputBox.insertAtCursor(`
`),e.preventDefault();return}if(e.equals(l.Tab)){this._findInput.focusOnCaseSensitive(),e.preventDefault();return}if(e.equals(b.Shift|l.Tab)){this._findInput.focus(),e.preventDefault();return}if(e.equals(b.CtrlCmd|l.DownArrow)){this._codeEditor.focus(),e.preventDefault();return}if(e.equals(l.UpArrow))return U(e,this._replaceInput.inputBox.value,this._replaceInput.inputBox.element.querySelector("textarea"));if(e.equals(l.DownArrow))return q(e,this._replaceInput.inputBox.value,this._replaceInput.inputBox.element.querySelector("textarea"))}getVerticalSashLeft(e){return 0}_keybindingLabelFor(e){const t=this._keybindingService.lookupKeybinding(e);return t?` (${t.getLabel()})`:""}_buildDomNode(){this._findInput=this._register(new ae(null,this._contextViewProvider,{width:Me,label:we,placeholder:Te,appendCaseSensitiveLabel:this._keybindingLabelFor(f.ToggleCaseSensitiveCommand),appendWholeWordsLabel:this._keybindingLabelFor(f.ToggleWholeWordCommand),appendRegexLabel:this._keybindingLabelFor(f.ToggleRegexCommand),validation:o=>{if(o.length===0||!this._findInput.getRegex())return null;try{return new RegExp(o,"gu"),null}catch(s){return{content:s.message}}},flexibleHeight:!0,flexibleWidth:!0,flexibleMaxHeight:118,showCommonFindToggles:!0,showHistoryHint:()=>V(this._keybindingService),inputBoxStyles:P,toggleStyles:O},this._contextKeyService)),this._findInput.setRegex(!!this._state.isRegex),this._findInput.setCaseSensitive(!!this._state.matchCase),this._findInput.setWholeWords(!!this._state.wholeWord),this._register(this._findInput.onKeyDown(o=>this._onFindInputKeyDown(o))),this._register(this._findInput.inputBox.onDidChange(()=>{this._ignoreChangeEvent||this._state.change({searchString:this._findInput.getValue()},!0)})),this._register(this._findInput.onDidOptionChange(()=>{this._state.change({isRegex:this._findInput.getRegex(),wholeWord:this._findInput.getWholeWords(),matchCase:this._findInput.getCaseSensitive()},!0)})),this._register(this._findInput.onCaseSensitiveKeyDown(o=>{o.equals(b.Shift|l.Tab)&&this._isReplaceVisible&&(this._replaceInput.focus(),o.preventDefault())})),this._register(this._findInput.onRegexKeyDown(o=>{o.equals(l.Tab)&&this._isReplaceVisible&&(this._replaceInput.focusOnPreserve(),o.preventDefault())})),this._register(this._findInput.inputBox.onDidHeightChange(o=>{this._tryUpdateHeight()&&this._showViewZone()})),w.isLinux&&this._register(this._findInput.onMouseDown(o=>this._onFindInputMouseDown(o))),this._matchesCount=document.createElement("div"),this._matchesCount.className="matchesCount",this._updateMatchesCount();const i=this._register(D());this._prevBtn=this._register(new C({label:xe+this._keybindingLabelFor(f.PreviousMatchFindAction),icon:Ce,hoverDelegate:i,onTrigger:()=>{A(this._codeEditor.getAction(f.PreviousMatchFindAction)).run().then(void 0,T)}},this._hoverService)),this._nextBtn=this._register(new C({label:Le+this._keybindingLabelFor(f.NextMatchFindAction),icon:Ne,hoverDelegate:i,onTrigger:()=>{A(this._codeEditor.getAction(f.NextMatchFindAction)).run().then(void 0,T)}},this._hoverService));const a=document.createElement("div");a.className="find-part",a.appendChild(this._findInput.domNode);const n=document.createElement("div");n.className="find-actions",a.appendChild(n),n.appendChild(this._matchesCount),n.appendChild(this._prevBtn.domNode),n.appendChild(this._nextBtn.domNode),this._toggleSelectionFind=this._register(new Y({icon:be,title:Re+this._keybindingLabelFor(f.ToggleSearchScopeCommand),isChecked:!1,hoverDelegate:i,inputActiveOptionBackground:L(ge),inputActiveOptionBorder:L(fe),inputActiveOptionForeground:L(me)})),this._register(this._toggleSelectionFind.onChange(()=>{if(this._toggleSelectionFind.checked){if(this._codeEditor.hasModel()){let o=this._codeEditor.getSelections();o=o.map(s=>(s.endColumn===1&&s.endLineNumber>s.startLineNumber&&(s=s.setEndPosition(s.endLineNumber-1,this._codeEditor.getModel().getLineMaxColumn(s.endLineNumber-1))),s.isEmpty()?null:s)).filter(s=>!!s),o.length&&this._state.change({searchScope:o},!0)}}else this._state.change({searchScope:null},!0)})),n.appendChild(this._toggleSelectionFind.domNode),this._closeBtn=this._register(new C({label:Be+this._keybindingLabelFor(f.CloseFindWidgetCommand),icon:ve,hoverDelegate:i,onTrigger:()=>{this._state.change({isRevealed:!1,searchScope:null},!1)},onKeyDown:o=>{o.equals(l.Tab)&&this._isReplaceVisible&&(this._replaceBtn.isEnabled()?this._replaceBtn.focus():this._codeEditor.focus(),o.preventDefault())}},this._hoverService)),this._replaceInput=this._register(new de(null,void 0,{label:Fe,placeholder:De,appendPreserveCaseLabel:this._keybindingLabelFor(f.TogglePreserveCaseCommand),history:[],flexibleHeight:!0,flexibleWidth:!0,flexibleMaxHeight:118,showHistoryHint:()=>V(this._keybindingService),inputBoxStyles:P,toggleStyles:O},this._contextKeyService,!0)),this._replaceInput.setPreserveCase(!!this._state.preserveCase),this._register(this._replaceInput.onKeyDown(o=>this._onReplaceInputKeyDown(o))),this._register(this._replaceInput.inputBox.onDidChange(()=>{this._state.change({replaceString:this._replaceInput.inputBox.value},!1)})),this._register(this._replaceInput.inputBox.onDidHeightChange(o=>{this._isReplaceVisible&&this._tryUpdateHeight()&&this._showViewZone()})),this._register(this._replaceInput.onDidOptionChange(()=>{this._state.change({preserveCase:this._replaceInput.getPreserveCase()},!0)})),this._register(this._replaceInput.onPreserveCaseKeyDown(o=>{o.equals(l.Tab)&&(this._prevBtn.isEnabled()?this._prevBtn.focus():this._nextBtn.isEnabled()?this._nextBtn.focus():this._toggleSelectionFind.enabled?this._toggleSelectionFind.focus():this._closeBtn.isEnabled()&&this._closeBtn.focus(),o.preventDefault())}));const c=this._register(D());this._replaceBtn=this._register(new C({label:Ae+this._keybindingLabelFor(f.ReplaceOneAction),icon:Se,hoverDelegate:c,onTrigger:()=>{this._controller.replace()},onKeyDown:o=>{o.equals(b.Shift|l.Tab)&&(this._closeBtn.focus(),o.preventDefault())}},this._hoverService)),this._replaceAllBtn=this._register(new C({label:Ve+this._keybindingLabelFor(f.ReplaceAllAction),icon:Ee,hoverDelegate:c,onTrigger:()=>{this._controller.replaceAll()}},this._hoverService));const g=document.createElement("div");g.className="replace-part",g.appendChild(this._replaceInput.domNode);const p=document.createElement("div");p.className="replace-actions",g.appendChild(p),p.appendChild(this._replaceBtn.domNode),p.appendChild(this._replaceAllBtn.domNode),this._toggleReplaceBtn=this._register(new C({label:We,className:"codicon toggle left",onTrigger:()=>{this._state.change({isReplaceRevealed:!this._isReplaceVisible},!1),this._isReplaceVisible&&(this._replaceInput.width=_.getTotalWidth(this._findInput.domNode),this._replaceInput.inputBox.layout()),this._showViewZone()}},this._hoverService)),this._toggleReplaceBtn.setExpanded(this._isReplaceVisible),this._domNode=document.createElement("div"),this._domNode.className="editor-widget find-widget",this._domNode.setAttribute("aria-hidden","true"),this._domNode.ariaLabel=ye,this._domNode.role="dialog",this._domNode.style.width=`${m}px`,this._domNode.appendChild(this._toggleReplaceBtn.domNode),this._domNode.appendChild(a),this._domNode.appendChild(this._closeBtn.domNode),this._domNode.appendChild(g),this._resizeSash=this._register(new j(this._domNode,this,{orientation:X.VERTICAL,size:2})),this._resized=!1;let v=m;this._register(this._resizeSash.onDidStart(()=>{v=_.getTotalWidth(this._domNode)})),this._register(this._resizeSash.onDidChange(o=>{this._resized=!0;const s=v+o.startX-o.currentX;if(s<m)return;const E=parseFloat(_.getComputedStyle(this._domNode).maxWidth)||0;s>E||(this._domNode.style.width=`${s}px`,this._isReplaceVisible&&(this._replaceInput.width=_.getTotalWidth(this._findInput.domNode)),this._findInput.inputBox.layout(),this._tryUpdateHeight())})),this._register(this._resizeSash.onDidReset(()=>{const o=_.getTotalWidth(this._domNode);if(o<m)return;let s=m;if(!this._resized||o===m){const E=this._codeEditor.getLayoutInfo();s=E.width-28-E.minimap.minimapWidth-15,this._resized=!0}this._domNode.style.width=`${s}px`,this._isReplaceVisible&&(this._replaceInput.width=_.getTotalWidth(this._findInput.domNode)),this._findInput.inputBox.layout()}))}updateAccessibilitySupport(){const e=this._codeEditor.getOption(h.accessibilitySupport);this._findInput.setFocusInputOnOptionClick(e!==re.Enabled)}getViewState(){let e=!1;return this._viewZone&&this._viewZoneId&&(e=this._viewZone.heightInPx>this._codeEditor.getScrollTop()),{widgetViewZoneVisible:e,scrollTop:this._codeEditor.getScrollTop()}}setViewState(e){e&&e.widgetViewZoneVisible&&this._layoutViewZone(e.scrollTop)}}class C extends F{_opts;_domNode;constructor(d,e){super(),this._opts=d;let t="button";this._opts.className&&(t=t+" "+this._opts.className),this._opts.icon&&(t=t+" "+N.asClassName(this._opts.icon)),this._domNode=document.createElement("div"),this._domNode.tabIndex=0,this._domNode.className=t,this._domNode.setAttribute("role","button"),this._domNode.setAttribute("aria-label",this._opts.label),this._register(e.setupManagedHover(d.hoverDelegate??te("element"),this._domNode,this._opts.label)),this.onclick(this._domNode,i=>{this._opts.onTrigger(),i.preventDefault()}),this.onkeydown(this._domNode,i=>{if(i.equals(l.Space)||i.equals(l.Enter)){this._opts.onTrigger(),i.preventDefault();return}this._opts.onKeyDown?.(i)})}get domNode(){return this._domNode}isEnabled(){return this._domNode.tabIndex>=0}focus(){this._domNode.focus()}setEnabled(d){this._domNode.classList.toggle("disabled",!d),this._domNode.setAttribute("aria-disabled",String(!d)),this._domNode.tabIndex=d?0:-1}setExpanded(d){this._domNode.setAttribute("aria-expanded",String(!!d)),d?(this._domNode.classList.remove(...N.asClassNameArray(M)),this._domNode.classList.add(...N.asClassNameArray(Z))):(this._domNode.classList.remove(...N.asClassNameArray(Z)),this._domNode.classList.add(...N.asClassNameArray(M)))}}Ie((u,d)=>{const e=u.getColor(pe);e&&d.addRule(`.monaco-editor .findMatch { border: 1px ${H(u.type)?"dotted":"solid"} ${e}; box-sizing: border-box; }`);const t=u.getColor(ue);t&&d.addRule(`.monaco-editor .findScope { border: 1px ${H(u.type)?"dashed":"solid"} ${t}; }`);const i=u.getColor(he);i&&d.addRule(`.monaco-editor .find-widget { border: 1px solid ${i}; }`);const a=u.getColor(ce);a&&d.addRule(`.monaco-editor .findMatchInline { color: ${a}; }`);const n=u.getColor(_e);n&&d.addRule(`.monaco-editor .currentFindMatchInline { color: ${n}; }`)});export{$ as FindWidget,R as FindWidgetViewZone,Oe as NLS_MATCHES_LOCATION,k as NLS_NO_RESULTS,C as SimpleButton,Ne as findNextMatchIcon,Ce as findPreviousMatchIcon,Ee as findReplaceAllIcon,Se as findReplaceIcon,be as findSelectionIcon};
