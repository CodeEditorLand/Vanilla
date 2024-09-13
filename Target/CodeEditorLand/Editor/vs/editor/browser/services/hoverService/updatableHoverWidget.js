import{isHTMLElement as n}from"../../../../base/browser/dom.js";import{HoverPosition as a}from"../../../../base/browser/ui/hover/hoverWidget.js";import{CancellationTokenSource as s}from"../../../../base/common/cancellation.js";import{isMarkdownString as l}from"../../../../base/common/htmlContent.js";import{isFunction as d,isString as v}from"../../../../base/common/types.js";import{localize as p}from"../../../../nls.js";class k{constructor(e,t,i){this.hoverDelegate=e;this.target=t;this.fadeInAnimation=i}_hoverWidget;_cancellationTokenSource;async update(e,t,i){if(this._cancellationTokenSource&&(this._cancellationTokenSource.dispose(!0),this._cancellationTokenSource=void 0),this.isDisposed)return;let o;if(e===void 0||v(e)||n(e))o=e;else if(d(e.markdown)){this._hoverWidget||this.show(p("iconLabel.loading","Loading..."),t,i),this._cancellationTokenSource=new s;const r=this._cancellationTokenSource.token;if(o=await e.markdown(r),o===void 0&&(o=e.markdownNotSupportedFallback),this.isDisposed||r.isCancellationRequested)return}else o=e.markdown??e.markdownNotSupportedFallback;this.show(o,t,i)}show(e,t,i){const o=this._hoverWidget;if(this.hasContent(e)){const r={content:e,target:this.target,actions:i?.actions,linkHandler:i?.linkHandler,trapFocus:i?.trapFocus,appearance:{showPointer:this.hoverDelegate.placement==="element",skipFadeInAnimation:!this.fadeInAnimation||!!o,showHoverHint:i?.appearance?.showHoverHint},position:{hoverPosition:a.BELOW}};this._hoverWidget=this.hoverDelegate.showHover(r,t)}o?.dispose()}hasContent(e){return e?l(e)?!!e.value:!0:!1}get isDisposed(){return this._hoverWidget?.isDisposed}dispose(){this._hoverWidget?.dispose(),this._cancellationTokenSource?.dispose(!0),this._cancellationTokenSource=void 0}}export{k as ManagedHoverWidget};
