import*as m from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/keyboardEvent.js";import"../../../../../vs/base/browser/mouseEvent.js";import"../../../../../vs/base/browser/ui/contextview/contextview.js";import"../../../../../vs/base/browser/ui/findinput/findInputToggles.js";import{HistoryInputBox as f}from"../../../../../vs/base/browser/ui/inputbox/inputBox.js";import{Toggle as x}from"../../../../../vs/base/browser/ui/toggle/toggle.js";import{Widget as C}from"../../../../../vs/base/browser/ui/widget.js";import{Codicon as w}from"../../../../../vs/base/common/codicons.js";import{Emitter as s}from"../../../../../vs/base/common/event.js";import{KeyCode as n}from"../../../../../vs/base/common/keyCodes.js";import"vs/css!./findInput";import{getDefaultHoverDelegate as I}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import*as p from"../../../../../vs/nls.js";const E=p.localize("defaultLabel","input"),_=p.localize("label.preserveCaseToggle","Preserve Case");class O extends x{constructor(o){super({icon:w.preserveCase,title:_+o.appendTitle,isChecked:o.isChecked,hoverDelegate:o.hoverDelegate??I("element"),inputActiveOptionBorder:o.inputActiveOptionBorder,inputActiveOptionForeground:o.inputActiveOptionForeground,inputActiveOptionBackground:o.inputActiveOptionBackground})}}class Q extends C{constructor(i,u,B,t){super();this._showOptionButtons=B;this.contextViewProvider=u,this.placeholder=t.placeholder||"",this.validation=t.validation,this.label=t.label||E;const c=t.appendPreserveCaseLabel||"",v=t.history||[],g=!!t.flexibleHeight,b=!!t.flexibleWidth,y=t.flexibleMaxHeight;this.domNode=document.createElement("div"),this.domNode.classList.add("monaco-findInput"),this.inputBox=this._register(new f(this.domNode,this.contextViewProvider,{ariaLabel:this.label||"",placeholder:this.placeholder||"",validationOptions:{validation:this.validation},history:v,showHistoryHint:t.showHistoryHint,flexibleHeight:g,flexibleWidth:b,flexibleMaxHeight:y,inputBoxStyles:t.inputBoxStyles})),this.preserveCase=this._register(new O({appendTitle:c,isChecked:!1,...t.toggleStyles})),this._register(this.preserveCase.onChange(e=>{this._onDidOptionChange.fire(e),!e&&this.fixFocusOnOptionClickEnabled&&this.inputBox.focus(),this.validate()})),this._register(this.preserveCase.onKeyDown(e=>{this._onPreserveCaseKeyDown.fire(e)})),this._showOptionButtons?this.cachedOptionsWidth=this.preserveCase.width():this.cachedOptionsWidth=0;const r=[this.preserveCase.domNode];this.onkeydown(this.domNode,e=>{if(e.equals(n.LeftArrow)||e.equals(n.RightArrow)||e.equals(n.Escape)){const l=r.indexOf(this.domNode.ownerDocument.activeElement);if(l>=0){let a=-1;e.equals(n.RightArrow)?a=(l+1)%r.length:e.equals(n.LeftArrow)&&(l===0?a=r.length-1:a=l-1),e.equals(n.Escape)?(r[l].blur(),this.inputBox.focus()):a>=0&&r[a].focus(),m.EventHelper.stop(e,!0)}}});const d=document.createElement("div");d.className="controls",d.style.display=this._showOptionButtons?"block":"none",d.appendChild(this.preserveCase.domNode),this.domNode.appendChild(d),i?.appendChild(this.domNode),this.onkeydown(this.inputBox.inputElement,e=>this._onKeyDown.fire(e)),this.onkeyup(this.inputBox.inputElement,e=>this._onKeyUp.fire(e)),this.oninput(this.inputBox.inputElement,e=>this._onInput.fire()),this.onmousedown(this.inputBox.inputElement,e=>this._onMouseDown.fire(e))}static OPTION_CHANGE="optionChange";contextViewProvider;placeholder;validation;label;fixFocusOnOptionClickEnabled=!0;preserveCase;cachedOptionsWidth=0;domNode;inputBox;_onDidOptionChange=this._register(new s);onDidOptionChange=this._onDidOptionChange.event;_onKeyDown=this._register(new s);onKeyDown=this._onKeyDown.event;_onMouseDown=this._register(new s);onMouseDown=this._onMouseDown.event;_onInput=this._register(new s);onInput=this._onInput.event;_onKeyUp=this._register(new s);onKeyUp=this._onKeyUp.event;_onPreserveCaseKeyDown=this._register(new s);onPreserveCaseKeyDown=this._onPreserveCaseKeyDown.event;enable(){this.domNode.classList.remove("disabled"),this.inputBox.enable(),this.preserveCase.enable()}disable(){this.domNode.classList.add("disabled"),this.inputBox.disable(),this.preserveCase.disable()}setFocusInputOnOptionClick(i){this.fixFocusOnOptionClickEnabled=i}setEnabled(i){i?this.enable():this.disable()}clear(){this.clearValidation(),this.setValue(""),this.focus()}getValue(){return this.inputBox.value}setValue(i){this.inputBox.value!==i&&(this.inputBox.value=i)}onSearchSubmit(){this.inputBox.addToHistory()}applyStyles(){}select(){this.inputBox.select()}focus(){this.inputBox.focus()}getPreserveCase(){return this.preserveCase.checked}setPreserveCase(i){this.preserveCase.checked=i}focusOnPreserve(){this.preserveCase.focus()}_lastHighlightFindOptions=0;highlightFindOptions(){this.domNode.classList.remove("highlight-"+this._lastHighlightFindOptions),this._lastHighlightFindOptions=1-this._lastHighlightFindOptions,this.domNode.classList.add("highlight-"+this._lastHighlightFindOptions)}validate(){this.inputBox?.validate()}showMessage(i){this.inputBox?.showMessage(i)}clearMessage(){this.inputBox?.hideMessage()}clearValidation(){this.inputBox?.hideMessage()}set width(i){this.inputBox.paddingRight=this.cachedOptionsWidth,this.domNode.style.width=i+"px"}dispose(){super.dispose()}}export{Q as ReplaceInput};
