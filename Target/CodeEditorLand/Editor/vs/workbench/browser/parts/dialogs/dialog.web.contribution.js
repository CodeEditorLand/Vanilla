var p=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var c=(s,t,r,i)=>{for(var e=i>1?void 0:i?u(t,r):t,l=s.length-1,n;l>=0;l--)(n=s[l])&&(e=(i?n(t,r,e):n(e))||e);return i&&e&&p(t,r,e),e},o=(s,t)=>(r,i)=>t(r,i,s);import{Lazy as d}from"../../../../../vs/base/common/lazy.js";import{Disposable as h}from"../../../../../vs/base/common/lifecycle.js";import{IClipboardService as I}from"../../../../../vs/platform/clipboard/common/clipboardService.js";import{IDialogService as v}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IInstantiationService as D}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as f}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{ILayoutService as S}from"../../../../../vs/platform/layout/browser/layoutService.js";import{ILogService as b}from"../../../../../vs/platform/log/common/log.js";import{IProductService as w}from"../../../../../vs/platform/product/common/productService.js";import{BrowserDialogHandler as y}from"../../../../../vs/workbench/browser/parts/dialogs/dialogHandler.js";import{registerWorkbenchContribution2 as k,WorkbenchPhase as A}from"../../../../../vs/workbench/common/contributions.js";import"../../../../../vs/workbench/common/dialogs.js";import"../../../../../vs/workbench/services/dialogs/common/dialogService.js";let a=class extends h{constructor(r,i,e,l,n,g,m){super();this.dialogService=r;this.impl=new d(()=>new y(i,e,l,n,g,m)),this.model=this.dialogService.model,this._register(this.model.onWillShowDialog(()=>{this.currentDialog||this.processDialogs()})),this.processDialogs()}static ID="workbench.contrib.dialogHandler";model;impl;currentDialog;async processDialogs(){for(;this.model.dialogs.length;){this.currentDialog=this.model.dialogs[0];let r;try{if(this.currentDialog.args.confirmArgs){const i=this.currentDialog.args.confirmArgs;r=await this.impl.value.confirm(i.confirmation)}else if(this.currentDialog.args.inputArgs){const i=this.currentDialog.args.inputArgs;r=await this.impl.value.input(i.input)}else if(this.currentDialog.args.promptArgs){const i=this.currentDialog.args.promptArgs;r=await this.impl.value.prompt(i.prompt)}else await this.impl.value.about()}catch(i){r=i}this.currentDialog.close(r),this.currentDialog=void 0}}};a=c([o(0,v),o(1,b),o(2,S),o(3,f),o(4,D),o(5,w),o(6,I)],a),k(a.ID,a,A.BlockStartup);export{a as DialogHandlerContribution};
