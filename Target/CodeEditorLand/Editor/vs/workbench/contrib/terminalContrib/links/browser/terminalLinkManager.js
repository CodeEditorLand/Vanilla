var E=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var F=(u,m,e,i)=>{for(var n=i>1?void 0:i?V(m,e):m,r=u.length-1,t;r>=0;r--)(t=u[r])&&(n=(i?t(m,e,n):t(n))||n);return i&&n&&E(m,e,n),n},L=(u,m)=>(e,i)=>m(e,i,u);import{EventType as z}from"../../../../../../vs/base/browser/dom.js";import{RunOnceScheduler as N}from"../../../../../../vs/base/common/async.js";import{MarkdownString as U}from"../../../../../../vs/base/common/htmlContent.js";import{DisposableStore as Y,dispose as M,toDisposable as B}from"../../../../../../vs/base/common/lifecycle.js";import{isMacintosh as y,OS as K}from"../../../../../../vs/base/common/platform.js";import{URI as O}from"../../../../../../vs/base/common/uri.js";import*as d from"../../../../../../vs/nls.js";import{IConfigurationService as X}from"../../../../../../vs/platform/configuration/common/configuration.js";import{IInstantiationService as $}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{INotificationService as q,Severity as G}from"../../../../../../vs/platform/notification/common/notification.js";import"../../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import{ITerminalLogService as Q}from"../../../../../../vs/platform/terminal/common/terminal.js";import{ITunnelService as j}from"../../../../../../vs/platform/tunnel/common/tunnel.js";import{ITerminalConfigurationService as J,TerminalLinkQuickPickEvent as R}from"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{TerminalHover as Z}from"../../../../../../vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget.js";import"../../../../../../vs/workbench/contrib/terminal/browser/widgets/widgetManager.js";import"vs/workbench/contrib/terminal/browser/xterm-private";import{TERMINAL_CONFIG_SECTION as ee}from"../../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{TerminalBuiltinLinkType as k}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/links.js";import{TerminalExternalLinkDetector as ie}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector.js";import"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLink.js";import{TerminalLinkDetectorAdapter as ne}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter.js";import{convertBufferRangeToViewport as re}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers.js";import{TerminalLocalFileLinkOpener as te,TerminalLocalFolderInWorkspaceLinkOpener as oe,TerminalLocalFolderOutsideWorkspaceLinkOpener as se,TerminalSearchLinkOpener as ae,TerminalUrlLinkOpener as le}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners.js";import{TerminalLocalLinkDetector as S}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector.js";import{TerminalMultiLineLinkDetector as H}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector.js";import{TerminalUriLinkDetector as D}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector.js";import{TerminalWordLinkDetector as C}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector.js";let b=class extends Y{constructor(e,i,n,r,t,s,o,a,l,h){super();this._xterm=e;this._processInfo=i;this._linkResolver=r;this._configurationService=t;this._terminalConfigurationService=s;this._instantiationService=o;this._notificationService=a;this._logService=l;this._tunnelService=h;let c=!0;switch(this._configurationService.getValue(ee).enableFileLinks){case"off":case!1:c=!1;break;case"notRemote":c=!this._processInfo.remoteAuthority;break}c&&(this._setupLinkDetector(H.id,this._instantiationService.createInstance(H,this._xterm,this._processInfo,this._linkResolver)),this._setupLinkDetector(S.id,this._instantiationService.createInstance(S,this._xterm,n,this._processInfo,this._linkResolver))),this._setupLinkDetector(D.id,this._instantiationService.createInstance(D,this._xterm,this._processInfo,this._linkResolver)),this._setupLinkDetector(C.id,this.add(this._instantiationService.createInstance(C,this._xterm)));const w=this._instantiationService.createInstance(te),_=this._instantiationService.createInstance(oe);this._openers.set(k.LocalFile,w),this._openers.set(k.LocalFolderInWorkspace,_),this._openers.set(k.LocalFolderOutsideWorkspace,this._instantiationService.createInstance(se)),this._openers.set(k.Search,this._instantiationService.createInstance(ae,n,this._processInfo.initialCwd,w,_,()=>this._processInfo.os||K)),this._openers.set(k.Url,this._instantiationService.createInstance(le,!!this._processInfo.remoteAuthority)),this._registerStandardLinkProviders();let I,v;this.add(B(()=>{this._clearLinkProviders(),M(this._externalLinkProviders),I?.dispose(),v?.dispose()})),this._xterm.options.linkHandler={allowNonHttpProtocols:!0,activate:(P,p)=>{if(!this._isLinkActivationModifierDown(P))return;const g=p.indexOf(":");if(g===-1)throw new Error(`Could not find scheme in link "${p}"`);const f=p.substring(0,g);this._terminalConfigurationService.config.allowedLinkSchemes.indexOf(f)===-1&&this._notificationService.prompt(G.Warning,d.localize("scheme","Opening URIs can be insecure, do you want to allow opening links with the scheme {0}?",f),[{label:d.localize("allow","Allow {0}",f),run:()=>{const x=[...this._terminalConfigurationService.config.allowedLinkSchemes,f];this._configurationService.updateValue("terminal.integrated.allowedLinkSchemes",x)}}]),this._openers.get(k.Url)?.open({type:k.Url,text:p,bufferRange:null,uri:O.parse(p)})},hover:(P,p,g)=>{I?.dispose(),I=void 0,v?.dispose(),v=new N(()=>{const f=this._xterm._core,x={width:f._renderService.dimensions.css.cell.width,height:f._renderService.dimensions.css.cell.height},A={width:this._xterm.cols,height:this._xterm.rows};I=this._showHover({viewportRange:re(g,this._xterm.buffer.active.viewportY),cellDimensions:x,terminalDimensions:A},this._getLinkHoverString(p,p),void 0,W=>this._xterm.options.linkHandler?.activate(P,W,g)),v?.dispose(),v=void 0},this._configurationService.getValue("workbench.hover.delay")),v.schedule()}}}_widgetManager;_standardLinkProviders=new Map;_linkProvidersDisposables=[];_externalLinkProviders=[];_openers=new Map;externalProvideLinksCb;_setupLinkDetector(e,i,n=!1){const r=this.add(this._instantiationService.createInstance(ne,i));return this.add(r.onDidActivateLink(t=>{t.event?.preventDefault(),!(t.event&&!(t.event instanceof R)&&!this._isLinkActivationModifierDown(t.event))&&(t.link.activate?t.link.activate(t.link.text):this._openLink(t.link))})),this.add(r.onDidShowHover(t=>this._tooltipCallback(t.link,t.viewportRange,t.modifierDownCallback,t.modifierUpCallback))),n||this._standardLinkProviders.set(e,r),r}async _openLink(e){this._logService.debug("Opening link",e);const i=this._openers.get(e.type);if(!i)throw new Error(`No matching opener for link type "${e.type}"`);await i.open(e)}async openRecentLink(e){let i,n=this._xterm.buffer.active.length;for(;(!i||i.length===0)&&n>=this._xterm.buffer.active.viewportY;)i=await this._getLinksForType(n,e),n--;if(!i||i.length<1)return;const r=new R(z.CLICK);return i[0].activate(r,i[0].text),i[0]}async getLinks(){const e=[];for(let o=this._xterm.buffer.active.viewportY+this._xterm.rows-1;o>=this._xterm.buffer.active.viewportY;o--)e.push(this._getLinksForLine(o));const i=await Promise.all(e),n={wordLinks:[],webLinks:[],fileLinks:[],folderLinks:[]};for(const o of i)if(o){const{wordLinks:a,webLinks:l,fileLinks:h,folderLinks:c}=o;a?.length&&n.wordLinks.push(...a.reverse()),l?.length&&n.webLinks.push(...l.reverse()),h?.length&&n.fileLinks.push(...h.reverse()),c?.length&&n.folderLinks.push(...c.reverse())}const r=[];for(let o=this._xterm.buffer.active.viewportY-1;o>=0;o--)r.push(this._getLinksForLine(o));const t=[];for(let o=this._xterm.buffer.active.length-1;o>=this._xterm.buffer.active.viewportY+this._xterm.rows;o--)t.push(this._getLinksForLine(o));const s=Promise.all(r).then(async o=>{const a=await Promise.all(t),l={wordLinks:[...n.wordLinks],webLinks:[...n.webLinks],fileLinks:[...n.fileLinks],folderLinks:[...n.folderLinks]};for(const h of[...a,...o])if(h){const{wordLinks:c,webLinks:T,fileLinks:w,folderLinks:_}=h;c?.length&&l.wordLinks.push(...c.reverse()),T?.length&&l.webLinks.push(...T.reverse()),w?.length&&l.fileLinks.push(...w.reverse()),_?.length&&l.folderLinks.push(..._.reverse())}return l});return{viewport:n,all:s}}async _getLinksForLine(e){const i=await this._getLinksForType(e,"word"),n=await this._getLinksForType(e,"url"),r=await this._getLinksForType(e,"localFile"),t=await this._getLinksForType(e,"localFolder"),s=new Set;let o;if(i){o=[];for(const a of i)!s.has(a.text)&&a.text.length>1&&(o.push(a),s.add(a.text))}return{wordLinks:o,webLinks:n,fileLinks:r,folderLinks:t}}async _getLinksForType(e,i){switch(i){case"word":return await new Promise(n=>this._standardLinkProviders.get(C.id)?.provideLinks(e,n));case"url":return await new Promise(n=>this._standardLinkProviders.get(D.id)?.provideLinks(e,n));case"localFile":return(await new Promise(r=>this._standardLinkProviders.get(S.id)?.provideLinks(e,r)))?.filter(r=>r.type===k.LocalFile);case"localFolder":return(await new Promise(r=>this._standardLinkProviders.get(S.id)?.provideLinks(e,r)))?.filter(r=>r.type===k.LocalFolderInWorkspace)}}_tooltipCallback(e,i,n,r){if(!this._widgetManager)return;const t=this._xterm._core,s={width:t._renderService.dimensions.css.cell.width,height:t._renderService.dimensions.css.cell.height},o={width:this._xterm.cols,height:this._xterm.rows};this._showHover({viewportRange:i,cellDimensions:s,terminalDimensions:o,modifierDownCallback:n,modifierUpCallback:r},this._getLinkHoverString(e.text,e.label),e.actions,a=>e.activate(void 0,a),e)}_showHover(e,i,n,r,t){if(this._widgetManager){const s=this._instantiationService.createInstance(Z,e,i,n,r),o=this._widgetManager.attachWidget(s);return o&&t?.onInvalidated(()=>o.dispose()),o}}setWidgetManager(e){this._widgetManager=e}_clearLinkProviders(){M(this._linkProvidersDisposables),this._linkProvidersDisposables.length=0}_registerStandardLinkProviders(){const e=async r=>this.externalProvideLinksCb?.(r),i=`extension-${this._externalLinkProviders.length}`,n=this._setupLinkDetector(i,new ie(i,this._xterm,e),!0);this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(n));for(const r of this._standardLinkProviders.values())this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(r))}_isLinkActivationModifierDown(e){return this._configurationService.getValue("editor").multiCursorModifier==="ctrlCmd"?!!e.altKey:y?e.metaKey:e.ctrlKey}_getLinkHoverString(e,i){const n=this._configurationService.getValue("editor");let r="";n.multiCursorModifier==="ctrlCmd"?y?r=d.localize("terminalLinkHandler.followLinkAlt.mac","option + click"):r=d.localize("terminalLinkHandler.followLinkAlt","alt + click"):y?r=d.localize("terminalLinkHandler.followLinkCmd","cmd + click"):r=d.localize("terminalLinkHandler.followLinkCtrl","ctrl + click");let t=d.localize("followLink","Follow link");try{this._tunnelService.canTunnel(O.parse(e))&&(t=d.localize("followForwardedLink","Follow link using forwarded port"))}catch{}const s=new U("",!0);return i&&(i=s.appendText(i).value,s.value=""),e&&(e=s.appendText(e).value,s.value=""),i=i||t,e=e||i,/(\s|&nbsp;)/.test(e)&&(e=d.localize("followLinkUrl","Link")),s.appendLink(e,i).appendMarkdown(` (${r})`)}};b=F([L(4,X),L(5,J),L(6,$),L(7,q),L(8,Q),L(9,j)],b);export{b as TerminalLinkManager};
