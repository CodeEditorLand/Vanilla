var E=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var x=(u,d,r,e)=>{for(var t=e>1?void 0:e?w(d,r):d,s=u.length-1,o;s>=0;s--)(o=u[s])&&(t=(e?o(d,r,t):o(t))||t);return e&&t&&E(d,r,t),t},a=(u,d)=>(r,e)=>d(r,e,u);import{homedir as I}from"os";import{Schemas as f}from"../../../base/common/network.js";import*as g from"../../../base/common/path.js";import*as y from"../../../base/common/resources.js";import{URI as k}from"../../../base/common/uri.js";import{win32 as v}from"../../../base/node/processes.js";import"../../../platform/extensions/common/extensions.js";import{ILogService as b}from"../../../platform/log/common/log.js";import{WorkspaceFolder as D}from"../../../platform/workspace/common/workspace.js";import{IExtHostApiDeprecationService as H}from"../common/extHostApiDeprecationService.js";import{IExtHostConfiguration as S}from"../common/extHostConfiguration.js";import{IExtHostDocumentsAndEditors as O}from"../common/extHostDocumentsAndEditors.js";import{IExtHostInitDataService as P}from"../common/extHostInitDataService.js";import{IExtHostRpcService as A}from"../common/extHostRpcService.js";import{CustomExecutionDTO as h,ExtHostTaskBase as _,TaskDTO as T,TaskHandleDTO as $}from"../common/extHostTask.js";import{IExtHostTerminalService as F}from"../common/extHostTerminalService.js";import"../common/extHostTypes.js";import{IExtHostVariableResolverProvider as W}from"../common/extHostVariableResolverService.js";import{IExtHostWorkspace as R}from"../common/extHostWorkspace.js";import"../common/shared/tasks.js";let l=class extends _{constructor(r,e,t,s,o,i,n,p,c){super(r,e,t,s,o,i,n,p);this.workspaceService=t;this.variableResolver=c;e.remote.isRemote&&e.remote.authority?this.registerTaskSystem(f.vscodeRemote,{scheme:f.vscodeRemote,authority:e.remote.authority,platform:process.platform}):this.registerTaskSystem(f.file,{scheme:f.file,authority:"",platform:process.platform}),this._proxy.$registerSupportedExecutions(!0,!0,!0)}async executeTask(r,e){const t=e;if(!e.execution&&t._id===void 0)throw new Error("Tasks to execute must include an execution");if(t._id!==void 0){const s=$.from(t,this.workspaceService),o=await this._proxy.$getTaskExecution(s);if(o.task===void 0)throw new Error("Task from execution DTO is undefined");const i=await this.getTaskExecution(o,e);return this._proxy.$executeTask(s).catch(()=>{}),i}else{const s=T.from(e,r);if(s===void 0)return Promise.reject(new Error("Task is not valid"));h.is(s.execution)&&await this.addCustomExecution(s,e,!1);const o=await this.getTaskExecution(await this._proxy.$getTaskExecution(s),e);return this._proxy.$executeTask(s).catch(()=>{}),o}}provideTasksInternal(r,e,t,s){const o=[];if(s)for(const i of s){this.checkDeprecation(i,t),(!i.definition||!r[i.definition.type])&&this._logService.warn(`The task [${i.source}, ${i.name}] uses an undefined task type. The task will be ignored in the future.`);const n=T.from(i,t.extension);n&&(o.push(n),h.is(n.execution)&&e.push(this.addCustomExecution(n,i,!0)))}return{tasks:o,extension:t.extension}}async resolveTaskInternal(r){return r}async getAFolder(r){let e=r&&r.length>0?r[0]:void 0;if(!e){const t=k.file(I());e=new D({uri:t,name:y.basename(t),index:0})}return{uri:e.uri,name:e.name,index:e.index,toResource:()=>{throw new Error("Not implemented")}}}async $resolveVariables(r,e){const t=k.revive(r),s={process:void 0,variables:Object.create(null)},o=await this._workspaceProvider.resolveWorkspaceFolder(t),i=await this._workspaceProvider.getWorkspaceFolders2()??[],n=await this.variableResolver.getResolver(),p=o?{uri:o.uri,name:o.name,index:o.index,toResource:()=>{throw new Error("Not implemented")}}:await this.getAFolder(i);for(const c of e.variables)s.variables[c]=await n.resolveAsync(p,c);if(e.process!==void 0){let c;if(e.process.path!==void 0){c=e.process.path.split(g.delimiter);for(let m=0;m<c.length;m++)c[m]=await n.resolveAsync(p,c[m])}s.process=await v.findExecutable(await n.resolveAsync(p,e.process.name),e.process.cwd!==void 0?await n.resolveAsync(p,e.process.cwd):void 0,c)}return s}async $jsonTasksSupported(){return!0}async $findExecutable(r,e,t){return v.findExecutable(r,e,t)}};l=x([a(0,A),a(1,P),a(2,R),a(3,O),a(4,S),a(5,F),a(6,b),a(7,H),a(8,W)],l);export{l as ExtHostTask};
