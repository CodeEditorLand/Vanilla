var x=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var g=(o,i,e,n)=>{for(var t=n>1?void 0:n?V(i,e):i,r=o.length-1,a;r>=0;r--)(a=o[r])&&(t=(n?a(i,e,t):a(t))||t);return n&&t&&x(i,e,t),t},l=(o,i)=>(e,n)=>i(e,n,o);import"../../../../base/common/cancellation.js";import{toDisposable as I}from"../../../../base/common/lifecycle.js";import{isDefined as v}from"../../../../base/common/types.js";import{ContextKeyExpr as y,IContextKeyService as E}from"../../../../platform/contextkey/common/contextkey.js";import{ExtensionIdentifier as f}from"../../../../platform/extensions/common/extensions.js";import{createDecorator as D}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as C}from"../../../../platform/log/common/log.js";import{CONTEXT_VARIABLE_NAME as T,CONTEXT_VARIABLE_TYPE as w,CONTEXT_VARIABLE_VALUE as P}from"./debug.js";import{getContextForVariable as S}from"./debugContext.js";import{Scope as R,Variable as c,VisualizedExpression as h}from"./debugModel.js";import{IExtensionService as A}from"../../../services/extensions/common/extensions.js";import{ExtensionsRegistry as k}from"../../../services/extensions/common/extensionsRegistry.js";const oe=D("debugVisualizerService");class H{constructor(i,e){this.handle=i;this.viz=e}get name(){return this.viz.name}get iconPath(){return this.viz.iconPath}get iconClass(){return this.viz.iconClass}async resolve(i){return this.viz.visualization??=await this.handle.resolveDebugVisualizer(this.viz,i)}async execute(){await this.handle.executeDebugVisualizerCommand(this.viz.id)}}const z={object:[],dispose:()=>{}};let p=class{constructor(i,e,n){this.contextKeyService=i;this.extensionService=e;this.logService=n;K.setHandler((t,{added:r,removed:a})=>{this.registrations=this.registrations.filter(d=>!a.some(s=>f.equals(s.description.identifier,d.extensionId))),r.forEach(d=>this.processExtensionRegistration(d.description))})}handles=new Map;trees=new Map;didActivate=new Map;registrations=[];async getApplicableFor(i,e){if(!(i instanceof c))return z;const n=i.getThreadId();if(n===void 0)return z;const t=this.getVariableContext(n,i),r=S(this.contextKeyService,i,[[T.key,i.name],[P.key,i.value],[w.key,i.type]]),a=await Promise.all(this.registrations.map(async s=>{if(!r.contextMatchesRules(s.expr))return;let u=this.didActivate.get(s.id);if(u||(u=this.extensionService.activateByEvent(`onDebugVisualizer:${s.id}`),this.didActivate.set(s.id,u)),await u,e.isCancellationRequested)return;const m=this.handles.get(b(s.extensionId,s.id));return m&&{handle:m,result:await m.provideDebugVisualizers(t,e)}})),d={object:a.filter(v).flatMap(s=>s.result.map(u=>new H(s.handle,u))),dispose:()=>{for(const s of a)s?.handle.disposeDebugVisualizers(s.result.map(u=>u.id))}};return e.isCancellationRequested&&d.dispose(),d}register(i){const e=b(i.extensionId,i.id);return this.handles.set(e,i),I(()=>this.handles.delete(e))}registerTree(i,e){return this.trees.set(i,e),I(()=>this.trees.delete(i))}async getVisualizedNodeFor(i,e){if(!(e instanceof c))return;const n=e.getThreadId();if(n===void 0)return;const t=this.trees.get(i);if(t)try{const r=await t.getTreeItem(this.getVariableContext(n,e));return r?new h(this,i,r,e):void 0}catch(r){this.logService.warn("Failed to get visualized node",r);return}}async getVisualizedChildren(i,e){return(await this.trees.get(i)?.getChildren(e)||[]).map(t=>new h(this,i,t,void 0))}async editTreeItem(i,e,n){const t=await this.trees.get(i)?.editItem?.(e.id,n);t&&Object.assign(e,t)}getVariableContext(i,e){const n={sessionId:e.getSession()?.getId()||"",containerId:e.parent instanceof c?e.reference:void 0,threadId:i,variable:{name:e.name,value:e.value,type:e.type,evaluateName:e.evaluateName,variablesReference:e.reference||0,indexedVariables:e.indexedVariables,memoryReference:e.memoryReference,namedVariables:e.namedVariables,presentationHint:e.presentationHint}};for(let t=e;t instanceof c;t=t.parent)t.parent instanceof R&&(n.frameId=t.parent.stackFrame.frameId);return n}processExtensionRegistration(i){const e=i.contributes?.debugVisualizers;if(e instanceof Array)for(const{when:n,id:t}of e)try{const r=y.deserialize(n);r&&this.registrations.push({expr:r,id:t,extensionId:i.identifier})}catch(r){this.logService.error(`Error processing debug visualizer registration from extension '${i.identifier.value}'`,r)}}};p=g([l(0,E),l(1,A),l(2,C)],p);const b=(o,i)=>`${f.toKey(o)}\0${i}`,K=k.registerExtensionPoint({extensionPoint:"debugVisualizers",jsonSchema:{type:"array",items:{type:"object",properties:{id:{type:"string",description:"Name of the debug visualizer"},when:{type:"string",description:"Condition when the debug visualizer is applicable"}},required:["id","when"]}},activationEventsGenerator:(o,i)=>{for(const e of o)e.id&&i.push(`onDebugVisualizer:${e.id}`)}});export{H as DebugVisualizer,p as DebugVisualizerService,oe as IDebugVisualizerService};
