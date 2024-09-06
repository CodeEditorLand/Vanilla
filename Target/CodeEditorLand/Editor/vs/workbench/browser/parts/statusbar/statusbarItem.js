var y=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var g=(a,s,e,t)=>{for(var i=t>1?void 0:t?S(s,e):s,r=a.length-1,o;r>=0;r--)(o=a[r])&&(i=(t?o(s,e,i):o(i))||i);return t&&i&&y(s,e,i),i},l=(a,s)=>(e,t)=>s(e,t,a);import{addDisposableListener as h,append as k,EventHelper as c,EventType as m,hide as w,show as E}from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as T}from"../../../../../vs/base/browser/keyboardEvent.js";import{Gesture as x,EventType as I}from"../../../../../vs/base/browser/touch.js";import"../../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{renderIcon as C,renderLabelWithIcons as M}from"../../../../../vs/base/browser/ui/iconLabel/iconLabels.js";import{SimpleIconLabel as H}from"../../../../../vs/base/browser/ui/iconLabel/simpleIconLabel.js";import"../../../../../vs/base/common/actions.js";import{toErrorMessage as A}from"../../../../../vs/base/common/errorMessage.js";import{isMarkdownString as f,markdownStringEqual as _}from"../../../../../vs/base/common/htmlContent.js";import{KeyCode as d}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as D,MutableDisposable as n}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/themables.js";import{assertIsDefined as q}from"../../../../../vs/base/common/types.js";import{isThemeColor as K}from"../../../../../vs/editor/common/editorCommon.js";import"../../../../../vs/editor/common/languages.js";import{ICommandService as N}from"../../../../../vs/platform/commands/common/commands.js";import{IHoverService as O}from"../../../../../vs/platform/hover/browser/hover.js";import{INotificationService as P}from"../../../../../vs/platform/notification/common/notification.js";import{ITelemetryService as W}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{spinningLoading as B,syncing as L}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{IThemeService as F}from"../../../../../vs/platform/theme/common/themeService.js";import{ShowTooltipCommand as v,StatusbarEntryKinds as U}from"../../../../../vs/workbench/services/statusbar/browser/statusbar.js";let u=class extends D{constructor(e,t,i,r,o,b,p,R){super();this.container=e;this.hoverDelegate=i;this.commandService=r;this.hoverService=o;this.notificationService=b;this.telemetryService=p;this.themeService=R;this.labelContainer=document.createElement("a"),this.labelContainer.tabIndex=-1,this.labelContainer.setAttribute("role","button"),this.labelContainer.className="statusbar-item-label",this._register(x.addTarget(this.labelContainer)),this.label=this._register(new $(this.labelContainer)),this.container.appendChild(this.labelContainer),this.beakContainer=document.createElement("div"),this.beakContainer.className="status-bar-item-beak-container",this.container.appendChild(this.beakContainer),this.update(t)}label;entry=void 0;foregroundListener=this._register(new n);backgroundListener=this._register(new n);commandMouseListener=this._register(new n);commandTouchListener=this._register(new n);commandKeyboardListener=this._register(new n);focusListener=this._register(new n);focusOutListener=this._register(new n);hover=void 0;labelContainer;beakContainer;get name(){return q(this.entry).name}get hasCommand(){return typeof this.entry?.command<"u"}update(e){if(this.label.showProgress=e.showProgress??!1,(!this.entry||e.text!==this.entry.text)&&(this.label.text=e.text,e.text?E(this.labelContainer):w(this.labelContainer)),(!this.entry||e.ariaLabel!==this.entry.ariaLabel)&&(this.container.setAttribute("aria-label",e.ariaLabel),this.labelContainer.setAttribute("aria-label",e.ariaLabel)),(!this.entry||e.role!==this.entry.role)&&this.labelContainer.setAttribute("role",e.role||"button"),!this.entry||!this.isEqualTooltip(this.entry,e)){const i=f(e.tooltip)?{markdown:e.tooltip,markdownNotSupportedFallback:void 0}:e.tooltip;this.hover?this.hover.update(i):this.hover=this._register(this.hoverService.setupManagedHover(this.hoverDelegate,this.container,i)),e.command!==v&&(this.focusListener.value=h(this.labelContainer,m.FOCUS,r=>{c.stop(r),this.hover?.show(!1)}),this.focusOutListener.value=h(this.labelContainer,m.FOCUS_OUT,r=>{c.stop(r),this.hover?.hide()}))}if(!this.entry||e.command!==this.entry.command){this.commandMouseListener.clear(),this.commandTouchListener.clear(),this.commandKeyboardListener.clear();const i=e.command;i&&(i!==v||this.hover)?(this.commandMouseListener.value=h(this.labelContainer,m.CLICK,()=>this.executeCommand(i)),this.commandTouchListener.value=h(this.labelContainer,I.Tap,()=>this.executeCommand(i)),this.commandKeyboardListener.value=h(this.labelContainer,m.KEY_DOWN,r=>{const o=new T(r);o.equals(d.Space)||o.equals(d.Enter)?(c.stop(r),this.executeCommand(i)):(o.equals(d.Escape)||o.equals(d.LeftArrow)||o.equals(d.RightArrow))&&(c.stop(r),this.hover?.hide())}),this.labelContainer.classList.remove("disabled")):this.labelContainer.classList.add("disabled")}(!this.entry||e.showBeak!==this.entry.showBeak)&&(e.showBeak?this.container.classList.add("has-beak"):this.container.classList.remove("has-beak"));const t=!!e.backgroundColor||e.kind&&e.kind!=="standard";if(!this.entry||e.kind!==this.entry.kind){for(const i of U)this.container.classList.remove(`${i}-kind`);e.kind&&e.kind!=="standard"&&this.container.classList.add(`${e.kind}-kind`),this.container.classList.toggle("has-background-color",t)}(!this.entry||e.color!==this.entry.color)&&this.applyColor(this.labelContainer,e.color),(!this.entry||e.backgroundColor!==this.entry.backgroundColor)&&(this.container.classList.toggle("has-background-color",t),this.applyColor(this.container,e.backgroundColor,!0)),this.entry=e}isEqualTooltip({tooltip:e},{tooltip:t}){return e===void 0?t===void 0:f(e)?f(t)&&_(e,t):e===t}async executeCommand(e){if(e===v)this.hover?.show(!0);else{const t=typeof e=="string"?e:e.id,i=typeof e=="string"?[]:e.arguments??[];this.telemetryService.publicLog2("workbenchActionExecuted",{id:t,from:"status bar"});try{await this.commandService.executeCommand(t,...i)}catch(r){this.notificationService.error(A(r))}}}applyColor(e,t,i){let r;if(i?this.backgroundListener.clear():this.foregroundListener.clear(),t)if(K(t)){r=this.themeService.getColorTheme().getColor(t.id)?.toString();const o=this.themeService.onDidColorThemeChange(b=>{const p=b.getColor(t.id)?.toString();i?e.style.backgroundColor=p??"":e.style.color=p??""});i?this.backgroundListener.value=o:this.foregroundListener.value=o}else r=t;i?e.style.backgroundColor=r??"":e.style.color=r??""}};u=g([l(3,N),l(4,O),l(5,P),l(6,W),l(7,F)],u);class $ extends H{constructor(e){super(e);this.container=e}progressCodicon=C(L);currentText="";currentShowProgress=!1;set showProgress(e){this.currentShowProgress!==e&&(this.currentShowProgress=e,this.progressCodicon=C(e==="syncing"?L:B),this.text=this.currentText)}set text(e){if(this.currentShowProgress){this.container.firstChild!==this.progressCodicon&&this.container.appendChild(this.progressCodicon);for(const i of Array.from(this.container.childNodes))i!==this.progressCodicon&&i.remove();let t=e??"";t&&(t=` ${t}`),k(this.container,...M(t))}else super.text=e}}export{u as StatusbarEntryItem};
