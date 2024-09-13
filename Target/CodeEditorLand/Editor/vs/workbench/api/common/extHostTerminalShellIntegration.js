var g=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var m=(a,r,e,t)=>{for(var i=t>1?void 0:t?_(r,e):r,n=a.length-1,l;n>=0;n--)(l=a[n])&&(i=(t?l(r,e,i):l(i))||i);return t&&i&&g(r,e,i),i},h=(a,r)=>(e,t)=>r(e,t,a);import{TerminalShellExecutionCommandLineConfidence as p}from"./extHostTypes.js";import{Disposable as u,DisposableStore as f,toDisposable as I}from"../../../base/common/lifecycle.js";import{createDecorator as T}from"../../../platform/instantiation/common/instantiation.js";import{MainContext as D}from"./extHost.protocol.js";import{IExtHostRpcService as b}from"./extHostRpcService.js";import{IExtHostTerminalService as y}from"./extHostTerminalService.js";import{Emitter as s}from"../../../base/common/event.js";import{URI as d}from"../../../base/common/uri.js";import{AsyncIterableObject as E,Barrier as C}from"../../../base/common/async.js";const P=T("IExtHostTerminalShellIntegration");let c=class extends u{constructor(e,t){super();this._extHostTerminalService=t;this._proxy=e.getProxy(D.MainThreadTerminalShellIntegration),this._register(I(()=>{for(const[i,n]of this._activeShellIntegrations)n.dispose();this._activeShellIntegrations.clear()}))}_serviceBrand;_proxy;_activeShellIntegrations=new Map;_onDidChangeTerminalShellIntegration=new s;onDidChangeTerminalShellIntegration=this._onDidChangeTerminalShellIntegration.event;_onDidStartTerminalShellExecution=new s;onDidStartTerminalShellExecution=this._onDidStartTerminalShellExecution.event;_onDidEndTerminalShellExecution=new s;onDidEndTerminalShellExecution=this._onDidEndTerminalShellExecution.event;$shellIntegrationChange(e){const t=this._extHostTerminalService.getTerminalById(e);if(!t)return;const i=t.value;let n=this._activeShellIntegrations.get(e);n||(n=new w(t.value,this._onDidStartTerminalShellExecution),this._activeShellIntegrations.set(e,n),n.store.add(t.onWillDispose(()=>this._activeShellIntegrations.get(e)?.dispose())),n.store.add(n.onDidRequestShellExecution(l=>this._proxy.$executeCommand(e,l))),n.store.add(n.onDidRequestEndExecution(l=>this._onDidEndTerminalShellExecution.fire(l))),n.store.add(n.onDidRequestChangeShellIntegration(l=>this._onDidChangeTerminalShellIntegration.fire(l))),t.shellIntegration=n.value),this._onDidChangeTerminalShellIntegration.fire({terminal:i,shellIntegration:n.value})}$shellExecutionStart(e,t,i,n,l){this._activeShellIntegrations.has(e)||this.$shellIntegrationChange(e);const o={value:t,confidence:i,isTrusted:n};this._activeShellIntegrations.get(e)?.startShellExecution(o,d.revive(l))}$shellExecutionEnd(e,t,i,n,l){const o={value:t,confidence:i,isTrusted:n};this._activeShellIntegrations.get(e)?.endShellExecution(o,l)}$shellExecutionData(e,t){this._activeShellIntegrations.get(e)?.emitData(t)}$cwdChange(e,t){this._activeShellIntegrations.get(e)?.setCwd(d.revive(t))}$closeTerminal(e){this._activeShellIntegrations.get(e)?.dispose(),this._activeShellIntegrations.delete(e)}};c=m([h(0,b),h(1,y)],c);class w extends u{constructor(e,t){super();this._terminal=e;this._onDidStartTerminalShellExecution=t;const i=this;this.value={get cwd(){return i._cwd},executeCommand(n,l){let o=n;l&&(o+=` "${l.map(v=>`${v.replaceAll('"','\\"')}`).join('" "')}"`),i._onDidRequestShellExecution.fire(o);const S={value:o,confidence:p.High,isTrusted:!0},x=i.startShellExecution(S,i._cwd,!0).value;return i._ignoreNextExecution=!0,x}}}_currentExecution;get currentExecution(){return this._currentExecution}_ignoreNextExecution=!1;_cwd;store=this._register(new f);value;_onDidRequestChangeShellIntegration=this._register(new s);onDidRequestChangeShellIntegration=this._onDidRequestChangeShellIntegration.event;_onDidRequestShellExecution=this._register(new s);onDidRequestShellExecution=this._onDidRequestShellExecution.event;_onDidRequestEndExecution=this._register(new s);onDidRequestEndExecution=this._onDidRequestEndExecution.event;startShellExecution(e,t,i){if(this._ignoreNextExecution&&this._currentExecution)this._ignoreNextExecution=!1;else{this._currentExecution&&(this._currentExecution.endExecution(void 0),this._onDidRequestEndExecution.fire({terminal:this._terminal,shellIntegration:this.value,execution:this._currentExecution.value,exitCode:void 0}));const n=this._currentExecution=new R(e,t??this._cwd);i?queueMicrotask(()=>this._onDidStartTerminalShellExecution.fire({terminal:this._terminal,shellIntegration:this.value,execution:n.value})):this._onDidStartTerminalShellExecution.fire({terminal:this._terminal,shellIntegration:this.value,execution:this._currentExecution.value})}return this._currentExecution}emitData(e){this.currentExecution?.emitData(e)}endShellExecution(e,t){this._currentExecution&&(this._currentExecution.endExecution(e),this._onDidRequestEndExecution.fire({terminal:this._terminal,shellIntegration:this.value,execution:this._currentExecution.value,exitCode:t}),this._currentExecution=void 0)}setCwd(e){let t=!1;d.isUri(this._cwd)?t=!d.isUri(e)||this._cwd.toString()!==e.toString():this._cwd!==e&&(t=!0),t&&(this._cwd=e,this._onDidRequestChangeShellIntegration.fire({terminal:this._terminal,shellIntegration:this.value}))}}class R{constructor(r,e){this._commandLine=r;this.cwd=e;const t=this;this.value={get commandLine(){return t._commandLine},get cwd(){return t.cwd},read(){return t._createDataStream()}}}_dataStream;_ended=!1;value;_createDataStream(){if(!this._dataStream){if(this._ended)return E.EMPTY;this._dataStream=new L}return this._dataStream.createIterable()}emitData(r){this._dataStream?.emitData(r)}endExecution(r){r&&(this._commandLine=r),this._dataStream?.endExecution(),this._dataStream=void 0,this._ended=!0}}class L extends u{_barrier;_emitters=[];createIterable(){this._barrier||(this._barrier=new C);const r=this._barrier;return new E(async t=>{this._emitters.push(t),await r.wait()})}emitData(r){for(const e of this._emitters)e.emitOne(r)}endExecution(){this._barrier?.open(),this._barrier=void 0}}export{c as ExtHostTerminalShellIntegration,P as IExtHostTerminalShellIntegration};
