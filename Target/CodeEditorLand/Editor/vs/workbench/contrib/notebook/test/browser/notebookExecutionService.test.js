import k from"assert";import*as x from"sinon";import{AsyncIterableObject as f}from"../../../../../base/common/async.js";import"../../../../../base/common/cancellation.js";import{Event as u}from"../../../../../base/common/event.js";import{DisposableStore as S}from"../../../../../base/common/lifecycle.js";import{URI as w}from"../../../../../base/common/uri.js";import{mock as l}from"../../../../../base/test/common/mock.js";import{assertThrowsAsync as N,ensureNoDisposablesAreLeakedInTestSuite as C}from"../../../../../base/test/common/utils.js";import{PLAINTEXT_LANGUAGE_ID as y}from"../../../../../editor/common/languages/modesRegistry.js";import{IMenuService as K}from"../../../../../platform/actions/common/actions.js";import{ICommandService as T}from"../../../../../platform/commands/common/commands.js";import{IContextKeyService as h}from"../../../../../platform/contextkey/common/contextkey.js";import{ExtensionIdentifier as E}from"../../../../../platform/extensions/common/extensions.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{insertCellAtIndex as m}from"../../browser/controller/cellOperations.js";import{NotebookExecutionService as b}from"../../browser/services/notebookExecutionServiceImpl.js";import{NotebookKernelService as M}from"../../browser/services/notebookKernelServiceImpl.js";import"../../browser/viewModel/notebookViewModelImpl.js";import"../../common/model/notebookTextModel.js";import{CellKind as p}from"../../common/notebookCommon.js";import{INotebookExecutionStateService as D}from"../../common/notebookExecutionStateService.js";import{INotebookKernelHistoryService as R,INotebookKernelService as A}from"../../common/notebookKernelService.js";import{INotebookLoggingService as L}from"../../common/notebookLoggingService.js";import{INotebookService as j}from"../../common/notebookService.js";import{setupInstantiationService as P,withTestNotebook as U}from"./testNotebookEditor.js";suite("NotebookExecutionService",()=>{let o,a,s,t;teardown(()=>{t.dispose()}),C(),setup(function(){t=new S,o=P(t),o.stub(j,new class extends l(){onDidAddNotebookDocument=u.None;onWillRemoveNotebookDocument=u.None;getNotebookTextModels(){return[]}}),o.stub(L,new class extends l(){debug(e,r){}}),o.stub(K,new class extends l(){createMenu(){return new class extends l(){onDidChange=u.None;getActions(){return[]}dispose(){}}}}),o.stub(R,new class extends l(){getKernels(e){return s.getMatchingKernel(e)}addMostRecentKernel(e){}}),o.stub(T,new class extends l(){executeCommand(e,...r){return Promise.resolve(void 0)}}),s=t.add(o.createInstance(M)),o.set(A,s),a=o.get(h)});async function d(e,r){return U(e,(i,n,c)=>r(n,n.notebookDocument,c))}test("cell is not runnable when no kernel is selected",async()=>{await d([],async(e,r,i)=>{const n=o.createInstance(b),c=m(e,1,"var c = 3","javascript",p.Code,{},[],!0,!0);await N(async()=>await n.executeNotebookCells(r,[c.model],a))})}),test("cell is not runnable when kernel does not support the language",async()=>{await d([],async(e,r)=>{t.add(s.registerKernel(new g({languages:["testlang"]})));const i=t.add(o.createInstance(b)),n=t.add(m(e,1,"var c = 3","javascript",p.Code,{},[],!0,!0));await N(async()=>await i.executeNotebookCells(r,[n.model],a))})}),test("cell is runnable when kernel does support the language",async()=>{await d([],async(e,r)=>{const i=new g({languages:["javascript"]});t.add(s.registerKernel(i)),s.selectKernelForNotebook(i,r);const n=t.add(o.createInstance(b)),c=x.spy();i.executeNotebookCellsRequest=c;const v=t.add(m(e,0,"var c = 3","javascript",p.Code,{},[],!0,!0));await n.executeNotebookCells(e.notebookDocument,[v.model],a),k.strictEqual(c.calledOnce,!0)})}),test("Completes unconfirmed executions",async function(){return d([],async(e,r)=>{let i=!1;const n=new class extends g{constructor(){super({languages:["javascript"]}),this.id="mySpecialId"}async executeNotebookCellsRequest(){i=!0}};t.add(s.registerKernel(n)),s.selectKernelForNotebook(n,r);const c=t.add(o.createInstance(b)),v=o.get(D),I=t.add(m(e,0,"var c = 3","javascript",p.Code,{},[],!0,!0));await c.executeNotebookCells(r,[I.model],a),k.strictEqual(i,!0),k.strictEqual(v.getCellExecution(I.uri),void 0)})})});class g{id="test";label="";viewType="*";onDidChange=u.None;extension=new E("test");localResourceRoot=w.file("/test");description;detail;preloadUris=[];preloadProvides=[];supportedLanguages=[];provideVariables(a,s,t,d,e){return f.EMPTY}executeNotebookCellsRequest(){throw new Error("Method not implemented.")}cancelNotebookCellExecution(){throw new Error("Method not implemented.")}constructor(a){this.supportedLanguages=a?.languages??[y]}implementsInterrupt;implementsExecutionOrder}
