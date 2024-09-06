var E=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=(s,n,t,e)=>{for(var i=e>1?void 0:e?p(n,t):n,a=s.length-1,c;a>=0;a--)(c=s[a])&&(i=(e?c(n,t,i):c(i))||i);return e&&i&&E(n,t,i),i},r=(s,n)=>(t,e)=>n(t,e,s);import"../../../../../vs/base/common/actions.js";import{Disposable as x}from"../../../../../vs/base/common/lifecycle.js";import*as v from"../../../../../vs/nls.js";import{Action2 as S,registerAction2 as b}from"../../../../../vs/platform/actions/common/actions.js";import{ICommandService as f}from"../../../../../vs/platform/commands/common/commands.js";import{IContextKeyService as y,RawContextKey as I}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IExtensionManagementService as u}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{ExtensionIdentifier as h}from"../../../../../vs/platform/extensions/common/extensions.js";import{IProductService as C}from"../../../../../vs/platform/product/common/productService.js";import{ITelemetryService as A}from"../../../../../vs/platform/telemetry/common/telemetry.js";import"../../../../../vs/workbench/common/contributions.js";import{IWorkbenchExtensionEnablementService as g}from"../../../../../vs/workbench/services/extensionManagement/common/extensionManagement.js";const m=new I("showRemoteStartEntryInWeb",!1);let o=class extends x{constructor(t,e,i,a,c,T){super();this.commandService=t;this.productService=e;this.extensionManagementService=i;this.extensionEnablementService=a;this.telemetryService=c;this.contextKeyService=T;const d=this.productService.remoteExtensionTips?.tunnel;this.startCommand=d?.startEntry?.startCommand??"",this.remoteExtensionId=d?.extensionId??"",this._init(),this.registerActions(),this.registerListeners()}static REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID="workbench.action.remote.showWebStartEntryActions";remoteExtensionId;startCommand;registerActions(){const t=v.localize2("remote.category","Remote"),e=this;this._register(b(class extends S{constructor(){super({id:o.REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID,category:t,title:v.localize2("remote.showWebStartEntryActions","Show Remote Start Entry for web"),f1:!1})}async run(){await e.showWebRemoteStartActions()}}))}registerListeners(){this._register(this.extensionEnablementService.onEnablementChanged(async t=>{for(const e of t)h.equals(this.remoteExtensionId,e.identifier.id)&&(this.extensionEnablementService.isEnabled(e)?m.bindTo(this.contextKeyService).set(!0):m.bindTo(this.contextKeyService).set(!1))}))}async _init(){const t=(await this.extensionManagementService.getInstalled()).find(e=>h.equals(e.identifier.id,this.remoteExtensionId));t&&this.extensionEnablementService.isEnabled(t)&&m.bindTo(this.contextKeyService).set(!0)}async showWebRemoteStartActions(){this.commandService.executeCommand(this.startCommand),this.telemetryService.publicLog2("workbenchActionExecuted",{id:this.startCommand,from:"remote start entry"})}};o=l([r(0,f),r(1,C),r(2,u),r(3,g),r(4,A),r(5,y)],o);export{o as RemoteStartEntry,m as showStartEntryInWeb};
