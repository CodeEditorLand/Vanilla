var H=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var b=(s,n,e,t)=>{for(var i=t>1?void 0:t?W(n,e):n,o=s.length-1,r;o>=0;o--)(r=s[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&H(n,e,i),i},l=(s,n)=>(e,t)=>n(e,t,s);import{$ as M,addDisposableListener as _,append as k,asCSSUrl as S,EventType as L,ModifierKeyEmitter as D,prepend as $}from"../../../base/browser/dom.js";import{StandardKeyboardEvent as E}from"../../../base/browser/keyboardEvent.js";import{ActionViewItem as q,BaseActionViewItem as Y,SelectActionViewItem as U}from"../../../base/browser/ui/actionbar/actionViewItems.js";import{DropdownMenuActionViewItem as O}from"../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import{ActionRunner as T,Separator as w,SubmenuAction as j}from"../../../base/common/actions.js";import{UILabelProvider as J}from"../../../base/common/keybindingLabels.js";import{KeyCode as V}from"../../../base/common/keyCodes.js";import{combinedDisposable as Q,MutableDisposable as X,toDisposable as R}from"../../../base/common/lifecycle.js";import{isLinux as Z,isWindows as ee,OS as te}from"../../../base/common/platform.js";import"./menuEntryActionViewItem.css";import{localize as g}from"../../../nls.js";import{IMenuService as ne,MenuItemAction as C,SubmenuItemAction as ie}from"../common/actions.js";import{isICommandActionToggleInfo as oe}from"../../action/common/action.js";import{IContextKeyService as re}from"../../contextkey/common/contextkey.js";import{IContextMenuService as x,IContextViewService as se}from"../../contextview/browser/contextView.js";import{IInstantiationService as ce}from"../../instantiation/common/instantiation.js";import{IKeybindingService as K}from"../../keybinding/common/keybinding.js";import{INotificationService as P}from"../../notification/common/notification.js";import{IStorageService as ae,StorageScope as G,StorageTarget as de}from"../../storage/common/storage.js";import{IThemeService as N}from"../../theme/common/themeService.js";import{ThemeIcon as f}from"../../../base/common/themables.js";import{isDark as B}from"../../theme/common/theme.js";import{assertType as le}from"../../../base/common/types.js";import{asCssVariable as ue,selectBorder as me}from"../../theme/common/colorRegistry.js";import{defaultSelectBoxStyles as pe}from"../../theme/browser/defaultStyles.js";import{IAccessibilityService as Ae}from"../../accessibility/common/accessibility.js";function et(s,n,e,t){let i,o,r;if(Array.isArray(s))r=s,i=n,o=e;else{const a=n;r=s.getActions(a),i=e,o=t}const c=D.getInstance(),u=c.keyStatus.altKey||(ee||Z)&&c.keyStatus.shiftKey;z(r,i,u,o?a=>a===o:a=>a==="navigation")}function tt(s,n,e,t,i,o){let r,c,u,a,m;if(Array.isArray(s))m=s,r=n,c=e,u=t,a=i;else{const d=n;m=s.getActions(d),r=e,c=t,u=i,a=o}z(m,r,!1,typeof c=="string"?d=>d===c:c,u,a)}function z(s,n,e,t=r=>r==="navigation",i=()=>!1,o=!1){let r,c;Array.isArray(n)?(r=n,c=n):(r=n.primary,c=n.secondary);const u=new Set;for(const[a,m]of s){let p;t(a)?(p=r,p.length>0&&o&&p.push(new w)):(p=c,p.length>0&&p.push(new w));for(let d of m){e&&(d=d instanceof C&&d.alt?d.alt:d);const A=p.push(d);d instanceof j&&u.add({group:a,action:d,index:A-1})}}for(const{group:a,action:m,index:p}of u){const d=t(a)?r:c,A=m.actions;i(m,a,d.length)&&d.splice(p,1,...A)}}let I=class extends q{constructor(e,t,i,o,r,c,u,a){super(void 0,e,{icon:!!(e.class||e.item.icon),label:!e.class&&!e.item.icon,draggable:t?.draggable,keybinding:t?.keybinding,hoverDelegate:t?.hoverDelegate});this._options=t;this._keybindingService=i;this._notificationService=o;this._contextKeyService=r;this._themeService=c;this._contextMenuService=u;this._accessibilityService=a;this._altKey=D.getInstance()}_wantsAltCommand=!1;_itemClassDispose=this._register(new X);_altKey;get _menuItemAction(){return this._action}get _commandAction(){return this._wantsAltCommand&&this._menuItemAction.alt||this._menuItemAction}async onClick(e){e.preventDefault(),e.stopPropagation();try{await this.actionRunner.run(this._commandAction,this._context)}catch(t){this._notificationService.error(t)}}render(e){if(super.render(e),e.classList.add("menu-entry"),this.options.icon&&this._updateItemClass(this._menuItemAction.item),this._menuItemAction.alt){let t=!1;const i=()=>{const o=!!this._menuItemAction.alt?.enabled&&(!this._accessibilityService.isMotionReduced()||t)&&(this._altKey.keyStatus.altKey||this._altKey.keyStatus.shiftKey&&t);o!==this._wantsAltCommand&&(this._wantsAltCommand=o,this.updateLabel(),this.updateTooltip(),this.updateClass())};this._register(this._altKey.event(i)),this._register(_(e,"mouseleave",o=>{t=!1,i()})),this._register(_(e,"mouseenter",o=>{t=!0,i()})),i()}}updateLabel(){this.options.label&&this.label&&(this.label.textContent=this._commandAction.label)}getTooltip(){const e=this._keybindingService.lookupKeybinding(this._commandAction.id,this._contextKeyService),t=e&&e.getLabel(),i=this._commandAction.tooltip||this._commandAction.label;let o=t?g("titleAndKb","{0} ({1})",i,t):i;if(!this._wantsAltCommand&&this._menuItemAction.alt?.enabled){const r=this._menuItemAction.alt.tooltip||this._menuItemAction.alt.label,c=this._keybindingService.lookupKeybinding(this._menuItemAction.alt.id,this._contextKeyService),u=c&&c.getLabel(),a=u?g("titleAndKb","{0} ({1})",r,u):r;o=g("titleAndKbAndAlt",`{0}
[{1}] {2}`,o,J.modifierLabels[te].altKey,a)}return o}updateClass(){this.options.icon&&(this._commandAction!==this._menuItemAction?this._menuItemAction.alt&&this._updateItemClass(this._menuItemAction.alt.item):this._updateItemClass(this._menuItemAction.item))}_updateItemClass(e){this._itemClassDispose.value=void 0;const{element:t,label:i}=this;if(!t||!i)return;const o=this._commandAction.checked&&oe(e.toggled)&&e.toggled.icon?e.toggled.icon:e.icon;if(o)if(f.isThemeIcon(o)){const r=f.asClassNameArray(o);i.classList.add(...r),this._itemClassDispose.value=R(()=>{i.classList.remove(...r)})}else i.style.backgroundImage=B(this._themeService.getColorTheme().type)?S(o.dark):S(o.light),i.classList.add("icon"),this._itemClassDispose.value=Q(R(()=>{i.style.backgroundImage="",i.classList.remove("icon")}),this._themeService.onDidColorThemeChange(()=>{this.updateClass()}))}};I=b([l(2,K),l(3,P),l(4,re),l(5,N),l(6,x),l(7,Ae)],I);class F extends I{render(n){this.options.label=!0,this.options.icon=!1,super.render(n),n.classList.add("text-only"),n.classList.toggle("use-comma",this._options?.useComma??!1)}updateLabel(){const n=this._keybindingService.lookupKeybinding(this._action.id,this._contextKeyService);if(!n)return super.updateLabel();if(this.label){const e=F._symbolPrintEnter(n);this._options?.conversational?this.label.textContent=g({key:"content2",comment:['A label with keybindg like "ESC to dismiss"']},"{1} to {0}",this._action.label,e):this.label.textContent=g({key:"content",comment:["A label","A keybinding"]},"{0} ({1})",this._action.label,e)}}static _symbolPrintEnter(n){return n.getLabel()?.replace(/\benter\b/gi,"\u23CE").replace(/\bEscape\b/gi,"Esc")}}let h=class extends O{constructor(e,t,i,o,r){const c={...t,menuAsChild:t?.menuAsChild??!1,classNames:t?.classNames??(f.isThemeIcon(e.item.icon)?f.asClassName(e.item.icon):void 0),keybindingProvider:t?.keybindingProvider??(u=>i.lookupKeybinding(u.id))};super(e,{getActions:()=>e.actions},o,c);this._keybindingService=i;this._contextMenuService=o;this._themeService=r}render(e){super.render(e),le(this.element),e.classList.add("menu-entry");const t=this._action,{icon:i}=t.item;if(i&&!f.isThemeIcon(i)){this.element.classList.add("icon");const o=()=>{this.element&&(this.element.style.backgroundImage=B(this._themeService.getColorTheme().type)?S(i.dark):S(i.light))};o(),this._register(this._themeService.onDidColorThemeChange(()=>{o()}))}}};h=b([l(2,K),l(3,x),l(4,N)],h);let y=class extends Y{constructor(e,t,i,o,r,c,u,a){super(null,e);this._keybindingService=i;this._notificationService=o;this._contextMenuService=r;this._menuService=c;this._instaService=u;this._storageService=a;this._options=t,this._storageKey=`${e.item.submenu.id}_lastActionId`;let m;const p=t?.persistLastActionId?a.get(this._storageKey,G.WORKSPACE):void 0;p&&(m=e.actions.find(A=>p===A.id)),m||(m=e.actions[0]),this._defaultAction=this._instaService.createInstance(I,m,{keybinding:this._getDefaultActionKeybindingLabel(m)});const d={keybindingProvider:A=>this._keybindingService.lookupKeybinding(A.id),...t,menuAsChild:t?.menuAsChild??!0,classNames:t?.classNames??["codicon","codicon-chevron-down"],actionRunner:t?.actionRunner??new T};this._dropdown=new O(e,e.actions,this._contextMenuService,d),this._register(this._dropdown.actionRunner.onDidRun(A=>{A.action instanceof C&&this.update(A.action)}))}_options;_defaultAction;_dropdown;_container=null;_storageKey;get onDidChangeDropdownVisibility(){return this._dropdown.onDidChangeVisibility}update(e){this._options?.persistLastActionId&&this._storageService.store(this._storageKey,e.id,G.WORKSPACE,de.MACHINE),this._defaultAction.dispose(),this._defaultAction=this._instaService.createInstance(I,e,{keybinding:this._getDefaultActionKeybindingLabel(e)}),this._defaultAction.actionRunner=new class extends T{async runAction(t,i){await t.run(void 0)}},this._container&&this._defaultAction.render($(this._container,M(".action-container")))}_getDefaultActionKeybindingLabel(e){let t;if(this._options?.renderKeybindingWithDefaultActionLabel){const i=this._keybindingService.lookupKeybinding(e.id);i&&(t=`(${i.getLabel()})`)}return t}setActionContext(e){super.setActionContext(e),this._defaultAction.setActionContext(e),this._dropdown.setActionContext(e)}render(e){this._container=e,super.render(this._container),this._container.classList.add("monaco-dropdown-with-default");const t=M(".action-container");this._defaultAction.render(k(this._container,t)),this._register(_(t,L.KEY_DOWN,o=>{const r=new E(o);r.equals(V.RightArrow)&&(this._defaultAction.element.tabIndex=-1,this._dropdown.focus(),r.stopPropagation())}));const i=M(".dropdown-action-container");this._dropdown.render(k(this._container,i)),this._register(_(i,L.KEY_DOWN,o=>{const r=new E(o);r.equals(V.LeftArrow)&&(this._defaultAction.element.tabIndex=0,this._dropdown.setFocusable(!1),this._defaultAction.element?.focus(),r.stopPropagation())}))}focus(e){e?this._dropdown.focus():(this._defaultAction.element.tabIndex=0,this._defaultAction.element.focus())}blur(){this._defaultAction.element.tabIndex=-1,this._dropdown.blur(),this._container.blur()}setFocusable(e){e?this._defaultAction.element.tabIndex=0:(this._defaultAction.element.tabIndex=-1,this._dropdown.setFocusable(!1))}dispose(){this._defaultAction.dispose(),this._dropdown.dispose(),super.dispose()}};y=b([l(2,K),l(3,P),l(4,x),l(5,ne),l(6,ce),l(7,ae)],y);let v=class extends U{constructor(n,e){super(null,n,n.actions.map(t=>({text:t.id===w.ID?"\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500":t.label,isDisabled:!t.enabled})),0,e,pe,{ariaLabel:n.tooltip,optionsAsChildren:!0}),this.select(Math.max(0,n.actions.findIndex(t=>t.checked)))}render(n){super.render(n),n.style.borderColor=ue(me)}runAction(n,e){const t=this.action.actions[e];t&&this.actionRunner.run(t)}};v=b([l(1,se)],v);function nt(s,n,e){return n instanceof C?s.createInstance(I,n,e):n instanceof ie?n.item.isSelection?s.createInstance(v,n):n.item.rememberDefaultAction?s.createInstance(y,n,{...e,persistLastActionId:!0}):s.createInstance(h,n,e):void 0}export{y as DropdownWithDefaultActionViewItem,I as MenuEntryActionViewItem,h as SubmenuEntryActionViewItem,F as TextOnlyMenuEntryActionViewItem,nt as createActionViewItem,tt as createAndFillInActionBarActions,et as createAndFillInContextMenuActions};
