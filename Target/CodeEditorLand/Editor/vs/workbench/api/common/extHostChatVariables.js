import"../../../../vs/base/common/cancellation.js";import{onUnexpectedExternalError as m}from"../../../../vs/base/common/errors.js";import{toDisposable as u}from"../../../../vs/base/common/lifecycle.js";import{ThemeIcon as v}from"../../../../vs/base/common/themables.js";import"../../../../vs/platform/extensions/common/extensions.js";import{MainContext as b}from"../../../../vs/workbench/api/common/extHost.protocol.js";import*as l from"../../../../vs/workbench/api/common/extHostTypeConverters.js";import*as p from"../../../../vs/workbench/api/common/extHostTypes.js";import"../../../../vs/workbench/contrib/chat/common/chatVariables.js";import{checkProposedApiEnabled as C}from"../../../../vs/workbench/services/extensions/common/extensions.js";class d{static _idPool=0;_resolver=new Map;_proxy;constructor(o){this._proxy=o.getProxy(b.MainThreadChatVariables)}async $resolveVariable(o,i,t,s){const e=this._resolver.get(o);if(e)try{if(e.resolver.resolve2){C(e.extension,"chatParticipantAdditions");const r=new R(i,this._proxy),a=await e.resolver.resolve2(e.data.name,{prompt:t},r.apiObject,s);if(a&&a[0])return a[0].value}else{const r=await e.resolver.resolve(e.data.name,{prompt:t},s);if(r&&r[0])return r[0].value}}catch(r){m(r)}}registerVariableResolver(o,i,t,s,e,r,a,f,h){const n=d._idPool++,c=h?v.fromId(h):void 0;return this._resolver.set(n,{extension:o,data:{id:i,name:t,description:s,modelDescription:e,icon:c},resolver:a}),this._proxy.$registerVariable(n,{id:i,name:t,description:s,modelDescription:e,isSlow:r,fullName:f,icon:c}),u(()=>{this._resolver.delete(n),this._proxy.$unregisterVariable(n)})}}class R{constructor(o,i){this._requestId=o;this._proxy=i}_isClosed=!1;_apiObject;close(){this._isClosed=!0}get apiObject(){if(!this._apiObject){let t=function(e){if(i._isClosed){const r=new Error("Response stream has been closed");throw Error.captureStackTrace(r,e),r}};var o=t;const i=this,s=e=>{this._proxy.$handleProgressChunk(this._requestId,e)};this._apiObject={progress(e){t(this.progress);const r=new p.ChatResponseProgressPart(e),a=l.ChatResponseProgressPart.from(r);return s(a),this},reference(e){t(this.reference);const r=new p.ChatResponseReferencePart(e),a=l.ChatResponseReferencePart.from(r);return s(a),this},push(e){return t(this.push),e instanceof p.ChatResponseReferencePart?s(l.ChatResponseReferencePart.from(e)):e instanceof p.ChatResponseProgressPart&&s(l.ChatResponseProgressPart.from(e)),this}}}return this._apiObject}}export{d as ExtHostChatVariables};
