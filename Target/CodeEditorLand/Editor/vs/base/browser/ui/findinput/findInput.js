import*as h from"../../dom.js";import{CaseSensitiveToggle as m,RegexToggle as x,WholeWordsToggle as y}from"./findInputToggles.js";import{HistoryInputBox as w}from"../inputbox/inputBox.js";import{Widget as I}from"../widget.js";import{Emitter as n}from"../../../common/event.js";import{KeyCode as l}from"../../../common/keyCodes.js";import"./findInput.css";import*as C from"../../../../nls.js";import{DisposableStore as _,MutableDisposable as E}from"../../../common/lifecycle.js";import{createInstantHoverDelegate as S}from"../hover/hoverDelegateFactory.js";const T=C.localize("defaultLabel","input");class X extends I{static OPTION_CHANGE="optionChange";placeholder;validation;label;showCommonFindToggles;fixFocusOnOptionClickEnabled=!0;imeSessionInProgress=!1;additionalTogglesDisposables=this._register(new E);controls;regex;wholeWords;caseSensitive;additionalToggles=[];domNode;inputBox;_onDidOptionChange=this._register(new n);onDidOptionChange=this._onDidOptionChange.event;_onKeyDown=this._register(new n);onKeyDown=this._onKeyDown.event;_onMouseDown=this._register(new n);onMouseDown=this._onMouseDown.event;_onInput=this._register(new n);onInput=this._onInput.event;_onKeyUp=this._register(new n);onKeyUp=this._onKeyUp.event;_onCaseSensitiveKeyDown=this._register(new n);onCaseSensitiveKeyDown=this._onCaseSensitiveKeyDown.event;_onRegexKeyDown=this._register(new n);onRegexKeyDown=this._onRegexKeyDown.event;constructor(e,s,i){super(),this.placeholder=i.placeholder||"",this.validation=i.validation,this.label=i.label||T,this.showCommonFindToggles=!!i.showCommonFindToggles;const p=i.appendCaseSensitiveLabel||"",g=i.appendWholeWordsLabel||"",u=i.appendRegexLabel||"",c=i.history||[],b=!!i.flexibleHeight,v=!!i.flexibleWidth,f=i.flexibleMaxHeight;this.domNode=document.createElement("div"),this.domNode.classList.add("monaco-findInput"),this.inputBox=this._register(new w(this.domNode,s,{placeholder:this.placeholder||"",ariaLabel:this.label||"",validationOptions:{validation:this.validation},history:c,showHistoryHint:i.showHistoryHint,flexibleHeight:b,flexibleWidth:v,flexibleMaxHeight:f,inputBoxStyles:i.inputBoxStyles}));const r=this._register(S());if(this.showCommonFindToggles){this.regex=this._register(new x({appendTitle:u,isChecked:!1,hoverDelegate:r,...i.toggleStyles})),this._register(this.regex.onChange(t=>{this._onDidOptionChange.fire(t),!t&&this.fixFocusOnOptionClickEnabled&&this.inputBox.focus(),this.validate()})),this._register(this.regex.onKeyDown(t=>{this._onRegexKeyDown.fire(t)})),this.wholeWords=this._register(new y({appendTitle:g,isChecked:!1,hoverDelegate:r,...i.toggleStyles})),this._register(this.wholeWords.onChange(t=>{this._onDidOptionChange.fire(t),!t&&this.fixFocusOnOptionClickEnabled&&this.inputBox.focus(),this.validate()})),this.caseSensitive=this._register(new m({appendTitle:p,isChecked:!1,hoverDelegate:r,...i.toggleStyles})),this._register(this.caseSensitive.onChange(t=>{this._onDidOptionChange.fire(t),!t&&this.fixFocusOnOptionClickEnabled&&this.inputBox.focus(),this.validate()})),this._register(this.caseSensitive.onKeyDown(t=>{this._onCaseSensitiveKeyDown.fire(t)}));const o=[this.caseSensitive.domNode,this.wholeWords.domNode,this.regex.domNode];this.onkeydown(this.domNode,t=>{if(t.equals(l.LeftArrow)||t.equals(l.RightArrow)||t.equals(l.Escape)){const a=o.indexOf(this.domNode.ownerDocument.activeElement);if(a>=0){let d=-1;t.equals(l.RightArrow)?d=(a+1)%o.length:t.equals(l.LeftArrow)&&(a===0?d=o.length-1:d=a-1),t.equals(l.Escape)?(o[a].blur(),this.inputBox.focus()):d>=0&&o[d].focus(),h.EventHelper.stop(t,!0)}}})}this.controls=document.createElement("div"),this.controls.className="controls",this.controls.style.display=this.showCommonFindToggles?"":"none",this.caseSensitive&&this.controls.append(this.caseSensitive.domNode),this.wholeWords&&this.controls.appendChild(this.wholeWords.domNode),this.regex&&this.controls.appendChild(this.regex.domNode),this.setAdditionalToggles(i?.additionalToggles),this.controls&&this.domNode.appendChild(this.controls),e?.appendChild(this.domNode),this._register(h.addDisposableListener(this.inputBox.inputElement,"compositionstart",o=>{this.imeSessionInProgress=!0})),this._register(h.addDisposableListener(this.inputBox.inputElement,"compositionend",o=>{this.imeSessionInProgress=!1,this._onInput.fire()})),this.onkeydown(this.inputBox.inputElement,o=>this._onKeyDown.fire(o)),this.onkeyup(this.inputBox.inputElement,o=>this._onKeyUp.fire(o)),this.oninput(this.inputBox.inputElement,o=>this._onInput.fire()),this.onmousedown(this.inputBox.inputElement,o=>this._onMouseDown.fire(o))}get isImeSessionInProgress(){return this.imeSessionInProgress}get onDidChange(){return this.inputBox.onDidChange}layout(e){this.inputBox.layout(),this.updateInputBoxPadding(e.collapsedFindWidget)}enable(){this.domNode.classList.remove("disabled"),this.inputBox.enable(),this.regex?.enable(),this.wholeWords?.enable(),this.caseSensitive?.enable();for(const e of this.additionalToggles)e.enable()}disable(){this.domNode.classList.add("disabled"),this.inputBox.disable(),this.regex?.disable(),this.wholeWords?.disable(),this.caseSensitive?.disable();for(const e of this.additionalToggles)e.disable()}setFocusInputOnOptionClick(e){this.fixFocusOnOptionClickEnabled=e}setEnabled(e){e?this.enable():this.disable()}setAdditionalToggles(e){for(const s of this.additionalToggles)s.domNode.remove();this.additionalToggles=[],this.additionalTogglesDisposables.value=new _;for(const s of e??[])this.additionalTogglesDisposables.value.add(s),this.controls.appendChild(s.domNode),this.additionalTogglesDisposables.value.add(s.onChange(i=>{this._onDidOptionChange.fire(i),!i&&this.fixFocusOnOptionClickEnabled&&this.inputBox.focus()})),this.additionalToggles.push(s);this.additionalToggles.length>0&&(this.controls.style.display=""),this.updateInputBoxPadding()}updateInputBoxPadding(e=!1){e?this.inputBox.paddingRight=0:this.inputBox.paddingRight=(this.caseSensitive?.width()??0)+(this.wholeWords?.width()??0)+(this.regex?.width()??0)+this.additionalToggles.reduce((s,i)=>s+i.width(),0)}clear(){this.clearValidation(),this.setValue(""),this.focus()}getValue(){return this.inputBox.value}setValue(e){this.inputBox.value!==e&&(this.inputBox.value=e)}onSearchSubmit(){this.inputBox.addToHistory()}select(){this.inputBox.select()}focus(){this.inputBox.focus()}getCaseSensitive(){return this.caseSensitive?.checked??!1}setCaseSensitive(e){this.caseSensitive&&(this.caseSensitive.checked=e)}getWholeWords(){return this.wholeWords?.checked??!1}setWholeWords(e){this.wholeWords&&(this.wholeWords.checked=e)}getRegex(){return this.regex?.checked??!1}setRegex(e){this.regex&&(this.regex.checked=e,this.validate())}focusOnCaseSensitive(){this.caseSensitive?.focus()}focusOnRegex(){this.regex?.focus()}_lastHighlightFindOptions=0;highlightFindOptions(){this.domNode.classList.remove("highlight-"+this._lastHighlightFindOptions),this._lastHighlightFindOptions=1-this._lastHighlightFindOptions,this.domNode.classList.add("highlight-"+this._lastHighlightFindOptions)}validate(){this.inputBox.validate()}showMessage(e){this.inputBox.showMessage(e)}clearMessage(){this.inputBox.hideMessage()}clearValidation(){this.inputBox.hideMessage()}}export{X as FindInput};
