var d=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var p=(r,o,e,t)=>{for(var i=t>1?void 0:t?c(o,e):o,n=r.length-1,a;n>=0;n--)(a=r[n])&&(i=(t?a(o,e,i):a(i))||i);return t&&i&&d(o,e,i),i},m=(r,o)=>(e,t)=>o(e,t,r);import{DisposableStore as l}from"../../../base/common/lifecycle.js";import{PLAINTEXT_LANGUAGE_ID as x}from"../../../editor/common/languages/modesRegistry.js";import{ExtHostContext as I,MainContext as v}from"../common/extHost.protocol.js";import{extHostNamedCustomer as h}from"../../services/extensions/common/extHostCustomers.js";import{IInteractiveDocumentService as _}from"../../contrib/interactive/browser/interactiveDocumentService.js";let s=class{_proxy;_disposables=new l;constructor(o,e){this._proxy=o.getProxy(I.ExtHostInteractive),this._disposables.add(e.onWillAddInteractiveDocument(t=>{this._proxy.$willAddInteractiveDocument(t.inputUri,`
`,x,t.notebookUri)})),this._disposables.add(e.onWillRemoveInteractiveDocument(t=>{this._proxy.$willRemoveInteractiveDocument(t.inputUri,t.notebookUri)}))}dispose(){this._disposables.dispose()}};s=p([h(v.MainThreadInteractive),m(1,_)],s);export{s as MainThreadInteractive};
