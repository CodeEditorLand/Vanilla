var ee=Object.defineProperty;var te=Object.getOwnPropertyDescriptor;var W=(S,f,t,e)=>{for(var a=e>1?void 0:e?te(f,t):f,o=S.length-1,c;o>=0;o--)(c=S[o])&&(a=(e?c(f,t,a):c(a))||a);return e&&a&&ee(f,t,a),a},D=(S,f)=>(t,e)=>f(t,e,S);import*as n from"../../../base/browser/dom.js";import{ActionBar as Q}from"../../../base/browser/ui/actionbar/actionbar.js";import{Button as N}from"../../../base/browser/ui/button/button.js";import{CountBadge as $}from"../../../base/browser/ui/countBadge/countBadge.js";import{ProgressBar as ie}from"../../../base/browser/ui/progressbar/progressbar.js";import{mainWindow as ne}from"../../../base/browser/window.js";import{CancellationToken as G}from"../../../base/common/cancellation.js";import{Emitter as B,Event as R}from"../../../base/common/event.js";import{KeyCode as L}from"../../../base/common/keyCodes.js";import{Disposable as se,dispose as j}from"../../../base/common/lifecycle.js";import T from"../../../base/common/severity.js";import{isString as q}from"../../../base/common/types.js";import{localize as v}from"../../../nls.js";import{IContextKeyService as oe}from"../../contextkey/common/contextkey.js";import{IInstantiationService as re}from"../../instantiation/common/instantiation.js";import{ILayoutService as ae}from"../../layout/browser/layoutService.js";import{QuickInputHideReason as Y,QuickPickFocus as X}from"../common/quickInput.js";import{EndOfQuickInputBoxContextKey as ce,InQuickInputContextKey as le,InputBox as ue,QuickInputTypeContextKey as de,QuickPick as E,QuickWidget as pe,backButton as z}from"./quickInput.js";import{QuickInputBox as he}from"./quickInputBox.js";import{QuickInputTree as ye}from"./quickInputTree.js";import"./quickInputActions.js";const h=n.$;let C=class extends se{constructor(t,e,a,o){super();this.options=t;this.layoutService=e;this.instantiationService=a;this.contextKeyService=o;this.idPrefix=t.idPrefix,this._container=t.container,this.styles=t.styles,this._register(R.runAndSubscribe(n.onDidRegisterWindow,({window:c,disposables:l})=>this.registerKeyModsListeners(c,l),{window:ne,disposables:this._store})),this._register(n.onWillUnregisterWindow(c=>{this.ui&&n.getWindow(this.ui.container)===c&&(this.reparentUI(this.layoutService.mainContainer),this.layout(this.layoutService.mainContainerDimension,this.layoutService.mainContainerOffset.quickPickTop))}))}static MAX_WIDTH=600;idPrefix;ui;dimension;titleBarOffset;enabled=!0;onDidAcceptEmitter=this._register(new B);onDidCustomEmitter=this._register(new B);onDidTriggerButtonEmitter=this._register(new B);keyMods={ctrlCmd:!1,alt:!1};controller=null;get currentQuickInput(){return this.controller??void 0}_container;get container(){return this._container}styles;onShowEmitter=this._register(new B);onShow=this.onShowEmitter.event;onHideEmitter=this._register(new B);onHide=this.onHideEmitter.event;previousFocusElement;inQuickInputContext=le.bindTo(this.contextKeyService);quickInputTypeContext=de.bindTo(this.contextKeyService);endOfQuickInputBoxContext=ce.bindTo(this.contextKeyService);registerKeyModsListeners(t,e){const a=o=>{this.keyMods.ctrlCmd=o.ctrlKey||o.metaKey,this.keyMods.alt=o.altKey};for(const o of[n.EventType.KEY_DOWN,n.EventType.KEY_UP,n.EventType.MOUSE_DOWN])e.add(n.addDisposableListener(t,o,a,!0))}getUI(t){if(this.ui)return t&&n.getWindow(this._container)!==n.getWindow(this.layoutService.activeContainer)&&(this.reparentUI(this.layoutService.activeContainer),this.layout(this.layoutService.activeContainerDimension,this.layoutService.activeContainerOffset.quickPickTop)),this.ui;const e=n.append(this._container,h(".quick-input-widget.show-file-icons"));e.tabIndex=-1,e.style.display="none";const a=n.createStyleSheet(e),o=n.append(e,h(".quick-input-titlebar")),c=this._register(new Q(o,{hoverDelegate:this.options.hoverDelegate}));c.domNode.classList.add("quick-input-left-action-bar");const l=n.append(o,h(".quick-input-title")),i=this._register(new Q(o,{hoverDelegate:this.options.hoverDelegate}));i.domNode.classList.add("quick-input-right-action-bar");const d=n.append(e,h(".quick-input-header")),y=n.append(d,h("input.quick-input-check-all"));y.type="checkbox",y.setAttribute("aria-label",v("quickInput.checkAll","Toggle all checkboxes")),this._register(n.addStandardDisposableListener(y,n.EventType.CHANGE,s=>{const p=y.checked;m.setAllVisibleChecked(p)})),this._register(n.addDisposableListener(y,n.EventType.CLICK,s=>{(s.x||s.y)&&k.setFocus()}));const r=n.append(d,h(".quick-input-description")),u=n.append(d,h(".quick-input-and-message")),g=n.append(u,h(".quick-input-filter")),k=this._register(new he(g,this.styles.inputBox,this.styles.toggle));k.setAttribute("aria-describedby",`${this.idPrefix}message`);const b=n.append(g,h(".quick-input-visible-count"));b.setAttribute("aria-live","polite"),b.setAttribute("aria-atomic","true");const w=new $(b,{countFormat:v({key:"quickInput.visibleCount",comment:["This tells the user how many items are shown in a list of items to select from. The items can be anything. Currently not visible, but read by screen readers."]},"{0} Results")},this.styles.countBadge),x=n.append(g,h(".quick-input-count"));x.setAttribute("aria-live","polite");const _=new $(x,{countFormat:v({key:"quickInput.countSelected",comment:["This tells the user how many items are selected in a list of items to select from. The items can be anything."]},"{0} Selected")},this.styles.countBadge),F=this._register(new Q(d,{hoverDelegate:this.options.hoverDelegate}));F.domNode.classList.add("quick-input-inline-action-bar");const K=n.append(d,h(".quick-input-action")),A=this._register(new N(K,this.styles.button));A.label=v("ok","OK"),this._register(A.onDidClick(s=>{this.onDidAcceptEmitter.fire()}));const M=n.append(d,h(".quick-input-action")),O=this._register(new N(M,{...this.styles.button,supportIcons:!0}));O.label=v("custom","Custom"),this._register(O.onDidClick(s=>{this.onDidCustomEmitter.fire()}));const J=n.append(u,h(`#${this.idPrefix}message.quick-input-message`)),U=this._register(new ie(e,this.styles.progressBar));U.getContainer().classList.add("quick-input-progress");const P=n.append(e,h(".quick-input-html-widget"));P.tabIndex=-1;const Z=n.append(e,h(".quick-input-description")),H=this.idPrefix+"list",m=this._register(this.instantiationService.createInstance(ye,e,this.options.hoverDelegate,this.options.linkOpenerDelegate,H));k.setAttribute("aria-controls",H),this._register(m.onDidChangeFocus(()=>{k.setAttribute("aria-activedescendant",m.getActiveDescendant()??"")})),this._register(m.onChangedAllVisibleChecked(s=>{y.checked=s})),this._register(m.onChangedVisibleCount(s=>{w.setCount(s)})),this._register(m.onChangedCheckedCount(s=>{_.setCount(s)})),this._register(m.onLeave(()=>{setTimeout(()=>{this.controller&&(k.setFocus(),this.controller instanceof E&&this.controller.canSelectMany&&m.clearFocus())},0)}));const V=n.trackFocus(e);return this._register(V),this._register(n.addDisposableListener(e,n.EventType.FOCUS,s=>{const p=this.getUI();if(n.isAncestor(s.relatedTarget,p.inputContainer)){const I=p.inputBox.isSelectionAtEnd();this.endOfQuickInputBoxContext.get()!==I&&this.endOfQuickInputBoxContext.set(I)}n.isAncestor(s.relatedTarget,p.container)||(this.inQuickInputContext.set(!0),this.previousFocusElement=n.isHTMLElement(s.relatedTarget)?s.relatedTarget:void 0)},!0)),this._register(V.onDidBlur(()=>{!this.getUI().ignoreFocusOut&&!this.options.ignoreFocusOut()&&this.hide(Y.Blur),this.inQuickInputContext.set(!1),this.endOfQuickInputBoxContext.set(!1),this.previousFocusElement=void 0})),this._register(k.onKeyDown(s=>{const p=this.getUI().inputBox.isSelectionAtEnd();this.endOfQuickInputBoxContext.get()!==p&&this.endOfQuickInputBoxContext.set(p)})),this._register(n.addDisposableListener(e,n.EventType.FOCUS,s=>{k.setFocus()})),this._register(n.addStandardDisposableListener(e,n.EventType.KEY_DOWN,s=>{if(!n.isAncestor(s.target,P))switch(s.keyCode){case L.Enter:n.EventHelper.stop(s,!0),this.enabled&&this.onDidAcceptEmitter.fire();break;case L.Escape:n.EventHelper.stop(s,!0),this.hide(Y.Gesture);break;case L.Tab:if(!s.altKey&&!s.ctrlKey&&!s.metaKey){const p=[".quick-input-list .monaco-action-bar .always-visible",".quick-input-list-entry:hover .monaco-action-bar",".monaco-list-row.focused .monaco-action-bar"];if(e.classList.contains("show-checkboxes")?p.push("input"):p.push("input[type=text]"),this.getUI().list.displayed&&p.push(".monaco-list"),this.getUI().message&&p.push(".quick-input-message a"),this.getUI().widget){if(n.isAncestor(s.target,this.getUI().widget))break;p.push(".quick-input-html-widget")}const I=e.querySelectorAll(p.join(", "));s.shiftKey&&s.target===I[0]?(n.EventHelper.stop(s,!0),m.clearFocus()):!s.shiftKey&&n.isAncestor(s.target,I[I.length-1])&&(n.EventHelper.stop(s,!0),I[0].focus())}break;case L.Space:s.ctrlKey&&(n.EventHelper.stop(s,!0),this.getUI().list.toggleHover());break}})),this.ui={container:e,styleSheet:a,leftActionBar:c,titleBar:o,title:l,description1:Z,description2:r,widget:P,rightActionBar:i,inlineActionBar:F,checkAll:y,inputContainer:u,filterContainer:g,inputBox:k,visibleCountContainer:b,visibleCount:w,countContainer:x,count:_,okContainer:K,ok:A,message:J,customButtonContainer:M,customButton:O,list:m,progressBar:U,onDidAccept:this.onDidAcceptEmitter.event,onDidCustom:this.onDidCustomEmitter.event,onDidTriggerButton:this.onDidTriggerButtonEmitter.event,ignoreFocusOut:!1,keyMods:this.keyMods,show:s=>this.show(s),hide:()=>this.hide(),setVisibilities:s=>this.setVisibilities(s),setEnabled:s=>this.setEnabled(s),setContextKey:s=>this.options.setContextKey(s),linkOpenerDelegate:s=>this.options.linkOpenerDelegate(s)},this.updateStyles(),this.ui}reparentUI(t){this.ui&&(this._container=t,n.append(this._container,this.ui.container))}pick(t,e={},a=G.None){return new Promise((o,c)=>{let l=r=>{l=o,e.onKeyMods?.(i.keyMods),o(r)};if(a.isCancellationRequested){l(void 0);return}const i=this.createQuickPick({useSeparators:!0});let d;const y=[i,i.onDidAccept(()=>{if(i.canSelectMany)l(i.selectedItems.slice()),i.hide();else{const r=i.activeItems[0];r&&(l(r),i.hide())}}),i.onDidChangeActive(r=>{const u=r[0];u&&e.onDidFocus&&e.onDidFocus(u)}),i.onDidChangeSelection(r=>{if(!i.canSelectMany){const u=r[0];u&&(l(u),i.hide())}}),i.onDidTriggerItemButton(r=>e.onDidTriggerItemButton&&e.onDidTriggerItemButton({...r,removeItem:()=>{const u=i.items.indexOf(r.item);if(u!==-1){const g=i.items.slice(),k=g.splice(u,1),b=i.activeItems.filter(x=>x!==k[0]),w=i.keepScrollPosition;i.keepScrollPosition=!0,i.items=g,b&&(i.activeItems=b),i.keepScrollPosition=w}}})),i.onDidTriggerSeparatorButton(r=>e.onDidTriggerSeparatorButton?.(r)),i.onDidChangeValue(r=>{d&&!r&&(i.activeItems.length!==1||i.activeItems[0]!==d)&&(i.activeItems=[d])}),a.onCancellationRequested(()=>{i.hide()}),i.onDidHide(()=>{j(y),l(void 0)})];i.title=e.title,e.value&&(i.value=e.value),i.canSelectMany=!!e.canPickMany,i.placeholder=e.placeHolder,i.ignoreFocusOut=!!e.ignoreFocusLost,i.matchOnDescription=!!e.matchOnDescription,i.matchOnDetail=!!e.matchOnDetail,i.matchOnLabel=e.matchOnLabel===void 0||e.matchOnLabel,i.quickNavigate=e.quickNavigate,i.hideInput=!!e.hideInput,i.contextKey=e.contextKey,i.busy=!0,Promise.all([t,e.activeItem]).then(([r,u])=>{d=u,i.busy=!1,i.items=r,i.canSelectMany&&(i.selectedItems=r.filter(g=>g.type!=="separator"&&g.picked)),d&&(i.activeItems=[d])}),i.show(),Promise.resolve(t).then(void 0,r=>{c(r),i.hide()})})}setValidationOnInput(t,e){e&&q(e)?(t.severity=T.Error,t.validationMessage=e):e&&!q(e)?(t.severity=e.severity,t.validationMessage=e.content):(t.severity=T.Ignore,t.validationMessage=void 0)}input(t={},e=G.None){return new Promise(a=>{if(e.isCancellationRequested){a(void 0);return}const o=this.createInputBox(),c=t.validateInput||(()=>Promise.resolve(void 0)),l=R.debounce(o.onDidChangeValue,(r,u)=>u,100);let i=t.value||"",d=Promise.resolve(c(i));const y=[o,l(r=>{r!==i&&(d=Promise.resolve(c(r)),i=r),d.then(u=>{r===i&&this.setValidationOnInput(o,u)})}),o.onDidAccept(()=>{const r=o.value;r!==i&&(d=Promise.resolve(c(r)),i=r),d.then(u=>{!u||!q(u)&&u.severity!==T.Error?(a(r),o.hide()):r===i&&this.setValidationOnInput(o,u)})}),e.onCancellationRequested(()=>{o.hide()}),o.onDidHide(()=>{j(y),a(void 0)})];o.title=t.title,o.value=t.value||"",o.valueSelection=t.valueSelection,o.prompt=t.prompt,o.placeholder=t.placeHolder,o.password=!!t.password,o.ignoreFocusOut=!!t.ignoreFocusLost,o.show()})}backButton=z;createQuickPick(t={useSeparators:!1}){const e=this.getUI(!0);return new E(e)}createInputBox(){const t=this.getUI(!0);return new ue(t)}createQuickWidget(){const t=this.getUI(!0);return new pe(t)}show(t){const e=this.getUI(!0);this.onShowEmitter.fire();const a=this.controller;this.controller=t,a?.didHide(),this.setEnabled(!0),e.leftActionBar.clear(),e.title.textContent="",e.description1.textContent="",e.description2.textContent="",n.reset(e.widget),e.rightActionBar.clear(),e.inlineActionBar.clear(),e.checkAll.checked=!1,e.inputBox.placeholder="",e.inputBox.password=!1,e.inputBox.showDecoration(T.Ignore),e.visibleCount.setCount(0),e.count.setCount(0),n.reset(e.message),e.progressBar.stop(),e.list.setElements([]),e.list.matchOnDescription=!1,e.list.matchOnDetail=!1,e.list.matchOnLabel=!0,e.list.sortByLabel=!0,e.ignoreFocusOut=!1,e.inputBox.toggles=void 0;const o=this.options.backKeybindingLabel();z.tooltip=o?v("quickInput.backWithKeybinding","Back ({0})",o):v("quickInput.back","Back"),e.container.style.display="",this.updateLayout(),e.inputBox.setFocus(),this.quickInputTypeContext.set(t.type)}isVisible(){return!!this.ui&&this.ui.container.style.display!=="none"}setVisibilities(t){const e=this.getUI();e.title.style.display=t.title?"":"none",e.description1.style.display=t.description&&(t.inputBox||t.checkAll)?"":"none",e.description2.style.display=t.description&&!(t.inputBox||t.checkAll)?"":"none",e.checkAll.style.display=t.checkAll?"":"none",e.inputContainer.style.display=t.inputBox?"":"none",e.filterContainer.style.display=t.inputBox?"":"none",e.visibleCountContainer.style.display=t.visibleCount?"":"none",e.countContainer.style.display=t.count?"":"none",e.okContainer.style.display=t.ok?"":"none",e.customButtonContainer.style.display=t.customButton?"":"none",e.message.style.display=t.message?"":"none",e.progressBar.getContainer().style.display=t.progressBar?"":"none",e.list.displayed=!!t.list,e.container.classList.toggle("show-checkboxes",!!t.checkBox),e.container.classList.toggle("hidden-input",!t.inputBox&&!t.description),this.updateLayout()}setEnabled(t){if(t!==this.enabled){this.enabled=t;for(const e of this.getUI().leftActionBar.viewItems)e.action.enabled=t;for(const e of this.getUI().rightActionBar.viewItems)e.action.enabled=t;this.getUI().checkAll.disabled=!t,this.getUI().inputBox.enabled=t,this.getUI().ok.enabled=t,this.getUI().list.enabled=t}}hide(t){const e=this.controller;if(!e)return;e.willHide(t);const a=this.ui?.container,o=a&&!n.isAncestorOfActiveElement(a);if(this.controller=null,this.onHideEmitter.fire(),a&&(a.style.display="none"),!o){let c=this.previousFocusElement;for(;c&&!c.offsetParent;)c=c.parentElement??void 0;c?.offsetParent?(c.focus(),this.previousFocusElement=void 0):this.options.returnFocus()}e.didHide(t)}focus(){if(this.isVisible()){const t=this.getUI();t.inputBox.enabled?t.inputBox.setFocus():t.list.domFocus()}}toggle(){this.isVisible()&&this.controller instanceof E&&this.controller.canSelectMany&&this.getUI().list.toggleCheckbox()}navigate(t,e){this.isVisible()&&this.getUI().list.displayed&&(this.getUI().list.focus(t?X.Next:X.Previous),e&&this.controller instanceof E&&(this.controller.quickNavigate=e))}async accept(t={alt:!1,ctrlCmd:!1}){this.keyMods.alt=t.alt,this.keyMods.ctrlCmd=t.ctrlCmd,this.onDidAcceptEmitter.fire()}async back(){this.onDidTriggerButtonEmitter.fire(this.backButton)}async cancel(){this.hide()}layout(t,e){this.dimension=t,this.titleBarOffset=e,this.updateLayout()}updateLayout(){if(this.ui&&this.isVisible()){this.ui.container.style.top=`${this.titleBarOffset}px`;const t=this.ui.container.style,e=Math.min(this.dimension.width*.62,C.MAX_WIDTH);t.width=e+"px",t.marginLeft="-"+e/2+"px",this.ui.inputBox.layout(),this.ui.list.layout(this.dimension&&this.dimension.height*.4)}}applyStyles(t){this.styles=t,this.updateStyles()}updateStyles(){if(this.ui){const{quickInputTitleBackground:t,quickInputBackground:e,quickInputForeground:a,widgetBorder:o,widgetShadow:c}=this.styles.widget;this.ui.titleBar.style.backgroundColor=t??"",this.ui.container.style.backgroundColor=e??"",this.ui.container.style.color=a??"",this.ui.container.style.border=o?`1px solid ${o}`:"",this.ui.container.style.boxShadow=c?`0 0 8px 2px ${c}`:"",this.ui.list.style(this.styles.list);const l=[];this.styles.pickerGroup.pickerGroupBorder&&l.push(`.quick-input-list .quick-input-list-entry { border-top-color:  ${this.styles.pickerGroup.pickerGroupBorder}; }`),this.styles.pickerGroup.pickerGroupForeground&&l.push(`.quick-input-list .quick-input-list-separator { color:  ${this.styles.pickerGroup.pickerGroupForeground}; }`),this.styles.pickerGroup.pickerGroupForeground&&l.push(".quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }"),(this.styles.keybindingLabel.keybindingLabelBackground||this.styles.keybindingLabel.keybindingLabelBorder||this.styles.keybindingLabel.keybindingLabelBottomBorder||this.styles.keybindingLabel.keybindingLabelShadow||this.styles.keybindingLabel.keybindingLabelForeground)&&(l.push(".quick-input-list .monaco-keybinding > .monaco-keybinding-key {"),this.styles.keybindingLabel.keybindingLabelBackground&&l.push(`background-color: ${this.styles.keybindingLabel.keybindingLabelBackground};`),this.styles.keybindingLabel.keybindingLabelBorder&&l.push(`border-color: ${this.styles.keybindingLabel.keybindingLabelBorder};`),this.styles.keybindingLabel.keybindingLabelBottomBorder&&l.push(`border-bottom-color: ${this.styles.keybindingLabel.keybindingLabelBottomBorder};`),this.styles.keybindingLabel.keybindingLabelShadow&&l.push(`box-shadow: inset 0 -1px 0 ${this.styles.keybindingLabel.keybindingLabelShadow};`),this.styles.keybindingLabel.keybindingLabelForeground&&l.push(`color: ${this.styles.keybindingLabel.keybindingLabelForeground};`),l.push("}"));const i=l.join(`
`);i!==this.ui.styleSheet.textContent&&(this.ui.styleSheet.textContent=i)}}};C=W([D(1,ae),D(2,re),D(3,oe)],C);export{C as QuickInputController};
