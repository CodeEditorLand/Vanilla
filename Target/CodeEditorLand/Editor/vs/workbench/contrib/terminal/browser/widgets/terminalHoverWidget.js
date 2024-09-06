var v=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var g=(a,r,i,s)=>{for(var e=s>1?void 0:s?_(r,i):r,n=a.length-1,o;n>=0;n--)(o=a[n])&&(e=(s?o(r,i,e):o(e))||e);return s&&e&&v(r,i,e),e},d=(a,r)=>(i,s)=>r(i,s,a);import*as m from"../../../../../../vs/base/browser/dom.js";import{Widget as c}from"../../../../../../vs/base/browser/ui/widget.js";import"../../../../../../vs/base/common/htmlContent.js";import{Disposable as w,toDisposable as y}from"../../../../../../vs/base/common/lifecycle.js";import{IConfigurationService as f}from"../../../../../../vs/platform/configuration/common/configuration.js";import{IHoverService as x}from"../../../../../../vs/platform/hover/browser/hover.js";import{TerminalSettingId as u}from"../../../../../../vs/platform/terminal/common/terminal.js";import"../../../../../../vs/workbench/contrib/terminal/browser/widgets/widgets.js";const h=m.$;let l=class extends w{constructor(i,s,e,n,o,t){super();this._targetOptions=i;this._text=s;this._actions=e;this._linkHandler=n;this._hoverService=o;this._configurationService=t}id="hover";attach(i){if(!this._configurationService.getValue(u.ShowLinkHover))return;const e=new D(i,this._targetOptions),n=this._hoverService.showHover({target:e,content:this._text,actions:this._actions,linkHandler:this._linkHandler,additionalClasses:["xterm-hover"]});n&&this._register(n)}};l=g([d(4,x),d(5,f)],l);class D extends c{constructor(i,s){super();this._options=s;this._domNode=h("div.terminal-hover-targets.xterm-hover");const e=this._options.viewportRange.end.y-this._options.viewportRange.start.y+1,n=(this._options.viewportRange.end.y>this._options.viewportRange.start.y?this._options.terminalDimensions.width-this._options.viewportRange.start.x:this._options.viewportRange.end.x-this._options.viewportRange.start.x+1)*this._options.cellDimensions.width,o=h("div.terminal-hover-target.hoverHighlight");if(o.style.left=`${this._options.viewportRange.start.x*this._options.cellDimensions.width}px`,o.style.bottom=`${(this._options.terminalDimensions.height-this._options.viewportRange.start.y-1)*this._options.cellDimensions.height}px`,o.style.width=`${n}px`,o.style.height=`${this._options.cellDimensions.height}px`,this._targetElements.push(this._domNode.appendChild(o)),e>2){const t=h("div.terminal-hover-target.hoverHighlight");t.style.left="0px",t.style.bottom=`${(this._options.terminalDimensions.height-this._options.viewportRange.start.y-1-(e-2))*this._options.cellDimensions.height}px`,t.style.width=`${this._options.terminalDimensions.width*this._options.cellDimensions.width}px`,t.style.height=`${(e-2)*this._options.cellDimensions.height}px`,this._targetElements.push(this._domNode.appendChild(t))}if(e>1){const t=h("div.terminal-hover-target.hoverHighlight");t.style.left="0px",t.style.bottom=`${(this._options.terminalDimensions.height-this._options.viewportRange.end.y-1)*this._options.cellDimensions.height}px`,t.style.width=`${(this._options.viewportRange.end.x+1)*this._options.cellDimensions.width}px`,t.style.height=`${this._options.cellDimensions.height}px`,this._targetElements.push(this._domNode.appendChild(t))}if(this._options.modifierDownCallback&&this._options.modifierUpCallback){let t=!1;this._register(m.addDisposableListener(i.ownerDocument,"keydown",p=>{p.ctrlKey&&!t&&(t=!0,this._options.modifierDownCallback())})),this._register(m.addDisposableListener(i.ownerDocument,"keyup",p=>{p.ctrlKey||(t=!1,this._options.modifierUpCallback())}))}i.appendChild(this._domNode),this._register(y(()=>this._domNode?.remove()))}_domNode;_targetElements=[];get targetElements(){return this._targetElements}}export{l as TerminalHover};