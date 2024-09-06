var w=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var k=(h,t,e,i)=>{for(var s=i>1?void 0:i?Q(t,e):t,o=h.length-1,r;o>=0;o--)(r=h[o])&&(s=(i?r(t,e,s):r(s))||s);return i&&s&&w(t,e,s),s},b=(h,t)=>(e,i)=>t(e,i,h);import*as u from"../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as O}from"../../../../vs/base/browser/keyboardEvent.js";import"../../../../vs/base/browser/ui/actionbar/actionbar.js";import"../../../../vs/base/browser/ui/button/button.js";import"../../../../vs/base/browser/ui/countBadge/countBadge.js";import"../../../../vs/base/browser/ui/hover/hoverDelegate.js";import"../../../../vs/base/browser/ui/inputbox/inputBox.js";import"../../../../vs/base/browser/ui/keybindingLabel/keybindingLabel.js";import"../../../../vs/base/browser/ui/list/listWidget.js";import"../../../../vs/base/browser/ui/progressbar/progressbar.js";import{Toggle as H}from"../../../../vs/base/browser/ui/toggle/toggle.js";import{equals as y}from"../../../../vs/base/common/arrays.js";import{TimeoutTimer as U}from"../../../../vs/base/common/async.js";import{Codicon as P}from"../../../../vs/base/common/codicons.js";import{Emitter as n,EventBufferer as K}from"../../../../vs/base/common/event.js";import{KeyCode as m}from"../../../../vs/base/common/keyCodes.js";import{Disposable as F,DisposableStore as V}from"../../../../vs/base/common/lifecycle.js";import{isIOS as S}from"../../../../vs/base/common/platform.js";import D from"../../../../vs/base/common/severity.js";import{ThemeIcon as q}from"../../../../vs/base/common/themables.js";import"vs/css!./media/quickInput";import{localize as l}from"../../../../vs/nls.js";import{IConfigurationService as N}from"../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as E,RawContextKey as I}from"../../../../vs/platform/contextkey/common/contextkey.js";import{IHoverService as W,WorkbenchHoverDelegate as R}from"../../../../vs/platform/hover/browser/hover.js";import"../../../../vs/platform/quickinput/browser/quickInputTree.js";import{ItemActivation as c,NO_KEY_MODS as $,QuickInputButtonLocation as T,QuickInputHideReason as C,QuickInputType as _,QuickPickFocus as v}from"../../../../vs/platform/quickinput/common/quickInput.js";import"./quickInputBox.js";import{quickInputButtonToAction as B,renderQuickInputDescription as z}from"./quickInputUtils.js";const x="inQuickInput",ee=new I(x,!1,l("inQuickInput","Whether keyboard focus is inside the quick input control")),ie=E.has(x),G="quickInputType",se=new I(G,void 0,l("quickInputType","The type of the currently visible quick input")),A="cursorAtEndOfQuickInputBox",ne=new I(A,!1,l("cursorAtEndOfQuickInputBox","Whether the cursor in the quick input is at the end of the input box")),oe=E.has(A),M={iconClass:q.asClassName(P.quickInputBack),tooltip:l("quickInput.back","Back"),handle:-1};class p extends F{constructor(e){super();this.ui=e}static noPromptMessage=l("inputModeEntry","Press 'Enter' to confirm your input or 'Escape' to cancel");_title;_description;_widget;_widgetUpdated=!1;_steps;_totalSteps;visible=!1;_enabled=!0;_contextKey;_busy=!1;_ignoreFocusOut=!1;_leftButtons=[];_rightButtons=[];_inlineButtons=[];buttonsUpdated=!1;_toggles=[];togglesUpdated=!1;noValidationMessage=p.noPromptMessage;_validationMessage;_lastValidationMessage;_severity=D.Ignore;_lastSeverity;onDidTriggerButtonEmitter=this._register(new n);onDidHideEmitter=this._register(new n);onWillHideEmitter=this._register(new n);onDisposeEmitter=this._register(new n);visibleDisposables=this._register(new V);busyDelay;get title(){return this._title}set title(e){this._title=e,this.update()}get description(){return this._description}set description(e){this._description=e,this.update()}get widget(){return this._widget}set widget(e){u.isHTMLElement(e)&&this._widget!==e&&(this._widget=e,this._widgetUpdated=!0,this.update())}get step(){return this._steps}set step(e){this._steps=e,this.update()}get totalSteps(){return this._totalSteps}set totalSteps(e){this._totalSteps=e,this.update()}get enabled(){return this._enabled}set enabled(e){this._enabled=e,this.update()}get contextKey(){return this._contextKey}set contextKey(e){this._contextKey=e,this.update()}get busy(){return this._busy}set busy(e){this._busy=e,this.update()}get ignoreFocusOut(){return this._ignoreFocusOut}set ignoreFocusOut(e){const i=this._ignoreFocusOut!==e&&!S;this._ignoreFocusOut=e&&!S,i&&this.update()}get titleButtons(){return this._leftButtons.length?[...this._leftButtons,this._rightButtons]:this._rightButtons}get buttons(){return[...this._leftButtons,...this._rightButtons,...this._inlineButtons]}set buttons(e){this._leftButtons=e.filter(i=>i===M),this._rightButtons=e.filter(i=>i!==M&&i.location!==T.Inline),this._inlineButtons=e.filter(i=>i.location===T.Inline),this.buttonsUpdated=!0,this.update()}get toggles(){return this._toggles}set toggles(e){this._toggles=e??[],this.togglesUpdated=!0,this.update()}get validationMessage(){return this._validationMessage}set validationMessage(e){this._validationMessage=e,this.update()}get severity(){return this._severity}set severity(e){this._severity=e,this.update()}onDidTriggerButton=this.onDidTriggerButtonEmitter.event;show(){this.visible||(this.visibleDisposables.add(this.ui.onDidTriggerButton(e=>{this.buttons.indexOf(e)!==-1&&this.onDidTriggerButtonEmitter.fire(e)})),this.ui.show(this),this.visible=!0,this._lastValidationMessage=void 0,this._lastSeverity=void 0,this.buttons.length&&(this.buttonsUpdated=!0),this.toggles.length&&(this.togglesUpdated=!0),this.update())}hide(){this.visible&&this.ui.hide()}didHide(e=C.Other){this.visible=!1,this.visibleDisposables.clear(),this.onDidHideEmitter.fire({reason:e})}onDidHide=this.onDidHideEmitter.event;willHide(e=C.Other){this.onWillHideEmitter.fire({reason:e})}onWillHide=this.onWillHideEmitter.event;update(){if(!this.visible)return;const e=this.getTitle();e&&this.ui.title.textContent!==e?this.ui.title.textContent=e:!e&&this.ui.title.innerHTML!=="&nbsp;"&&(this.ui.title.innerText="\xA0");const i=this.getDescription();if(this.ui.description1.textContent!==i&&(this.ui.description1.textContent=i),this.ui.description2.textContent!==i&&(this.ui.description2.textContent=i),this._widgetUpdated&&(this._widgetUpdated=!1,this._widget?u.reset(this.ui.widget,this._widget):u.reset(this.ui.widget)),this.busy&&!this.busyDelay&&(this.busyDelay=new U,this.busyDelay.setIfNotSet(()=>{this.visible&&this.ui.progressBar.infinite()},800)),!this.busy&&this.busyDelay&&(this.ui.progressBar.stop(),this.busyDelay.cancel(),this.busyDelay=void 0),this.buttonsUpdated){this.buttonsUpdated=!1,this.ui.leftActionBar.clear();const o=this._leftButtons.map((a,g)=>B(a,`id-${g}`,async()=>this.onDidTriggerButtonEmitter.fire(a)));this.ui.leftActionBar.push(o,{icon:!0,label:!1}),this.ui.rightActionBar.clear();const r=this._rightButtons.map((a,g)=>B(a,`id-${g}`,async()=>this.onDidTriggerButtonEmitter.fire(a)));this.ui.rightActionBar.push(r,{icon:!0,label:!1}),this.ui.inlineActionBar.clear();const d=this._inlineButtons.map((a,g)=>B(a,`id-${g}`,async()=>this.onDidTriggerButtonEmitter.fire(a)));this.ui.inlineActionBar.push(d,{icon:!0,label:!1})}if(this.togglesUpdated){this.togglesUpdated=!1;const o=this.toggles?.filter(r=>r instanceof H)??[];this.ui.inputBox.toggles=o}this.ui.ignoreFocusOut=this.ignoreFocusOut,this.ui.setEnabled(this.enabled),this.ui.setContextKey(this.contextKey);const s=this.validationMessage||this.noValidationMessage;this._lastValidationMessage!==s&&(this._lastValidationMessage=s,u.reset(this.ui.message),z(s,this.ui.message,{callback:o=>{this.ui.linkOpenerDelegate(o)},disposables:this.visibleDisposables})),this._lastSeverity!==this.severity&&(this._lastSeverity=this.severity,this.showMessageDecoration(this.severity))}getTitle(){return this.title&&this.step?`${this.title} (${this.getSteps()})`:this.title?this.title:this.step?this.getSteps():""}getDescription(){return this.description||""}getSteps(){return this.step&&this.totalSteps?l("quickInput.steps","{0}/{1}",this.step,this.totalSteps):this.step?String(this.step):""}showMessageDecoration(e){if(this.ui.inputBox.showDecoration(e),e!==D.Ignore){const i=this.ui.inputBox.stylesForType(e);this.ui.message.style.color=i.foreground?`${i.foreground}`:"",this.ui.message.style.backgroundColor=i.background?`${i.background}`:"",this.ui.message.style.border=i.border?`1px solid ${i.border}`:"",this.ui.message.style.marginBottom="-2px"}else this.ui.message.style.color="",this.ui.message.style.backgroundColor="",this.ui.message.style.border="",this.ui.message.style.marginBottom=""}onDispose=this.onDisposeEmitter.event;dispose(){this.hide(),this.onDisposeEmitter.fire(),super.dispose()}}class L extends p{static DEFAULT_ARIA_LABEL=l("quickInputBox.ariaLabel","Type to narrow down results.");_value="";_ariaLabel;_placeholder;onDidChangeValueEmitter=this._register(new n);onWillAcceptEmitter=this._register(new n);onDidAcceptEmitter=this._register(new n);onDidCustomEmitter=this._register(new n);_items=[];itemsUpdated=!1;_canSelectMany=!1;_canAcceptInBackground=!1;_matchOnDescription=!1;_matchOnDetail=!1;_matchOnLabel=!0;_matchOnLabelMode="fuzzy";_sortByLabel=!0;_keepScrollPosition=!1;_itemActivation=c.FIRST;_activeItems=[];activeItemsUpdated=!1;activeItemsToConfirm=[];onDidChangeActiveEmitter=this._register(new n);_selectedItems=[];selectedItemsUpdated=!1;selectedItemsToConfirm=[];onDidChangeSelectionEmitter=this._register(new n);onDidTriggerItemButtonEmitter=this._register(new n);onDidTriggerSeparatorButtonEmitter=this._register(new n);_valueSelection;valueSelectionUpdated=!0;_ok="default";_customButton=!1;_customButtonLabel;_customButtonHover;_quickNavigate;_hideInput;_hideCountBadge;_hideCheckAll;_focusEventBufferer=new K;type=_.QuickPick;get quickNavigate(){return this._quickNavigate}set quickNavigate(t){this._quickNavigate=t,this.update()}get value(){return this._value}set value(t){this.doSetValue(t)}doSetValue(t,e){this._value!==t&&(this._value=t,e||this.update(),this.visible&&this.ui.list.filter(this.filterValue(this._value))&&this.trySelectFirst(),this.onDidChangeValueEmitter.fire(this._value))}filterValue=t=>t;set ariaLabel(t){this._ariaLabel=t,this.update()}get ariaLabel(){return this._ariaLabel}get placeholder(){return this._placeholder}set placeholder(t){this._placeholder=t,this.update()}onDidChangeValue=this.onDidChangeValueEmitter.event;onWillAccept=this.onWillAcceptEmitter.event;onDidAccept=this.onDidAcceptEmitter.event;onDidCustom=this.onDidCustomEmitter.event;get items(){return this._items}get scrollTop(){return this.ui.list.scrollTop}set scrollTop(t){this.ui.list.scrollTop=t}set items(t){this._items=t,this.itemsUpdated=!0,this.update()}get canSelectMany(){return this._canSelectMany}set canSelectMany(t){this._canSelectMany=t,this.update()}get canAcceptInBackground(){return this._canAcceptInBackground}set canAcceptInBackground(t){this._canAcceptInBackground=t}get matchOnDescription(){return this._matchOnDescription}set matchOnDescription(t){this._matchOnDescription=t,this.update()}get matchOnDetail(){return this._matchOnDetail}set matchOnDetail(t){this._matchOnDetail=t,this.update()}get matchOnLabel(){return this._matchOnLabel}set matchOnLabel(t){this._matchOnLabel=t,this.update()}get matchOnLabelMode(){return this._matchOnLabelMode}set matchOnLabelMode(t){this._matchOnLabelMode=t,this.update()}get sortByLabel(){return this._sortByLabel}set sortByLabel(t){this._sortByLabel=t,this.update()}get keepScrollPosition(){return this._keepScrollPosition}set keepScrollPosition(t){this._keepScrollPosition=t}get itemActivation(){return this._itemActivation}set itemActivation(t){this._itemActivation=t}get activeItems(){return this._activeItems}set activeItems(t){this._activeItems=t,this.activeItemsUpdated=!0,this.update()}onDidChangeActive=this.onDidChangeActiveEmitter.event;get selectedItems(){return this._selectedItems}set selectedItems(t){this._selectedItems=t,this.selectedItemsUpdated=!0,this.update()}get keyMods(){return this._quickNavigate?$:this.ui.keyMods}get valueSelection(){const t=this.ui.inputBox.getSelection();if(t)return[t.start,t.end]}set valueSelection(t){this._valueSelection=t,this.valueSelectionUpdated=!0,this.update()}get customButton(){return this._customButton}set customButton(t){this._customButton=t,this.update()}get customLabel(){return this._customButtonLabel}set customLabel(t){this._customButtonLabel=t,this.update()}get customHover(){return this._customButtonHover}set customHover(t){this._customButtonHover=t,this.update()}get ok(){return this._ok}set ok(t){this._ok=t,this.update()}inputHasFocus(){return this.visible?this.ui.inputBox.hasFocus():!1}focusOnInput(){this.ui.inputBox.setFocus()}get hideInput(){return!!this._hideInput}set hideInput(t){this._hideInput=t,this.update()}get hideCountBadge(){return!!this._hideCountBadge}set hideCountBadge(t){this._hideCountBadge=t,this.update()}get hideCheckAll(){return!!this._hideCheckAll}set hideCheckAll(t){this._hideCheckAll=t,this.update()}onDidChangeSelection=this.onDidChangeSelectionEmitter.event;onDidTriggerItemButton=this.onDidTriggerItemButtonEmitter.event;onDidTriggerSeparatorButton=this.onDidTriggerSeparatorButtonEmitter.event;trySelectFirst(){this.canSelectMany||this.ui.list.focus(v.First)}show(){this.visible||(this.visibleDisposables.add(this.ui.inputBox.onDidChange(t=>{this.doSetValue(t,!0)})),this.visibleDisposables.add(this.ui.onDidAccept(()=>{this.canSelectMany?this.ui.list.getCheckedElements().length||(this._selectedItems=[],this.onDidChangeSelectionEmitter.fire(this.selectedItems)):this.activeItems[0]&&(this._selectedItems=[this.activeItems[0]],this.onDidChangeSelectionEmitter.fire(this.selectedItems)),this.handleAccept(!1)})),this.visibleDisposables.add(this.ui.onDidCustom(()=>{this.onDidCustomEmitter.fire()})),this.visibleDisposables.add(this._focusEventBufferer.wrapEvent(this.ui.list.onDidChangeFocus,(t,e)=>e)(t=>{this.activeItemsUpdated||this.activeItemsToConfirm!==this._activeItems&&y(t,this._activeItems,(e,i)=>e===i)||(this._activeItems=t,this.onDidChangeActiveEmitter.fire(t))})),this.visibleDisposables.add(this.ui.list.onDidChangeSelection(({items:t,event:e})=>{if(this.canSelectMany){t.length&&this.ui.list.setSelectedElements([]);return}this.selectedItemsToConfirm!==this._selectedItems&&y(t,this._selectedItems,(i,s)=>i===s)||(this._selectedItems=t,this.onDidChangeSelectionEmitter.fire(t),t.length&&this.handleAccept(u.isMouseEvent(e)&&e.button===1))})),this.visibleDisposables.add(this.ui.list.onChangedCheckedElements(t=>{!this.canSelectMany||!this.visible||this.selectedItemsToConfirm!==this._selectedItems&&y(t,this._selectedItems,(e,i)=>e===i)||(this._selectedItems=t,this.onDidChangeSelectionEmitter.fire(t))})),this.visibleDisposables.add(this.ui.list.onButtonTriggered(t=>this.onDidTriggerItemButtonEmitter.fire(t))),this.visibleDisposables.add(this.ui.list.onSeparatorButtonTriggered(t=>this.onDidTriggerSeparatorButtonEmitter.fire(t))),this.visibleDisposables.add(this.registerQuickNavigation()),this.valueSelectionUpdated=!0),super.show()}handleAccept(t){let e=!1;this.onWillAcceptEmitter.fire({veto:()=>e=!0}),e||this.onDidAcceptEmitter.fire({inBackground:t})}registerQuickNavigation(){return u.addDisposableListener(this.ui.container,u.EventType.KEY_UP,t=>{if(this.canSelectMany||!this._quickNavigate)return;const e=new O(t),i=e.keyCode;this._quickNavigate.keybindings.some(r=>{const d=r.getChords();return d.length>1?!1:d[0].shiftKey&&i===m.Shift?!(e.ctrlKey||e.altKey||e.metaKey):!!(d[0].altKey&&i===m.Alt||d[0].ctrlKey&&i===m.Ctrl||d[0].metaKey&&i===m.Meta)})&&(this.activeItems[0]&&(this._selectedItems=[this.activeItems[0]],this.onDidChangeSelectionEmitter.fire(this.selectedItems),this.handleAccept(!1)),this._quickNavigate=void 0)})}update(){if(!this.visible)return;const t=this.keepScrollPosition?this.scrollTop:0,e=!!this.description,i={title:!!this.title||!!this.step||!!this.titleButtons.length,description:e,checkAll:this.canSelectMany&&!this._hideCheckAll,checkBox:this.canSelectMany,inputBox:!this._hideInput,progressBar:!this._hideInput||e,visibleCount:!0,count:this.canSelectMany&&!this._hideCountBadge,ok:this.ok==="default"?this.canSelectMany:this.ok,list:!0,message:!!this.validationMessage,customButton:this.customButton};this.ui.setVisibilities(i),super.update(),this.ui.inputBox.value!==this.value&&(this.ui.inputBox.value=this.value),this.valueSelectionUpdated&&(this.valueSelectionUpdated=!1,this.ui.inputBox.select(this._valueSelection&&{start:this._valueSelection[0],end:this._valueSelection[1]})),this.ui.inputBox.placeholder!==(this.placeholder||"")&&(this.ui.inputBox.placeholder=this.placeholder||"");let s=this.ariaLabel;!s&&i.inputBox&&(s=this.placeholder||L.DEFAULT_ARIA_LABEL,this.title&&(s+=` - ${this.title}`)),this.ui.list.ariaLabel!==s&&(this.ui.list.ariaLabel=s??null),this.ui.list.matchOnDescription=this.matchOnDescription,this.ui.list.matchOnDetail=this.matchOnDetail,this.ui.list.matchOnLabel=this.matchOnLabel,this.ui.list.matchOnLabelMode=this.matchOnLabelMode,this.ui.list.sortByLabel=this.sortByLabel,this.itemsUpdated&&(this.itemsUpdated=!1,this._focusEventBufferer.bufferEvents(()=>{switch(this.ui.list.setElements(this.items),this.ui.list.shouldLoop=!this.canSelectMany,this.ui.list.filter(this.filterValue(this.ui.inputBox.value)),this._itemActivation){case c.NONE:this._itemActivation=c.FIRST;break;case c.SECOND:this.ui.list.focus(v.Second),this._itemActivation=c.FIRST;break;case c.LAST:this.ui.list.focus(v.Last),this._itemActivation=c.FIRST;break;default:this.trySelectFirst();break}})),this.ui.container.classList.contains("show-checkboxes")!==!!this.canSelectMany&&(this.canSelectMany?this.ui.list.clearFocus():this.trySelectFirst()),this.activeItemsUpdated&&(this.activeItemsUpdated=!1,this.activeItemsToConfirm=this._activeItems,this.ui.list.setFocusedElements(this.activeItems),this.activeItemsToConfirm===this._activeItems&&(this.activeItemsToConfirm=null)),this.selectedItemsUpdated&&(this.selectedItemsUpdated=!1,this.selectedItemsToConfirm=this._selectedItems,this.canSelectMany?this.ui.list.setCheckedElements(this.selectedItems):this.ui.list.setSelectedElements(this.selectedItems),this.selectedItemsToConfirm===this._selectedItems&&(this.selectedItemsToConfirm=null)),this.ui.customButton.label=this.customLabel||"",this.ui.customButton.element.title=this.customHover||"",i.inputBox||(this.ui.list.domFocus(),this.canSelectMany&&this.ui.list.focus(v.First)),this.keepScrollPosition&&(this.scrollTop=t)}focus(t){this.ui.list.focus(t),this.canSelectMany&&this.ui.list.domFocus()}accept(t){t&&!this._canAcceptInBackground||this.activeItems[0]&&(this._selectedItems=[this.activeItems[0]],this.onDidChangeSelectionEmitter.fire(this.selectedItems),this.handleAccept(t??!1))}}class re extends p{_value="";_valueSelection;valueSelectionUpdated=!0;_placeholder;_password=!1;_prompt;onDidValueChangeEmitter=this._register(new n);onDidAcceptEmitter=this._register(new n);type=_.InputBox;get value(){return this._value}set value(t){this._value=t||"",this.update()}get valueSelection(){const t=this.ui.inputBox.getSelection();if(t)return[t.start,t.end]}set valueSelection(t){this._valueSelection=t,this.valueSelectionUpdated=!0,this.update()}get placeholder(){return this._placeholder}set placeholder(t){this._placeholder=t,this.update()}get password(){return this._password}set password(t){this._password=t,this.update()}get prompt(){return this._prompt}set prompt(t){this._prompt=t,this.noValidationMessage=t?l("inputModeEntryDescription","{0} (Press 'Enter' to confirm or 'Escape' to cancel)",t):p.noPromptMessage,this.update()}onDidChangeValue=this.onDidValueChangeEmitter.event;onDidAccept=this.onDidAcceptEmitter.event;show(){this.visible||(this.visibleDisposables.add(this.ui.inputBox.onDidChange(t=>{t!==this.value&&(this._value=t,this.onDidValueChangeEmitter.fire(t))})),this.visibleDisposables.add(this.ui.onDidAccept(()=>this.onDidAcceptEmitter.fire())),this.valueSelectionUpdated=!0),super.show()}update(){if(!this.visible)return;this.ui.container.classList.remove("hidden-input");const t={title:!!this.title||!!this.step||!!this.titleButtons.length,description:!!this.description||!!this.step,inputBox:!0,message:!0,progressBar:!0};this.ui.setVisibilities(t),super.update(),this.ui.inputBox.value!==this.value&&(this.ui.inputBox.value=this.value),this.valueSelectionUpdated&&(this.valueSelectionUpdated=!1,this.ui.inputBox.select(this._valueSelection&&{start:this._valueSelection[0],end:this._valueSelection[1]})),this.ui.inputBox.placeholder!==(this.placeholder||"")&&(this.ui.inputBox.placeholder=this.placeholder||""),this.ui.inputBox.password!==this.password&&(this.ui.inputBox.password=this.password)}}class ae extends p{type=_.QuickWidget;update(){if(!this.visible)return;const t={title:!!this.title||!!this.step||!!this.titleButtons.length,description:!!this.description||!!this.step};this.ui.setVisibilities(t),super.update()}}let f=class extends R{constructor(t,e){super("element",!1,i=>this.getOverrideOptions(i),t,e)}getOverrideOptions(t){const e=(u.isHTMLElement(t.content)?t.content.textContent??"":typeof t.content=="string"?t.content:t.content.value).includes(`
`);return{persistence:{hideOnKeyDown:!1},appearance:{showHoverHint:e,skipFadeInAnimation:!0}}}};f=k([b(0,N),b(1,W)],f);export{ne as EndOfQuickInputBoxContextKey,ee as InQuickInputContextKey,re as InputBox,f as QuickInputHoverDelegate,se as QuickInputTypeContextKey,L as QuickPick,ae as QuickWidget,M as backButton,oe as endOfQuickInputBoxContext,A as endOfQuickInputBoxContextKeyValue,ie as inQuickInputContext,x as inQuickInputContextKeyValue,G as quickInputTypeContextKeyValue};
