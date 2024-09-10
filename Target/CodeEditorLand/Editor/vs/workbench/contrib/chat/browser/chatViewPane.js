var f=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var g=(a,o,e,t)=>{for(var r=t>1?void 0:t?C(o,e):o,s=a.length-1,n;s>=0;s--)(n=a[s])&&(r=(t?n(o,e,r):n(r))||r);return t&&r&&f(o,e,r),r},i=(a,o)=>(e,t)=>o(e,t,a);import{CancellationToken as _}from"../../../../base/common/cancellation.js";import{DisposableStore as V}from"../../../../base/common/lifecycle.js";import{IConfigurationService as D}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as l}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as y}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as M}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as A}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as P}from"../../../../platform/instantiation/common/serviceCollection.js";import{IKeybindingService as b}from"../../../../platform/keybinding/common/keybinding.js";import{ILogService as R}from"../../../../platform/log/common/log.js";import{IOpenerService as B}from"../../../../platform/opener/common/opener.js";import{IStorageService as x,StorageScope as O,StorageTarget as E}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as T}from"../../../../platform/telemetry/common/telemetry.js";import{editorBackground as k}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as F}from"../../../../platform/theme/common/themeService.js";import{ViewPane as W}from"../../../browser/parts/views/viewPane.js";import{Memento as L}from"../../../common/memento.js";import{SIDE_BAR_FOREGROUND as H}from"../../../common/theme.js";import{IViewDescriptorService as K}from"../../../common/views.js";import{ChatWidget as U}from"./chatWidget.js";import{ChatAgentLocation as c,IChatAgentService as N}from"../common/chatAgents.js";import{CHAT_PROVIDER_ID as z}from"../common/chatParticipantContribTypes.js";import{ChatModelInitState as G}from"../common/chatModel.js";import{IChatService as j}from"../common/chatService.js";const Ae="workbench.panel.chatSidebar";let h=class extends W{constructor(e,t,r,s,n,v,d,p,u,m,I,q,J,Q,X){super(e,t,r,s,n,v,d,p,u,m,I);this.storageService=q;this.chatService=J;this.chatAgentService=Q;this.logService=X;this.memento=new L("interactive-session-view-"+z,this.storageService),this.viewState=this.memento.getMemento(O.WORKSPACE,E.MACHINE),this._register(this.chatAgentService.onDidChangeAgents(()=>{if(this.chatAgentService.getDefaultAgent(c.Panel)){if(!this._widget?.viewModel){const S=this.getSessionId(),w=S?this.chatService.getOrRestoreSession(S):void 0;try{this._widget.setVisible(!1),this.updateModel(w),this.didProviderRegistrationFail=!1,this.didUnregisterProvider=!1,this._onDidChangeViewWelcomeState.fire()}finally{this.widget.setVisible(!0)}}}else this._widget?.viewModel?.initState===G.Initialized&&(this.didUnregisterProvider=!0);this._onDidChangeViewWelcomeState.fire()}))}_widget;get widget(){return this._widget}modelDisposables=this._register(new V);memento;viewState;didProviderRegistrationFail=!1;didUnregisterProvider=!1;getActionsContext(){return{chatView:this}}updateModel(e){if(this.modelDisposables.clear(),e=e??(this.chatService.transferredSessionData?.sessionId?this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId):this.chatService.startSession(c.Panel,_.None)),!e)throw new Error("Could not start chat session");this._widget.setModel(e,{...this.viewState}),this.viewState.sessionId=e.sessionId}shouldShowWelcome(){if(!this.chatAgentService.getContributedDefaultAgent(c.Panel))return!0;const e=!this.chatService.hasSessions();return this.didUnregisterProvider||!this._widget?.viewModel&&(e||this.didProviderRegistrationFail)}getSessionId(){let e;return this.chatService.transferredSessionData?(e=this.chatService.transferredSessionData.sessionId,this.viewState.inputValue=this.chatService.transferredSessionData.inputValue):e=this.viewState.sessionId,e}renderBody(e){try{super.renderBody(e);const t=this._register(this.instantiationService.createChild(new P([l,this.scopedContextKeyService]))),r=this.getLocationBasedColors();this._widget=this._register(t.createInstance(U,c.Panel,{viewId:this.id},{supportsFileReferences:!0},{listForeground:H,listBackground:r.background,inputEditorBackground:r.background,resultEditorBackground:k})),this._register(this.onDidChangeBodyVisibility(d=>{this._widget.setVisible(d)})),this._register(this._widget.onDidClear(()=>this.clear())),this._widget.render(e);const s=this.getSessionId(),n=s?this._register(this.chatService.onDidDisposeSession(d=>{d.reason==="initializationFailed"&&(this.didProviderRegistrationFail=!0,n?.dispose(),this._onDidChangeViewWelcomeState.fire())})):void 0,v=s?this.chatService.getOrRestoreSession(s):void 0;this.updateModel(v)}catch(t){throw this.logService.error(t),t}}acceptInput(e){this._widget.acceptInput(e)}clear(){this.widget.viewModel&&this.chatService.clearSession(this.widget.viewModel.sessionId),this.updateViewState(),this.updateModel(void 0)}loadSession(e){this.widget.viewModel&&this.chatService.clearSession(this.widget.viewModel.sessionId);const t=this.chatService.getOrRestoreSession(e);this.updateModel(t)}focusInput(){this._widget.focusInput()}focus(){super.focus(),this._widget.focusInput()}layoutBody(e,t){super.layoutBody(e,t),this._widget.layout(e,t)}saveState(){this._widget&&(this._widget.saveState(),this.updateViewState(),this.memento.saveMemento()),super.saveState()}updateViewState(){const e=this._widget.getViewState();this.viewState.inputValue=e.inputValue,this.viewState.inputState=e.inputState}};h=g([i(1,b),i(2,y),i(3,D),i(4,l),i(5,K),i(6,A),i(7,B),i(8,F),i(9,T),i(10,M),i(11,x),i(12,j),i(13,N),i(14,R)],h);export{Ae as CHAT_SIDEBAR_PANEL_ID,h as ChatViewPane};
