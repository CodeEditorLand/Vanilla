var k=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var C=(a,d,e,t)=>{for(var i=t>1?void 0:t?_(d,e):d,r=a.length-1,o;r>=0;r--)(o=a[r])&&(i=(t?o(d,e,i):o(i))||i);return t&&i&&k(d,e,i),i},n=(a,d)=>(e,t)=>d(e,t,a);import{localize as g}from"../../../../nls.js";import{dirname as R,basename as A}from"../../../../base/common/resources.js";import"./titlebarPart.js";import{IConfigurationService as O}from"../../../../platform/configuration/common/configuration.js";import{IEditorService as M}from"../../../services/editor/common/editorService.js";import{Disposable as H,DisposableStore as K}from"../../../../base/common/lifecycle.js";import{EditorResourceAccessor as B,Verbosity as h,SideBySideEditor as Y}from"../../../common/editor.js";import{IBrowserWorkbenchEnvironmentService as G}from"../../../services/environment/browser/environmentService.js";import{IWorkspaceContextService as X,WorkbenchState as z}from"../../../../platform/workspace/common/workspace.js";import{isWindows as j,isWeb as y,isMacintosh as S,isNative as q}from"../../../../base/common/platform.js";import"../../../../base/common/uri.js";import{trim as J}from"../../../../base/common/strings.js";import"../../../services/editor/common/editorGroupsService.js";import{template as Q}from"../../../../base/common/labels.js";import{ILabelService as Z,Verbosity as ee}from"../../../../platform/label/common/label.js";import{Emitter as te}from"../../../../base/common/event.js";import{RunOnceScheduler as ie}from"../../../../base/common/async.js";import{IProductService as re}from"../../../../platform/product/common/productService.js";import{Schemas as oe}from"../../../../base/common/network.js";import{getVirtualWorkspaceLocation as se}from"../../../../platform/workspace/common/virtualWorkspace.js";import{IUserDataProfileService as ne}from"../../../services/userDataProfile/common/userDataProfile.js";import{IViewsService as ae}from"../../../services/views/common/viewsService.js";import{isCodeEditor as de,isDiffEditor as ce}from"../../../../editor/browser/editorBrowser.js";import{IContextKeyService as le}from"../../../../platform/contextkey/common/contextkey.js";import{getWindowById as pe}from"../../../../base/browser/dom.js";import"../../../../base/browser/window.js";var he=(e=>(e.titleSeparator="window.titleSeparator",e.title="window.title",e))(he||{});const ue=(()=>{if(S&&q)return"${activeEditorShort}${separator}${rootName}${separator}${profileName}";const a="${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}";return y?a+"${separator}${remoteName}":a})(),fe=S?" \u2014 ":" - ";let s=class extends H{constructor(e,t,i,r,o,c,p,u,f,I,E){super();this.configurationService=i;this.contextKeyService=r;this.environmentService=c;this.contextService=p;this.labelService=u;this.userDataProfileService=f;this.productService=I;this.viewsService=E;this.editorService=o.createScoped(t,this._store),this.windowId=e.vscodeWindowId,this.updateTitleIncludesFocusedView(),this.registerListeners()}static NLS_USER_IS_ADMIN=j?g("userIsAdmin","[Administrator]"):g("userIsSudo","[Superuser]");static NLS_EXTENSION_HOST=g("devExtensionWindowTitlePrefix","[Extension Development Host]");static TITLE_DIRTY="\u25CF ";properties={isPure:!0,isAdmin:!1,prefix:void 0};variables=new Map;activeEditorListeners=this._register(new K);titleUpdater=this._register(new ie(()=>this.doUpdateTitle(),0));onDidChangeEmitter=new te;onDidChange=this.onDidChangeEmitter.event;get value(){return this.title??""}get workspaceName(){return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace())}get fileName(){const e=this.editorService.activeEditor;if(!e)return;const t=e.getTitle(h.SHORT);return`${e?.isDirty()&&!e.isSaving()?s.TITLE_DIRTY:""}${t}`}title;titleIncludesFocusedView=!1;editorService;windowId;registerListeners(){this._register(this.configurationService.onDidChangeConfiguration(e=>this.onConfigurationChanged(e))),this._register(this.editorService.onDidActiveEditorChange(()=>this.onActiveEditorChange())),this._register(this.contextService.onDidChangeWorkspaceFolders(()=>this.titleUpdater.schedule())),this._register(this.contextService.onDidChangeWorkbenchState(()=>this.titleUpdater.schedule())),this._register(this.contextService.onDidChangeWorkspaceName(()=>this.titleUpdater.schedule())),this._register(this.labelService.onDidChangeFormatters(()=>this.titleUpdater.schedule())),this._register(this.userDataProfileService.onDidChangeCurrentProfile(()=>this.titleUpdater.schedule())),this._register(this.viewsService.onDidChangeFocusedView(()=>{this.titleIncludesFocusedView&&this.titleUpdater.schedule()})),this._register(this.contextKeyService.onDidChangeContext(e=>{e.affectsSome(this.variables)&&this.titleUpdater.schedule()}))}onConfigurationChanged(e){e.affectsConfiguration("window.title")&&this.updateTitleIncludesFocusedView(),(e.affectsConfiguration("window.title")||e.affectsConfiguration("window.titleSeparator"))&&this.titleUpdater.schedule()}updateTitleIncludesFocusedView(){const e=this.configurationService.getValue("window.title");this.titleIncludesFocusedView=typeof e=="string"&&e.includes("${focusedView}")}onActiveEditorChange(){this.activeEditorListeners.clear(),this.titleUpdater.schedule();const e=this.editorService.activeEditor;if(e&&(this.activeEditorListeners.add(e.onDidChangeDirty(()=>this.titleUpdater.schedule())),this.activeEditorListeners.add(e.onDidChangeLabel(()=>this.titleUpdater.schedule()))),this.titleIncludesFocusedView){const t=this.editorService.activeTextEditorControl,i=[];de(t)?i.push(t):ce(t)&&i.push(t.getOriginalEditor(),t.getModifiedEditor());for(const r of i)this.activeEditorListeners.add(r.onDidBlurEditorText(()=>this.titleUpdater.schedule())),this.activeEditorListeners.add(r.onDidFocusEditorText(()=>this.titleUpdater.schedule()))}}doUpdateTitle(){const e=this.getFullWindowTitle();if(e!==this.title){let t=e;J(t)||(t=this.productService.nameLong);const i=pe(this.windowId,!0).window;!i.document.title&&S&&t===this.productService.nameLong&&(i.document.title=`${this.productService.nameLong} ${s.TITLE_DIRTY}`),i.document.title=t,this.title=e,this.onDidChangeEmitter.fire()}}getFullWindowTitle(){const{prefix:e,suffix:t}=this.getTitleDecorations();let i=this.getWindowTitle()||this.productService.nameLong;return e&&(i=`${e} ${i}`),t&&(i=`${i} ${t}`),i.replace(/[^\S ]/g," ")}getTitleDecorations(){let e,t;return this.properties.prefix&&(e=this.properties.prefix),this.environmentService.isExtensionDevelopment&&(e=e?`${s.NLS_EXTENSION_HOST} - ${e}`:s.NLS_EXTENSION_HOST),this.properties.isAdmin&&(t=s.NLS_USER_IS_ADMIN),{prefix:e,suffix:t}}updateProperties(e){const t=typeof e.isAdmin=="boolean"?e.isAdmin:this.properties.isAdmin,i=typeof e.isPure=="boolean"?e.isPure:this.properties.isPure,r=typeof e.prefix=="string"?e.prefix:this.properties.prefix;(t!==this.properties.isAdmin||i!==this.properties.isPure||r!==this.properties.prefix)&&(this.properties.isAdmin=t,this.properties.isPure=i,this.properties.prefix=r,this.titleUpdater.schedule())}registerVariables(e){let t=!1;for(const{name:i,contextKey:r}of e)this.variables.has(r)||(this.variables.set(r,i),t=!0);t&&this.titleUpdater.schedule()}getWindowTitle(){const e=this.editorService.activeEditor,t=this.contextService.getWorkspace();let i;t.configuration?i=t.configuration:t.folders.length&&(i=t.folders[0].uri);const r=B.getOriginalUri(e,{supportSideBySide:Y.PRIMARY});let o=r?R(r):void 0;o?.path==="."&&(o=void 0);let c;this.contextService.getWorkbenchState()===z.FOLDER?c=t.folders[0]:r&&(c=this.contextService.getWorkspaceFolder(r)??void 0);let p;if(this.environmentService.remoteAuthority&&!y)p=this.labelService.getHostLabel(oe.vscodeRemote,this.environmentService.remoteAuthority);else{const l=se(t);l&&(p=this.labelService.getHostLabel(l.scheme,l.authority))}const u=e?e.getTitle(h.SHORT):"",f=e?e.getTitle(h.MEDIUM):u,I=e?e.getTitle(h.LONG):f,E=o?A(o):"",w=o?this.labelService.getUriLabel(o,{relative:!0}):"",x=o?this.labelService.getUriLabel(o):"",T=this.labelService.getWorkspaceLabel(t),D=this.labelService.getWorkspaceLabel(t,{verbose:ee.SHORT}),L=i?this.labelService.getUriLabel(i):"",N=c?c.name:"",U=c?this.labelService.getUriLabel(c.uri):"",W=e?.isDirty()&&!e.isSaving()?s.TITLE_DIRTY:"",P=this.productService.nameLong,V=this.userDataProfileService.currentProfile.isDefault?"":this.userDataProfileService.currentProfile.name,$=this.viewsService.getFocusedViewName(),b={};for(const[l,F]of this.variables)b[F]=this.contextKeyService.getContextKeyValue(l)??"";let v=this.configurationService.getValue("window.title");typeof v!="string"&&(v=ue);let m=this.configurationService.getValue("window.titleSeparator");return typeof m!="string"&&(m=fe),Q(v,{...b,activeEditorShort:u,activeEditorLong:I,activeEditorMedium:f,activeFolderShort:E,activeFolderMedium:w,activeFolderLong:x,rootName:T,rootPath:L,rootNameShort:D,folderName:N,folderPath:U,dirty:W,appName:P,remoteName:p,profileName:V,focusedView:$,separator:{label:m}})}isCustomTitleFormat(){const e=this.configurationService.inspect("window.title"),t=this.configurationService.inspect("window.titleSeparator");return e.value!==e.defaultValue||t.value!==t.defaultValue}};s=C([n(2,O),n(3,le),n(4,M),n(5,G),n(6,X),n(7,Z),n(8,ne),n(9,re),n(10,ae)],s);export{s as WindowTitle,ue as defaultWindowTitle,fe as defaultWindowTitleSeparator};
