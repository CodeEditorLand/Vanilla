var x=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var A=(r,n,e,i)=>{for(var t=i>1?void 0:i?B(n,e):n,o=r.length-1,s;o>=0;o--)(s=r[o])&&(t=(i?s(n,e,t):s(t))||t);return i&&t&&x(n,e,t),t},a=(r,n)=>(e,i)=>n(e,i,r);import"./media/bannerpart.css";import{$ as c,EventType as L,addDisposableListener as k,append as m,asCSSUrl as T,clearNode as I,isHTMLElement as R}from"../../../../base/browser/dom.js";import{ActionBar as N}from"../../../../base/browser/ui/actionbar/actionbar.js";import{Action as E}from"../../../../base/common/actions.js";import{Emitter as _}from"../../../../base/common/event.js";import{KeyCode as d}from"../../../../base/common/keyCodes.js";import{ThemeIcon as v}from"../../../../base/common/themables.js";import{URI as K}from"../../../../base/common/uri.js";import{MarkdownRenderer as M}from"../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{localize2 as P}from"../../../../nls.js";import{Categories as D}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as H,registerAction2 as W}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as V}from"../../../../platform/contextkey/common/contextkey.js";import{InstantiationType as F,registerSingleton as U}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as z}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as p,KeybindingsRegistry as b}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{Link as O}from"../../../../platform/opener/browser/link.js";import{IStorageService as j}from"../../../../platform/storage/common/storage.js";import{widgetClose as $}from"../../../../platform/theme/common/iconRegistry.js";import{IThemeService as J}from"../../../../platform/theme/common/themeService.js";import{BannerFocused as l}from"../../../common/contextkeys.js";import{IBannerService as u}from"../../../services/banner/browser/bannerService.js";import{IWorkbenchLayoutService as S,Parts as f}from"../../../services/layout/browser/layoutService.js";import{Part as Y}from"../../part.js";let h=class extends Y{constructor(e,i,t,o,s){super(f.BANNER_PART,{hasTitle:!1},e,t,i);this.contextKeyService=o;this.instantiationService=s;this.markdownRenderer=this.instantiationService.createInstance(M,{})}height=26;minimumWidth=0;maximumWidth=Number.POSITIVE_INFINITY;get minimumHeight(){return this.visible?this.height:0}get maximumHeight(){return this.visible?this.height:0}_onDidChangeSize=this._register(new _);get onDidChange(){return this._onDidChangeSize.event}item;markdownRenderer;visible=!1;actionBar;messageActionsContainer;focusedActionIndex=-1;createContentArea(e){this.element=e,this.element.tabIndex=0,this._register(k(this.element,L.FOCUS,()=>{this.focusedActionIndex!==-1&&this.focusActionLink()}));const i=this._register(this.contextKeyService.createScoped(this.element));return l.bindTo(i).set(!0),this.element}close(e){this.setVisibility(!1),I(this.element),typeof e.onClose=="function"&&e.onClose(),this.item=void 0}focusActionLink(){const e=this.item?.actions?.length??0;if(this.focusedActionIndex<e){const i=this.messageActionsContainer?.children[this.focusedActionIndex];R(i)&&(this.actionBar?.setFocusable(!1),i.focus())}else this.actionBar?.focus(0)}getAriaLabel(e){if(e.ariaLabel)return e.ariaLabel;if(typeof e.message=="string")return e.message}getBannerMessage(e){if(typeof e=="string"){const i=c("span");return i.innerText=e,i}return this.markdownRenderer.render(e).element}setVisibility(e){e!==this.visible&&(this.visible=e,this.focusedActionIndex=-1,this.layoutService.setPartHidden(!e,f.BANNER_PART),this._onDidChangeSize.fire(void 0))}focus(){this.focusedActionIndex=-1,this.element.focus()}focusNextAction(){const e=this.item?.actions?.length??0;this.focusedActionIndex=this.focusedActionIndex<e?this.focusedActionIndex+1:0,this.focusActionLink()}focusPreviousAction(){const e=this.item?.actions?.length??0;this.focusedActionIndex=this.focusedActionIndex>0?this.focusedActionIndex-1:e,this.focusActionLink()}hide(e){this.item?.id===e&&this.setVisibility(!1)}show(e){if(e.id===this.item?.id){this.setVisibility(!0);return}I(this.element);const i=this.getAriaLabel(e);i&&this.element.setAttribute("aria-label",i);const t=m(this.element,c("div.icon-container"));t.setAttribute("aria-hidden","true"),v.isThemeIcon(e.icon)?t.appendChild(c(`div${v.asCSSSelector(e.icon)}`)):(t.classList.add("custom-icon"),K.isUri(e.icon)&&(t.style.backgroundImage=T(e.icon)));const o=m(this.element,c("div.message-container"));if(o.setAttribute("aria-hidden","true"),o.appendChild(this.getBannerMessage(e.message)),this.messageActionsContainer=m(this.element,c("div.message-actions-container")),e.actions)for(const w of e.actions)this._register(this.instantiationService.createInstance(O,this.messageActionsContainer,{...w,tabIndex:-1},{}));const s=m(this.element,c("div.action-container"));this.actionBar=this._register(new N(s));const y=e.closeLabel??"Close Banner",C=this._register(new E("banner.close",y,v.asClassName($),!0,()=>this.close(e)));this.actionBar.push(C,{icon:!0,label:!1}),this.actionBar.setFocusable(!1),this.setVisibility(!0),this.item=e}toJSON(){return{type:f.BANNER_PART}}};h=A([a(0,J),a(1,S),a(2,j),a(3,V),a(4,z)],h),U(u,h,F.Eager),b.registerCommandAndKeybindingRule({id:"workbench.banner.focusBanner",weight:p.WorkbenchContrib,primary:d.Escape,when:l,handler:r=>{r.get(u).focus()}}),b.registerCommandAndKeybindingRule({id:"workbench.banner.focusNextAction",weight:p.WorkbenchContrib,primary:d.RightArrow,secondary:[d.DownArrow],when:l,handler:r=>{r.get(u).focusNextAction()}}),b.registerCommandAndKeybindingRule({id:"workbench.banner.focusPreviousAction",weight:p.WorkbenchContrib,primary:d.LeftArrow,secondary:[d.UpArrow],when:l,handler:r=>{r.get(u).focusPreviousAction()}});class g extends H{static ID="workbench.action.focusBanner";static LABEL=P("focusBanner","Focus Banner");constructor(){super({id:g.ID,title:g.LABEL,category:D.View,f1:!0})}async run(n){n.get(S).focusPart(f.BANNER_PART)}}W(g);export{h as BannerPart};
