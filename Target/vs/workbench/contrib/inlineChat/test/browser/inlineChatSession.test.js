import n from"assert";import{DisposableStore as V}from"../../../../../base/common/lifecycle.js";import{Event as C}from"../../../../../base/common/event.js";import{mock as I}from"../../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as T}from"../../../../../base/test/common/utils.js";import{TestDiffProviderFactoryService as R}from"../../../../../editor/test/browser/diff/testDiffProviderFactoryService.js";import"../../../../../editor/browser/editorBrowser.js";import{IDiffProviderFactoryService as y}from"../../../../../editor/browser/widget/diffEditor/diffProviderFactoryService.js";import{Range as w}from"../../../../../editor/common/core/range.js";import"../../../../../editor/common/model.js";import{IModelService as b}from"../../../../../editor/common/services/model.js";import{instantiateTestCodeEditor as j}from"../../../../../editor/test/browser/testCodeEditor.js";import{IConfigurationService as p}from"../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as M}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IContextKeyService as x}from"../../../../../platform/contextkey/common/contextkey.js";import{SyncDescriptor as m}from"../../../../../platform/instantiation/common/descriptors.js";import{ServiceCollection as O}from"../../../../../platform/instantiation/common/serviceCollection.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{MockContextKeyService as k}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{IEditorProgressService as L}from"../../../../../platform/progress/common/progress.js";import{IViewDescriptorService as _}from"../../../../common/views.js";import"../../../accessibility/browser/accessibilityConfiguration.js";import{IChatAccessibilityService as H,IChatWidgetService as z}from"../../../chat/browser/chat.js";import"../../../chat/common/chatViewModel.js";import{IInlineChatSavingService as F}from"../../browser/inlineChatSavingService.js";import{HunkState as h}from"../../browser/inlineChatSession.js";import{IInlineChatSessionService as A}from"../../browser/inlineChatSessionService.js";import{InlineChatSessionServiceImpl as W}from"../../browser/inlineChatSessionServiceImpl.js";import{EditMode as d}from"../../common/inlineChat.js";import{workbenchInstantiationService as U}from"../../../../test/browser/workbenchTestServices.js";import{CancellationToken as f}from"../../../../../base/common/cancellation.js";import{assertType as u}from"../../../../../base/common/types.js";import{EditOperation as i}from"../../../../../editor/common/core/editOperation.js";import{Position as r}from"../../../../../editor/common/core/position.js";import{IEditorWorkerService as P}from"../../../../../editor/common/services/editorWorker.js";import{TestWorkerService as B}from"./testWorkerService.js";import{IExtensionService as K,nullExtensionDescription as G}from"../../../../services/extensions/common/extensions.js";import{ILogService as X,NullLogService as J}from"../../../../../platform/log/common/log.js";import{ITelemetryService as Q}from"../../../../../platform/telemetry/common/telemetry.js";import{NullTelemetryService as Y}from"../../../../../platform/telemetry/common/telemetryUtils.js";import{IWorkspaceContextService as Z}from"../../../../../platform/workspace/common/workspace.js";import{ChatWidgetService as $}from"../../../chat/browser/chatWidget.js";import{IChatService as ee}from"../../../chat/common/chatService.js";import{ChatService as te}from"../../../chat/common/chatServiceImpl.js";import{IChatSlashCommandService as ne,ChatSlashCommandService as ie}from"../../../chat/common/chatSlashCommands.js";import{IChatVariablesService as oe}from"../../../chat/common/chatVariables.js";import{IChatWidgetHistoryService as re,ChatWidgetHistoryService as ae}from"../../../chat/common/chatWidgetHistoryService.js";import{IViewsService as se}from"../../../../services/views/common/viewsService.js";import{TestExtensionService as q,TestContextService as le}from"../../../../test/common/workbenchTestServices.js";import{IChatAgentService as D,ChatAgentService as ue,ChatAgentLocation as ce}from"../../../chat/common/chatAgents.js";import{ChatVariablesService as de}from"../../../chat/browser/chatVariables.js";import{ICommandService as fe}from"../../../../../platform/commands/common/commands.js";import{TestCommandService as ge}from"../../../../../editor/test/browser/editorTestServices.js";import{IAccessibleViewService as me}from"../../../../../platform/accessibility/browser/accessibleView.js";import{IWorkbenchAssignmentService as we}from"../../../../services/assignment/common/assignmentService.js";import{NullWorkbenchAssignmentService as he}from"../../../../services/assignment/test/common/nullAssignmentService.js";import{ILanguageModelToolsService as Ee}from"../../../chat/common/languageModelToolsService.js";import{MockLanguageModelToolsService as Ie}from"../../../chat/test/common/mockLanguageModelToolsService.js";import"../../../chat/common/chatModel.js";import{assertSnapshot as S}from"../../../../../base/test/common/snapshot.js";suite("InlineChatSession",function(){const E=new V;let o,l,v,a;setup(function(){const t=new k,e=new O([p,new M],[oe,new m(de)],[X,new J],[Q,Y],[K,new q],[x,new k],[se,new q],[Z,new le],[re,new m(ae)],[z,new m($)],[ne,new m(ie)],[ee,new m(te)],[P,new m(B)],[D,new m(ue)],[x,t],[y,new m(R)],[A,new m(W)],[fe,new m(ge)],[Ee,new Ie],[F,new class extends I(){markChanged(s){}}],[L,new class extends I(){show(s,N){return{total(){},worked(ve){},done(){}}}}],[H,new class extends I(){acceptResponse(s,N){}acceptRequest(){return-1}}],[me,new class extends I(){getOpenAriaHint(s){return null}}],[p,new M],[_,new class extends I(){onDidChangeLocation=C.None}],[we,new he]);v=E.add(U(void 0,E).createChild(e)),a=E.add(v.get(A)),v.get(D).registerDynamicAgent({extensionId:G.identifier,publisherDisplayName:"",extensionDisplayName:"",extensionPublisherId:"",id:"testAgent",name:"testAgent",isDefault:!0,locations:[ce.Editor],metadata:{},slashCommands:[],disambiguation:[]},{async invoke(){return{}}}),l=E.add(v.get(b).createModel(`one
two
three
four
five
six
seven
eight
nine
ten
eleven`,null)),o=E.add(j(v,l))}),teardown(function(){E.clear()}),T();async function c(t){const e=a.getSession(o,o.getModel().uri);u(e),e.hunkData.ignoreTextModelNChanges=!0;try{o.executeEdits("test",Array.isArray(t)?t:[t])}finally{e.hunkData.ignoreTextModelNChanges=!1}await e.hunkData.recompute({applied:0,sha1:"fakeSha1"})}function g(t){o.executeEdits("test",Array.isArray(t)?t:[t])}test("Create, release",async function(){const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),a.releaseSession(t)}),test("HunkData, info",async function(){const t=l.getAllDecorations().length,e=await a.createSession(o,{editMode:d.Live},f.None);u(e),n.ok(e.textModelN===l),await c(i.insert(new r(1,1),`AI_EDIT
`)),n.strictEqual(e.hunkData.size,1);let[s]=e.hunkData.getInfo();u(s),n.ok(!e.textModel0.equalsTextBuffer(e.textModelN.getTextBuffer())),n.strictEqual(s.getState(),h.Pending),n.ok(s.getRangesN()[0].equalsRange({startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:7})),await c(i.insert(new r(1,3),"foobar")),[s]=e.hunkData.getInfo(),n.ok(s.getRangesN()[0].equalsRange({startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:13})),a.releaseSession(e),n.strictEqual(l.getAllDecorations().length,t)}),test("HunkData, accept",async function(){const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),await c([i.insert(new r(1,1),`AI_EDIT
`),i.insert(new r(10,1),`AI_EDIT
`)]),n.strictEqual(t.hunkData.size,2),n.ok(!t.textModel0.equalsTextBuffer(t.textModelN.getTextBuffer()));for(const e of t.hunkData.getInfo())u(e),n.strictEqual(e.getState(),h.Pending),e.acceptChanges(),n.strictEqual(e.getState(),h.Accepted);n.strictEqual(t.textModel0.getValue(),t.textModelN.getValue()),a.releaseSession(t)}),test("HunkData, reject",async function(){const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),await c([i.insert(new r(1,1),`AI_EDIT
`),i.insert(new r(10,1),`AI_EDIT
`)]),n.strictEqual(t.hunkData.size,2),n.ok(!t.textModel0.equalsTextBuffer(t.textModelN.getTextBuffer()));for(const e of t.hunkData.getInfo())u(e),n.strictEqual(e.getState(),h.Pending),e.discardChanges(),n.strictEqual(e.getState(),h.Rejected);n.strictEqual(t.textModel0.getValue(),t.textModelN.getValue()),a.releaseSession(t)}),test("HunkData, N rounds",async function(){l.setValue(`one
two
three
four
five
six
seven
eight
nine
ten
eleven
twelwe
thirteen
fourteen
fifteen
sixteen
seventeen
eighteen
nineteen
`);const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),n.ok(t.textModel0.equalsTextBuffer(t.textModelN.getTextBuffer())),n.strictEqual(t.hunkData.size,0),await c([i.insert(new r(1,1),"AI1"),i.insert(new r(4,1),"AI2"),i.insert(new r(19,1),"AI3")]),n.strictEqual(t.hunkData.size,2);let[e,s]=t.hunkData.getInfo();n.ok(l.getValueInRange(e.getRangesN()[0]).includes("AI1")),n.ok(l.getValueInRange(e.getRangesN()[0]).includes("AI2")),n.ok(l.getValueInRange(s.getRangesN()[0]).includes("AI3")),n.ok(!t.textModel0.getValueInRange(e.getRangesN()[0]).includes("AI1")),n.ok(!t.textModel0.getValueInRange(e.getRangesN()[0]).includes("AI2")),n.ok(!t.textModel0.getValueInRange(s.getRangesN()[0]).includes("AI3")),e.acceptChanges(),n.ok(t.textModel0.getValueInRange(e.getRangesN()[0]).includes("AI1")),n.ok(t.textModel0.getValueInRange(e.getRangesN()[0]).includes("AI2")),n.ok(!t.textModel0.getValueInRange(s.getRangesN()[0]).includes("AI3")),await c([i.insert(new r(7,1),"AI4")]),n.strictEqual(t.hunkData.size,2),[e,s]=t.hunkData.getInfo(),n.ok(l.getValueInRange(e.getRangesN()[0]).includes("AI4")),n.ok(l.getValueInRange(s.getRangesN()[0]).includes("AI3")),a.releaseSession(t)}),test("HunkData, (mirror) edit before",async function(){const t=["one","two","three"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI WAS HERE
`)]),n.strictEqual(e.textModelN.getValue(),["one","two","AI WAS HERE","three"].join(`
`)),n.strictEqual(e.textModel0.getValue(),t.join(`
`)),g([i.replace(new w(1,1,1,4),"ONE")]),n.strictEqual(e.textModelN.getValue(),["ONE","two","AI WAS HERE","three"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["ONE","two","three"].join(`
`))}),test("HunkData, (mirror) edit after",async function(){const t=["one","two","three","four","five"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI_EDIT
`)]),n.strictEqual(e.hunkData.size,1);const[s]=e.hunkData.getInfo();g([i.insert(new r(1,1),"USER1")]),n.strictEqual(e.textModelN.getValue(),["USER1one","two","AI_EDIT","three","four","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["USER1one","two","three","four","five"].join(`
`)),g([i.insert(new r(5,1),"USER2")]),n.strictEqual(e.textModelN.getValue(),["USER1one","two","AI_EDIT","three","USER2four","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["USER1one","two","three","USER2four","five"].join(`
`)),s.acceptChanges(),n.strictEqual(e.textModelN.getValue(),["USER1one","two","AI_EDIT","three","USER2four","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["USER1one","two","AI_EDIT","three","USER2four","five"].join(`
`))}),test("HunkData, (mirror) edit inside ",async function(){const t=["one","two","three"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI WAS HERE
`)]),n.strictEqual(e.textModelN.getValue(),["one","two","AI WAS HERE","three"].join(`
`)),n.strictEqual(e.textModel0.getValue(),t.join(`
`)),g([i.replace(new w(3,4,3,7),"wwaaassss")]),n.strictEqual(e.textModelN.getValue(),["one","two","AI wwaaassss HERE","three"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three"].join(`
`))}),test("HunkData, (mirror) edit after dicard ",async function(){const t=["one","two","three"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI WAS HERE
`)]),n.strictEqual(e.textModelN.getValue(),["one","two","AI WAS HERE","three"].join(`
`)),n.strictEqual(e.textModel0.getValue(),t.join(`
`)),n.strictEqual(e.hunkData.size,1);const[s]=e.hunkData.getInfo();s.discardChanges(),n.strictEqual(e.textModelN.getValue(),t.join(`
`)),n.strictEqual(e.textModel0.getValue(),t.join(`
`)),g([i.replace(new w(3,4,3,6),"3333")]),n.strictEqual(e.textModelN.getValue(),["one","two","thr3333"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","thr3333"].join(`
`))}),test("HunkData, (mirror) edit after, multi turn",async function(){const t=["one","two","three","four","five"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI_EDIT
`)]),n.strictEqual(e.hunkData.size,1),g([i.insert(new r(5,1),"FOO")]),n.strictEqual(e.textModelN.getValue(),["one","two","AI_EDIT","three","FOOfour","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","five"].join(`
`)),await c([i.insert(new r(2,4)," zwei")]),n.strictEqual(e.hunkData.size,1),n.strictEqual(e.textModelN.getValue(),["one","two zwei","AI_EDIT","three","FOOfour","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","five"].join(`
`)),g([i.replace(new w(6,3,6,5),"vefivefi")]),n.strictEqual(e.textModelN.getValue(),["one","two zwei","AI_EDIT","three","FOOfour","fivefivefi"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","fivefivefi"].join(`
`))}),test("HunkData, (mirror) edit after, multi turn 2",async function(){const t=["one","two","three","four","five"];l.setValue(t.join(`
`));const e=await a.createSession(o,{editMode:d.Live},f.None);u(e),await c([i.insert(new r(3,1),`AI_EDIT
`)]),n.strictEqual(e.hunkData.size,1),g([i.insert(new r(5,1),"FOO")]),n.strictEqual(e.textModelN.getValue(),["one","two","AI_EDIT","three","FOOfour","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","five"].join(`
`)),await c([i.insert(new r(2,4),"zwei")]),n.strictEqual(e.hunkData.size,1),n.strictEqual(e.textModelN.getValue(),["one","twozwei","AI_EDIT","three","FOOfour","five"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","five"].join(`
`)),g([i.replace(new w(6,3,6,5),"vefivefi")]),n.strictEqual(e.textModelN.getValue(),["one","twozwei","AI_EDIT","three","FOOfour","fivefivefi"].join(`
`)),n.strictEqual(e.textModel0.getValue(),["one","two","three","FOOfour","fivefivefi"].join(`
`)),e.hunkData.getInfo()[0].acceptChanges(),n.strictEqual(e.textModelN.getValue(),e.textModel0.getValue()),g([i.replace(new w(1,1,1,1),"done")]),n.strictEqual(e.textModelN.getValue(),e.textModel0.getValue())}),test("HunkData, accept, discardAll",async function(){const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),await c([i.insert(new r(1,1),`AI_EDIT
`),i.insert(new r(10,1),`AI_EDIT
`)]),n.strictEqual(t.hunkData.size,2),n.ok(!t.textModel0.equalsTextBuffer(t.textModelN.getTextBuffer()));const e=t.textModelN.getValue();t.hunkData.getInfo()[0].acceptChanges(),n.strictEqual(e,t.textModelN.getValue()),t.hunkData.discardAll(),n.strictEqual(t.textModelN.getValue(),`AI_EDIT
one
two
three
four
five
six
seven
eight
nine
ten
eleven`),n.strictEqual(t.textModelN.getValue(),t.textModel0.getValue()),a.releaseSession(t)}),test("HunkData, discardAll return undo edits",async function(){const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),await c([i.insert(new r(1,1),`AI_EDIT
`),i.insert(new r(10,1),`AI_EDIT
`)]),n.strictEqual(t.hunkData.size,2),n.ok(!t.textModel0.equalsTextBuffer(t.textModelN.getTextBuffer()));const e=t.textModelN.getValue();t.hunkData.getInfo()[0].acceptChanges(),n.strictEqual(e,t.textModelN.getValue());const s=t.hunkData.discardAll();n.strictEqual(t.textModelN.getValue(),`AI_EDIT
one
two
three
four
five
six
seven
eight
nine
ten
eleven`),n.strictEqual(t.textModelN.getValue(),t.textModel0.getValue()),t.textModelN.pushEditOperations(null,s,()=>null),n.strictEqual(e,t.textModelN.getValue()),a.releaseSession(t)}),test('Pressing Escape after inline chat errored with "response filtered" leaves document dirty #7764',async function(){const t=`class Foo {
	private onError(error: string): void {
		if (/The request timed out|The network connection was lost/i.test(error)) {
			return;
		}

		error = error.replace(/See https://github.com/Squirrel/Squirrel.Mac/issues/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');

		this.notificationService.notify({
			severity: Severity.Error,
			message: error,
			source: nls.localize('update service', "Update Service"),
		});
	}
}`;l.setValue(t);const e=await a.createSession(o,{editMode:d.Live},f.None);u(e);const s=new class extends I(){get id(){return"one"}};e.markModelVersion(s),n.strictEqual(o.getModel().getLineCount(),15),await c([i.replace(new w(7,1,7,Number.MAX_SAFE_INTEGER),`error = error.replace(
			/See https://github.com/Squirrel/Squirrel.Mac/issues/182 for more information/,
			'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information'
		);`)]),n.strictEqual(o.getModel().getLineCount(),18),await e.undoChangesUntil(s.id),await e.hunkData.recompute({applied:0,sha1:"fakeSha1"},void 0),n.strictEqual(o.getModel().getValue(),t),e.hunkData.discardAll(),n.strictEqual(o.getModel().getValue(),t)}),test("Apply Code's preview should be easier to undo/esc #7537",async function(){l.setValue(`export function fib(n) {
	if (n <= 0) return 0;
	if (n === 1) return 0;
	if (n === 2) return 1;
	return fib(n - 1) + fib(n - 2);
}`);const t=await a.createSession(o,{editMode:d.Live},f.None);u(t),await c([i.replace(new w(5,1,6,Number.MAX_SAFE_INTEGER),`
	let a = 0, b = 1, c;
	for (let i = 3; i <= n; i++) {
		c = a + b;
		a = b;
		b = c;
	}
	return b;
}`)]),n.strictEqual(t.hunkData.size,1),n.strictEqual(t.hunkData.pending,1),n.ok(t.hunkData.getInfo().every(e=>e.getState()===h.Pending)),await S(o.getModel().getValue(),{name:"1"}),await l.undo(),await S(o.getModel().getValue(),{name:"2"}),n.strictEqual(t.hunkData.size,1),n.strictEqual(t.hunkData.pending,0),n.ok(t.hunkData.getInfo().every(e=>e.getState()===h.Accepted)),t.hunkData.discardAll(),await S(o.getModel().getValue(),{name:"2"})})});
