var A=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var N=(c,a,e,t)=>{for(var i=t>1?void 0:t?E(a,e):a,o=c.length-1,s;o>=0;o--)(s=c[o])&&(i=(t?s(a,e,i):s(i))||i);return t&&i&&A(a,e,i),i},h=(c,a)=>(e,t)=>a(e,t,c);import*as n from"../../../../../../nls.js";import*as d from"../../../../../../base/browser/dom.js";import"./notebookFindReplaceWidget.css";import{ActionBar as w}from"../../../../../../base/browser/ui/actionbar/actionbar.js";import{AnchorAlignment as L}from"../../../../../../base/browser/ui/contextview/contextview.js";import{DropdownMenuActionViewItem as V}from"../../../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import{FindInput as O}from"../../../../../../base/browser/ui/findinput/findInput.js";import{ProgressBar as M}from"../../../../../../base/browser/ui/progressbar/progressbar.js";import{Orientation as P,Sash as W}from"../../../../../../base/browser/ui/sash/sash.js";import{Toggle as H}from"../../../../../../base/browser/ui/toggle/toggle.js";import{Widget as z}from"../../../../../../base/browser/ui/widget.js";import{Action as K,ActionRunner as U,Separator as G}from"../../../../../../base/common/actions.js";import{Delayer as $}from"../../../../../../base/common/async.js";import{Codicon as X}from"../../../../../../base/common/codicons.js";import{KeyCode as q}from"../../../../../../base/common/keyCodes.js";import{Disposable as Z}from"../../../../../../base/common/lifecycle.js";import{isSafari as j}from"../../../../../../base/common/platform.js";import{ThemeIcon as J}from"../../../../../../base/common/themables.js";import{FindReplaceState as Q}from"../../../../../../editor/contrib/find/browser/findState.js";import{findNextMatchIcon as Y,findPreviousMatchIcon as ee,findReplaceAllIcon as te,findReplaceIcon as ie,findSelectionIcon as oe,SimpleButton as _}from"../../../../../../editor/contrib/find/browser/findWidget.js";import{parseReplaceString as ne,ReplacePattern as se}from"../../../../../../editor/contrib/find/browser/replacePattern.js";import{createAndFillInActionBarActions as k}from"../../../../../../platform/actions/browser/menuEntryActionViewItem.js";import{IConfigurationService as re}from"../../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as le}from"../../../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as F,IContextViewService as ae}from"../../../../../../platform/contextview/browser/contextView.js";import{ContextScopedReplaceInput as de,registerAndCreateHistoryNavigationContext as ce}from"../../../../../../platform/history/browser/contextScopedHistoryWidget.js";import{IHoverService as pe}from"../../../../../../platform/hover/browser/hover.js";import{IInstantiationService as he}from"../../../../../../platform/instantiation/common/instantiation.js";import{defaultInputBoxStyles as B,defaultProgressBarStyles as ue,defaultToggleStyles as D}from"../../../../../../platform/theme/browser/defaultStyles.js";import{asCssVariable as C,inputActiveOptionBackground as _e,inputActiveOptionBorder as fe,inputActiveOptionForeground as ge}from"../../../../../../platform/theme/common/colorRegistry.js";import{registerIcon as me,widgetClose as Ie}from"../../../../../../platform/theme/common/iconRegistry.js";import{registerThemingParticipant as be}from"../../../../../../platform/theme/common/themeService.js";import{filterIcon as ve}from"../../../../extensions/browser/extensionsIcons.js";import{NotebookFindFilters as Se}from"./findFilters.js";import{NotebookFindScopeType as m,NotebookSetting as Ne}from"../../../common/notebookCommon.js";const Ce=n.localize("label.find","Find"),Te=n.localize("placeholder.find","Find"),ye=n.localize("label.previousMatchButton","Previous Match"),ke=n.localize("label.nextMatchButton","Next Match"),Fe=n.localize("label.toggleSelectionFind","Find in Selection"),Be=n.localize("label.closeButton","Close"),De=n.localize("label.toggleReplaceButton","Toggle Replace"),Re=n.localize("label.replace","Replace"),xe=n.localize("placeholder.replace","Replace"),Ae=n.localize("label.replaceButton","Replace"),Ee=n.localize("label.replaceAllButton","Replace All"),Zt=me("find-filter",X.filter,n.localize("findFilterIcon","Icon for Find Filter in find widget.")),we=n.localize("notebook.find.filter.filterAction","Find Filters"),Le=n.localize("notebook.find.filter.findInMarkupInput","Markdown Source"),Ve=n.localize("notebook.find.filter.findInMarkupPreview","Rendered Markdown"),Oe=n.localize("notebook.find.filter.findInCodeInput","Code Cell Source"),Me=n.localize("notebook.find.filter.findInCodeOutput","Code Cell Output"),f=419,R=4;let I=class extends V{constructor(e,t,i,o,s){super(t,{getActions:()=>this.getActions()},s,{...i,actionRunner:o,classNames:t.class,anchorAlignmentProvider:()=>L.RIGHT});this.filters=e}render(e){super.render(e),this.updateChecked()}getActions(){const e={checked:this.filters.markupInput,class:void 0,enabled:!0,id:"findInMarkdownInput",label:Le,run:async()=>{this.filters.markupInput=!this.filters.markupInput},tooltip:""},t={checked:this.filters.markupPreview,class:void 0,enabled:!0,id:"findInMarkdownInput",label:Ve,run:async()=>{this.filters.markupPreview=!this.filters.markupPreview},tooltip:""},i={checked:this.filters.codeInput,class:void 0,enabled:!0,id:"findInCodeInput",label:Oe,run:async()=>{this.filters.codeInput=!this.filters.codeInput},tooltip:""},o={checked:this.filters.codeOutput,class:void 0,enabled:!0,id:"findInCodeOutput",label:Me,run:async()=>{this.filters.codeOutput=!this.filters.codeOutput},tooltip:"",dispose:()=>null};return j?[e,i]:[e,t,new G,i,o]}updateChecked(){this.element.classList.toggle("checked",this._action.checked)}};I=N([h(4,F)],I);class Pe extends Z{constructor(e,t,i,o,s=we){super();this.filters=e;this.contextMenuService=t;this.instantiationService=i;this._toggleStyles=o.toggleStyles,this._filtersAction=new K("notebookFindFilterAction",s,"notebook-filters "+J.asClassName(ve)),this._filtersAction.checked=!1,this._filterButtonContainer=d.$(".find-filter-button"),this._filterButtonContainer.classList.add("monaco-custom-toggle"),this.createFilters(this._filterButtonContainer)}_filterButtonContainer;_actionbar=null;_filtersAction;_toggleStyles;get container(){return this._filterButtonContainer}width(){return 2+2+2+16}enable(){this.container.setAttribute("aria-disabled",String(!1))}disable(){this.container.setAttribute("aria-disabled",String(!0))}set visible(e){this._filterButtonContainer.style.display=e?"":"none"}get visible(){return this._filterButtonContainer.style.display!=="none"}applyStyles(e){const t=this._toggleStyles;this._filterButtonContainer.style.border="1px solid transparent",this._filterButtonContainer.style.borderRadius="3px",this._filterButtonContainer.style.borderColor=e&&t.inputActiveOptionBorder||"",this._filterButtonContainer.style.color=e&&t.inputActiveOptionForeground||"inherit",this._filterButtonContainer.style.backgroundColor=e&&t.inputActiveOptionBackground||""}createFilters(e){this._actionbar=this._register(new w(e,{actionViewItemProvider:(t,i)=>{if(t.id===this._filtersAction.id)return this.instantiationService.createInstance(I,this.filters,t,i,new U)}})),this._actionbar.push(this._filtersAction,{icon:!0,label:!1})}}class We extends O{constructor(e,t,i,o,s,p,S){super(s,p,S);this.filters=e;this.contextMenuService=i;this.instantiationService=o;this._register(ce(t,this.inputBox)),this._findFilter=this._register(new Pe(e,i,o,S)),this.inputBox.paddingRight=(this.caseSensitive?.width()??0)+(this.wholeWords?.width()??0)+(this.regex?.width()??0)+this._findFilter.width(),this.controls.appendChild(this._findFilter.container)}_findFilter;_filterChecked=!1;setEnabled(e){super.setEnabled(e),e&&!this._filterChecked?this.regex?.enable():this.regex?.disable()}updateFilterState(e){this._filterChecked=e,this.regex&&(this._filterChecked?(this.regex.disable(),this.regex.domNode.tabIndex=-1,this.regex.domNode.classList.toggle("disabled",!0)):(this.regex.enable(),this.regex.domNode.tabIndex=0,this.regex.domNode.classList.toggle("disabled",!1))),this._findFilter.applyStyles(this._filterChecked)}getCellToolbarActions(e){const o={primary:[],secondary:[]};return k(e,{shouldForwardArgs:!0},o,s=>/^inline/.test(s)),o}}let v=class extends z{constructor(e,t,i,o,s,p,S=new Q,He){super();this._contextViewService=e;this._configurationService=i;this.contextMenuService=o;this.instantiationService=s;this._state=S;this._notebookEditor=He;const b=this._configurationService.getValue(Ne.findFilters)??{markupSource:!0,markupPreview:!0,codeSource:!0,codeOutput:!0};this._filters=new Se(b.markupSource,b.markupPreview,b.codeSource,b.codeOutput,{findScopeType:m.None}),this._state.change({filters:this._filters},!1),this._filters.onDidChange(()=>{this._state.change({filters:this._filters},!1)}),this._domNode=document.createElement("div"),this._domNode.classList.add("simple-fr-find-part-wrapper"),this._register(this._state.onFindReplaceStateChange(r=>this._onStateChanged(r))),this._scopedContextKeyService=t.createScoped(this._domNode);const T=d.$(".find-replace-progress");this._progressBar=new M(T,ue),this._domNode.appendChild(T);const y=t.getContextKeyValue("notebookType")==="interactive";this._toggleReplaceBtn=this._register(new _({label:De,className:"codicon toggle left",onTrigger:y?()=>{}:()=>{this._isReplaceVisible=!this._isReplaceVisible,this._state.change({isReplaceRevealed:this._isReplaceVisible},!1),this._updateReplaceViewDisplay()}},p)),this._toggleReplaceBtn.setEnabled(!y),this._toggleReplaceBtn.setExpanded(this._isReplaceVisible),this._domNode.appendChild(this._toggleReplaceBtn.domNode),this._innerFindDomNode=document.createElement("div"),this._innerFindDomNode.classList.add("simple-fr-find-part"),this._findInput=this._register(new We(this._filters,this._scopedContextKeyService,this.contextMenuService,this.instantiationService,null,this._contextViewService,{label:Ce,placeholder:Te,validation:r=>{if(r.length===0||!this._findInput.getRegex())return null;try{return new RegExp(r),null}catch(l){return this.foundMatch=!1,this.updateButtons(this.foundMatch),{content:l.message}}},flexibleWidth:!0,showCommonFindToggles:!0,inputBoxStyles:B,toggleStyles:D})),this._updateHistoryDelayer=new $(500),this.oninput(this._findInput.domNode,r=>{this.foundMatch=this.onInputChanged(),this.updateButtons(this.foundMatch),this._delayedUpdateHistory()}),this._register(this._findInput.inputBox.onDidChange(()=>{this._state.change({searchString:this._findInput.getValue()},!0)})),this._findInput.setRegex(!!this._state.isRegex),this._findInput.setCaseSensitive(!!this._state.matchCase),this._findInput.setWholeWords(!!this._state.wholeWord),this._register(this._findInput.onDidOptionChange(()=>{this._state.change({isRegex:this._findInput.getRegex(),wholeWord:this._findInput.getWholeWords(),matchCase:this._findInput.getCaseSensitive()},!0)})),this._register(this._state.onFindReplaceStateChange(()=>{this._findInput.setRegex(this._state.isRegex),this._findInput.setWholeWords(this._state.wholeWord),this._findInput.setCaseSensitive(this._state.matchCase),this._replaceInput.setPreserveCase(this._state.preserveCase)})),this._matchesCount=document.createElement("div"),this._matchesCount.className="matchesCount",this._updateMatchesCount(),this.prevBtn=this._register(new _({label:ye,icon:ee,onTrigger:()=>{this.find(!0)}},p)),this.nextBtn=this._register(new _({label:ke,icon:Y,onTrigger:()=>{this.find(!1)}},p)),this.inSelectionToggle=this._register(new H({icon:oe,title:Fe,isChecked:!1,inputActiveOptionBackground:C(_e),inputActiveOptionBorder:C(fe),inputActiveOptionForeground:C(ge)})),this.inSelectionToggle.domNode.style.display="inline",this.inSelectionToggle.onChange(()=>{if(this.inSelectionToggle.checked){const l=this._notebookEditor.getSelections(),u=this._notebookEditor.getSelectionViewModels()[0].getSelections();l.length>1||l.some(g=>g.end-g.start>1)?(this._filters.findScope={findScopeType:m.Cells,selectedCellRanges:l},this.setCellSelectionDecorations()):u.length>1||u.some(g=>g.endLineNumber-g.startLineNumber>=1)?(this._filters.findScope={findScopeType:m.Text,selectedCellRanges:l,selectedTextRanges:u},this.setTextSelectionDecorations(u,this._notebookEditor.getSelectionViewModels()[0])):(this._filters.findScope={findScopeType:m.Cells,selectedCellRanges:l},this.setCellSelectionDecorations())}else this._filters.findScope={findScopeType:m.None},this.clearCellSelectionDecorations(),this.clearTextSelectionDecorations()});const x=this._register(new _({label:Be,icon:Ie,onTrigger:()=>{this.hide()}},p));this._innerFindDomNode.appendChild(this._findInput.domNode),this._innerFindDomNode.appendChild(this._matchesCount),this._innerFindDomNode.appendChild(this.prevBtn.domNode),this._innerFindDomNode.appendChild(this.nextBtn.domNode),this._innerFindDomNode.appendChild(this.inSelectionToggle.domNode),this._innerFindDomNode.appendChild(x.domNode),this._domNode.appendChild(this._innerFindDomNode),this.onkeyup(this._innerFindDomNode,r=>{if(r.equals(q.Escape)){this.hide(),r.preventDefault();return}}),this._focusTracker=this._register(d.trackFocus(this._domNode)),this._register(this._focusTracker.onDidFocus(this.onFocusTrackerFocus.bind(this))),this._register(this._focusTracker.onDidBlur(this.onFocusTrackerBlur.bind(this))),this._findInputFocusTracker=this._register(d.trackFocus(this._findInput.domNode)),this._register(this._findInputFocusTracker.onDidFocus(this.onFindInputFocusTrackerFocus.bind(this))),this._register(this._findInputFocusTracker.onDidBlur(this.onFindInputFocusTrackerBlur.bind(this))),this._register(d.addDisposableListener(this._innerFindDomNode,"click",r=>{r.stopPropagation()})),this._innerReplaceDomNode=document.createElement("div"),this._innerReplaceDomNode.classList.add("simple-fr-replace-part"),this._replaceInput=this._register(new de(null,void 0,{label:Re,placeholder:xe,history:[],inputBoxStyles:B,toggleStyles:D},t,!1)),this._innerReplaceDomNode.appendChild(this._replaceInput.domNode),this._replaceInputFocusTracker=this._register(d.trackFocus(this._replaceInput.domNode)),this._register(this._replaceInputFocusTracker.onDidFocus(this.onReplaceInputFocusTrackerFocus.bind(this))),this._register(this._replaceInputFocusTracker.onDidBlur(this.onReplaceInputFocusTrackerBlur.bind(this))),this._register(this._replaceInput.inputBox.onDidChange(()=>{this._state.change({replaceString:this._replaceInput.getValue()},!0)})),this._domNode.appendChild(this._innerReplaceDomNode),this._updateReplaceViewDisplay(),this._replaceBtn=this._register(new _({label:Ae,icon:ie,onTrigger:()=>{this.replaceOne()}},p)),this._replaceAllBtn=this._register(new _({label:Ee,icon:te,onTrigger:()=>{this.replaceAll()}},p)),this._innerReplaceDomNode.appendChild(this._replaceBtn.domNode),this._innerReplaceDomNode.appendChild(this._replaceAllBtn.domNode),this._resizeSash=this._register(new W(this._domNode,{getVerticalSashLeft:()=>0},{orientation:P.VERTICAL,size:2})),this._register(this._resizeSash.onDidStart(()=>{this._resizeOriginalWidth=this._getDomWidth()})),this._register(this._resizeSash.onDidChange(r=>{let l=this._resizeOriginalWidth+r.startX-r.currentX;l<f&&(l=f);const u=this._getMaxWidth();l>u&&(l=u),this._domNode.style.width=`${l}px`,this._isReplaceVisible&&(this._replaceInput.width=d.getTotalWidth(this._findInput.domNode)),this._findInput.inputBox.layout()})),this._register(this._resizeSash.onDidReset(()=>{const r=this._getDomWidth();let l=f;r<=f&&(l=this._getMaxWidth()),this._domNode.style.width=`${l}px`,this._isReplaceVisible&&(this._replaceInput.width=d.getTotalWidth(this._findInput.domNode)),this._findInput.inputBox.layout()}))}_findInput;_domNode;_innerFindDomNode;_focusTracker;_findInputFocusTracker;_updateHistoryDelayer;_matchesCount;prevBtn;nextBtn;_replaceInput;_innerReplaceDomNode;_toggleReplaceBtn;_replaceInputFocusTracker;_replaceBtn;_replaceAllBtn;_resizeSash;_resizeOriginalWidth=f;_isVisible=!1;_isReplaceVisible=!1;foundMatch=!1;_progressBar;_scopedContextKeyService;_filters;inSelectionToggle;cellSelectionDecorationIds=[];textSelectionDecorationIds=[];_getMaxWidth(){return this._notebookEditor.getLayoutInfo().width-64}_getDomWidth(){return d.getTotalWidth(this._domNode)-R*2}getCellToolbarActions(e){const o={primary:[],secondary:[]};return k(e,{shouldForwardArgs:!0},o,s=>/^inline/.test(s)),o}get inputValue(){return this._findInput.getValue()}get replaceValue(){return this._replaceInput.getValue()}get replacePattern(){return this._state.isRegex?ne(this.replaceValue):se.fromStaticValue(this.replaceValue)}get focusTracker(){return this._focusTracker}_onStateChanged(e){this._updateButtons(),this._updateMatchesCount()}_updateButtons(){this._findInput.setEnabled(this._isVisible),this._replaceInput.setEnabled(this._isVisible&&this._isReplaceVisible);const e=this._state.searchString.length>0;this._replaceBtn.setEnabled(this._isVisible&&this._isReplaceVisible&&e),this._replaceAllBtn.setEnabled(this._isVisible&&this._isReplaceVisible&&e),this._domNode.classList.toggle("replaceToggled",this._isReplaceVisible),this._toggleReplaceBtn.setExpanded(this._isReplaceVisible),this.foundMatch=this._state.matchesCount>0,this.updateButtons(this.foundMatch)}setCellSelectionDecorations(){const e=[];this._notebookEditor.getSelectionViewModels().forEach(i=>{e.push(i.handle)});const t=[];for(const i of e)t.push({handle:i,options:{className:"nb-multiCellHighlight",outputClassName:"nb-multiCellHighlight"}});this.cellSelectionDecorationIds=this._notebookEditor.deltaCellDecorations([],t)}clearCellSelectionDecorations(){this._notebookEditor.deltaCellDecorations(this.cellSelectionDecorationIds,[])}setTextSelectionDecorations(e,t){this._notebookEditor.changeModelDecorations(i=>{const o=[];for(const s of e)o.push({ownerId:t.handle,decorations:[{range:s,options:{description:"text search range for notebook search scope",isWholeLine:!0,className:"nb-findScope"}}]});this.textSelectionDecorationIds=i.deltaDecorations([],o)})}clearTextSelectionDecorations(){this._notebookEditor.changeModelDecorations(e=>{e.deltaDecorations(this.textSelectionDecorationIds,[])})}_updateMatchesCount(){}dispose(){super.dispose(),this._domNode.remove()}getDomNode(){return this._domNode}reveal(e){if(e&&this._findInput.setValue(e),this._isVisible){this._findInput.select();return}this._isVisible=!0,this.updateButtons(this.foundMatch),setTimeout(()=>{this._domNode.classList.add("visible","visible-transition"),this._domNode.setAttribute("aria-hidden","false"),this._findInput.select()},0)}focus(){this._findInput.focus()}show(e,t){e&&this._findInput.setValue(e),this._isVisible=!0,setTimeout(()=>{this._domNode.classList.add("visible","visible-transition"),this._domNode.setAttribute("aria-hidden","false"),(t?.focus??!0)&&this.focus()},0)}showWithReplace(e,t){e&&this._findInput.setValue(e),t&&this._replaceInput.setValue(t),this._isVisible=!0,this._isReplaceVisible=!0,this._state.change({isReplaceRevealed:this._isReplaceVisible},!1),this._updateReplaceViewDisplay(),setTimeout(()=>{this._domNode.classList.add("visible","visible-transition"),this._domNode.setAttribute("aria-hidden","false"),this._updateButtons(),this._replaceInput.focus()},0)}_updateReplaceViewDisplay(){this._isReplaceVisible?this._innerReplaceDomNode.style.display="flex":this._innerReplaceDomNode.style.display="none",this._replaceInput.width=d.getTotalWidth(this._findInput.domNode)}hide(){this._isVisible&&(this.inSelectionToggle.checked=!1,this._notebookEditor.deltaCellDecorations(this.cellSelectionDecorationIds,[]),this._notebookEditor.changeModelDecorations(e=>{e.deltaDecorations(this.textSelectionDecorationIds,[])}),this._domNode.classList.remove("visible-transition"),this._domNode.setAttribute("aria-hidden","true"),setTimeout(()=>{this._isVisible=!1,this.updateButtons(this.foundMatch),this._domNode.classList.remove("visible")},200))}_delayedUpdateHistory(){this._updateHistoryDelayer.trigger(this._updateHistory.bind(this))}_updateHistory(){this._findInput.inputBox.addToHistory()}_getRegexValue(){return this._findInput.getRegex()}_getWholeWordValue(){return this._findInput.getWholeWords()}_getCaseSensitiveValue(){return this._findInput.getCaseSensitive()}updateButtons(e){const t=this.inputValue.length>0;this.prevBtn.setEnabled(this._isVisible&&t&&e),this.nextBtn.setEnabled(this._isVisible&&t&&e)}};v=N([h(0,ae),h(1,le),h(2,re),h(3,F),h(4,he),h(5,pe)],v),be((c,a)=>{a.addRule(`
	.notebook-editor {
		--notebook-find-width: ${f}px;
		--notebook-find-horizontal-padding: ${R}px;
	}
	`)});export{We as NotebookFindInput,Pe as NotebookFindInputFilterButton,v as SimpleFindReplaceWidget,Zt as findFilterButton};
