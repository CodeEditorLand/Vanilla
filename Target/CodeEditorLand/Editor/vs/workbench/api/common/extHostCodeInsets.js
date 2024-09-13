import{Emitter as l}from"../../../base/common/event.js";import{DisposableStore as E}from"../../../base/common/lifecycle.js";import{asWebviewUri as b,webviewGenericCspSource as h}from"../../contrib/webview/common/webview.js";class _{constructor(t,s,r){this._proxy=t;this._editors=s;this._remoteInfo=r;this._disposables.add(s.onDidChangeVisibleTextEditors(()=>{const a=s.getVisibleTextEditors();for(const n of this._insets.values())a.indexOf(n.editor)<0&&n.inset.dispose()}))}_handlePool=0;_disposables=new E;_insets=new Map;dispose(){this._insets.forEach(t=>t.inset.dispose()),this._disposables.dispose()}createWebviewEditorInset(t,s,r,a,n){let d;for(const e of this._editors.getVisibleTextEditors(!0))if(e.value===t){d=e;break}if(!d)throw new Error("not a visible editor");const i=this,o=this._handlePool++,p=new l,v=new l,m=new class{_html="";_options=Object.create(null);asWebviewUri(e){return b(e,i._remoteInfo)}get cspSource(){return h}set options(e){this._options=e,i._proxy.$setOptions(o,e)}get options(){return this._options}set html(e){this._html=e,i._proxy.$setHtml(o,e)}get html(){return this._html}get onDidReceiveMessage(){return p.event}postMessage(e){return i._proxy.$postMessage(o,e)}},c=new class{editor=t;line=s;height=r;webview=m;onDidDispose=v.event;dispose(){i._insets.has(o)&&(i._insets.delete(o),i._proxy.$disposeEditorInset(o),v.fire(),v.dispose(),p.dispose())}};return this._proxy.$createEditorInset(o,d.id,d.value.document.uri,s+1,r,a||{},n.identifier,n.extensionLocation),this._insets.set(o,{editor:t,inset:c,onDidReceiveMessage:p}),c}$onDidDispose(t){const s=this._insets.get(t);s&&s.inset.dispose()}$onDidReceiveMessage(t,s){this._insets.get(t)?.onDidReceiveMessage.fire(s)}}export{_ as ExtHostEditorInsets};
