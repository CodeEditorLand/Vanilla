import{importAMDNodeModule as n}from"../../../../../../amdX.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../../../base/test/common/utils.js";import{IConfigurationService as l}from"../../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as k}from"../../../../../../platform/configuration/test/common/testConfigurationService.js";import{TestInstantiationService as j}from"../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{IProductService as g}from"../../../../../../platform/product/common/productService.js";import{TerminalBuiltinLinkType as u}from"../../browser/links.js";import{TerminalWordLinkDetector as m}from"../../browser/terminalWordLinkDetector.js";import{assertLinkHelper as c}from"./linkTestUtils.js";import{TestProductService as w}from"../../../../../test/common/workbenchTestServices.js";suite("Workbench - TerminalWordLinkDetector",()=>{const r=d();let e,f,i,a;setup(async()=>{a=r.add(new j),e=new k,await e.setUserConfiguration("terminal",{integrated:{wordSeparators:""}}),a.stub(l,e),a.set(g,w);const s=(await n("@xterm/xterm","lib/xterm.js")).Terminal;i=r.add(new s({allowProposedApi:!0,cols:80,rows:30})),f=r.add(a.createInstance(m,i))});async function t(s,o){await c(s,o,f,u.Search)}suite("should link words as defined by wordSeparators",()=>{test('" ()[]"',async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" ()[]"}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("foo",[{range:[[1,1],[3,1]],text:"foo"}]),await t(" foo ",[{range:[[2,1],[4,1]],text:"foo"}]),await t("(foo)",[{range:[[2,1],[4,1]],text:"foo"}]),await t("[foo]",[{range:[[2,1],[4,1]],text:"foo"}]),await t("{foo}",[{range:[[1,1],[5,1]],text:"{foo}"}])}),test('" "',async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("foo",[{range:[[1,1],[3,1]],text:"foo"}]),await t(" foo ",[{range:[[2,1],[4,1]],text:"foo"}]),await t("(foo)",[{range:[[1,1],[5,1]],text:"(foo)"}]),await t("[foo]",[{range:[[1,1],[5,1]],text:"[foo]"}]),await t("{foo}",[{range:[[1,1],[5,1]],text:"{foo}"}])}),test('" []"',async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" []"}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("aabbccdd.txt ",[{range:[[1,1],[12,1]],text:"aabbccdd.txt"}]),await t(" aabbccdd.txt ",[{range:[[2,1],[13,1]],text:"aabbccdd.txt"}]),await t(" [aabbccdd.txt] ",[{range:[[3,1],[14,1]],text:"aabbccdd.txt"}])})}),suite("should ignore powerline symbols",()=>{for(let s=57520;s<=57535;s++)test(`\\u${s.toString(16)}`,async()=>{await t(`${String.fromCharCode(s)}foo${String.fromCharCode(s)}`,[{range:[[2,1],[4,1]],text:"foo"}])})}),test.skip("should support wide characters",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" []"}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("\u6211\u662F\u5B66\u751F.txt ",[{range:[[1,1],[12,1]],text:"\u6211\u662F\u5B66\u751F.txt"}]),await t(" \u6211\u662F\u5B66\u751F.txt ",[{range:[[2,1],[13,1]],text:"\u6211\u662F\u5B66\u751F.txt"}]),await t(" [\u6211\u662F\u5B66\u751F.txt] ",[{range:[[3,1],[14,1]],text:"\u6211\u662F\u5B66\u751F.txt"}])}),test("should support multiple link results",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("foo bar",[{range:[[1,1],[3,1]],text:"foo"},{range:[[5,1],[7,1]],text:"bar"}])}),test("should remove trailing colon in the link results",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("foo:5:6: bar:0:32:",[{range:[[1,1],[7,1]],text:"foo:5:6"},{range:[[10,1],[17,1]],text:"bar:0:32"}])}),test("should support wrapping",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd",[{range:[[1,1],[41,3]],text:"fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd"}])}),test("should support wrapping with multiple links",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("fsdjfsdkfjslkdfjskdfjsldkfj sdlkfjslkdjfskldjflskdfjskldjflskdfj sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd",[{range:[[1,1],[27,1]],text:"fsdjfsdkfjslkdfjskdfjsldkfj"},{range:[[29,1],[64,1]],text:"sdlkfjslkdjfskldjflskdfjskldjflskdfj"},{range:[[66,1],[43,3]],text:"sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd"}])}),test("does not return any links for empty text",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("",[])}),test("should support file scheme links",async()=>{await e.setUserConfiguration("terminal",{integrated:{wordSeparators:" "}}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration:()=>!0}),await t("file:///C:/users/test/file.txt ",[{range:[[1,1],[30,1]],text:"file:///C:/users/test/file.txt"}]),await t("file:///C:/users/test/file.txt:1:10 ",[{range:[[1,1],[35,1]],text:"file:///C:/users/test/file.txt:1:10"}])})});