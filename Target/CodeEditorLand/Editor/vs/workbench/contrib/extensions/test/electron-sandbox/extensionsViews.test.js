import t from"assert";import{generateUuid as H}from"../../../../../base/common/uuid.js";import{ExtensionsListView as c}from"../../browser/extensionsViews.js";import{TestInstantiationService as J}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{IExtensionsWorkbenchService as Q}from"../../common/extensions.js";import{ExtensionsWorkbenchService as X}from"../../browser/extensionsWorkbenchService.js";import{IExtensionManagementService as O,IExtensionGalleryService as m,getTargetPlatform as G,SortBy as V}from"../../../../../platform/extensionManagement/common/extensionManagement.js";import{IWorkbenchExtensionEnablementService as A,EnablementState as F,IExtensionManagementServerService as Y,IWorkbenchExtensionManagementService as z}from"../../../../services/extensionManagement/common/extensionManagement.js";import{IExtensionRecommendationsService as Z,ExtensionRecommendationReason as T}from"../../../../services/extensionRecommendations/common/extensionRecommendations.js";import{getGalleryExtensionId as N}from"../../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{TestExtensionEnablementService as _}from"../../../../services/extensionManagement/test/browser/extensionEnablementService.test.js";import{ExtensionGalleryService as ee}from"../../../../../platform/extensionManagement/common/extensionGalleryService.js";import{IURLService as te}from"../../../../../platform/url/common/url.js";import{Event as x}from"../../../../../base/common/event.js";import"../../../../../base/common/paging.js";import{ITelemetryService as ne}from"../../../../../platform/telemetry/common/telemetry.js";import{NullTelemetryService as ie}from"../../../../../platform/telemetry/common/telemetryUtils.js";import{IExtensionService as se,toExtensionDescription as v}from"../../../../services/extensions/common/extensions.js";import{IWorkspaceContextService as ae}from"../../../../../platform/workspace/common/workspace.js";import{TestMenuService as re}from"../../../../test/browser/workbenchTestServices.js";import{TestSharedProcessService as oe}from"../../../../test/electron-sandbox/workbenchTestServices.js";import{IConfigurationService as le}from"../../../../../platform/configuration/common/configuration.js";import{ILogService as ce,NullLogService as K}from"../../../../../platform/log/common/log.js";import{NativeURLService as me}from"../../../../../platform/url/common/urlService.js";import{URI as W}from"../../../../../base/common/uri.js";import{TestConfigurationService as de}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import"sinon";import{IRemoteAgentService as ue}from"../../../../services/remote/common/remoteAgentService.js";import{RemoteAgentService as ge}from"../../../../services/remote/electron-sandbox/remoteAgentService.js";import{ExtensionType as B}from"../../../../../platform/extensions/common/extensions.js";import{ISharedProcessService as fe}from"../../../../../platform/ipc/electron-sandbox/services.js";import{IContextKeyService as he}from"../../../../../platform/contextkey/common/contextkey.js";import{MockContextKeyService as pe}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{IMenuService as xe}from"../../../../../platform/actions/common/actions.js";import{TestContextService as ye}from"../../../../test/common/workbenchTestServices.js";import{IViewDescriptorService as Ee,ViewContainerLocation as qe}from"../../../../common/views.js";import{Schemas as be}from"../../../../../base/common/network.js";import{platform as $}from"../../../../../base/common/platform.js";import{arch as j}from"../../../../../base/common/process.js";import{IProductService as we}from"../../../../../platform/product/common/productService.js";import{CancellationToken as Se}from"../../../../../base/common/cancellation.js";import{ensureNoDisposablesAreLeakedInTestSuite as Ie}from"../../../../../base/test/common/utils.js";import{IUpdateService as Te,State as Ue}from"../../../../../platform/update/common/update.js";import{IFileService as ve}from"../../../../../platform/files/common/files.js";import{FileService as Pe}from"../../../../../platform/files/common/fileService.js";import{IUserDataProfileService as Le}from"../../../../services/userDataProfile/common/userDataProfile.js";import{UserDataProfileService as Re}from"../../../../services/userDataProfile/common/userDataProfileService.js";import{toUserDataProfile as ke}from"../../../../../platform/userDataProfile/common/userDataProfile.js";suite("ExtensionsViews Tests",()=>{const I=Ie();let i,a;const d=w("first-enabled-extension",{categories:["Themes","random"]},{installedTimestamp:123456}),g=w("second-enabled-extension",{categories:["Programming languages"],version:"1.0.0"},{installedTimestamp:Date.now(),updated:!1}),u=w("first-disabled-extension",{categories:["themes"]},{installedTimestamp:234567}),f=w("second-disabled-extension",{categories:["programming languages"]},{installedTimestamp:Date.now()-5e4,updated:!0}),b=w("random-enabled-extension",{categories:["random"]},{installedTimestamp:345678}),U=w("my-theme",{categories:["Themes"],contributes:{themes:["my-theme"]}},{type:B.System,installedTimestamp:222}),P=w("my-lang",{categories:["Programming Languages"],contributes:{grammars:[{language:"my-language"}]}},{type:B.System,installedTimestamp:666666}),C=q(g.manifest.name,{...g.manifest,version:"1.0.1",identifier:f.identifier}),h=q("workspace-recommendation-A"),p=q("workspace-recommendation-B"),L=q("configbased-recommendation-A"),R=q("configbased-recommendation-B"),y=q("filebased-recommendation-A"),k=q("filebased-recommendation-B"),E=q("other-recommendation-A");setup(async()=>{i=I.add(new J),i.stub(ne,ie),i.stub(ce,K),i.stub(ve,I.add(new Pe(new K))),i.stub(we,{}),i.stub(ae,new ye),i.stub(le,new de),i.stub(m,ee),i.stub(fe,oe),i.stub(z,{onInstallExtension:x.None,onDidInstallExtensions:x.None,onUninstallExtension:x.None,onDidUninstallExtension:x.None,onDidUpdateExtensionMetadata:x.None,onDidChangeProfile:x.None,async getInstalled(){return[]},async getInstalledWorkspaceExtensions(){return[]},async canInstall(){return!0},async getExtensionsControlManifest(){return{malicious:[],deprecated:{},search:[]}},async getTargetPlatform(){return G($,j)},async updateMetadata(s){return s}}),i.stub(ue,ge),i.stub(he,new pe),i.stub(xe,new re);const e={extensionManagementService:i.get(O),label:"local",id:"vscode-local"};i.stub(Y,{get localExtensionManagementServer(){return e},getExtensionManagementServer(s){if(s.location.scheme===be.file)return e;throw new Error(`Invalid Extension ${s.location}`)}}),i.stub(A,I.add(new _(i))),i.stub(Le,I.add(new Re(ke("test","test",W.file("foo"),W.file("cache")))));const n={};n[h.identifier.id]={reasonId:T.Workspace},n[p.identifier.id]={reasonId:T.Workspace},n[y.identifier.id]={reasonId:T.File},n[k.identifier.id]={reasonId:T.File},n[E.identifier.id]={reasonId:T.Executable},n[L.identifier.id]={reasonId:T.WorkspaceConfig},i.stub(Z,{getWorkspaceRecommendations(){return Promise.resolve([h.identifier.id,p.identifier.id])},getConfigBasedRecommendations(){return Promise.resolve({important:[L.identifier.id],others:[R.identifier.id]})},getImportantRecommendations(){return Promise.resolve([])},getFileBasedRecommendations(){return[y.identifier.id,k.identifier.id]},getOtherRecommendations(){return Promise.resolve([R.identifier.id,E.identifier.id])},getAllRecommendationsWithReason(){return n}}),i.stub(te,me),i.stubPromise(O,"getInstalled",[d,g,b,u,f,U,P]),i.stubPromise(O,"getExtensgetExtensionsControlManifestionsReport",{}),i.stub(m,"isEnabled",!0),i.stubPromise(m,"query",S(C)),i.stubPromise(m,"getCompatibleExtension",C),i.stubPromise(m,"getExtensions",[C]),i.stub(Ee,{getViewLocationById(){return qe.Sidebar},onDidChangeLocation:x.None}),i.stub(se,{onDidChangeExtensions:x.None,extensions:[v(d),v(g),v(b),v(U),v(P)],canAddExtension:s=>!0,whenInstalledExtensionsRegistered:()=>Promise.resolve(!0)}),await i.get(A).setEnablement([u],F.DisabledGlobally),await i.get(A).setEnablement([f],F.DisabledGlobally),i.stub(Te,{onStateChange:x.None,state:Ue.Uninitialized}),i.set(Q,I.add(i.createInstance(X))),a=I.add(i.createInstance(c,{},{id:"",title:""}))}),test("Test query types",()=>{t.strictEqual(c.isBuiltInExtensionsQuery("@builtin"),!0),t.strictEqual(c.isLocalExtensionsQuery("@installed"),!0),t.strictEqual(c.isLocalExtensionsQuery("@enabled"),!0),t.strictEqual(c.isLocalExtensionsQuery("@disabled"),!0),t.strictEqual(c.isLocalExtensionsQuery("@outdated"),!0),t.strictEqual(c.isLocalExtensionsQuery("@updates"),!0),t.strictEqual(c.isLocalExtensionsQuery("@sort:name"),!0),t.strictEqual(c.isLocalExtensionsQuery("@sort:updateDate"),!0),t.strictEqual(c.isLocalExtensionsQuery("@installed searchText"),!0),t.strictEqual(c.isLocalExtensionsQuery("@enabled searchText"),!0),t.strictEqual(c.isLocalExtensionsQuery("@disabled searchText"),!0),t.strictEqual(c.isLocalExtensionsQuery("@outdated searchText"),!0),t.strictEqual(c.isLocalExtensionsQuery("@updates searchText"),!0)}),test("Test empty query equates to sort by install count",()=>{const e=i.stubPromise(m,"query",S());return a.show("").then(()=>{t.ok(e.calledOnce);const n=e.args[0][0];t.strictEqual(n.sortBy,V.InstallCount)})}),test("Test non empty query without sort doesnt use sortBy",()=>{const e=i.stubPromise(m,"query",S());return a.show("some extension").then(()=>{t.ok(e.calledOnce);const n=e.args[0][0];t.strictEqual(n.sortBy,void 0)})}),test("Test query with sort uses sortBy",()=>{const e=i.stubPromise(m,"query",S());return a.show("some extension @sort:rating").then(()=>{t.ok(e.calledOnce);const n=e.args[0][0];t.strictEqual(n.sortBy,V.WeightedRating)})}),test("Test default view actions required sorting",async()=>{const e=i.get(Q),n=(await e.queryLocal()).find(l=>l.identifier===g.identifier);await new Promise(l=>{const M=e.onChange(()=>{n?.outdated&&(M.dispose(),l())});i.get(Q).queryGallery(Se.None)});const s=await a.show("@installed");t.strictEqual(s.length,5,"Unexpected number of results for @installed query");const r=[s.get(0).name,s.get(1).name,s.get(2).name,s.get(3).name,s.get(4).name],o=[g.manifest.name,d.manifest.name,b.manifest.name,u.manifest.name,f.manifest.name];for(let l=0;l<s.length;l++)t.strictEqual(r[l],o[l],"Unexpected extension for @installed query with outadted extension.")}),test("Test installed query results",async()=>{await a.show("@installed").then(e=>{t.strictEqual(e.length,5,"Unexpected number of results for @installed query");const n=[e.get(0).name,e.get(1).name,e.get(2).name,e.get(3).name,e.get(4).name].sort(),s=[u.manifest.name,d.manifest.name,b.manifest.name,f.manifest.name,g.manifest.name];for(let r=0;r<e.length;r++)t.strictEqual(n[r],s[r],"Unexpected extension for @installed query.")}),await a.show("@installed first").then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @installed query"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @installed query with search text."),t.strictEqual(e.get(1).name,u.manifest.name,"Unexpected extension for @installed query with search text.")}),await a.show("@disabled").then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @disabled query"),t.strictEqual(e.get(0).name,u.manifest.name,"Unexpected extension for @disabled query."),t.strictEqual(e.get(1).name,f.manifest.name,"Unexpected extension for @disabled query.")}),await a.show("@enabled").then(e=>{t.strictEqual(e.length,3,"Unexpected number of results for @enabled query"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @enabled query."),t.strictEqual(e.get(1).name,b.manifest.name,"Unexpected extension for @enabled query."),t.strictEqual(e.get(2).name,g.manifest.name,"Unexpected extension for @enabled query.")}),await a.show("@builtin category:themes").then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @builtin category:themes query"),t.strictEqual(e.get(0).name,U.manifest.name,"Unexpected extension for @builtin:themes query.")}),await a.show('@builtin category:"programming languages"').then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @builtin:basics query"),t.strictEqual(e.get(0).name,P.manifest.name,"Unexpected extension for @builtin:basics query.")}),await a.show("@builtin").then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @builtin query"),t.strictEqual(e.get(0).name,P.manifest.name,"Unexpected extension for @builtin query."),t.strictEqual(e.get(1).name,U.manifest.name,"Unexpected extension for @builtin query.")}),await a.show("@builtin my-theme").then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @builtin query"),t.strictEqual(e.get(0).name,U.manifest.name,"Unexpected extension for @builtin query.")})}),test("Test installed query with category",async()=>{await a.show("@installed category:themes").then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @installed query with category"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @installed query with category."),t.strictEqual(e.get(1).name,u.manifest.name,"Unexpected extension for @installed query with category.")}),await a.show('@installed category:"themes"').then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @installed query with quoted category"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @installed query with quoted category."),t.strictEqual(e.get(1).name,u.manifest.name,"Unexpected extension for @installed query with quoted category.")}),await a.show('@installed category:"programming languages"').then(e=>{t.strictEqual(e.length,2,"Unexpected number of results for @installed query with quoted category including space"),t.strictEqual(e.get(0).name,g.manifest.name,"Unexpected extension for @installed query with quoted category including space."),t.strictEqual(e.get(1).name,f.manifest.name,"Unexpected extension for @installed query with quoted category inlcuding space.")}),await a.show("@installed category:themes category:random").then(e=>{t.strictEqual(e.length,3,"Unexpected number of results for @installed query with multiple category"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @installed query with multiple category."),t.strictEqual(e.get(1).name,b.manifest.name,"Unexpected extension for @installed query with multiple category."),t.strictEqual(e.get(2).name,u.manifest.name,"Unexpected extension for @installed query with multiple category.")}),await a.show("@enabled category:themes").then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @enabled query with category"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @enabled query with category.")}),await a.show('@enabled category:"themes"').then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @enabled query with quoted category"),t.strictEqual(e.get(0).name,d.manifest.name,"Unexpected extension for @enabled query with quoted category.")}),await a.show('@enabled category:"programming languages"').then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @enabled query with quoted category inlcuding space"),t.strictEqual(e.get(0).name,g.manifest.name,"Unexpected extension for @enabled query with quoted category including space.")}),await a.show("@disabled category:themes").then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @disabled query with category"),t.strictEqual(e.get(0).name,u.manifest.name,"Unexpected extension for @disabled query with category.")}),await a.show('@disabled category:"themes"').then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @disabled query with quoted category"),t.strictEqual(e.get(0).name,u.manifest.name,"Unexpected extension for @disabled query with quoted category.")}),await a.show('@disabled category:"programming languages"').then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @disabled query with quoted category inlcuding space"),t.strictEqual(e.get(0).name,f.manifest.name,"Unexpected extension for @disabled query with quoted category including space.")})}),test("Test local query with sorting order",async()=>{await a.show("@recentlyUpdated").then(e=>{t.strictEqual(e.length,1,"Unexpected number of results for @recentlyUpdated"),t.strictEqual(e.get(0).name,f.manifest.name,"Unexpected default sort order of extensions for @recentlyUpdate query")}),await a.show("@installed @sort:updateDate").then(e=>{t.strictEqual(e.length,5,"Unexpected number of results for @sort:updateDate. Expected all localy installed Extension which are not builtin");const n=[e.get(0).local?.installedTimestamp,e.get(1).local?.installedTimestamp,e.get(2).local?.installedTimestamp,e.get(3).local?.installedTimestamp,e.get(4).local?.installedTimestamp],s=[g.installedTimestamp,f.installedTimestamp,b.installedTimestamp,u.installedTimestamp,d.installedTimestamp];for(let r=0;r<e.length;r++)t.strictEqual(n[r],s[r],"Unexpected extension sorting for @sort:updateDate query.")})}),test("Test @recommended:workspace query",()=>{const e=[h,p,L],n=i.stubPromise(m,"getExtensions",e);return a.show("@recommended:workspace").then(s=>{const r=n.args[0][0];t.strictEqual(r.length,e.length),t.strictEqual(s.length,e.length);for(let o=0;o<e.length;o++)t.strictEqual(r[o].id,e[o].identifier.id),t.strictEqual(s.get(o).identifier.id,e[o].identifier.id)})}),test("Test @recommended query",()=>{const e=[y,k,R,E],n=i.stubPromise(m,"getExtensions",e);return a.show("@recommended").then(s=>{const r=n.args[0][0];t.strictEqual(r.length,e.length),t.strictEqual(s.length,e.length);for(let o=0;o<e.length;o++)t.strictEqual(r[o].id,e[o].identifier.id),t.strictEqual(s.get(o).identifier.id,e[o].identifier.id)})}),test("Test @recommended:all query",()=>{const e=[h,p,L,y,k,R,E],n=i.stubPromise(m,"getExtensions",e);return a.show("@recommended:all").then(s=>{const r=n.args[0][0];t.strictEqual(r.length,e.length),t.strictEqual(s.length,e.length);for(let o=0;o<e.length;o++)t.strictEqual(r[o].id,e[o].identifier.id),t.strictEqual(s.get(o).identifier.id,e[o].identifier.id)})}),test("Test search",()=>{const e="search-me",n=[y,h,E,p],s=i.stubPromise(m,"query",S(...n));return a.show("search-me").then(r=>{const o=s.args[0][0];t.ok(s.calledOnce),t.strictEqual(o.text,e),t.strictEqual(r.length,n.length);for(let l=0;l<n.length;l++)t.strictEqual(r.get(l).identifier.id,n[l].identifier.id)})}),test("Test preferred search experiment",()=>{const e="search-me",n=[y,h,E,p],s=[h,p,y,E],r=i.stubPromise(m,"query",S(...n)),o=i.stubPromise(z,"getExtensionsControlManifest",{malicious:[],deprecated:{},search:[{query:"search-me",preferredResults:[h.identifier.id,"something-that-wasnt-in-first-page",p.identifier.id]}]});return a.show("search-me").then(l=>{const M=r.args[0][0];t.ok(o.calledTwice),t.ok(r.calledOnce),t.strictEqual(M.text,e),t.strictEqual(l.length,s.length);for(let D=0;D<s.length;D++)t.strictEqual(l.get(D).identifier.id,s[D].identifier.id)})}),test("Skip preferred search experiment when user defines sort order",()=>{const e="search-me",n=[y,h,E,p],s=i.stubPromise(m,"query",S(...n));return a.show("search-me @sort:installs").then(r=>{const o=s.args[0][0];t.ok(s.calledOnce),t.strictEqual(o.text,e),t.strictEqual(r.length,n.length);for(let l=0;l<n.length;l++)t.strictEqual(r.get(l).identifier.id,n[l].identifier.id)})});function w(e="someext",n={},s={}){return n={name:e,publisher:"pub",version:"1.0.0",...n},s={type:B.User,location:W.file(`pub.${e}`),identifier:{id:N(n.publisher,n.name)},metadata:{id:N(n.publisher,n.name),publisherId:n.publisher,publisherDisplayName:"somename"},...s},s.isBuiltin=s.type===B.System,Object.create({manifest:n,...s})}function q(e,n={},s={},r={}){const o=G($,j),l=Object.create({name:e,publisher:"pub",version:"1.0.0",allTargetPlatforms:[o],properties:{},assets:{},...n});return l.properties={...l.properties,dependencies:[],targetPlatform:o,...s},l.assets={...l.assets,...r},l.identifier={id:N(l.publisher,l.name),uuid:H()},l}function S(...e){return{firstPage:e,total:e.length,pageSize:e.length,getPage:()=>null}}});