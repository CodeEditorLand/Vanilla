var m=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var u=(d,e,r,i)=>{for(var s=i>1?void 0:i?h(e,r):e,t=d.length-1,o;t>=0;t--)(o=d[t])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&m(e,r,s),s},n=(d,e)=>(r,i)=>e(r,i,d);import{safeInnerHtml as f}from"../../../../../vs/base/browser/dom.js";import{DisposableStore as w}from"../../../../../vs/base/common/lifecycle.js";import p from"../../../../../vs/base/common/severity.js";import"vs/css!./media/issueReporter";import{localize as a}from"../../../../../vs/nls.js";import{IMenuService as y,MenuId as I}from"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as v}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IDialogService as S}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{ExtensionIdentifier as R,ExtensionIdentifierSet as g}from"../../../../../vs/platform/extensions/common/extensions.js";import{IInstantiationService as x}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as W}from"../../../../../vs/platform/log/common/log.js";import b from"../../../../../vs/platform/product/common/product.js";import"../../../../../vs/platform/window/common/window.js";import D from"../../../../../vs/workbench/contrib/issue/browser/issueReporterPage.js";import{IssueWebReporter as C}from"../../../../../vs/workbench/contrib/issue/browser/issueReporterService.js";import"../../../../../vs/workbench/contrib/issue/common/issue.js";import{AuxiliaryWindowMode as P,IAuxiliaryWindowService as T}from"../../../../../vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.js";import{IHostService as A}from"../../../../../vs/workbench/services/host/browser/host.js";let c=class{constructor(e,r,i,s,t,o,l){this.instantiationService=e;this.auxiliaryWindowService=r;this.menuService=i;this.contextKeyService=s;this.logService=t;this.dialogService=o;this.hostService=l}_serviceBrand;currentData;issueReporterWindow=null;extensionIdentifierSet=new g;arch="";release="";type="";async openReporter(e){this.hasToReload(e)||(await this.openAuxIssueReporter(e),this.issueReporterWindow&&this.instantiationService.createInstance(C,!1,e,{type:this.type,arch:this.arch,release:this.release},b,this.issueReporterWindow).render())}async openAuxIssueReporter(e,r){let i={width:700,height:800};if(r&&r.x&&r.y){const o=r.x+r.width/2,l=r.y+r.height/2;i={...i,x:o-350,y:l-400}}const t=new w().add(await this.auxiliaryWindowService.open({mode:P.Normal,bounds:i,nativeTitlebar:!0,disableFullscreen:!0}));if(t){await t.whenStylesHaveLoaded,t.window.document.title="Issue Reporter",t.window.document.body.classList.add("issue-reporter-body");const o=document.createElement("div");o.classList.add("monaco-workbench"),t.container.remove(),t.window.document.body.appendChild(o),f(o,D()),this.issueReporterWindow=t.window}else console.error("Failed to open auxiliary window");this.issueReporterWindow?.addEventListener("beforeunload",()=>{t.window.close(),this.issueReporterWindow=null})}async sendReporterMenu(e){const r=this.menuService.createMenu(I.IssueReporter,this.contextKeyService),i=r.getActions({renderShortTitle:!0}).flatMap(t=>t[1]);for(const t of i)try{t.item&&"source"in t.item&&t.item.source?.id===e&&(this.extensionIdentifierSet.add(e),await t.run())}catch(o){console.error(o)}if(!this.extensionIdentifierSet.has(e))return;this.extensionIdentifierSet.delete(new R(e)),r.dispose();const s=this.currentData;return this.currentData=void 0,s??void 0}async closeReporter(){this.issueReporterWindow?.close()}async reloadWithExtensionsDisabled(){if(this.issueReporterWindow)try{await this.hostService.reload({disableExtensions:!0})}catch(e){this.logService.error(e)}}async showConfirmCloseDialog(){await this.dialogService.prompt({type:p.Warning,message:a("confirmCloseIssueReporter","Your input will not be saved. Are you sure you want to close this window?"),buttons:[{label:a({key:"yes",comment:["&& denotes a mnemonic"]},"&&Yes"),run:()=>{this.closeReporter(),this.issueReporterWindow=null}},{label:a("cancel","Cancel"),run:()=>{}}]})}async showClipboardDialog(){let e=!1;return await this.dialogService.prompt({type:p.Warning,message:a("issueReporterWriteToClipboard","There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),buttons:[{label:a({key:"ok",comment:["&& denotes a mnemonic"]},"&&OK"),run:()=>{e=!0}},{label:a("cancel","Cancel"),run:()=>{e=!1}}]}),e}hasToReload(e){return e.extensionId&&this.extensionIdentifierSet.has(e.extensionId)?(this.currentData=e,this.issueReporterWindow?.focus(),!0):this.issueReporterWindow?(this.issueReporterWindow.focus(),!0):!1}};c=u([n(0,x),n(1,T),n(2,y),n(3,v),n(4,W),n(5,S),n(6,A)],c);export{c as IssueFormService};