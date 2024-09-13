var p=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var v=(a,t,e,r)=>{for(var i=r>1?void 0:r?d(t,e):t,o=a.length-1,n;o>=0;o--)(n=a[o])&&(i=(r?n(t,e,i):n(i))||i);return r&&i&&p(t,e,i),i},s=(a,t)=>(e,r)=>t(e,r,a);import{getActiveWindow as f}from"../../../../base/browser/dom.js";import{Event as l}from"../../../../base/common/event.js";import{DisposableStore as S}from"../../../../base/common/lifecycle.js";import{localize as m}from"../../../../nls.js";import{BrowserClipboardService as g}from"../../../../platform/clipboard/browser/clipboardService.js";import{IClipboardService as u}from"../../../../platform/clipboard/common/clipboardService.js";import{InstantiationType as h,registerSingleton as I}from"../../../../platform/instantiation/common/extensions.js";import{ILayoutService as b}from"../../../../platform/layout/browser/layoutService.js";import{ILogService as y}from"../../../../platform/log/common/log.js";import{INotificationService as x,Severity as w}from"../../../../platform/notification/common/notification.js";import{IOpenerService as T}from"../../../../platform/opener/common/opener.js";import{IWorkbenchEnvironmentService as L}from"../../environment/common/environmentService.js";let c=class extends g{constructor(e,r,i,o,n){super(n,o);this.notificationService=e;this.openerService=r;this.environmentService=i}async writeText(e,r){return this.environmentService.extensionTestsLocationURI&&typeof r!="string"&&(r="vscode-tests"),super.writeText(e,r)}async readText(e){if(this.environmentService.extensionTestsLocationURI&&typeof e!="string"&&(e="vscode-tests"),e)return super.readText(e);try{return await f().navigator.clipboard.readText()}catch{return new Promise(i=>{const o=new S,n=this.notificationService.prompt(w.Error,m("clipboardError","Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."),[{label:m("retry","Retry"),run:async()=>{o.dispose(),i(await this.readText(e))}},{label:m("learnMore","Learn More"),run:()=>this.openerService.open("https://go.microsoft.com/fwlink/?linkid=2151362")}],{sticky:!0});o.add(l.once(n.onDidClose)(()=>i("")))})}}};c=v([s(0,x),s(1,T),s(2,L),s(3,y),s(4,b)],c),I(u,c,h.Delayed);export{c as BrowserClipboardService};
