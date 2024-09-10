var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var c=(s,t,n,e)=>{for(var r=e>1?void 0:e?m(t,n):t,o=s.length-1,i;o>=0;o--)(i=s[o])&&(r=(e?i(t,n,r):i(r))||r);return e&&r&&l(t,n,r),r},d=(s,t)=>(n,e)=>t(n,e,s);import{onUnexpectedError as v}from"../../../base/common/errors.js";import{dispose as g,DisposableMap as u}from"../../../base/common/lifecycle.js";import{URI as x}from"../../../base/common/uri.js";import{EditOperation as S}from"../../../editor/common/core/editOperation.js";import{Range as h}from"../../../editor/common/core/range.js";import"../../../editor/common/model.js";import{IEditorWorkerService as C}from"../../../editor/common/services/editorWorker.js";import{IModelService as _}from"../../../editor/common/services/model.js";import{ILanguageService as f}from"../../../editor/common/languages/language.js";import{ITextModelService as y}from"../../../editor/common/services/resolverService.js";import{extHostNamedCustomer as M}from"../../services/extensions/common/extHostCustomers.js";import{ExtHostContext as I,MainContext as P}from"../common/extHost.protocol.js";import{CancellationTokenSource as T}from"../../../base/common/cancellation.js";let p=class{constructor(t,n,e,r,o){this._textModelResolverService=n;this._languageService=e;this._modelService=r;this._editorWorkerService=o;this._proxy=t.getProxy(I.ExtHostDocumentContentProviders)}_resourceContentProvider=new u;_pendingUpdate=new Map;_proxy;dispose(){this._resourceContentProvider.dispose(),g(this._pendingUpdate.values())}$registerTextContentProvider(t,n){const e=this._textModelResolverService.registerTextModelContentProvider(n,{provideTextContent:r=>this._proxy.$provideTextDocumentContent(t,r).then(o=>{if(typeof o=="string"){const i=o.substr(0,1+o.search(/\r?\n/)),a=this._languageService.createByFilepathOrFirstLine(r,i);return this._modelService.createModel(o,a,r)}return null})});this._resourceContentProvider.set(t,e)}$unregisterTextContentProvider(t){this._resourceContentProvider.deleteAndDispose(t)}async $onVirtualDocumentChange(t,n){const e=this._modelService.getModel(x.revive(t));if(!e)return;this._pendingUpdate.get(e.id)?.cancel();const o=new T;this._pendingUpdate.set(e.id,o);try{const i=await this._editorWorkerService.computeMoreMinimalEdits(e.uri,[{text:n,range:e.getFullModelRange()}]);if(this._pendingUpdate.delete(e.id),o.token.isCancellationRequested)return;i&&i.length>0&&e.applyEdits(i.map(a=>S.replace(h.lift(a.range),a.text)))}catch(i){v(i)}}};p=c([M(P.MainThreadDocumentContentProviders),d(1,y),d(2,f),d(3,_),d(4,C)],p);export{p as MainThreadDocumentContentProviders};
