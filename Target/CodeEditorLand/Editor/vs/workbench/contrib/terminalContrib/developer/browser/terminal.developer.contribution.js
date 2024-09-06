var A=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var C=(d,c,n,t)=>{for(var r=t>1?void 0:t?R(c,n):c,e=d.length-1,a;e>=0;e--)(a=d[e])&&(r=(t?a(c,n,r):a(r))||r);return t&&r&&A(c,n,r),r},D=(d,c)=>(n,t)=>c(n,t,d);import{Delayer as P}from"../../../../../../vs/base/common/async.js";import{VSBuffer as B}from"../../../../../../vs/base/common/buffer.js";import{Event as T}from"../../../../../../vs/base/common/event.js";import{combinedDisposable as L,Disposable as F,DisposableStore as W,dispose as X,MutableDisposable as _}from"../../../../../../vs/base/common/lifecycle.js";import{URI as $}from"../../../../../../vs/base/common/uri.js";import"vs/css!./media/developer";import{localize as w,localize2 as h}from"../../../../../../vs/nls.js";import{Categories as f}from"../../../../../../vs/platform/action/common/actionCommonCategories.js";import{IClipboardService as H}from"../../../../../../vs/platform/clipboard/common/clipboardService.js";import{ICommandService as q}from"../../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as z}from"../../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as O}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IFileService as U}from"../../../../../../vs/platform/files/common/files.js";import{IOpenerService as V}from"../../../../../../vs/platform/opener/common/opener.js";import{IQuickInputService as K}from"../../../../../../vs/platform/quickinput/common/quickInput.js";import{TerminalCapability as x}from"../../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import{ITerminalLogService as j,TerminalSettingId as M}from"../../../../../../vs/platform/terminal/common/terminal.js";import{IWorkspaceContextService as J}from"../../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{registerTerminalAction as b}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalActions.js";import{registerTerminalContribution as N}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalExtensions.js";import"../../../../../../vs/workbench/contrib/terminal/browser/widgets/widgetManager.js";import"../../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{TerminalContextKeys as Q}from"../../../../../../vs/workbench/contrib/terminal/common/terminalContextKey.js";import{TerminalDeveloperCommandId as y}from"../../../../../../vs/workbench/contrib/terminalContrib/developer/common/terminal.developer.js";import{IStatusbarService as k,StatusbarAlignment as E}from"../../../../../../vs/workbench/services/statusbar/browser/statusbar.js";b({id:y.ShowTextureAtlas,title:h("workbench.action.terminal.showTextureAtlas","Show Terminal Texture Atlas"),category:f.Developer,precondition:O.or(Q.isOpen),run:async(d,c)=>{const n=c.get(U),t=c.get(V),r=c.get(J),e=await d.service.activeInstance?.xterm?.textureAtlas;if(!e)return;const a=r.getWorkspace().folders[0].uri,o=$.joinPath(a,"textureAtlas.png"),s=document.createElement("canvas");s.width=e.width,s.height=e.height;const i=s.getContext("bitmaprenderer");if(!i)return;i.transferFromImageBitmap(e);const v=await new Promise(l=>s.toBlob(l));v&&(await n.writeFile(o,B.wrap(new Uint8Array(await v.arrayBuffer()))),t.open(o))}}),b({id:y.WriteDataToTerminal,title:h("workbench.action.terminal.writeDataToTerminal","Write Data to Terminal"),category:f.Developer,run:async(d,c)=>{const n=c.get(K),t=await d.service.getActiveOrCreateInstance();if(await d.service.revealActiveTerminal(),await t.processReady,!t.xterm)throw new Error("Cannot write data to terminal if xterm isn't initialized");const r=await n.input({value:"",placeHolder:"Enter data, use \\x to escape",prompt:w("workbench.action.terminal.writeDataToTerminal.prompt","Enter data to write directly to the terminal, bypassing the pty")});if(!r)return;let e=r.replace(/\\n/g,`
`).replace(/\\r/g,"\r");for(;;){const o=e.match(/\\x([0-9a-fA-F]{2})/);if(o===null||o.index===void 0||o.length<2)break;e=e.slice(0,o.index)+String.fromCharCode(parseInt(o[1],16))+e.slice(o.index+4)}t.xterm._writeText(e)}}),b({id:y.RecordSession,title:h("workbench.action.terminal.recordSession","Record Terminal Session"),category:f.Developer,run:async(d,c)=>{const n=c.get(H),t=c.get(q),r=c.get(k),e=new W,a=w("workbench.action.terminal.recordSession.recording","Recording terminal session..."),o={text:a,name:a,ariaLabel:a,showProgress:!0},s=r.addEntry(o,"recordSession",E.LEFT);e.add(s);const i=await d.service.createTerminal();return d.service.setActiveInstance(i),await d.service.revealActiveTerminal(),await Promise.all([i.processReady,i.focusWhenReady(!0)]),new Promise(v=>{const l=[],u=()=>{const m=JSON.stringify(l,null,2);n.writeText(m),e.dispose(),v()},g=e.add(new P(5e3));e.add(T.runAndSubscribe(i.onDimensionsChanged,()=>{l.push({type:"resize",cols:i.cols,rows:i.rows}),g.trigger(u)})),e.add(t.onWillExecuteCommand(m=>{l.push({type:"command",id:m.commandId}),g.trigger(u)})),e.add(i.onWillData(m=>{l.push({type:"output",data:m}),g.trigger(u)})),e.add(i.onDidSendText(m=>{l.push({type:"sendText",data:m}),g.trigger(u)})),e.add(i.xterm.raw.onData(m=>{l.push({type:"input",data:m}),g.trigger(u)}));let S=!1;e.add(T.runAndSubscribe(i.capabilities.onDidAddCapability,m=>{if(S)return;const I=i.capabilities.get(x.CommandDetection);I&&(e.add(I.promptInputModel.onDidChangeInput(G=>{l.push({type:"promptInputChange",data:I.promptInputModel.getCombinedString()}),g.trigger(u)})),S=!0)}))})}}),b({id:y.RestartPtyHost,title:h("workbench.action.terminal.restartPtyHost","Restart Pty Host"),category:f.Developer,run:async(d,c)=>{const n=c.get(j),t=Array.from(d.instanceService.getRegisteredBackends()),r=t.filter(a=>!a.isResponsive),e=r.length>0?r:t;for(const a of e)n.warn(`Restarting pty host for authority "${a.remoteAuthority}"`),a.restartPtyHost()}});let p=class extends F{constructor(n,t,r,e,a){super();this._instance=n;this._configurationService=e;this._statusbarService=a;this._register(this._configurationService.onDidChangeConfiguration(o=>{o.affectsConfiguration(M.DevMode)&&this._updateDevMode()}))}static ID="terminal.devMode";static get(n){return n.getContribution(p.ID)}_xterm;_activeDevModeDisposables=new _;_currentColor=0;_statusbarEntry;_statusbarEntryAccessor=this._register(new _);xtermReady(n){this._xterm=n,this._updateDevMode()}_updateDevMode(){const n=this._isEnabled();this._xterm?.raw.element?.classList.toggle("dev-mode",n);const t=this._instance.capabilities.get(x.CommandDetection);if(n)if(t){const r=new Map;this._activeDevModeDisposables.value=L(this._instance.onDidBlur(()=>this._updateDevMode()),this._instance.onDidFocus(()=>this._updateDevMode()),t.promptInputModel.onDidChangeInput(()=>this._updateDevMode()),t.onCommandFinished(e=>{const a=`color-${this._currentColor}`,o=[];if(r.set(e,o),e.promptStartMarker){const s=this._instance.xterm.raw?.registerDecoration({marker:e.promptStartMarker});s&&(o.push(s),s.onRender(i=>{i.textContent="A",i.classList.add("xterm-sequence-decoration","top","left",a)}))}if(e.marker){const s=this._instance.xterm.raw?.registerDecoration({marker:e.marker,x:e.startX});s&&(o.push(s),s.onRender(i=>{i.textContent="B",i.classList.add("xterm-sequence-decoration","top","right",a)}))}if(e.executedMarker){const s=this._instance.xterm.raw?.registerDecoration({marker:e.executedMarker,x:e.executedX});s&&(o.push(s),s.onRender(i=>{i.textContent="C",i.classList.add("xterm-sequence-decoration","bottom","left",a)}))}if(e.endMarker){const s=this._instance.xterm.raw?.registerDecoration({marker:e.endMarker});s&&(o.push(s),s.onRender(i=>{i.textContent="D",i.classList.add("xterm-sequence-decoration","bottom","right",a)}))}this._currentColor=(this._currentColor+1)%2}),t.onCommandInvalidated(e=>{for(const a of e){const o=r.get(a);o&&X(o),r.delete(a)}})),this._updatePromptInputStatusBar(t)}else this._activeDevModeDisposables.value=this._instance.capabilities.onDidAddCapabilityType(r=>{r===x.CommandDetection&&this._updateDevMode()});else this._activeDevModeDisposables.clear()}_isEnabled(){return this._configurationService.getValue(M.DevMode)||!1}_updatePromptInputStatusBar(n){const t=n.promptInputModel;if(t){const r=w("terminalDevMode","Terminal Dev Mode"),e=t.cursorIndex===-1;this._statusbarEntry={name:r,text:`$(${e?"loading~spin":"terminal"}) ${t.getCombinedString()}`,ariaLabel:r,tooltip:"The detected terminal prompt input",kind:"prominent"},this._statusbarEntryAccessor.value?this._statusbarEntryAccessor.value.update(this._statusbarEntry):this._statusbarEntryAccessor.value=this._statusbarService.addEntry(this._statusbarEntry,`terminal.promptInput.${this._instance.instanceId}`,E.LEFT),this._statusbarService.updateEntryVisibility(`terminal.promptInput.${this._instance.instanceId}`,this._instance.hasFocus)}}};p=C([D(3,z),D(4,k)],p),N(p.ID,p);