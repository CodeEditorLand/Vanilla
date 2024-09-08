import{strictEqual as e}from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as c}from"../../../../../base/test/common/utils.js";import{IConfigurationService as a}from"../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as r}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IDialogService as l}from"../../../../../platform/dialogs/common/dialogs.js";import{TestDialogService as d}from"../../../../../platform/dialogs/test/common/testDialogService.js";import{TestInstantiationService as v}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{TerminalSettingId as u}from"../../../../../platform/terminal/common/terminal.js";import{shouldPasteTerminalText as i}from"../../common/terminalClipboard.js";suite("TerminalClipboard",function(){const s=c();suite("shouldPasteTerminalText",()=>{let n,o;setup(async()=>{n=s.add(new v),o=new r({[u.EnableMultiLinePasteWarning]:"auto"}),n.stub(a,o),n.stub(l,new d(void 0,{result:{confirmed:!1}}))});function t(f){o=new r({[u.EnableMultiLinePasteWarning]:f}),n.stub(a,o)}test("Single line string",async()=>{e(await n.invokeFunction(i,"foo",void 0),!0),t("always"),e(await n.invokeFunction(i,"foo",void 0),!0),t("never"),e(await n.invokeFunction(i,"foo",void 0),!0)}),test("Single line string with trailing new line",async()=>{e(await n.invokeFunction(i,`foo
`,void 0),!0),t("always"),e(await n.invokeFunction(i,`foo
`,void 0),!1),t("never"),e(await n.invokeFunction(i,`foo
`,void 0),!0)}),test("Multi-line string",async()=>{e(await n.invokeFunction(i,`foo
bar`,void 0),!1),t("always"),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),t("never"),e(await n.invokeFunction(i,`foo
bar`,void 0),!0)}),test("Bracketed paste mode",async()=>{e(await n.invokeFunction(i,`foo
bar`,!0),!0),t("always"),e(await n.invokeFunction(i,`foo
bar`,!0),!1),t("never"),e(await n.invokeFunction(i,`foo
bar`,!0),!0)}),test("Legacy config",async()=>{t(!0),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0),t(!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0)}),test("Invalid config",async()=>{t(123),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0)})})});
