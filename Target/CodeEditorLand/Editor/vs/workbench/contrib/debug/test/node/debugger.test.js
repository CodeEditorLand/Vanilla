import i from"assert";import{join as x,normalize as D}from"../../../../../base/common/path.js";import*as o from"../../../../../base/common/platform.js";import"../../common/debug.js";import{Debugger as E}from"../../common/debugger.js";import{TestConfigurationService as v}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{URI as s}from"../../../../../base/common/uri.js";import{ExecutableDebugAdapter as g}from"../../node/debugAdapter.js";import{TestTextResourcePropertiesService as k}from"../../../../../editor/test/common/services/testTextResourcePropertiesService.js";import{ExtensionIdentifier as a,TargetPlatform as u}from"../../../../../platform/extensions/common/extensions.js";import{ensureNoDisposablesAreLeakedInTestSuite as I}from"../../../../../base/test/common/utils.js";suite("Debug - Debugger",()=>{let n;const m="/a/b/c/",t={type:"mock",label:"Mock Debug",program:"./out/mock/mockDebug.js",args:["arg1","arg2"],configurationAttributes:{launch:{required:["program"],properties:{program:{type:"string",description:"Workspace relative path to a text file.",default:"readme.md"}}}},variables:null,initialConfigurations:[{name:"Mock-Debug",type:"mock",request:"launch",program:"readme.md"}]},l={id:"adapter",identifier:new a("adapter"),name:"myAdapter",version:"1.0.0",publisher:"vscode",extensionLocation:s.file(m),isBuiltin:!1,isUserBuiltin:!1,isUnderDevelopment:!1,engines:null,targetPlatform:u.UNDEFINED,contributes:{debuggers:[t]},enabledApiProposals:void 0},d={id:"extension1",identifier:new a("extension1"),name:"extension1",version:"1.0.0",publisher:"vscode",extensionLocation:s.file("/e1/b/c/"),isBuiltin:!1,isUserBuiltin:!1,isUnderDevelopment:!1,engines:null,targetPlatform:u.UNDEFINED,contributes:{debuggers:[{type:"mock",runtime:"runtime",runtimeArgs:["rarg"],program:"mockprogram",args:["parg"]}]},enabledApiProposals:void 0},f={id:"extension2",identifier:new a("extension2"),name:"extension2",version:"1.0.0",publisher:"vscode",extensionLocation:s.file("/e2/b/c/"),isBuiltin:!1,isUserBuiltin:!1,isUnderDevelopment:!1,engines:null,targetPlatform:u.UNDEFINED,contributes:{debuggers:[{type:"mock",win:{runtime:"winRuntime",program:"winProgram"},linux:{runtime:"linuxRuntime",program:"linuxProgram"},osx:{runtime:"osxRuntime",program:"osxProgram"}}]},enabledApiProposals:void 0},b={getDebugAdapterDescriptor(e,r){return Promise.resolve(void 0)}};I();const c=new v,p=new k(c);setup(()=>{n=new E(b,t,l,c,p,void 0,void 0,void 0,void 0)}),teardown(()=>{n=null}),test("attributes",()=>{i.strictEqual(n.type,t.type),i.strictEqual(n.label,t.label);const e=g.platformAdapterExecutable([l],"mock");i.strictEqual(e.command,x(m,t.program)),i.deepStrictEqual(e.args,t.args)}),test("merge platform specific attributes",function(){process.versions.electron||this.skip();const e=g.platformAdapterExecutable([d,f],"mock");i.strictEqual(e.command,o.isLinux?"linuxRuntime":o.isMacintosh?"osxRuntime":"winRuntime");const r=o.isLinux?"linuxProgram":o.isMacintosh?"osxProgram":"winProgram";i.deepStrictEqual(e.args,["rarg",D("/e2/b/c/")+r,"parg"])}),test("initial config file content",()=>{const e=["{","	// Use IntelliSense to learn about possible attributes.","	// Hover to view descriptions of existing attributes.","	// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387",'	"version": "0.2.0",','	"configurations": [',"		{",'			"name": "Mock-Debug",','			"type": "mock",','			"request": "launch",','			"program": "readme.md"',"		}","	]","}"].join(p.getEOL(s.file("somefile")));return n.getInitialConfigurationContent().then(r=>{i.strictEqual(r,e)},r=>i.fail(r))})});