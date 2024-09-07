import a from"assert";import{VSBuffer as d}from"../../../../base/common/buffer.js";import{platform as b}from"../../../../base/common/platform.js";import{arch as g}from"../../../../base/common/process.js";import{joinPath as p}from"../../../../base/common/resources.js";import{isBoolean as m}from"../../../../base/common/types.js";import{URI as w}from"../../../../base/common/uri.js";import{generateUuid as y}from"../../../../base/common/uuid.js";import{mock as E}from"../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as I}from"../../../../base/test/common/utils.js";import{IConfigurationService as x}from"../../../configuration/common/configuration.js";import{TestConfigurationService as O}from"../../../configuration/test/common/testConfigurationService.js";import{INativeEnvironmentService as j}from"../../../environment/common/environment.js";import{getTargetPlatform as h,IExtensionGalleryService as R,InstallOperation as r}from"../../common/extensionManagement.js";import{getGalleryExtensionId as V}from"../../common/extensionManagementUtil.js";import{ExtensionsDownloader as T}from"../../node/extensionDownloader.js";import{IExtensionSignatureVerificationService as P}from"../../node/extensionSignatureVerificationService.js";import{IFileService as G}from"../../../files/common/files.js";import{FileService as q}from"../../../files/common/fileService.js";import{InMemoryFileSystemProvider as C}from"../../../files/common/inMemoryFilesystemProvider.js";import{TestInstantiationService as D}from"../../../instantiation/test/common/instantiationServiceMock.js";import{ILogService as v,NullLogService as F}from"../../../log/common/log.js";const S=w.file("tests").with({scheme:"vscode-tests"});class N extends E(){constructor(i){super();this.verificationResult=i}async verify(){if(m(this.verificationResult))return this.verificationResult;const i=Error(this.verificationResult);throw i.code=this.verificationResult,i}}class A extends T{async validate(){}}suite("ExtensionDownloader Tests",()=>{const c=I();let s;setup(()=>{s=c.add(new D);const e=new F,t=c.add(new q(e)),l=c.add(new C);c.add(t.registerProvider(S.scheme,l)),s.stub(v,e),s.stub(G,t),s.stub(v,e),s.stub(j,{extensionsDownloadLocation:p(S,"CachedExtensionVSIXs")}),s.stub(R,{async download(f,u,n){await t.writeFile(u,d.fromString("extension vsix"))},async downloadSignatureArchive(f,u){await t.writeFile(u,d.fromString("extension signature"))}})}),test("download completes successfully if verification is disabled by setting set to false",async()=>{const t=await i({isSignatureVerificationEnabled:!1,verificationResult:"error"}).download(o("a",{isSigned:!0}),r.Install,!0);a.strictEqual(t.verificationStatus,!1)}),test("download completes successfully if verification is disabled by options",async()=>{const t=await i({isSignatureVerificationEnabled:!0,verificationResult:"error"}).download(o("a",{isSigned:!0}),r.Install,!1);a.strictEqual(t.verificationStatus,!1)}),test("download completes successfully if verification is disabled because the module is not loaded",async()=>{const t=await i({isSignatureVerificationEnabled:!0,verificationResult:!1}).download(o("a",{isSigned:!0}),r.Install,!0);a.strictEqual(t.verificationStatus,!1)}),test("download completes successfully if verification fails to execute",async()=>{const e="ENOENT",l=await i({isSignatureVerificationEnabled:!0,verificationResult:e}).download(o("a",{isSigned:!0}),r.Install,!0);a.strictEqual(l.verificationStatus,e)}),test("download completes successfully if verification fails ",async()=>{const e="IntegrityCheckFailed",l=await i({isSignatureVerificationEnabled:!0,verificationResult:e}).download(o("a",{isSigned:!0}),r.Install,!0);a.strictEqual(l.verificationStatus,e)}),test("download completes successfully if verification succeeds",async()=>{const t=await i({isSignatureVerificationEnabled:!0,verificationResult:!0}).download(o("a",{isSigned:!0}),r.Install,!0);a.strictEqual(t.verificationStatus,!0)}),test("download completes successfully for unsigned extension",async()=>{const t=await i({isSignatureVerificationEnabled:!0,verificationResult:!0}).download(o("a",{isSigned:!1}),r.Install,!0);a.strictEqual(t.verificationStatus,!1)}),test("download completes successfully for an unsigned extension even when signature verification throws error",async()=>{const t=await i({isSignatureVerificationEnabled:!0,verificationResult:"error"}).download(o("a",{isSigned:!1}),r.Install,!0);a.strictEqual(t.verificationStatus,!1)});function i(e){return s.stub(x,new O(m(e.isSignatureVerificationEnabled)?{extensions:{verifySignature:e.isSignatureVerificationEnabled}}:void 0)),s.stub(P,new N(e.verificationResult)),c.add(s.createInstance(A))}function o(e,t={},l={},f={}){const u=h(b,g),n=Object.create({name:e,publisher:"pub",version:"1.0.0",allTargetPlatforms:[u],properties:{},assets:{},...t});return n.properties={...n.properties,dependencies:[],targetPlatform:u,...l},n.assets={...n.assets,...f},n.identifier={id:V(n.publisher,n.name),uuid:y()},n}});