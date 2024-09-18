var p=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var v=(a,t,e,r)=>{for(var i=r>1?void 0:r?d(t,e):t,o=a.length-1,n;o>=0;o--)(n=a[o])&&(i=(r?n(t,e,i):n(i))||i);return r&&i&&p(t,e,i),i},s=(a,t)=>(e,r)=>t(e,r,a);import{localize as m}from"../../../../nls.js";import{InstantiationType as f,registerSingleton as l}from"../../../../platform/instantiation/common/extensions.js";import{IClipboardService as S}from"../../../../platform/clipboard/common/clipboardService.js";import{BrowserClipboardService as g}from"../../../../platform/clipboard/browser/clipboardService.js";import{INotificationService as u,Severity as h}from"../../../../platform/notification/common/notification.js";import{IOpenerService as I}from"../../../../platform/opener/common/opener.js";import{Event as b}from"../../../../base/common/event.js";import{DisposableStore as y}from"../../../../base/common/lifecycle.js";import{IWorkbenchEnvironmentService as x}from"../../environment/common/environmentService.js";import{ILogService as w}from"../../../../platform/log/common/log.js";import{ILayoutService as T}from"../../../../platform/layout/browser/layoutService.js";import{getActiveWindow as L}from"../../../../base/browser/dom.js";let c=class extends g{constructor(e,r,i,o,n){super(n,o);this.notificationService=e;this.openerService=r;this.environmentService=i}async writeText(e,r){return this.environmentService.extensionTestsLocationURI&&typeof r!="string"&&(r="vscode-tests"),super.writeText(e,r)}async readText(e){if(this.environmentService.extensionTestsLocationURI&&typeof e!="string"&&(e="vscode-tests"),e)return super.readText(e);try{return await L().navigator.clipboard.readText()}catch{return new Promise(i=>{const o=new y,n=this.notificationService.prompt(h.Error,m("clipboardError","Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."),[{label:m("retry","Retry"),run:async()=>{o.dispose(),i(await this.readText(e))}},{label:m("learnMore","Learn More"),run:()=>this.openerService.open("https://go.microsoft.com/fwlink/?linkid=2151362")}],{sticky:!0});o.add(b.once(n.onDidClose)(()=>i("")))})}}};c=v([s(0,u),s(1,I),s(2,x),s(3,w),s(4,T)],c),l(S,c,f.Delayed);export{c as BrowserClipboardService};
