import{promiseWithResolvers as d}from"../../../../base/common/async.js";import{CancellationTokenSource as p}from"../../../../base/common/cancellation.js";import*as m from"../../../../base/common/errors.js";import*as x from"../../../../base/common/resources.js";import{URI as v}from"../../../../base/common/uri.js";import"../../../../platform/extensions/common/extensions.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/log/common/log.js";import{toWorkspaceFolder as g}from"../../../../platform/workspace/common/workspace.js";import{QueryBuilder as I}from"../../search/common/queryBuilder.js";import{ISearchService as h}from"../../search/common/search.js";const k=7e3;function q(e,o){const n=o.activationEvents;if(!n)return Promise.resolve(void 0);const t=[],r=[];for(const a of n)if(/^workspaceContains:/.test(a)){const f=a.substr(18);f.indexOf("*")>=0||f.indexOf("?")>=0||e.forceUsingSearch?r.push(f):t.push(f)}if(t.length===0&&r.length===0)return Promise.resolve(void 0);const{promise:c,resolve:l}=d(),s=a=>l({activationEvent:a}),i=Promise.all(t.map(a=>C(e,a,s))).then(()=>{}),u=P(e,o.identifier,r,s);return Promise.all([i,u]).then(()=>{l(void 0)}),c}async function C(e,o,n){for(const t of e.folders)if(await e.exists(x.joinPath(v.revive(t),o))){n(`workspaceContains:${o}`);return}}async function P(e,o,n,t){if(n.length===0)return Promise.resolve(void 0);const r=new p,c=e.checkExists(e.folders,n,r.token),l=setTimeout(async()=>{r.cancel(),e.logService.info(`Not activating extension '${o.value}': Timed out while searching for 'workspaceContains' pattern ${n.join(",")}`)},k);let s=!1;try{s=await c}catch(i){m.isCancellationError(i)||m.onUnexpectedError(i)}r.dispose(),clearTimeout(l),s&&t(`workspaceContains:${n.join(",")}`)}function B(e,o,n,t){const r=e.get(E),c=e.get(h),s=r.createInstance(I).file(o.map(i=>g(v.revive(i))),{_reason:"checkExists",includePattern:n,exists:!0});return c.fileSearch(s,t).then(i=>!!i.limitHit,i=>m.isCancellationError(i)?!1:Promise.reject(i))}export{q as checkActivateWorkspaceContainsExtension,B as checkGlobFileExists};
