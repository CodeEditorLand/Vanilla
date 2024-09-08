import*as M from"sinon";import t from"assert";import*as X from"../../../../../base/common/uuid.js";import{IExtensionGalleryService as E,IExtensionManagementService as A,IExtensionTipsService as Y,getTargetPlatform as W}from"../../../../../platform/extensionManagement/common/extensionManagement.js";import{IWorkbenchExtensionEnablementService as Z,IWorkbenchExtensionManagementService as ee}from"../../../../services/extensionManagement/common/extensionManagement.js";import{ExtensionGalleryService as oe}from"../../../../../platform/extensionManagement/common/extensionGalleryService.js";import{TestInstantiationService as te}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{Emitter as G,Event as b}from"../../../../../base/common/event.js";import{ITelemetryService as ne}from"../../../../../platform/telemetry/common/telemetry.js";import{NullTelemetryService as se}from"../../../../../platform/telemetry/common/telemetryUtils.js";import{IWorkspaceContextService as ie}from"../../../../../platform/workspace/common/workspace.js";import{TestLifecycleService as re}from"../../../../test/browser/workbenchTestServices.js";import{TestContextService as ae,TestProductService as me,TestStorageService as ce}from"../../../../test/common/workbenchTestServices.js";import{TestExtensionTipsService as le,TestSharedProcessService as de}from"../../../../test/electron-sandbox/workbenchTestServices.js";import{TestNotificationService as D}from"../../../../../platform/notification/test/common/testNotificationService.js";import{IConfigurationService as pe}from"../../../../../platform/configuration/common/configuration.js";import{URI as L}from"../../../../../base/common/uri.js";import{testWorkspace as ue}from"../../../../../platform/workspace/test/common/testWorkspace.js";import{TestConfigurationService as ge}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../../../base/common/paging.js";import{getGalleryExtensionId as fe}from"../../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{IEnvironmentService as H}from"../../../../../platform/environment/common/environment.js";import{ConfigurationKey as C,IExtensionsWorkbenchService as ke}from"../../common/extensions.js";import{TestExtensionEnablementService as ve}from"../../../../services/extensionManagement/test/browser/extensionEnablementService.test.js";import{IURLService as he}from"../../../../../platform/url/common/url.js";import"../../../../../editor/common/model.js";import{IModelService as be}from"../../../../../editor/common/services/model.js";import{ILifecycleService as ye}from"../../../../services/lifecycle/common/lifecycle.js";import{INotificationService as j}from"../../../../../platform/notification/common/notification.js";import{NativeURLService as xe}from"../../../../../platform/url/common/urlService.js";import{IStorageService as f,StorageScope as m,StorageTarget as c}from"../../../../../platform/storage/common/storage.js";import{ExtensionType as K}from"../../../../../platform/extensions/common/extensions.js";import{ISharedProcessService as Ee}from"../../../../../platform/ipc/electron-sandbox/services.js";import{FileService as Ie}from"../../../../../platform/files/common/fileService.js";import{NullLogService as q,ILogService as T}from"../../../../../platform/log/common/log.js";import{IFileService as S}from"../../../../../platform/files/common/files.js";import{IProductService as B}from"../../../../../platform/product/common/productService.js";import{ExtensionRecommendationsService as v}from"../../browser/extensionRecommendationsService.js";import{NoOpWorkspaceTagsService as Se}from"../../../tags/browser/workspaceTagsService.js";import{IWorkspaceTagsService as Re}from"../../../tags/common/workspaceTags.js";import{ExtensionsWorkbenchService as Pe}from"../../browser/extensionsWorkbenchService.js";import{IExtensionService as we}from"../../../../services/extensions/common/extensions.js";import{IWorkspaceExtensionsConfigService as Ae,WorkspaceExtensionsConfigService as Ce}from"../../../../services/extensionRecommendations/common/workspaceExtensionsConfig.js";import{IExtensionIgnoredRecommendationsService as F}from"../../../../services/extensionRecommendations/common/extensionRecommendations.js";import{ExtensionIgnoredRecommendationsService as Te}from"../../../../services/extensionRecommendations/common/extensionIgnoredRecommendationsService.js";import{IExtensionRecommendationNotificationService as Fe}from"../../../../../platform/extensionRecommendations/common/extensionRecommendations.js";import{ExtensionRecommendationNotificationService as Ne}from"../../browser/extensionRecommendationNotificationService.js";import{IContextKeyService as Ue}from"../../../../../platform/contextkey/common/contextkey.js";import{MockContextKeyService as Oe}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{InMemoryFileSystemProvider as Me}from"../../../../../platform/files/common/inMemoryFilesystemProvider.js";import{joinPath as N}from"../../../../../base/common/resources.js";import{VSBuffer as We}from"../../../../../base/common/buffer.js";import{platform as _}from"../../../../../base/common/platform.js";import{arch as $}from"../../../../../base/common/process.js";import{runWithFakedTimers as d}from"../../../../../base/test/common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as Ge}from"../../../../../base/test/common/utils.js";import{DisposableStore as De}from"../../../../../base/common/lifecycle.js";import{timeout as Le}from"../../../../../base/common/async.js";import{IUpdateService as He,State as je}from"../../../../../platform/update/common/update.js";import{IUriIdentityService as Ke}from"../../../../../platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as qe}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";const V=L.file("tests").with({scheme:"vscode-tests"}),h=[J("MockExtension1",{displayName:"Mock Extension 1",version:"1.5",publisherId:"mockPublisher1Id",publisher:"mockPublisher1",publisherDisplayName:"Mock Publisher 1",description:"Mock Description",installCount:1e3,rating:4,ratingCount:100},{dependencies:["pub.1"]},{manifest:{uri:"uri:manifest",fallbackUri:"fallback:manifest"},readme:{uri:"uri:readme",fallbackUri:"fallback:readme"},changelog:{uri:"uri:changelog",fallbackUri:"fallback:changlog"},download:{uri:"uri:download",fallbackUri:"fallback:download"},icon:{uri:"uri:icon",fallbackUri:"fallback:icon"},license:{uri:"uri:license",fallbackUri:"fallback:license"},repository:{uri:"uri:repository",fallbackUri:"fallback:repository"},signature:{uri:"uri:signature",fallbackUri:"fallback:signature"},coreTranslations:[]}),J("MockExtension2",{displayName:"Mock Extension 2",version:"1.5",publisherId:"mockPublisher2Id",publisher:"mockPublisher2",publisherDisplayName:"Mock Publisher 2",description:"Mock Description",installCount:1e3,rating:4,ratingCount:100},{dependencies:["pub.1","pub.2"]},{manifest:{uri:"uri:manifest",fallbackUri:"fallback:manifest"},readme:{uri:"uri:readme",fallbackUri:"fallback:readme"},changelog:{uri:"uri:changelog",fallbackUri:"fallback:changlog"},download:{uri:"uri:download",fallbackUri:"fallback:download"},icon:{uri:"uri:icon",fallbackUri:"fallback:icon"},license:{uri:"uri:license",fallbackUri:"fallback:license"},repository:{uri:"uri:repository",fallbackUri:"fallback:repository"},signature:{uri:"uri:signature",fallbackUri:"fallback:signature"},coreTranslations:[]})],z=[{type:K.User,identifier:h[0].identifier,manifest:{name:h[0].name,publisher:h[0].publisher,version:h[0].version},metadata:null,path:"somepath",readmeUrl:"some readmeUrl",changelogUrl:"some changelogUrl"},{type:K.User,identifier:h[1].identifier,manifest:{name:h[1].name,publisher:h[1].publisher,version:h[1].version},metadata:null,path:"somepath",readmeUrl:"some readmeUrl",changelogUrl:"some changelogUrl"}],u={recommendedExtensions:["mockPublisher1.mockExtension1","MOCKPUBLISHER2.mockextension2","badlyformattedextension","MOCKPUBLISHER2.mockextension2","unknown.extension"],validRecommendedExtensions:["mockPublisher1.mockExtension1","MOCKPUBLISHER2.mockextension2"]};function Be(...s){return{firstPage:s,total:s.length,pageSize:s.length,getPage:()=>null}}const _e={changelog:null,download:null,icon:null,license:null,manifest:null,readme:null,repository:null,signature:null,coreTranslations:[]};function J(s,I={},e={},y=_e){const n=W(_,$),l=Object.create({name:s,publisher:"pub",version:"1.0.0",allTargetPlatforms:[n],properties:{},assets:{},...I});return l.properties={...l.properties,dependencies:[],targetPlatform:n,...e},l.assets={...l.assets,...y},l.identifier={id:fe(l.publisher,l.name),uuid:X.generateUuid()},l}suite("ExtensionRecommendationsService Test",()=>{let s,I,e,y,n,l,R,U;teardown(async()=>{s.dispose(),await Le(0)}),Ge(),setup(()=>{s=new De,e=s.add(new te),R=s.add(new G),e.stub(E,oe),e.stub(Ee,de),e.stub(ye,s.add(new re)),y=new ge,e.stub(pe,y),e.stub(B,me),e.stub(T,q);const o=new Ie(e.get(T));e.stub(S,s.add(o));const i=s.add(new Me);s.add(o.registerProvider(V.scheme,i)),e.stub(Ke,s.add(new qe(e.get(S)))),e.stub(j,new D),e.stub(Ue,new Oe),e.stub(ee,{onInstallExtension:b.None,onDidInstallExtensions:b.None,onUninstallExtension:b.None,onDidUninstallExtension:b.None,onDidUpdateExtensionMetadata:b.None,onDidChangeProfile:b.None,async getInstalled(){return[]},async canInstall(){return!0},async getExtensionsControlManifest(){return{malicious:[],deprecated:{},search:[]}},async getTargetPlatform(){return W(_,$)}}),e.stub(we,{onDidChangeExtensions:b.None,extensions:[],async whenInstalledExtensionsRegistered(){return!0}}),e.stub(Z,s.add(new ve(e))),e.stub(ne,se),e.stub(he,xe),e.stub(Re,new Se),e.stub(f,s.add(new ce)),e.stub(T,new q),e.stub(B,{extensionRecommendations:{"ms-python.python":{onFileOpen:[{pathGlob:"{**/*.py}",important:!0}]},"ms-vscode.PowerShell":{onFileOpen:[{pathGlob:"{**/*.ps,**/*.ps1}",important:!0}]},"ms-dotnettools.csharp":{onFileOpen:[{pathGlob:"{**/*.cs,**/project.json,**/global.json,**/*.csproj,**/*.sln,**/appsettings.json}"}]},"msjsdiag.debugger-for-chrome":{onFileOpen:[{pathGlob:"{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs,**/.babelrc}"}]},"lukehoban.Go":{onFileOpen:[{pathGlob:"**/*.go"}]}}}),e.stub(He,{onStateChange:b.None,state:je.Uninitialized}),e.set(ke,s.add(e.createInstance(Pe))),e.stub(Y,s.add(e.createInstance(le))),U=new G,e.stub(H,{}),e.stubPromise(A,"getInstalled",[]),e.stub(E,"isEnabled",!0),e.stubPromise(E,"query",Be(...h)),e.stubPromise(E,"getExtensions",h),l=!1;class r extends D{prompt(a,g,P,w){return l=!0,R.fire(),super.prompt(a,g,P,w)}}e.stub(j,new r),y.setUserConfiguration(C,{ignoreRecommendations:!1}),e.stub(be,{getModels(){return[]},onModelAdded:U.event})});function k(o,i,r=[]){return Q(o,i,r)}async function Q(o,i,r=[]){const p=e.get(S),a=N(V,o),g=N(a,".vscode");await p.createFolder(g);const P=N(g,"extensions.json");await p.writeFile(P,We.fromString(JSON.stringify({recommendations:i,unwantedRecommendations:r},null,"	")));const w=ue(a);e.stub(S,p),I=new ae(w),e.stub(ie,I),e.stub(Ae,s.add(e.createInstance(Ce))),e.stub(F,s.add(e.createInstance(Te))),e.stub(Fe,s.add(e.createInstance(Ne)))}function x(o){return k("myFolder",o).then(()=>(n=s.add(e.createInstance(v)),n.activationPromise.then(()=>{t.strictEqual(Object.keys(n.getAllRecommendationsWithReason()).length,o.length),t.ok(!l)})))}function O(o){return k("myFolder",u.validRecommendedExtensions).then(()=>(n=s.add(e.createInstance(v)),t.ok(!l),n.getWorkspaceRecommendations().then(()=>{t.strictEqual(Object.keys(n.getAllRecommendationsWithReason()).length,0),t.ok(!l)})))}test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations when galleryService is absent",()=>d({useFakeTimers:!0},async()=>{const o=M.spy();return e.stub(E,{query:o,isEnabled:()=>!1}),O(u.validRecommendedExtensions).then(()=>t.ok(o.notCalled))})),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations during extension development",()=>d({useFakeTimers:!0},async()=>(e.stub(H,{extensionDevelopmentLocationURI:[L.file("/folder/file")],isExtensionDevelopment:!0}),O(u.validRecommendedExtensions)))),test("ExtensionRecommendationsService: No workspace recommendations or prompts when extensions.json has empty array",()=>d({useFakeTimers:!0},async()=>x([]))),test("ExtensionRecommendationsService: Prompt for valid workspace recommendations",()=>d({useFakeTimers:!0},async()=>{await k("myFolder",u.recommendedExtensions),n=s.add(e.createInstance(v)),await b.toPromise(R.event);const o=Object.keys(n.getAllRecommendationsWithReason()),i=[...u.validRecommendedExtensions,"unknown.extension"];t.strictEqual(o.length,i.length),i.forEach(r=>{t.strictEqual(o.indexOf(r.toLowerCase())>-1,!0)})})),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if they are already installed",()=>d({useFakeTimers:!0},async()=>(e.stubPromise(A,"getInstalled",z),x(u.validRecommendedExtensions)))),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations with casing mismatch if they are already installed",()=>d({useFakeTimers:!0},async()=>(e.stubPromise(A,"getInstalled",z),x(u.validRecommendedExtensions.map(o=>o.toUpperCase()))))),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set",()=>d({useFakeTimers:!0},async()=>(y.setUserConfiguration(C,{ignoreRecommendations:!0}),x(u.validRecommendedExtensions)))),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if showRecommendationsOnlyOnDemand is set",()=>d({useFakeTimers:!0},async()=>(y.setUserConfiguration(C,{showRecommendationsOnlyOnDemand:!0}),k("myFolder",u.validRecommendedExtensions).then(()=>(n=s.add(e.createInstance(v)),n.activationPromise.then(()=>{t.ok(!l)})))))),test("ExtensionRecommendationsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set for current workspace",()=>d({useFakeTimers:!0},async()=>(e.get(f).store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),x(u.validRecommendedExtensions)))),test("ExtensionRecommendationsService: No Recommendations of globally ignored recommendations",()=>d({useFakeTimers:!0},async()=>(e.get(f).store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),e.get(f).store("extensionsAssistant/recommendations",'["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]',m.PROFILE,c.MACHINE),e.get(f).store("extensionsAssistant/ignored_recommendations",'["ms-dotnettools.csharp", "mockpublisher2.mockextension2"]',m.PROFILE,c.MACHINE),k("myFolder",u.validRecommendedExtensions).then(()=>(n=s.add(e.createInstance(v)),n.activationPromise.then(()=>{const o=n.getAllRecommendationsWithReason();t.ok(!o["ms-dotnettools.csharp"]),t.ok(o["ms-python.python"]),t.ok(o["mockpublisher1.mockextension1"]),t.ok(!o["mockpublisher2.mockextension2"])})))))),test("ExtensionRecommendationsService: No Recommendations of workspace ignored recommendations",()=>d({useFakeTimers:!0},async()=>{const o=["ms-dotnettools.csharp","mockpublisher2.mockextension2"],i='["ms-dotnettools.csharp", "ms-python.python"]';return e.get(f).store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),e.get(f).store("extensionsAssistant/recommendations",i,m.PROFILE,c.MACHINE),k("myFolder",u.validRecommendedExtensions,o).then(()=>(n=s.add(e.createInstance(v)),n.activationPromise.then(()=>{const r=n.getAllRecommendationsWithReason();t.ok(!r["ms-dotnettools.csharp"]),t.ok(r["ms-python.python"]),t.ok(r["mockpublisher1.mockextension1"]),t.ok(!r["mockpublisher2.mockextension2"])})))})),test("ExtensionRecommendationsService: Able to retrieve collection of all ignored recommendations",async()=>d({useFakeTimers:!0},async()=>{const o=e.get(f),i=["ms-dotnettools.csharp"],r='["ms-dotnettools.csharp", "ms-python.python"]',p='["mockpublisher2.mockextension2"]';o.store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),o.store("extensionsAssistant/recommendations",r,m.PROFILE,c.MACHINE),o.store("extensionsAssistant/ignored_recommendations",p,m.PROFILE,c.MACHINE),await k("myFolder",u.validRecommendedExtensions,i),n=s.add(e.createInstance(v)),await n.activationPromise;const a=n.getAllRecommendationsWithReason();t.deepStrictEqual(Object.keys(a),["ms-python.python","mockpublisher1.mockextension1"])})),test("ExtensionRecommendationsService: Able to dynamically ignore/unignore global recommendations",async()=>d({useFakeTimers:!0},async()=>{const o=e.get(f),i='["ms-dotnettools.csharp", "ms-python.python"]',r='["mockpublisher2.mockextension2"]';o.store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),o.store("extensionsAssistant/recommendations",i,m.PROFILE,c.MACHINE),o.store("extensionsAssistant/ignored_recommendations",r,m.PROFILE,c.MACHINE),await k("myFolder",u.validRecommendedExtensions);const p=e.get(F);n=s.add(e.createInstance(v)),await n.activationPromise;let a=n.getAllRecommendationsWithReason();t.ok(a["ms-python.python"]),t.ok(a["mockpublisher1.mockextension1"]),t.ok(!a["mockpublisher2.mockextension2"]),p.toggleGlobalIgnoredRecommendation("mockpublisher1.mockextension1",!0),a=n.getAllRecommendationsWithReason(),t.ok(a["ms-python.python"]),t.ok(!a["mockpublisher1.mockextension1"]),t.ok(!a["mockpublisher2.mockextension2"]),p.toggleGlobalIgnoredRecommendation("mockpublisher1.mockextension1",!1),a=n.getAllRecommendationsWithReason(),t.ok(a["ms-python.python"]),t.ok(a["mockpublisher1.mockextension1"]),t.ok(!a["mockpublisher2.mockextension2"])})),test("test global extensions are modified and recommendation change event is fired when an extension is ignored",async()=>d({useFakeTimers:!0},async()=>{const o=e.get(f),i=M.spy(),r="Some.Extension";o.store("extensionsAssistant/workspaceRecommendationsIgnore",!0,m.WORKSPACE,c.MACHINE),o.store("extensionsAssistant/ignored_recommendations",'["ms-vscode.vscode"]',m.PROFILE,c.MACHINE),await k("myFolder",[]),n=s.add(e.createInstance(v));const p=e.get(F);s.add(p.onDidChangeGlobalIgnoredRecommendation(i)),p.toggleGlobalIgnoredRecommendation(r,!0),await n.activationPromise,t.ok(i.calledOnce),t.ok(i.getCall(0).calledWithMatch({extensionId:r.toLowerCase(),isRecommended:!1}))})),test("ExtensionRecommendationsService: Get file based recommendations from storage (old format)",()=>d({useFakeTimers:!0},async()=>(e.get(f).store("extensionsAssistant/recommendations",'["ms-dotnettools.csharp", "ms-python.python", "ms-vscode.vscode-typescript-tslint-plugin"]',m.PROFILE,c.MACHINE),k("myFolder",[]).then(()=>(n=s.add(e.createInstance(v)),n.activationPromise.then(()=>{const i=n.getFileBasedRecommendations();t.strictEqual(i.length,2),t.ok(i.some(r=>r==="ms-dotnettools.csharp")),t.ok(i.some(r=>r==="ms-python.python")),t.ok(i.every(r=>r!=="ms-vscode.vscode-typescript-tslint-plugin"))})))))),test("ExtensionRecommendationsService: Get file based recommendations from storage (new format)",async()=>{const i=Date.now(),r=10*864e5,p=`{"ms-dotnettools.csharp": ${i}, "ms-python.python": ${i}, "ms-vscode.vscode-typescript-tslint-plugin": ${i}, "lukehoban.Go": ${r}}`;e.get(f).store("extensionsAssistant/recommendations",p,m.PROFILE,c.MACHINE),await k("myFolder",[]),n=s.add(e.createInstance(v)),await n.activationPromise;const a=n.getFileBasedRecommendations();t.strictEqual(a.length,2),t.ok(a.some(g=>g==="ms-dotnettools.csharp")),t.ok(a.some(g=>g==="ms-python.python")),t.ok(a.every(g=>g!=="ms-vscode.vscode-typescript-tslint-plugin")),t.ok(a.every(g=>g!=="lukehoban.Go"))})});
