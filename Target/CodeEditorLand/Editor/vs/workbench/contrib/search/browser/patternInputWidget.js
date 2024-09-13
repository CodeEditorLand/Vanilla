var B=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var c=(d,o,e,i)=>{for(var t=i>1?void 0:i?y(o,e):o,s=d.length-1,n;s>=0;s--)(n=d[s])&&(t=(i?n(o,e,t):n(t))||t);return i&&t&&B(o,e,t),t},r=(d,o)=>(e,i)=>o(e,i,d);import*as C from"../../../../base/browser/dom.js";import{getDefaultHoverDelegate as g}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{Toggle as S}from"../../../../base/browser/ui/toggle/toggle.js";import{Widget as f}from"../../../../base/browser/ui/widget.js";import{Codicon as I}from"../../../../base/common/codicons.js";import{Emitter as u}from"../../../../base/common/event.js";import{KeyCode as E}from"../../../../base/common/keyCodes.js";import*as p from"../../../../nls.js";import{IConfigurationService as m}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as x}from"../../../../platform/contextkey/common/contextkey.js";import{ContextScopedHistoryInputBox as w}from"../../../../platform/history/browser/contextScopedHistoryWidget.js";import{showHistoryKeybindingHint as _}from"../../../../platform/history/browser/historyWidgetKeybindingHint.js";import{IKeybindingService as v}from"../../../../platform/keybinding/common/keybinding.js";import{defaultToggleStyles as b}from"../../../../platform/theme/browser/defaultStyles.js";let h=class extends f{constructor(e,i,t,s,n,H){super();this.contextViewProvider=i;this.contextKeyService=s;this.configurationService=n;this.keybindingService=H;t={ariaLabel:p.localize("defaultLabel","input"),...t},this.width=t.width??100,this.render(t),e.appendChild(this.domNode)}static OPTION_CHANGE="optionChange";inputFocusTracker;width;domNode;inputBox;_onSubmit=this._register(new u);onSubmit=this._onSubmit.event;_onCancel=this._register(new u);onCancel=this._onCancel.event;dispose(){super.dispose(),this.inputFocusTracker?.dispose()}setWidth(e){this.width=e,this.contextViewProvider.layout(),this.setInputWidth()}getValue(){return this.inputBox.value}setValue(e){this.inputBox.value!==e&&(this.inputBox.value=e)}select(){this.inputBox.select()}focus(){this.inputBox.focus()}inputHasFocus(){return this.inputBox.hasFocus()}setInputWidth(){this.inputBox.width=this.width-this.getSubcontrolsWidth()-2}getSubcontrolsWidth(){return 0}getHistory(){return this.inputBox.getHistory()}clearHistory(){this.inputBox.clearHistory()}prependHistory(e){this.inputBox.prependHistory(e)}clear(){this.setValue("")}onSearchSubmit(){this.inputBox.addToHistory()}showNextTerm(){this.inputBox.showNextValue()}showPreviousTerm(){this.inputBox.showPreviousValue()}render(e){this.domNode=document.createElement("div"),this.domNode.classList.add("monaco-findInput"),this.inputBox=new w(this.domNode,this.contextViewProvider,{placeholder:e.placeholder,showPlaceholderOnFocus:e.showPlaceholderOnFocus,tooltip:e.tooltip,ariaLabel:e.ariaLabel,validationOptions:{validation:void 0},history:e.history||[],showHistoryHint:()=>_(this.keybindingService),inputBoxStyles:e.inputBoxStyles},this.contextKeyService),this._register(this.inputBox.onDidChange(()=>this._onSubmit.fire(!0))),this.inputFocusTracker=C.trackFocus(this.inputBox.inputElement),this.onkeyup(this.inputBox.inputElement,t=>this.onInputKeyUp(t));const i=document.createElement("div");i.className="controls",this.renderSubcontrols(i),this.domNode.appendChild(i),this.setInputWidth()}renderSubcontrols(e){}onInputKeyUp(e){switch(e.keyCode){case E.Enter:this.onSearchSubmit(),this._onSubmit.fire(!1);return;case E.Escape:this._onCancel.fire();return}}};h=c([r(3,x),r(4,m),r(5,v)],h);let a=class extends h{_onChangeSearchInEditorsBoxEmitter=this._register(new u);onChangeSearchInEditorsBox=this._onChangeSearchInEditorsBoxEmitter.event;constructor(o,e,i,t,s,n){super(o,e,i,t,s,n)}useSearchInEditorsBox;dispose(){super.dispose(),this.useSearchInEditorsBox.dispose()}onlySearchInOpenEditors(){return this.useSearchInEditorsBox.checked}setOnlySearchInOpenEditors(o){this.useSearchInEditorsBox.checked=o,this._onChangeSearchInEditorsBoxEmitter.fire()}getSubcontrolsWidth(){return super.getSubcontrolsWidth()+this.useSearchInEditorsBox.width()}renderSubcontrols(o){this.useSearchInEditorsBox=this._register(new S({icon:I.book,title:p.localize("onlySearchInOpenEditors","Search only in Open Editors"),isChecked:!1,hoverDelegate:g("element"),...b})),this._register(this.useSearchInEditorsBox.onChange(e=>{this._onChangeSearchInEditorsBoxEmitter.fire(),e||this.inputBox.focus()})),o.appendChild(this.useSearchInEditorsBox.domNode),super.renderSubcontrols(o)}};a=c([r(3,x),r(4,m),r(5,v)],a);let l=class extends h{_onChangeIgnoreBoxEmitter=this._register(new u);onChangeIgnoreBox=this._onChangeIgnoreBoxEmitter.event;constructor(o,e,i,t,s,n){super(o,e,i,t,s,n)}useExcludesAndIgnoreFilesBox;dispose(){super.dispose(),this.useExcludesAndIgnoreFilesBox.dispose()}useExcludesAndIgnoreFiles(){return this.useExcludesAndIgnoreFilesBox.checked}setUseExcludesAndIgnoreFiles(o){this.useExcludesAndIgnoreFilesBox.checked=o,this._onChangeIgnoreBoxEmitter.fire()}getSubcontrolsWidth(){return super.getSubcontrolsWidth()+this.useExcludesAndIgnoreFilesBox.width()}renderSubcontrols(o){this.useExcludesAndIgnoreFilesBox=this._register(new S({icon:I.exclude,actionClassName:"useExcludesAndIgnoreFiles",title:p.localize("useExcludesAndIgnoreFilesDescription","Use Exclude Settings and Ignore Files"),isChecked:!0,hoverDelegate:g("element"),...b})),this._register(this.useExcludesAndIgnoreFilesBox.onChange(e=>{this._onChangeIgnoreBoxEmitter.fire(),e||this.inputBox.focus()})),o.appendChild(this.useExcludesAndIgnoreFilesBox.domNode),super.renderSubcontrols(o)}};l=c([r(3,x),r(4,m),r(5,v)],l);export{l as ExcludePatternInputWidget,a as IncludePatternInputWidget,h as PatternInputWidget};
