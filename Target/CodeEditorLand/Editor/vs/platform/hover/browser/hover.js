var h=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(a,i,e,t)=>{for(var r=t>1?void 0:t?m(i,e):i,o=a.length-1,n;o>=0;o--)(n=a[o])&&(r=(t?n(i,e,r):n(r))||r);return t&&r&&h(i,e,r),r},d=(a,i)=>(e,t)=>i(e,t,a);import{createDecorator as H}from"../../instantiation/common/instantiation.js";import{Disposable as u,DisposableStore as f}from"../../../base/common/lifecycle.js";import"../../../base/browser/ui/hover/hoverDelegate.js";import{IConfigurationService as g}from"../../configuration/common/configuration.js";import{addStandardDisposableListener as I,isHTMLElement as p}from"../../../base/browser/dom.js";import{KeyCode as y}from"../../../base/common/keyCodes.js";const b=H("hoverService");let s=class extends u{constructor(e,t,r={},o,n){super();this.placement=e;this.instantHover=t;this.overrideOptions=r;this.configurationService=o;this.hoverService=n;this._delay=this.configurationService.getValue("workbench.hover.delay"),this._register(this.configurationService.onDidChangeConfiguration(v=>{v.affectsConfiguration("workbench.hover.delay")&&(this._delay=this.configurationService.getValue("workbench.hover.delay"))}))}lastHoverHideTime=0;timeLimit=200;_delay;get delay(){return this.isInstantlyHovering()?0:this._delay}hoverDisposables=this._register(new f);showHover(e,t){const r=typeof this.overrideOptions=="function"?this.overrideOptions(e,t):this.overrideOptions;this.hoverDisposables.clear();const o=p(e.target)?[e.target]:e.target.targetElements;for(const v of o)this.hoverDisposables.add(I(v,"keydown",c=>{c.equals(y.Escape)&&this.hoverService.hideHover()}));const n=p(e.content)?void 0:e.content.toString();return this.hoverService.showHover({...e,...r,persistence:{hideOnKeyDown:!0,...r.persistence},id:n,appearance:{...e.appearance,compact:!0,skipFadeInAnimation:this.isInstantlyHovering(),...r.appearance}},t)}isInstantlyHovering(){return this.instantHover&&Date.now()-this.lastHoverHideTime<this.timeLimit}setInstantHoverTimeLimit(e){if(!this.instantHover)throw new Error("Instant hover is not enabled");this.timeLimit=e}onDidHideHover(){this.hoverDisposables.clear(),this.instantHover&&(this.lastHoverHideTime=Date.now())}};s=l([d(3,g),d(4,b)],s);const T={showHover:function(){throw new Error("Native hover function not implemented.")},delay:0,showNativeHover:!0};export{b as IHoverService,s as WorkbenchHoverDelegate,T as nativeHoverDelegate};
