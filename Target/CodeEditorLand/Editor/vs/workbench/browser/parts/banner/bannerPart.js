var x=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var A=(r,n,e,i)=>{for(var t=i>1?void 0:i?B(n,e):n,o=r.length-1,s;o>=0;o--)(s=r[o])&&(t=(i?s(n,e,t):s(t))||t);return i&&t&&x(n,e,t),t},a=(r,n)=>(e,i)=>n(e,i,r);import"vs/css!./media/bannerpart";import{$ as c,addDisposableListener as L,append as m,asCSSUrl as k,clearNode as I,EventType as T,isHTMLElement as R}from"../../../../../vs/base/browser/dom.js";import{ActionBar as N}from"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import{Action as E}from"../../../../../vs/base/common/actions.js";import{Emitter as _}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/htmlContent.js";import{KeyCode as d}from"../../../../../vs/base/common/keyCodes.js";import{ThemeIcon as v}from"../../../../../vs/base/common/themables.js";import{URI as K}from"../../../../../vs/base/common/uri.js";import{MarkdownRenderer as M}from"../../../../../vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{localize2 as P}from"../../../../../vs/nls.js";import{Categories as D}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as H,registerAction2 as W}from"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as V}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{InstantiationType as F,registerSingleton as U}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IInstantiationService as z}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingsRegistry as p,KeybindingWeight as b}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{Link as O}from"../../../../../vs/platform/opener/browser/link.js";import{IStorageService as $}from"../../../../../vs/platform/storage/common/storage.js";import{widgetClose as j}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{IThemeService as J}from"../../../../../vs/platform/theme/common/themeService.js";import{Part as Y}from"../../../../../vs/workbench/browser/part.js";import{BannerFocused as l}from"../../../../../vs/workbench/common/contextkeys.js";import{IBannerService as u}from"../../../../../vs/workbench/services/banner/browser/bannerService.js";import{IWorkbenchLayoutService as S,Parts as f}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";let h=class extends Y{constructor(e,i,t,o,s){super(f.BANNER_PART,{hasTitle:!1},e,t,i);this.contextKeyService=o;this.instantiationService=s;this.markdownRenderer=this.instantiationService.createInstance(M,{})}height=26;minimumWidth=0;maximumWidth=Number.POSITIVE_INFINITY;get minimumHeight(){return this.visible?this.height:0}get maximumHeight(){return this.visible?this.height:0}_onDidChangeSize=this._register(new _);get onDidChange(){return this._onDidChangeSize.event}item;markdownRenderer;visible=!1;actionBar;messageActionsContainer;focusedActionIndex=-1;createContentArea(e){this.element=e,this.element.tabIndex=0,this._register(L(this.element,T.FOCUS,()=>{this.focusedActionIndex!==-1&&this.focusActionLink()}));const i=this._register(this.contextKeyService.createScoped(this.element));return l.bindTo(i).set(!0),this.element}close(e){this.setVisibility(!1),I(this.element),typeof e.onClose=="function"&&e.onClose(),this.item=void 0}focusActionLink(){const e=this.item?.actions?.length??0;if(this.focusedActionIndex<e){const i=this.messageActionsContainer?.children[this.focusedActionIndex];R(i)&&(this.actionBar?.setFocusable(!1),i.focus())}else this.actionBar?.focus(0)}getAriaLabel(e){if(e.ariaLabel)return e.ariaLabel;if(typeof e.message=="string")return e.message}getBannerMessage(e){if(typeof e=="string"){const i=c("span");return i.innerText=e,i}return this.markdownRenderer.render(e).element}setVisibility(e){e!==this.visible&&(this.visible=e,this.focusedActionIndex=-1,this.layoutService.setPartHidden(!e,f.BANNER_PART),this._onDidChangeSize.fire(void 0))}focus(){this.focusedActionIndex=-1,this.element.focus()}focusNextAction(){const e=this.item?.actions?.length??0;this.focusedActionIndex=this.focusedActionIndex<e?this.focusedActionIndex+1:0,this.focusActionLink()}focusPreviousAction(){const e=this.item?.actions?.length??0;this.focusedActionIndex=this.focusedActionIndex>0?this.focusedActionIndex-1:e,this.focusActionLink()}hide(e){this.item?.id===e&&this.setVisibility(!1)}show(e){if(e.id===this.item?.id){this.setVisibility(!0);return}I(this.element);const i=this.getAriaLabel(e);i&&this.element.setAttribute("aria-label",i);const t=m(this.element,c("div.icon-container"));t.setAttribute("aria-hidden","true"),v.isThemeIcon(e.icon)?t.appendChild(c(`div${v.asCSSSelector(e.icon)}`)):(t.classList.add("custom-icon"),K.isUri(e.icon)&&(t.style.backgroundImage=k(e.icon)));const o=m(this.element,c("div.message-container"));if(o.setAttribute("aria-hidden","true"),o.appendChild(this.getBannerMessage(e.message)),this.messageActionsContainer=m(this.element,c("div.message-actions-container")),e.actions)for(const w of e.actions)this._register(this.instantiationService.createInstance(O,this.messageActionsContainer,{...w,tabIndex:-1},{}));const s=m(this.element,c("div.action-container"));this.actionBar=this._register(new N(s));const y=e.closeLabel??"Close Banner",C=this._register(new E("banner.close",y,v.asClassName(j),!0,()=>this.close(e)));this.actionBar.push(C,{icon:!0,label:!1}),this.actionBar.setFocusable(!1),this.setVisibility(!0),this.item=e}toJSON(){return{type:f.BANNER_PART}}};h=A([a(0,J),a(1,S),a(2,$),a(3,V),a(4,z)],h),U(u,h,F.Eager),p.registerCommandAndKeybindingRule({id:"workbench.banner.focusBanner",weight:b.WorkbenchContrib,primary:d.Escape,when:l,handler:r=>{r.get(u).focus()}}),p.registerCommandAndKeybindingRule({id:"workbench.banner.focusNextAction",weight:b.WorkbenchContrib,primary:d.RightArrow,secondary:[d.DownArrow],when:l,handler:r=>{r.get(u).focusNextAction()}}),p.registerCommandAndKeybindingRule({id:"workbench.banner.focusPreviousAction",weight:b.WorkbenchContrib,primary:d.LeftArrow,secondary:[d.UpArrow],when:l,handler:r=>{r.get(u).focusPreviousAction()}});class g extends H{static ID="workbench.action.focusBanner";static LABEL=P("focusBanner","Focus Banner");constructor(){super({id:g.ID,title:g.LABEL,category:D.View,f1:!0})}async run(n){n.get(S).focusPart(f.BANNER_PART)}}W(g);export{h as BannerPart};
