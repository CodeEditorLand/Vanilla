var b=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var v=(s,n,o,t)=>{for(var e=t>1?void 0:t?h(n,o):n,i=s.length-1,r;i>=0;i--)(r=s[i])&&(e=(t?r(n,o,e):r(e))||e);return t&&e&&b(n,o,e),e},l=(s,n)=>(o,t)=>n(o,t,s);import{Disposable as p,DisposableStore as g}from"../../../../../../base/common/lifecycle.js";import{Registry as S}from"../../../../../../platform/registry/common/platform.js";import{Extensions as d}from"../../../../../common/contributions.js";import{IExtensionService as f}from"../../../../../services/extensions/common/extensions.js";import{LifecyclePhase as u}from"../../../../../services/lifecycle/common/lifecycle.js";import{INotebookKernelService as _}from"../../../common/notebookKernelService.js";import{INotebookLoggingService as k}from"../../../common/notebookLoggingService.js";let a=class extends p{constructor(o,t,e){super();this._notebookKernelService=o;this._extensionService=t;this._notebookLoggingService=e;this._registerListeners()}_detectionMap=new Map;_localDisposableStore=this._register(new g);_registerListeners(){this._localDisposableStore.clear(),this._localDisposableStore.add(this._extensionService.onWillActivateByEvent(t=>{if(t.event.startsWith("onNotebook:")){if(this._extensionService.activationEventIsDone(t.event))return;const e=t.event.substring(11);if(e==="*")return;let i=!1;const r=this._extensionService.getExtensionsStatus();if(this._extensionService.extensions.forEach(c=>{r[c.identifier.value].activationTimes||c.activationEvents?.includes(t.event)&&(i=!0)}),i&&!this._detectionMap.has(e)){this._notebookLoggingService.debug("KernelDetection",`start extension activation for ${e}`);const c=this._notebookKernelService.registerNotebookKernelDetectionTask({notebookType:e});this._detectionMap.set(e,c)}}}));let o=null;this._localDisposableStore.add(this._extensionService.onDidChangeExtensionsStatus(()=>{o&&clearTimeout(o),o=setTimeout(()=>{const t=[];for(const[e,i]of this._detectionMap)this._extensionService.activationEventIsDone(`onNotebook:${e}`)&&(this._notebookLoggingService.debug("KernelDetection",`finish extension activation for ${e}`),t.push(e),i.dispose());t.forEach(e=>{this._detectionMap.delete(e)})})})),this._localDisposableStore.add({dispose:()=>{o&&clearTimeout(o)}})}};a=v([l(0,_),l(1,f),l(2,k)],a),S.as(d.Workbench).registerWorkbenchContribution(a,u.Restored);
