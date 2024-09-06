var A=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var D=(c,s,o,t)=>{for(var e=t>1?void 0:t?j(s,o):s,n=c.length-1,i;n>=0;n--)(i=c[n])&&(e=(t?i(s,o,e):i(e))||e);return t&&e&&A(s,o,e),e},d=(c,s)=>(o,t)=>s(o,t,c);import{asArray as G}from"../../../../vs/base/common/arrays.js";import{asPromise as B}from"../../../../vs/base/common/async.js";import{CancellationToken as P}from"../../../../vs/base/common/cancellation.js";import{ErrorNoTelemetry as _,NotSupportedError as N}from"../../../../vs/base/common/errors.js";import{Emitter as x}from"../../../../vs/base/common/event.js";import{Schemas as S}from"../../../../vs/base/common/network.js";import*as y from"../../../../vs/base/common/platform.js";import{URI as K}from"../../../../vs/base/common/uri.js";import"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as V}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as O}from"../../../../vs/platform/log/common/log.js";import{MainContext as Y}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{IExtHostApiDeprecationService as b}from"../../../../vs/workbench/api/common/extHostApiDeprecationService.js";import{IExtHostConfiguration as w}from"../../../../vs/workbench/api/common/extHostConfiguration.js";import{IExtHostDocumentsAndEditors as C}from"../../../../vs/workbench/api/common/extHostDocumentsAndEditors.js";import{IExtHostInitDataService as H}from"../../../../vs/workbench/api/common/extHostInitDataService.js";import{IExtHostRpcService as $}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{IExtHostTerminalService as M}from"../../../../vs/workbench/api/common/extHostTerminalService.js";import*as u from"../../../../vs/workbench/api/common/extHostTypes.js";import{IExtHostWorkspace as U}from"../../../../vs/workbench/api/common/extHostWorkspace.js";import{USER_TASKS_GROUP_KEY as q}from"../../../../vs/workbench/contrib/tasks/common/tasks.js";import"../common/shared/tasks.js";var I;(o=>{function c(t){if(t!=null)return t}o.from=c;function s(t){if(t!=null)return t}o.to=s})(I||={});var v;(o=>{function c(t){if(t!=null)return t}o.from=c;function s(t){if(t!=null)return t}o.to=s})(v||={});var R;(o=>{function c(t){if(t!=null)return t}o.from=c;function s(t){if(t!=null)return t}o.to=s})(R||={});var E;(t=>{function c(e){if(e){const n=e;return n&&!!n.process}else return!1}t.is=c;function s(e){if(e==null)return;const n={process:e.process,args:e.args};return e.options&&(n.options=R.from(e.options)),n}t.from=s;function o(e){if(e!=null)return new u.ProcessExecution(e.process,e.args,e.options)}t.to=o})(E||={});var F;(o=>{function c(t){if(t!=null)return t}o.from=c;function s(t){if(t!=null)return t}o.to=s})(F||={});var l;(t=>{function c(e){if(e){const n=e;return n&&(!!n.commandLine||!!n.command)}else return!1}t.is=c;function s(e){if(e==null)return;const n={};return e.commandLine!==void 0?n.commandLine=e.commandLine:(n.command=e.command,n.args=e.args),e.options&&(n.options=F.from(e.options)),n}t.from=s;function o(e){if(!(e==null||e.command===void 0&&e.commandLine===void 0))return e.commandLine?new u.ShellExecution(e.commandLine,e.options):new u.ShellExecution(e.command,e.args?e.args:[],e.options)}t.to=o})(l||={});var k;(t=>{function c(e){if(e){const n=e;return n&&n.customExecution==="customExecution"}else return!1}t.is=c;function s(e){return{customExecution:"customExecution"}}t.from=s;function o(e,n){return n.get(e)}t.to=o})(k||={});var z;(s=>{function c(o,t){let e;return o.scope!==void 0&&typeof o.scope!="number"?e=o.scope.uri:o.scope!==void 0&&typeof o.scope=="number"&&(o.scope===u.TaskScope.Workspace&&t&&t.workspaceFile?e=t.workspaceFile:e=q),{id:o._id,workspaceFolder:e}}s.from=c})(z||={});var L;(s=>{function c(o){if(o!=null)return{_id:o.id,isDefault:o.isDefault}}s.from=c})(L||={});var f;(t=>{function c(e,n){if(e==null)return[];const i=[];for(const r of e){const a=s(r,n);a&&i.push(a)}return i}t.fromMany=c;function s(e,n){if(e==null)return;let i;e.execution instanceof u.ProcessExecution?i=E.from(e.execution):e.execution instanceof u.ShellExecution?i=l.from(e.execution):e.execution&&e.execution instanceof u.CustomExecution&&(i=k.from(e.execution));const r=I.from(e.definition);let a;return e.scope?typeof e.scope=="number"?a=e.scope:a=e.scope.uri:a=u.TaskScope.Workspace,!r||!a?void 0:{_id:e._id,definition:r,name:e.name,source:{extensionId:n.identifier.value,label:e.source,scope:a},execution:i,isBackground:e.isBackground,group:L.from(e.group),presentationOptions:v.from(e.presentationOptions),problemMatchers:G(e.problemMatchers),hasDefinedMatchers:e.hasDefinedMatchers,runOptions:e.runOptions?e.runOptions:{reevaluateOnRerun:!0},detail:e.detail}}t.from=s;async function o(e,n,i){if(e==null)return;let r;E.is(e.execution)?r=E.to(e.execution):l.is(e.execution)?r=l.to(e.execution):k.is(e.execution)&&(r=k.to(e._id,i));const a=I.to(e.definition);let m;if(e.source&&(e.source.scope!==void 0?typeof e.source.scope=="number"?m=e.source.scope:m=await n.resolveWorkspaceFolder(K.revive(e.source.scope)):m=u.TaskScope.Workspace),!a||!m)return;const p=new u.Task(a,m,e.name,e.source.label,r,e.problemMatchers);return e.isBackground!==void 0&&(p.isBackground=e.isBackground),e.group!==void 0&&(p.group=u.TaskGroup.from(e.group._id),p.group&&e.group.isDefault&&(p.group=new u.TaskGroup(p.group.id,p.group.label),e.group.isDefault===!0&&(p.group.isDefault=e.group.isDefault))),e.presentationOptions&&(p.presentationOptions=v.to(e.presentationOptions)),e._id&&(p._id=e._id),e.detail&&(p.detail=e.detail),p}t.to=o})(f||={});var W;(o=>{function c(t){return t}o.from=c;function s(t){if(t)return Object.assign(Object.create(null),t)}o.to=s})(W||={});class g{constructor(s,o,t){this._id=o;this._task=t;this.#e=s}#e;get task(){return this._task}terminate(){this.#e.terminateTask(this)}fireDidStartProcess(s){}fireDidEndProcess(s){}}let T=class{_serviceBrand;_proxy;_workspaceProvider;_editorService;_configurationService;_terminalService;_logService;_deprecationService;_handleCounter;_handlers;_taskExecutions;_taskExecutionPromises;_providedCustomExecutions2;_notProvidedCustomExecutions;_activeCustomExecutions2;_lastStartedTask;_onDidExecuteTask=new x;_onDidTerminateTask=new x;_onDidTaskProcessStarted=new x;_onDidTaskProcessEnded=new x;constructor(s,o,t,e,n,i,r,a){this._proxy=s.getProxy(Y.MainThreadTask),this._workspaceProvider=t,this._editorService=e,this._configurationService=n,this._terminalService=i,this._handleCounter=0,this._handlers=new Map,this._taskExecutions=new Map,this._taskExecutionPromises=new Map,this._providedCustomExecutions2=new Map,this._notProvidedCustomExecutions=new Set,this._activeCustomExecutions2=new Map,this._logService=r,this._deprecationService=a,this._proxy.$registerSupportedExecutions(!0)}registerTaskProvider(s,o,t){if(!t)return new u.Disposable(()=>{});const e=this.nextHandle();return this._handlers.set(e,{type:o,provider:t,extension:s}),this._proxy.$registerTaskProvider(e,o),new u.Disposable(()=>{this._handlers.delete(e),this._proxy.$unregisterTaskProvider(e)})}registerTaskSystem(s,o){this._proxy.$registerTaskSystem(s,o)}fetchTasks(s){return this._proxy.$fetchTasks(W.from(s)).then(async o=>{const t=[];for(const e of o){const n=await f.to(e,this._workspaceProvider,this._providedCustomExecutions2);n&&t.push(n)}return t})}get taskExecutions(){const s=[];return this._taskExecutions.forEach(o=>s.push(o)),s}terminateTask(s){if(!(s instanceof g))throw new Error("No valid task execution provided");return this._proxy.$terminateTask(s._id)}get onDidStartTask(){return this._onDidExecuteTask.event}async $onDidStartTask(s,o,t){const e=this._providedCustomExecutions2.get(s.id);e&&(this._activeCustomExecutions2.set(s.id,e),this._terminalService.attachPtyToTerminal(o,await e.callback(t))),this._lastStartedTask=s.id,this._onDidExecuteTask.fire({execution:await this.getTaskExecution(s)})}get onDidEndTask(){return this._onDidTerminateTask.event}async $OnDidEndTask(s){if(!this._taskExecutionPromises.has(s.id))return;const o=await this.getTaskExecution(s);this._taskExecutionPromises.delete(s.id),this._taskExecutions.delete(s.id),this.customExecutionComplete(s),this._onDidTerminateTask.fire({execution:o})}get onDidStartTaskProcess(){return this._onDidTaskProcessStarted.event}async $onDidStartTaskProcess(s){const o=await this.getTaskExecution(s.id);this._onDidTaskProcessStarted.fire({execution:o,processId:s.processId})}get onDidEndTaskProcess(){return this._onDidTaskProcessEnded.event}async $onDidEndTaskProcess(s){const o=await this.getTaskExecution(s.id);this._onDidTaskProcessEnded.fire({execution:o,exitCode:s.exitCode})}$provideTasks(s,o){const t=this._handlers.get(s);if(!t)return Promise.reject(new Error("no handler found"));const e=[],n=B(()=>t.provider.provideTasks(P.None)).then(i=>this.provideTasksInternal(o,e,t,i));return new Promise(i=>{n.then(r=>{Promise.all(e).then(()=>{i(r)})})})}async $resolveTask(s,o){const t=this._handlers.get(s);if(!t)return Promise.reject(new Error("no handler found"));if(o.definition.type!==t.type)throw new Error(`Unexpected: Task of type [${o.definition.type}] cannot be resolved by provider of type [${t.type}].`);const e=await f.to(o,this._workspaceProvider,this._providedCustomExecutions2);if(!e)throw new Error("Unexpected: Task cannot be resolved.");const n=await t.provider.resolveTask(e,P.None);if(!n)return;this.checkDeprecation(n,t);const i=f.from(n,t.extension);if(!i)throw new Error("Unexpected: Task cannot be resolved.");if(n.definition!==e.definition)throw new Error("Unexpected: The resolved task definition must be the same object as the original task definition. The task definition cannot be changed.");return k.is(i.execution)&&await this.addCustomExecution(i,n,!0),await this.resolveTaskInternal(i)}nextHandle(){return this._handleCounter++}async addCustomExecution(s,o,t){const e=await this._proxy.$createTaskId(s);!t&&!this._providedCustomExecutions2.has(e)&&(this._notProvidedCustomExecutions.add(e),this._activeCustomExecutions2.set(e,o.execution)),this._providedCustomExecutions2.set(e,o.execution)}async getTaskExecution(s,o){if(typeof s=="string"){const n=this._taskExecutionPromises.get(s);if(!n)throw new _("Unexpected: The specified task is missing an execution");return n}const t=this._taskExecutionPromises.get(s.id);if(t)return t;let e;return o?e=Promise.resolve(new g(this,s.id,o)):e=f.to(s.task,this._workspaceProvider,this._providedCustomExecutions2).then(n=>{if(!n)throw new _("Unexpected: Task does not exist.");return new g(this,s.id,n)}),this._taskExecutionPromises.set(s.id,e),e.then(n=>(this._taskExecutions.set(s.id,n),n))}checkDeprecation(s,o){s._deprecated&&this._deprecationService.report("Task.constructor",o.extension,"Use the Task constructor that takes a `scope` instead.")}customExecutionComplete(s){this._activeCustomExecutions2.get(s.id)&&this._activeCustomExecutions2.delete(s.id),this._notProvidedCustomExecutions.has(s.id)&&this._lastStartedTask!==s.id&&(this._providedCustomExecutions2.delete(s.id),this._notProvidedCustomExecutions.delete(s.id));const t=this._notProvidedCustomExecutions.values();let e=t.next();for(;!e.done;)!this._activeCustomExecutions2.has(e.value)&&this._lastStartedTask!==e.value&&(this._providedCustomExecutions2.delete(e.value),this._notProvidedCustomExecutions.delete(e.value)),e=t.next()}};T=D([d(0,$),d(1,H),d(2,U),d(3,C),d(4,w),d(5,M),d(6,O),d(7,b)],T);let h=class extends T{constructor(s,o,t,e,n,i,r,a){super(s,o,t,e,n,i,r,a),this.registerTaskSystem(S.vscodeRemote,{scheme:S.vscodeRemote,authority:"",platform:y.PlatformToString(y.Platform.Web)})}async executeTask(s,o){if(!o.execution)throw new Error("Tasks to execute must include an execution");const t=f.from(o,s);if(t===void 0)throw new Error("Task is not valid");if(k.is(t.execution))await this.addCustomExecution(t,o,!1);else throw new N;const e=await this.getTaskExecution(await this._proxy.$getTaskExecution(t),o);return this._proxy.$executeTask(t).catch(n=>{throw new Error(n)}),e}provideTasksInternal(s,o,t,e){const n=[];if(e)for(const i of e){if(this.checkDeprecation(i,t),!i.definition||!s[i.definition.type]){const a=i.source?i.source:"No task source";this._logService.warn(`The task [${a}, ${i.name}] uses an undefined task type. The task will be ignored in the future.`)}const r=f.from(i,t.extension);r&&k.is(r.execution)?(n.push(r),o.push(this.addCustomExecution(r,i,!0))):this._logService.warn("Only custom execution tasks supported.")}return{tasks:n,extension:t.extension}}async resolveTaskInternal(s){if(k.is(s.execution))return s;this._logService.warn("Only custom execution tasks supported.")}async $resolveVariables(s,o){return{process:void 0,variables:Object.create(null)}}async $jsonTasksSupported(){return!1}async $findExecutable(s,o,t){}};h=D([d(0,$),d(1,H),d(2,U),d(3,C),d(4,w),d(5,M),d(6,O),d(7,b)],h);const ge=V("IExtHostTask");export{k as CustomExecutionDTO,T as ExtHostTaskBase,ge as IExtHostTask,f as TaskDTO,z as TaskHandleDTO,h as WorkerExtHostTask};