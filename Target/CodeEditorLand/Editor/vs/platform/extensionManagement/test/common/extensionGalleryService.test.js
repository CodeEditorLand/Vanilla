import i from"assert";import{joinPath as S}from"../../../../base/common/resources.js";import{URI as g}from"../../../../base/common/uri.js";import{isUUID as R}from"../../../../base/common/uuid.js";import{mock as M}from"../../../../base/test/common/mock.js";import"../../../configuration/common/configuration.js";import{TestConfigurationService as N}from"../../../configuration/test/common/testConfigurationService.js";import"../../../environment/common/environment.js";import{sortExtensionVersions as s}from"../../common/extensionGalleryService.js";import"../../../files/common/files.js";import{FileService as E}from"../../../files/common/fileService.js";import{InMemoryFileSystemProvider as x}from"../../../files/common/inMemoryFilesystemProvider.js";import{NullLogService as A}from"../../../log/common/log.js";import d from"../../../product/common/product.js";import"../../../product/common/productService.js";import{resolveMarketplaceHeaders as u}from"../../../externalServices/common/marketplace.js";import{InMemoryStorageService as h}from"../../../storage/common/storage.js";import{TelemetryConfiguration as v,TELEMETRY_SETTING_ID as I}from"../../../telemetry/common/telemetry.js";import{TargetPlatform as o}from"../../../extensions/common/extensions.js";import{NullTelemetryService as f}from"../../../telemetry/common/telemetryUtils.js";import{ensureNoDisposablesAreLeakedInTestSuite as y}from"../../../../base/test/common/utils.js";class _ extends M(){serviceMachineIdResource;constructor(n){super(),this.serviceMachineIdResource=n,this.isBuilt=!0}}suite("Extension Gallery Service",()=>{const a=y();let n,m,l,p,c;setup(()=>{const e=S(g.file("tests").with({scheme:"vscode-tests"}),"machineid");m=new _(e),n=a.add(new E(new A));const r=a.add(new x);a.add(n.registerProvider(e.scheme,r)),l=a.add(new h),c=new N({[I]:v.ON}),c.updateValue(I,v.ON),p={_serviceBrand:void 0,...d,enableTelemetry:!0}}),test("marketplace machine id",async()=>{const e=await u(d.version,p,m,c,n,l,f);i.ok(e["X-Market-User-Id"]),i.ok(R(e["X-Market-User-Id"]));const r=await u(d.version,p,m,c,n,l,f);i.strictEqual(e["X-Market-User-Id"],r["X-Market-User-Id"])}),test("sorting single extension version without target platform",async()=>{const e=[t("1.1.2")],r=[...e];s(e,o.DARWIN_X64),i.deepStrictEqual(e,r)}),test("sorting single extension version with preferred target platform",async()=>{const e=[t("1.1.2",o.DARWIN_X64)],r=[...e];s(e,o.DARWIN_X64),i.deepStrictEqual(e,r)}),test("sorting single extension version with not compatible target platform",async()=>{const e=[t("1.1.2",o.DARWIN_ARM64)],r=[...e];s(e,o.WIN32_X64),i.deepStrictEqual(e,r)}),test("sorting multiple extension versions without target platforms",async()=>{const e=[t("1.2.4"),t("1.1.3"),t("1.1.2"),t("1.1.1")],r=[...e];s(e,o.WIN32_ARM64),i.deepStrictEqual(e,r)}),test("sorting multiple extension versions with target platforms - 1",async()=>{const e=[t("1.2.4",o.DARWIN_ARM64),t("1.2.4",o.WIN32_ARM64),t("1.2.4",o.LINUX_ARM64),t("1.1.3"),t("1.1.2"),t("1.1.1")],r=[e[1],e[0],e[2],e[3],e[4],e[5]];s(e,o.WIN32_ARM64),i.deepStrictEqual(e,r)}),test("sorting multiple extension versions with target platforms - 2",async()=>{const e=[t("1.2.4"),t("1.2.3",o.DARWIN_ARM64),t("1.2.3",o.WIN32_ARM64),t("1.2.3",o.LINUX_ARM64),t("1.1.2"),t("1.1.1")],r=[e[0],e[3],e[1],e[2],e[4],e[5]];s(e,o.LINUX_ARM64),i.deepStrictEqual(e,r)}),test("sorting multiple extension versions with target platforms - 3",async()=>{const e=[t("1.2.4"),t("1.1.2"),t("1.1.1"),t("1.0.0",o.DARWIN_ARM64),t("1.0.0",o.WIN32_ARM64)],r=[e[0],e[1],e[2],e[4],e[3]];s(e,o.WIN32_ARM64),i.deepStrictEqual(e,r)});function t(e,r){return{version:e,targetPlatform:r}}});