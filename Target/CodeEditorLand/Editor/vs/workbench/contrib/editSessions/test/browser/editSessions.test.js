import{DisposableStore as g}from"../../../../../base/common/lifecycle.js";import{IFileService as w}from"../../../../../platform/files/common/files.js";import{FileService as y}from"../../../../../platform/files/common/fileService.js";import{Schemas as x}from"../../../../../base/common/network.js";import{InMemoryFileSystemProvider as E}from"../../../../../platform/files/common/inMemoryFilesystemProvider.js";import{TestInstantiationService as h}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{NullLogService as C}from"../../../../../platform/log/common/log.js";import{EditSessionsContribution as k}from"../../browser/editSessions.contribution.js";import{ProgressService as T}from"../../../../services/progress/browser/progressService.js";import{IProgressService as D}from"../../../../../platform/progress/common/progress.js";import{ISCMService as v}from"../../../scm/common/scm.js";import{SCMService as P}from"../../../scm/common/scmService.js";import{TestConfigurationService as R}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IConfigurationService as N}from"../../../../../platform/configuration/common/configuration.js";import{IWorkspaceContextService as F,WorkbenchState as M}from"../../../../../platform/workspace/common/workspace.js";import{mock as r}from"../../../../../base/test/common/mock.js";import*as p from"sinon";import I from"assert";import{ChangeType as A,FileType as W,IEditSessionsLogService as U,IEditSessionsStorageService as S}from"../../common/editSessions.js";import{URI as t}from"../../../../../base/common/uri.js";import{joinPath as b}from"../../../../../base/common/resources.js";import{INotificationService as H}from"../../../../../platform/notification/common/notification.js";import{TestNotificationService as L}from"../../../../../platform/notification/test/common/testNotificationService.js";import{TestEnvironmentService as O}from"../../../../test/browser/workbenchTestServices.js";import{IEnvironmentService as q}from"../../../../../platform/environment/common/environment.js";import{MockContextKeyService as K}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{IContextKeyService as _}from"../../../../../platform/contextkey/common/contextkey.js";import{IThemeService as j}from"../../../../../platform/theme/common/themeService.js";import{Event as s}from"../../../../../base/common/event.js";import{IViewDescriptorService as J}from"../../../../common/views.js";import{ITextModelService as V}from"../../../../../editor/common/services/resolverService.js";import{ILifecycleService as $}from"../../../../services/lifecycle/common/lifecycle.js";import{IDialogService as z}from"../../../../../platform/dialogs/common/dialogs.js";import{IEditorService as B}from"../../../../services/editor/common/editorService.js";import{CancellationToken as G}from"../../../../../base/common/cancellation.js";import{ITelemetryService as Q}from"../../../../../platform/telemetry/common/telemetry.js";import{NullTelemetryService as X}from"../../../../../platform/telemetry/common/telemetryUtils.js";import{IRemoteAgentService as Y}from"../../../../services/remote/common/remoteAgentService.js";import{IExtensionService as Z}from"../../../../services/extensions/common/extensions.js";import{IEditSessionIdentityService as ee}from"../../../../../platform/workspace/common/editSessions.js";import{IUserDataProfilesService as re}from"../../../../../platform/userDataProfile/common/userDataProfile.js";import{IProductService as te}from"../../../../../platform/product/common/productService.js";import{IStorageService as ie}from"../../../../../platform/storage/common/storage.js";import{TestStorageService as oe}from"../../../../test/common/workbenchTestServices.js";import{IUriIdentityService as se}from"../../../../../platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as ne}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";import{IWorkspaceIdentityService as ce,WorkspaceIdentityService as me}from"../../../../services/workspaces/common/workspaceIdentityService.js";const f="test-folder",c=t.file(`/${f}`);suite("Edit session sync",()=>{let e,a,i,d;const l=new g;suiteSetup(()=>{d=p.createSandbox(),e=new h;const o=new C;i=l.add(new y(o));const m=l.add(new E);i.registerProvider(x.file,m),e.stub(U,o),e.stub(w,i),e.stub($,new class extends r(){onWillShutdown=s.None}),e.stub(H,new L),e.stub(te,{"editSessions.store":{url:"https://test.com",canSwitch:!0,authenticationProviders:{}}}),e.stub(ie,new oe),e.stub(se,new ne(i)),e.stub(S,new class extends r(){onDidSignIn=s.None;onDidSignOut=s.None}),e.stub(Z,new class extends r(){onDidChangeExtensions=s.None}),e.stub(D,T),e.stub(v,P),e.stub(q,O),e.stub(Q,X),e.stub(z,new class extends r(){async prompt(n){return{result:n.buttons?.[0].run({checkboxChecked:!1})}}async confirm(){return{confirmed:!1}}}),e.stub(Y,new class extends r(){async getEnvironment(){return null}}),e.stub(N,new R({workbench:{experimental:{editSessions:{enabled:!0}}}})),e.stub(F,new class extends r(){getWorkspace(){return{id:"workspace-id",folders:[{uri:c,name:f,index:0,toResource:n=>b(c,n)}]}}getWorkbenchState(){return M.FOLDER}}),e.stub(v,"_repositories",new Map),e.stub(_,new K),e.stub(j,new class extends r(){onDidColorThemeChange=s.None;onDidFileIconThemeChange=s.None}),e.stub(J,{onDidChangeLocation:s.None}),e.stub(V,new class extends r(){registerTextModelContentProvider=()=>({dispose:()=>{}})}),e.stub(B,new class extends r(){saveAll=async n=>({success:!0,editors:[]})}),e.stub(ee,new class extends r(){async getEditSessionIdentifier(){return"test-identity"}}),e.set(ce,e.createInstance(me)),e.stub(re,new class extends r(){defaultProfile={id:"default",name:"Default",isDefault:!0,location:t.file("location"),globalStorageHome:t.file("globalStorageHome"),settingsResource:t.file("settingsResource"),keybindingsResource:t.file("keybindingsResource"),tasksResource:t.file("tasksResource"),snippetsHome:t.file("snippetsHome"),extensionsResource:t.file("extensionsResource"),cacheHome:t.file("cacheHome")}}),a=e.createInstance(k)}),teardown(()=>{p.restore(),l.clear()}),test("Can apply edit session",async function(){const o=b(c,"dir1","README.md"),m="# readme",n={version:1,folders:[{name:f,workingChanges:[{relativeFilePath:"dir1/README.md",fileType:W.File,contents:m,type:A.Addition}]}]},u=d.stub().returns({content:JSON.stringify(n),ref:"0"});e.stub(S,"read",u),await i.createFolder(c),await a.resumeEditSession(),I.equal((await i.readFile(o)).value.toString(),m)}),test("Edit session not stored if there are no edits",async function(){const o=d.stub();e.stub(S,"write",o),await i.createFolder(c),await a.storeEditSession(!0,G.None),I.equal(o.called,!1)})});
