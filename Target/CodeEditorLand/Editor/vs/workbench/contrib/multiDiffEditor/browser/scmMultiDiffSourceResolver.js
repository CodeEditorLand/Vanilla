var I=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var d=(c,r,e,i)=>{for(var t=i>1?void 0:i?g(r,e):r,n=c.length-1,s;n>=0;n--)(s=c[n])&&(t=(i?s(r,e,t):s(t))||t);return i&&t&&I(r,e,t),t},p=(c,r)=>(e,i)=>r(e,i,c);import{Disposable as v}from"../../../../../vs/base/common/lifecycle.js";import{observableFromEvent as a,waitForState as l}from"../../../../../vs/base/common/observable.js";import{ValueWithChangeEventFromObservable as y}from"../../../../../vs/base/common/observableInternal/utils.js";import{URI as f}from"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js";import{localize2 as U}from"../../../../../vs/nls.js";import{Action2 as h}from"../../../../../vs/platform/actions/common/actions.js";import"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as S}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IMultiDiffSourceResolverService as D,MultiDiffEditorItem as M}from"../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService.js";import{ISCMService as R}from"../../../../../vs/workbench/contrib/scm/common/scm.js";import{IEditorService as E}from"../../../../../vs/workbench/services/editor/common/editorService.js";let o=class{constructor(r){this._scmService=r}static _scheme="scm-multi-diff-source";static getMultiDiffSourceUri(r,e){return f.from({scheme:o._scheme,query:JSON.stringify({repositoryUri:r,groupId:e})})}static parseUri(r){if(r.scheme!==o._scheme)return;let e;try{e=JSON.parse(r.query)}catch{return}if(typeof e!="object"||e===null)return;const{repositoryUri:i,groupId:t}=e;if(!(typeof i!="string"||typeof t!="string"))return{repositoryUri:f.parse(i),groupId:t}}canHandleUri(r){return o.parseUri(r)!==void 0}async resolveDiffSource(r){const{repositoryUri:e,groupId:i}=o.parseUri(r),t=await l(a(this,this._scmService.onDidAddRepository,()=>[...this._scmService.repositories].find(s=>s.provider.rootUri?.toString()===e.toString()))),n=await l(a(this,t.provider.onDidChangeResourceGroups,()=>t.provider.groups.find(s=>s.id===i)));return new w(n,t)}};o=d([p(0,R)],o);class w{constructor(r,e){this._group=r;this._repository=e}_resources=a(this._group.onDidChangeResources,()=>this._group.resources.map(r=>new M(r.multiDiffEditorOriginalUri,r.multiDiffEditorModifiedUri,r.sourceUri)));resources=new y(this._resources);contextKeys={scmResourceGroup:this._group.id,scmProvider:this._repository.provider.contextValue}}let u=class extends v{static ID="workbench.contrib.scmMultiDiffSourceResolver";constructor(r,e){super(),this._register(e.registerResolver(r.createInstance(o)))}};u=d([p(0,S),p(1,D)],u);class m extends h{static async openMultiFileDiffEditor(r,e,i,t,n){if(!i)return;const s=o.getMultiDiffSourceUri(i.toString(),t);return await r.openEditor({label:e,multiDiffSource:s,options:n})}constructor(){super({id:"_workbench.openScmMultiDiffEditor",title:U("viewChanges","View Changes"),f1:!1})}async run(r,e){const i=r.get(E);await m.openMultiFileDiffEditor(i,e.title,f.revive(e.repositoryUri),e.resourceGroupId)}}export{m as OpenScmGroupAction,o as ScmMultiDiffSourceResolver,u as ScmMultiDiffSourceResolverContribution};
