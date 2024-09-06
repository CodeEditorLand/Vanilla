var U=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var v=(c,i,a,r)=>{for(var n=r>1?void 0:r?F(i,a):i,u=c.length-1,m;u>=0;u--)(m=c[u])&&(n=(r?m(i,a,n):m(n))||n);return r&&n&&U(i,a,n),n},e=(c,i)=>(a,r)=>i(a,r,c);import{DisposableStore as P}from"../../../../../vs/base/common/lifecycle.js";import{isMacintosh as w,isWeb as y}from"../../../../../vs/base/common/platform.js";import{isCodeEditor as T,isDiffEditor as A}from"../../../../../vs/editor/browser/editorBrowser.js";import{localize as d,localize2 as $}from"../../../../../vs/nls.js";import"../../../../../vs/platform/action/common/action.js";import{IConfigurationService as X}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as h,IContextKeyService as j,RawContextKey as x}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as H}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as q}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as J}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as Q}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{IOpenerService as Y}from"../../../../../vs/platform/opener/common/opener.js";import{Registry as Z}from"../../../../../vs/platform/registry/common/platform.js";import{IStorageService as ee,StorageScope as _,StorageTarget as te}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as oe}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as ne}from"../../../../../vs/platform/theme/common/themeService.js";import{OpenFileAction as re,OpenFileFolderAction as L,OpenFolderAction as ie}from"../../../../../vs/workbench/browser/actions/workspaceActions.js";import{ViewPane as ae}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{WorkbenchStateContext as R}from"../../../../../vs/workbench/common/contextkeys.js";import{Extensions as de,IViewDescriptorService as ge,ViewContentGroups as g}from"../../../../../vs/workbench/common/views.js";import{DEBUG_CONFIGURE_COMMAND_ID as se,DEBUG_START_COMMAND_ID as O,SELECT_AND_START_ID as ce}from"../../../../../vs/workbench/contrib/debug/browser/debugCommands.js";import{CONTEXT_DEBUG_EXTENSION_AVAILABLE as ue,CONTEXT_DEBUGGERS_AVAILABLE as I,IDebugService as me}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{IEditorService as le}from"../../../../../vs/workbench/services/editor/common/editorService.js";const f="debugStartLanguage",Ie=new x(f,void 0),V=new x("debuggerInterestedInActiveEditor",!1);let o=class extends ae{constructor(a,r,n,u,m,b,pe,M,K,G,k,D,B,W){super(a,n,u,m,b,G,K,k,r,B,W);this.debugService=pe;this.editorService=M;this.debugStartLanguageContext=Ie.bindTo(b),this.debuggerInterestedContext=V.bindTo(b);const z=D.get(f,_.WORKSPACE);this.debugStartLanguageContext.set(z);const l=()=>{let t=this.editorService.activeTextEditorControl;if(A(t)&&(t=t.getModifiedEditor()),T(t)){const E=t.getModel(),p=E?E.getLanguageId():void 0;if(p&&this.debugService.getAdapterManager().someDebuggerInterestedInLanguage(p)){this.debugStartLanguageContext.set(p),this.debuggerInterestedContext.set(!0),D.store(f,p,_.WORKSPACE,te.MACHINE);return}}this.debuggerInterestedContext.set(!1)},S=new P;this._register(S),this._register(M.onDidActiveEditorChange(()=>{S.clear();let t=this.editorService.activeTextEditorControl;A(t)&&(t=t.getModifiedEditor()),T(t)&&S.add(t.onDidChangeModelLanguage(l)),l()})),this._register(this.debugService.getAdapterManager().onDidRegisterDebugger(l)),this._register(this.onDidChangeBodyVisibility(t=>{t&&l()})),l();const C=this.keybindingService.lookupKeybinding(O);N=C?` (${C.getLabel()})`:""}static ID="workbench.debug.welcome";static LABEL=$("run","Run");debugStartLanguageContext;debuggerInterestedContext;shouldShowWelcome(){return!0}};o=v([e(1,ne),e(2,Q),e(3,H),e(4,X),e(5,j),e(6,me),e(7,le),e(8,J),e(9,ge),e(10,Y),e(11,ee),e(12,oe),e(13,q)],o);const s=Z.as(de.ViewsRegistry);s.registerViewWelcomeContent(o.ID,{content:d({key:"openAFileWhichCanBeDebugged",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change','{Locked="](command:{0})"}']},"[Open a file](command:{0}) which can be debugged or run.",w&&!y?L.ID:re.ID),when:h.and(I,V.toNegated()),group:g.Open});let N="";s.registerViewWelcomeContent(o.ID,{content:`[${d("runAndDebugAction","Run and Debug")}${N}](command:${O})`,when:I,group:g.Debug,order:1}),s.registerViewWelcomeContent(o.ID,{content:`[${d("detectThenRunAndDebug","Show all automatic debug configurations")}](command:${ce}).`,when:I,group:g.Debug,order:10}),s.registerViewWelcomeContent(o.ID,{content:d({key:"customizeRunAndDebug",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change','{Locked="](command:{0})"}']},"To customize Run and Debug [create a launch.json file](command:{0}).",se),when:h.and(I,R.notEqualsTo("empty")),group:g.Debug}),s.registerViewWelcomeContent(o.ID,{content:d({key:"customizeRunAndDebugOpenFolder",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change','Please do not translate "launch.json", it is the specific configuration file name','{Locked="](command:{0})"}']},"To customize Run and Debug, [open a folder](command:{0}) and create a launch.json file.",w&&!y?L.ID:ie.ID),when:h.and(I,R.isEqualTo("empty")),group:g.Debug}),s.registerViewWelcomeContent(o.ID,{content:d("allDebuggersDisabled","All debug extensions are disabled. Enable a debug extension or install a new one from the Marketplace."),when:ue.toNegated(),group:g.Debug});export{o as WelcomeView};