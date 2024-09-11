var g=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var w=(n,e,t,i)=>{for(var o=i>1?void 0:i?x(e,t):e,s=n.length-1,m;s>=0;s--)(m=n[s])&&(o=(i?m(e,t,o):m(o))||o);return i&&o&&g(e,t,o),o},b=(n,e)=>(t,i)=>e(t,i,n);import{getWindow as y}from"../../../base/browser/dom.js";import{DisposableStore as h}from"../../../base/common/lifecycle.js";import{isEqual as C}from"../../../base/common/resources.js";import{URI as u}from"../../../base/common/uri.js";import"../../../editor/browser/editorBrowser.js";import{ICodeEditorService as _}from"../../../editor/browser/services/codeEditorService.js";import"../../../platform/extensions/common/extensions.js";import{reviveWebviewContentOptions as I}from"./mainThreadWebviews.js";import{ExtHostContext as W,MainContext as S}from"../common/extHost.protocol.js";import{IWebviewService as D}from"../../contrib/webview/browser/webview.js";import{extHostNamedCustomer as H}from"../../services/extensions/common/extHostCustomers.js";class M{constructor(e,t,i,o){this.editor=e;this.line=t;this.height=i;this.webview=o;this.domNode=document.createElement("div"),this.domNode.style.zIndex="10",this.afterLineNumber=t,this.afterColumn=1,this.heightInLines=i,e.changeViewZones(s=>this._id=s.addZone(this)),o.mountTo(this.domNode,y(e.getDomNode()))}domNode;afterLineNumber;afterColumn;heightInLines;_id;dispose(){this.editor.changeViewZones(e=>this._id&&e.removeZone(this._id))}}let p=class{constructor(e,t,i){this._editorService=t;this._webviewService=i;this._proxy=e.getProxy(W.ExtHostEditorInsets)}_proxy;_disposables=new h;_insets=new Map;dispose(){this._disposables.dispose()}async $createEditorInset(e,t,i,o,s,m,E,f){let a;t=t.substr(0,t.indexOf(","));for(const d of this._editorService.listCodeEditors())if(d.getId()===t&&d.hasModel()&&C(d.getModel().uri,u.revive(i))){a=d;break}if(!a){setTimeout(()=>this._proxy.$onDidDispose(e));return}const r=new h,v=this._webviewService.createWebviewElement({title:void 0,options:{enableFindWidget:!1},contentOptions:I(m),extension:{id:E,location:u.revive(f)}}),c=new M(a,o,s,v),l=()=>{r.dispose(),this._proxy.$onDidDispose(e),this._insets.delete(e)};r.add(a.onDidChangeModel(l)),r.add(a.onDidDispose(l)),r.add(c),r.add(v),r.add(v.onMessage(d=>this._proxy.$onDidReceiveMessage(e,d.message))),this._insets.set(e,c)}$disposeEditorInset(e){const t=this.getInset(e);this._insets.delete(e),t.dispose()}$setHtml(e,t){this.getInset(e).webview.setHtml(t)}$setOptions(e,t){const i=this.getInset(e);i.webview.contentOptions=I(t)}async $postMessage(e,t){return this.getInset(e).webview.postMessage(t),!0}getInset(e){const t=this._insets.get(e);if(!t)throw new Error("Unknown inset");return t}};p=w([H(S.MainThreadEditorInsets),b(1,_),b(2,D)],p);export{p as MainThreadEditorInsets};
