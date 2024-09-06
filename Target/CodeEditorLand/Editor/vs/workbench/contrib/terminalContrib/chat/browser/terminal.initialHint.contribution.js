var X=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var C=(p,d,e,t)=>{for(var n=t>1?void 0:t?q(d,e):d,i=p.length-1,r;i>=0;i--)(r=p[i])&&(n=(t?r(d,e,n):r(n))||n);return t&&n&&X(d,e,n),n},a=(p,d)=>(e,t)=>d(e,t,p);import*as l from"../../../../../../vs/base/browser/dom.js";import{renderFormattedText as V}from"../../../../../../vs/base/browser/formattedTextRenderer.js";import{status as F}from"../../../../../../vs/base/browser/ui/aria/aria.js";import{KeybindingLabel as O}from"../../../../../../vs/base/browser/ui/keybindingLabel/keybindingLabel.js";import"../../../../../../vs/base/common/actions.js";import{Emitter as G,Event as E}from"../../../../../../vs/base/common/event.js";import{Disposable as y,DisposableStore as w,MutableDisposable as z}from"../../../../../../vs/base/common/lifecycle.js";import{OS as U}from"../../../../../../vs/base/common/platform.js";import{localize as v}from"../../../../../../vs/nls.js";import{ICommandService as $}from"../../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as L}from"../../../../../../vs/platform/configuration/common/configuration.js";import{IInstantiationService as B}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as j}from"../../../../../../vs/platform/keybinding/common/keybinding.js";import{IProductService as J}from"../../../../../../vs/platform/product/common/productService.js";import{ITelemetryService as Q}from"../../../../../../vs/platform/telemetry/common/telemetry.js";import{TerminalCapability as D}from"../../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import{AccessibilityVerbositySettingId as M}from"../../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{ITerminalEditorService as Y,ITerminalGroupService as Z,ITerminalService as ee}from"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{registerTerminalContribution as te}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalExtensions.js";import{TerminalInstance as ie}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalInstance.js";import"../../../../../../vs/workbench/contrib/terminal/browser/widgets/widgetManager.js";import"../../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{TerminalChatCommandId as T}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChat.js";import"vs/css!./media/terminalInitialHint";import{StandardMouseEvent as ne}from"../../../../../../vs/base/browser/mouseEvent.js";import{IContextMenuService as re}from"../../../../../../vs/platform/contextview/browser/contextView.js";import{IStorageService as k,StorageScope as S,StorageTarget as N}from"../../../../../../vs/platform/storage/common/storage.js";import{ChatAgentLocation as A,IChatAgentService as P}from"../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{TerminalInitialHintSettingId as h}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/common/terminalInitialHintConfiguration.js";const b=l.$;var ae=(d=>(d.InitialHintHideStorageKey="terminal.initialHint.hide",d))(ae||{});class oe extends y{constructor(e,t){super();this._capabilities=e;this._onDidChangeAgents=t}_onDidRequestCreateHint=this._register(new G);get onDidRequestCreateHint(){return this._onDidRequestCreateHint.event}_disposables=this._register(new z);activate(e){const t=this._register(new w);this._disposables.value=t;const n=this._capabilities.get(D.CommandDetection);n?t.add(E.once(n.promptInputModel.onDidStartInput)(()=>this._onDidRequestCreateHint.fire())):this._register(this._capabilities.onDidAddCapability(r=>{if(r.id===D.CommandDetection){const s=r.capability;t.add(E.once(s.promptInputModel.onDidStartInput)(()=>this._onDidRequestCreateHint.fire())),s.promptInputModel.value||this._onDidRequestCreateHint.fire()}}));const i=this._onDidChangeAgents(r=>{r?.locations.includes(A.Terminal)&&(this._onDidRequestCreateHint.fire(),i.dispose())});this._disposables.value?.add(i)}}let m=class extends y{constructor(e,t,n,i,r,s,o,g,f){super();this._instance=e;this._instantiationService=i;this._configurationService=r;this._terminalGroupService=s;this._terminalEditorService=o;this._chatAgentService=g;this._storageService=f;this._register(this._configurationService.onDidChangeConfiguration(c=>{c.affectsConfiguration(h.Enabled)&&this._storageService.remove("terminal.initialHint.hide",S.APPLICATION)}))}static ID="terminal.initialHint";_addon;_hintWidget;static get(e){return e.getContribution(m.ID)}_decoration;_xterm;xtermOpen(e){this._storageService.getBoolean("terminal.initialHint.hide",S.APPLICATION,!1)||this._terminalGroupService.instances.length+this._terminalEditorService.instances.length===1&&(this._xterm=e,this._addon=this._register(this._instantiationService.createInstance(oe,this._instance.capabilities,this._chatAgentService.onDidChangeAgents)),this._xterm.raw.loadAddon(this._addon),this._register(this._addon.onDidRequestCreateHint(()=>this._createHint())))}_createHint(){const e=this._instance instanceof ie?this._instance:void 0,t=e?.capabilities.get(D.CommandDetection);if(!e||!this._xterm||this._hintWidget||!t||t.promptInputModel.value||e.shellLaunchConfig.attachPersistentProcess||!this._configurationService.getValue(h.Enabled))return;if(!this._decoration){const i=this._xterm.raw.registerMarker();if(!i||this._xterm.raw.buffer.active.cursorX===0)return;this._register(i),this._decoration=this._xterm.raw.registerDecoration({marker:i,x:this._xterm.raw.buffer.active.cursorX+1}),this._decoration&&this._register(this._decoration)}this._register(this._xterm.raw.onKey(()=>this.dispose())),this._register(this._configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration(h.Enabled)&&!this._configurationService.getValue(h.Enabled)&&this.dispose()}));const n=t.promptInputModel;n&&this._register(n.onDidChangeInput(()=>{n.value&&this.dispose()})),this._decoration&&(this._register(this._decoration),this._register(this._decoration.onRender(i=>{if(!this._hintWidget&&this._xterm?.isFocused&&this._terminalGroupService.instances.length+this._terminalEditorService.instances.length===1){const r=this._chatAgentService.getActivatedAgents().filter(s=>s.locations.includes(A.Terminal));if(r?.length){const s=this._register(this._instantiationService.createInstance(_,e));if(this._addon?.dispose(),this._hintWidget=s.getDomNode(r),!this._hintWidget)return;i.appendChild(this._hintWidget),i.classList.add("terminal-initial-hint");const o=this._xterm.getFont();o&&(i.style.fontFamily=o.fontFamily,i.style.fontSize=o.fontSize+"px")}}if(this._hintWidget&&this._xterm){const r=this._hintWidget.parentElement;r&&(r.style.width=(this._xterm.raw.cols-this._xterm.raw.buffer.active.cursorX)/this._xterm.raw.cols*100+"%")}})))}};m=C([a(3,B),a(4,L),a(5,Z),a(6,Y),a(7,P),a(8,k)],m),te(m.ID,m,!1);let _=class extends y{constructor(e,t,n,i,r,s,o,g,f,c){super();this._instance=e;this._chatAgentService=t;this.commandService=n;this.configurationService=i;this.keybindingService=r;this.telemetryService=s;this.productService=o;this.terminalService=g;this._storageService=f;this.contextMenuService=c;this.toDispose.add(e.onDidFocus(()=>{this._instance.hasFocus&&this.isVisible&&this.ariaLabel&&this.configurationService.getValue(M.TerminalChat)&&F(this.ariaLabel)})),this.toDispose.add(g.onDidChangeInstances(()=>{this.terminalService.instances.length!==1&&this.dispose()})),this.toDispose.add(this.configurationService.onDidChangeConfiguration(u=>{u.affectsConfiguration(h.Enabled)&&!this.configurationService.getValue(h.Enabled)&&this.dispose()}))}domNode;toDispose=this._register(new w);isVisible=!1;ariaLabel="";_getHintInlineChat(e){let t=(e.length===1?e[0].fullName:void 0)??this.productService.nameShort;const n=this._chatAgentService.getDefaultAgent(A.Panel);n?.extensionId.value===e[0].extensionId.value&&(t=n.fullName??t);let i=`Ask ${t} something or start typing to dismiss.`;const r=()=>{this._storageService.store("terminal.initialHint.hide",!0,S.APPLICATION,N.USER),this.telemetryService.publicLog2("workbenchActionExecuted",{id:"terminalInlineChat.hintAction",from:"hint"}),this.commandService.executeCommand(T.Start,{from:"hint"})};this.toDispose.add(this.commandService.onDidExecuteCommand(c=>{c.commandId===T.Start&&(this._storageService.store("terminal.initialHint.hide",!0,S.APPLICATION,N.USER),this.dispose())}));const s={disposables:this.toDispose,callback:(c,u)=>{switch(c){case"0":r();break}}},o=b("div.terminal-initial-hint");o.style.display="block";const g=this.keybindingService.lookupKeybinding(T.Start),f=g?.getLabel();if(g&&f){const c=v("emptyHintText","Press {0} to ask {1} to do something. ",f,t),[u,R]=c.split(f).map(W=>{const H=b("a",void 0,W);return this.toDispose.add(l.addDisposableListener(H,l.EventType.CLICK,r)),H});o.appendChild(u);const I=s.disposables.add(new O(o,U));I.set(g),I.element.style.width="min-content",I.element.style.display="inline",I.element.style.cursor="pointer",this.toDispose.add(l.addDisposableListener(I.element,l.EventType.CLICK,r)),o.appendChild(R);const x=v("hintTextDismiss","Start typing to dismiss."),K=b("span.detail",void 0,x);o.appendChild(K),i=c.concat(x)}else{const c=v({key:"inlineChatHint",comment:["Preserve double-square brackets and their order"]},"[[Ask {0} to do something]] or start typing to dismiss.",t),u=V(c,{actionHandler:s});o.appendChild(u)}return{ariaLabel:i,hintHandler:s,hintElement:o}}getDomNode(e){if(!this.domNode){this.domNode=b(".terminal-initial-hint"),this.domNode.style.paddingLeft="4px";const{hintElement:t,ariaLabel:n}=this._getHintInlineChat(e);this.domNode.append(t),this.ariaLabel=n.concat(v("disableHint"," Toggle {0} in settings to disable this hint.",M.TerminalChat)),this.toDispose.add(l.addDisposableListener(this.domNode,"click",()=>{this.domNode?.remove(),this.domNode=void 0})),this.toDispose.add(l.addDisposableListener(this.domNode,l.EventType.CONTEXT_MENU,i=>{this.contextMenuService.showContextMenu({getAnchor:()=>new ne(l.getActiveWindow(),i),getActions:()=>[{id:"workench.action.disableTerminalInitialHint",label:v("disableInitialHint","Disable Initial Hint"),tooltip:v("disableInitialHint","Disable Initial Hint"),enabled:!0,class:void 0,run:()=>this.configurationService.updateValue(h.Enabled,!1)}]})}))}return this.domNode}dispose(){this.domNode?.remove(),super.dispose()}};_=C([a(1,P),a(2,$),a(3,L),a(4,j),a(5,Q),a(6,J),a(7,ee),a(8,k),a(9,re)],_);export{oe as InitialHintAddon,m as TerminalInitialHintContribution};