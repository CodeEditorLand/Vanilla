var H=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var b=(s,n,e,t)=>{for(var i=t>1?void 0:t?W(n,e):n,o=s.length-1,r;o>=0;o--)(r=s[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&H(n,e,i),i},l=(s,n)=>(e,t)=>n(e,t,s);import{$ as w,EventType as k,ModifierKeyEmitter as L,addDisposableListener as _,append as D,asCSSUrl as S,prepend as j}from"../../../base/browser/dom.js";import{StandardKeyboardEvent as E}from"../../../base/browser/keyboardEvent.js";import{ActionViewItem as $,BaseActionViewItem as q,SelectActionViewItem as Y}from"../../../base/browser/ui/actionbar/actionViewItems.js";import{DropdownMenuActionViewItem as O}from"../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import{ActionRunner as T,Separator as M,SubmenuAction as U}from"../../../base/common/actions.js";import{KeyCode as V}from"../../../base/common/keyCodes.js";import{UILabelProvider as J}from"../../../base/common/keybindingLabels.js";import{MutableDisposable as Q,combinedDisposable as X,toDisposable as R}from"../../../base/common/lifecycle.js";import{OS as Z,isLinux as ee,isWindows as te}from"../../../base/common/platform.js";import"./menuEntryActionViewItem.css";import{ThemeIcon as g}from"../../../base/common/themables.js";import{assertType as ne}from"../../../base/common/types.js";import{localize as h}from"../../../nls.js";import{IAccessibilityService as ie}from"../../accessibility/common/accessibility.js";import{isICommandActionToggleInfo as oe}from"../../action/common/action.js";import{IContextKeyService as re}from"../../contextkey/common/contextkey.js";import{IContextMenuService as C,IContextViewService as se}from"../../contextview/browser/contextView.js";import{IInstantiationService as ce}from"../../instantiation/common/instantiation.js";import{IKeybindingService as x}from"../../keybinding/common/keybinding.js";import{INotificationService as P}from"../../notification/common/notification.js";import{IStorageService as ae,StorageScope as G,StorageTarget as de}from"../../storage/common/storage.js";import{defaultSelectBoxStyles as le}from"../../theme/browser/defaultStyles.js";import{asCssVariable as ue,selectBorder as me}from"../../theme/common/colorRegistry.js";import{isDark as N}from"../../theme/common/theme.js";import{IThemeService as B}from"../../theme/common/themeService.js";import{IMenuService as pe,MenuItemAction as K,SubmenuItemAction as Ae}from"../common/actions.js";function Fe(s,n,e,t){let i,o,r;if(Array.isArray(s))r=s,i=n,o=e;else{const a=n;r=s.getActions(a),i=e,o=t}const c=L.getInstance(),u=c.keyStatus.altKey||(te||ee)&&c.keyStatus.shiftKey;z(r,i,u,o?a=>a===o:a=>a==="navigation")}function He(s,n,e,t,i,o){let r,c,u,a,m;if(Array.isArray(s))m=s,r=n,c=e,u=t,a=i;else{const d=n;m=s.getActions(d),r=e,c=t,u=i,a=o}z(m,r,!1,typeof c=="string"?d=>d===c:c,u,a)}function z(s,n,e,t=r=>r==="navigation",i=()=>!1,o=!1){let r,c;Array.isArray(n)?(r=n,c=n):(r=n.primary,c=n.secondary);const u=new Set;for(const[a,m]of s){let p;t(a)?(p=r,p.length>0&&o&&p.push(new M)):(p=c,p.length>0&&p.push(new M));for(let d of m){e&&(d=d instanceof K&&d.alt?d.alt:d);const A=p.push(d);d instanceof U&&u.add({group:a,action:d,index:A-1})}}for(const{group:a,action:m,index:p}of u){const d=t(a)?r:c,A=m.actions;i(m,a,d.length)&&d.splice(p,1,...A)}}let I=class extends ${constructor(e,t,i,o,r,c,u,a){super(void 0,e,{icon:!!(e.class||e.item.icon),label:!e.class&&!e.item.icon,draggable:t?.draggable,keybinding:t?.keybinding,hoverDelegate:t?.hoverDelegate});this._options=t;this._keybindingService=i;this._notificationService=o;this._contextKeyService=r;this._themeService=c;this._contextMenuService=u;this._accessibilityService=a;this._altKey=L.getInstance()}_wantsAltCommand=!1;_itemClassDispose=this._register(new Q);_altKey;get _menuItemAction(){return this._action}get _commandAction(){return this._wantsAltCommand&&this._menuItemAction.alt||this._menuItemAction}async onClick(e){e.preventDefault(),e.stopPropagation();try{await this.actionRunner.run(this._commandAction,this._context)}catch(t){this._notificationService.error(t)}}render(e){if(super.render(e),e.classList.add("menu-entry"),this.options.icon&&this._updateItemClass(this._menuItemAction.item),this._menuItemAction.alt){let t=!1;const i=()=>{const o=!!this._menuItemAction.alt?.enabled&&(!this._accessibilityService.isMotionReduced()||t)&&(this._altKey.keyStatus.altKey||this._altKey.keyStatus.shiftKey&&t);o!==this._wantsAltCommand&&(this._wantsAltCommand=o,this.updateLabel(),this.updateTooltip(),this.updateClass())};this._register(this._altKey.event(i)),this._register(_(e,"mouseleave",o=>{t=!1,i()})),this._register(_(e,"mouseenter",o=>{t=!0,i()})),i()}}updateLabel(){this.options.label&&this.label&&(this.label.textContent=this._commandAction.label)}getTooltip(){const e=this._keybindingService.lookupKeybinding(this._commandAction.id,this._contextKeyService),t=e&&e.getLabel(),i=this._commandAction.tooltip||this._commandAction.label;let o=t?h("titleAndKb","{0} ({1})",i,t):i;if(!this._wantsAltCommand&&this._menuItemAction.alt?.enabled){const r=this._menuItemAction.alt.tooltip||this._menuItemAction.alt.label,c=this._keybindingService.lookupKeybinding(this._menuItemAction.alt.id,this._contextKeyService),u=c&&c.getLabel(),a=u?h("titleAndKb","{0} ({1})",r,u):r;o=h("titleAndKbAndAlt",`{0}
[{1}] {2}`,o,J.modifierLabels[Z].altKey,a)}return o}updateClass(){this.options.icon&&(this._commandAction!==this._menuItemAction?this._menuItemAction.alt&&this._updateItemClass(this._menuItemAction.alt.item):this._updateItemClass(this._menuItemAction.item))}_updateItemClass(e){this._itemClassDispose.value=void 0;const{element:t,label:i}=this;if(!t||!i)return;const o=this._commandAction.checked&&oe(e.toggled)&&e.toggled.icon?e.toggled.icon:e.icon;if(o)if(g.isThemeIcon(o)){const r=g.asClassNameArray(o);i.classList.add(...r),this._itemClassDispose.value=R(()=>{i.classList.remove(...r)})}else i.style.backgroundImage=N(this._themeService.getColorTheme().type)?S(o.dark):S(o.light),i.classList.add("icon"),this._itemClassDispose.value=X(R(()=>{i.style.backgroundImage="",i.classList.remove("icon")}),this._themeService.onDidColorThemeChange(()=>{this.updateClass()}))}};I=b([l(2,x),l(3,P),l(4,re),l(5,B),l(6,C),l(7,ie)],I);class F extends I{render(n){this.options.label=!0,this.options.icon=!1,super.render(n),n.classList.add("text-only"),n.classList.toggle("use-comma",this._options?.useComma??!1)}updateLabel(){const n=this._keybindingService.lookupKeybinding(this._action.id,this._contextKeyService);if(!n)return super.updateLabel();if(this.label){const e=F._symbolPrintEnter(n);this._options?.conversational?this.label.textContent=h({key:"content2",comment:['A label with keybindg like "ESC to dismiss"']},"{1} to {0}",this._action.label,e):this.label.textContent=h({key:"content",comment:["A label","A keybinding"]},"{0} ({1})",this._action.label,e)}}static _symbolPrintEnter(n){return n.getLabel()?.replace(/\benter\b/gi,"\u23CE").replace(/\bEscape\b/gi,"Esc")}}let f=class extends O{constructor(e,t,i,o,r){const c={...t,menuAsChild:t?.menuAsChild??!1,classNames:t?.classNames??(g.isThemeIcon(e.item.icon)?g.asClassName(e.item.icon):void 0),keybindingProvider:t?.keybindingProvider??(u=>i.lookupKeybinding(u.id))};super(e,{getActions:()=>e.actions},o,c);this._keybindingService=i;this._contextMenuService=o;this._themeService=r}render(e){super.render(e),ne(this.element),e.classList.add("menu-entry");const t=this._action,{icon:i}=t.item;if(i&&!g.isThemeIcon(i)){this.element.classList.add("icon");const o=()=>{this.element&&(this.element.style.backgroundImage=N(this._themeService.getColorTheme().type)?S(i.dark):S(i.light))};o(),this._register(this._themeService.onDidColorThemeChange(()=>{o()}))}}};f=b([l(2,x),l(3,C),l(4,B)],f);let y=class extends q{constructor(e,t,i,o,r,c,u,a){super(null,e);this._keybindingService=i;this._notificationService=o;this._contextMenuService=r;this._menuService=c;this._instaService=u;this._storageService=a;this._options=t,this._storageKey=`${e.item.submenu.id}_lastActionId`;let m;const p=t?.persistLastActionId?a.get(this._storageKey,G.WORKSPACE):void 0;p&&(m=e.actions.find(A=>p===A.id)),m||(m=e.actions[0]),this._defaultAction=this._instaService.createInstance(I,m,{keybinding:this._getDefaultActionKeybindingLabel(m)});const d={keybindingProvider:A=>this._keybindingService.lookupKeybinding(A.id),...t,menuAsChild:t?.menuAsChild??!0,classNames:t?.classNames??["codicon","codicon-chevron-down"],actionRunner:t?.actionRunner??new T};this._dropdown=new O(e,e.actions,this._contextMenuService,d),this._register(this._dropdown.actionRunner.onDidRun(A=>{A.action instanceof K&&this.update(A.action)}))}_options;_defaultAction;_dropdown;_container=null;_storageKey;get onDidChangeDropdownVisibility(){return this._dropdown.onDidChangeVisibility}update(e){this._options?.persistLastActionId&&this._storageService.store(this._storageKey,e.id,G.WORKSPACE,de.MACHINE),this._defaultAction.dispose(),this._defaultAction=this._instaService.createInstance(I,e,{keybinding:this._getDefaultActionKeybindingLabel(e)}),this._defaultAction.actionRunner=new class extends T{async runAction(t,i){await t.run(void 0)}},this._container&&this._defaultAction.render(j(this._container,w(".action-container")))}_getDefaultActionKeybindingLabel(e){let t;if(this._options?.renderKeybindingWithDefaultActionLabel){const i=this._keybindingService.lookupKeybinding(e.id);i&&(t=`(${i.getLabel()})`)}return t}setActionContext(e){super.setActionContext(e),this._defaultAction.setActionContext(e),this._dropdown.setActionContext(e)}render(e){this._container=e,super.render(this._container),this._container.classList.add("monaco-dropdown-with-default");const t=w(".action-container");this._defaultAction.render(D(this._container,t)),this._register(_(t,k.KEY_DOWN,o=>{const r=new E(o);r.equals(V.RightArrow)&&(this._defaultAction.element.tabIndex=-1,this._dropdown.focus(),r.stopPropagation())}));const i=w(".dropdown-action-container");this._dropdown.render(D(this._container,i)),this._register(_(i,k.KEY_DOWN,o=>{const r=new E(o);r.equals(V.LeftArrow)&&(this._defaultAction.element.tabIndex=0,this._dropdown.setFocusable(!1),this._defaultAction.element?.focus(),r.stopPropagation())}))}focus(e){e?this._dropdown.focus():(this._defaultAction.element.tabIndex=0,this._defaultAction.element.focus())}blur(){this._defaultAction.element.tabIndex=-1,this._dropdown.blur(),this._container.blur()}setFocusable(e){e?this._defaultAction.element.tabIndex=0:(this._defaultAction.element.tabIndex=-1,this._dropdown.setFocusable(!1))}dispose(){this._defaultAction.dispose(),this._dropdown.dispose(),super.dispose()}};y=b([l(2,x),l(3,P),l(4,C),l(5,pe),l(6,ce),l(7,ae)],y);let v=class extends Y{constructor(n,e){super(null,n,n.actions.map(t=>({text:t.id===M.ID?"\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500":t.label,isDisabled:!t.enabled})),0,e,le,{ariaLabel:n.tooltip,optionsAsChildren:!0}),this.select(Math.max(0,n.actions.findIndex(t=>t.checked)))}render(n){super.render(n),n.style.borderColor=ue(me)}runAction(n,e){const t=this.action.actions[e];t&&this.actionRunner.run(t)}};v=b([l(1,se)],v);function We(s,n,e){return n instanceof K?s.createInstance(I,n,e):n instanceof Ae?n.item.isSelection?s.createInstance(v,n):n.item.rememberDefaultAction?s.createInstance(y,n,{...e,persistLastActionId:!0}):s.createInstance(f,n,e):void 0}export{y as DropdownWithDefaultActionViewItem,I as MenuEntryActionViewItem,f as SubmenuEntryActionViewItem,F as TextOnlyMenuEntryActionViewItem,We as createActionViewItem,He as createAndFillInActionBarActions,Fe as createAndFillInContextMenuActions};
