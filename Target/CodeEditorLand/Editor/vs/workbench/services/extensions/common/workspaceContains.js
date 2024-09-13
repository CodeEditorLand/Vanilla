import{promiseWithResolvers as u}from"../../../../base/common/async.js";import{CancellationTokenSource as d}from"../../../../base/common/cancellation.js";import*as m from"../../../../base/common/errors.js";import*as x from"../../../../base/common/resources.js";import{URI as v}from"../../../../base/common/uri.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import{toWorkspaceFolder as g}from"../../../../platform/workspace/common/workspace.js";import{QueryBuilder as I}from"../../search/common/queryBuilder.js";import{ISearchService as h}from"../../search/common/search.js";const k=7e3;function R(e,o){const n=o.activationEvents;if(!n)return Promise.resolve(void 0);const i=[],r=[];for(const c of n)if(/^workspaceContains:/.test(c)){const f=c.substr(18);f.indexOf("*")>=0||f.indexOf("?")>=0||e.forceUsingSearch?r.push(f):i.push(f)}if(i.length===0&&r.length===0)return Promise.resolve(void 0);const{promise:a,resolve:l}=u(),s=c=>l({activationEvent:c}),t=Promise.all(i.map(c=>y(e,c,s))).then(()=>{}),p=C(e,o.identifier,r,s);return Promise.all([t,p]).then(()=>{l(void 0)}),a}async function y(e,o,n){for(const i of e.folders)if(await e.exists(x.joinPath(v.revive(i),o))){n(`workspaceContains:${o}`);return}}async function C(e,o,n,i){if(n.length===0)return Promise.resolve(void 0);const r=new d,a=e.checkExists(e.folders,n,r.token),l=setTimeout(async()=>{r.cancel(),e.logService.info(`Not activating extension '${o.value}': Timed out while searching for 'workspaceContains' pattern ${n.join(",")}`)},k);let s=!1;try{s=await a}catch(t){m.isCancellationError(t)||m.onUnexpectedError(t)}r.dispose(),clearTimeout(l),s&&i(`workspaceContains:${n.join(",")}`)}function j(e,o,n,i){const r=e.get(E),a=e.get(h),s=r.createInstance(I).file(o.map(t=>g(v.revive(t))),{_reason:"checkExists",includePattern:n,exists:!0});return a.fileSearch(s,i).then(t=>!!t.limitHit,t=>m.isCancellationError(t)?!1:Promise.reject(t))}export{R as checkActivateWorkspaceContainsExtension,j as checkGlobFileExists};
