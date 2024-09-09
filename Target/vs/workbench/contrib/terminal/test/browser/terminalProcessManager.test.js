import{strictEqual as t}from"assert";import{Event as s}from"../../../../../base/common/event.js";import{Schemas as a}from"../../../../../base/common/network.js";import{URI as c}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../../base/test/common/utils.js";import{IConfigurationService as l}from"../../../../../platform/configuration/common/configuration.js";import"../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../../../platform/terminal/common/terminal.js";import{ITerminalInstanceService as m}from"../../browser/terminal.js";import{TerminalProcessManager as u}from"../../browser/terminalProcessManager.js";import{workbenchInstantiationService as f}from"../../../../test/browser/workbenchTestServices.js";class p{constructor(n){this.shouldPersist=n}id=0;get capabilities(){return[]}updateProperty(n,e){throw new Error("Method not implemented.")}onProcessOverrideDimensions;onProcessResolvedShellLaunchConfig;onDidChangeHasChildProcesses;onDidChangeProperty=s.None;onProcessData=s.None;onProcessExit=s.None;onProcessReady=s.None;onProcessTitleChanged=s.None;onProcessShellTypeChanged=s.None;async start(){}shutdown(n){}input(n){}resize(n,e){}clearBuffer(){}acknowledgeDataEvent(n){}async setUnicodeVersion(n){}async getInitialCwd(){return""}async getCwd(){return""}async processBinary(n){}refreshProperty(n){return Promise.resolve("")}}class P{getBackend(){return{onPtyHostExit:s.None,onPtyHostUnresponsive:s.None,onPtyHostResponsive:s.None,onPtyHostRestart:s.None,onDidMoveWindowInstance:s.None,onDidRequestDetach:s.None,createProcess:(n,e,o,y,g,h,v,i)=>new p(i),getLatency:()=>Promise.resolve([])}}}suite("Workbench - TerminalProcessManager",()=>{let r;const n=d();setup(async()=>{const e=f(void 0,n),o=e.get(l);await o.setUserConfiguration("editor",{fontFamily:"foo"}),await o.setUserConfiguration("terminal",{integrated:{fontFamily:"bar",enablePersistentSessions:!0,shellIntegration:{enabled:!1}}}),o.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),e.stub(m,new P),r=n.add(e.createInstance(u,1,void 0,void 0,void 0))}),suite("process persistence",()=>{suite("local",()=>{test("regular terminal should persist",async()=>{const e=await r.createProcess({},1,1,!1);t(e,void 0),t(r.shouldPersist,!0)}),test("task terminal should not persist",async()=>{const e=await r.createProcess({isFeatureTerminal:!0},1,1,!1);t(e,void 0),t(r.shouldPersist,!1)})}),suite("remote",()=>{const e=c.from({scheme:a.vscodeRemote,path:"test/cwd"});test("regular terminal should persist",async()=>{const o=await r.createProcess({cwd:e},1,1,!1);t(o,void 0),t(r.shouldPersist,!0)}),test("task terminal should not persist",async()=>{const o=await r.createProcess({isFeatureTerminal:!0,cwd:e},1,1,!1);t(o,void 0),t(r.shouldPersist,!1)})})})});
