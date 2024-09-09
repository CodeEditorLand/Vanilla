import t from"assert";import"vscode";import{ExtHostDocumentsAndEditors as M}from"../../common/extHostDocumentsAndEditors.js";import{TestRPCProtocol as $}from"../common/testRPCProtocol.js";import{DisposableStore as B}from"../../../../base/common/lifecycle.js";import{NullLogService as w}from"../../../../platform/log/common/log.js";import{mock as D}from"../../../../base/test/common/mock.js";import{MainContext as I}from"../../common/extHost.protocol.js";import{ExtHostNotebookController as z}from"../../common/extHostNotebook.js";import"../../common/extHostNotebookDocument.js";import{CellKind as b,CellUri as E,NotebookCellsChangeType as m}from"../../../contrib/notebook/common/notebookCommon.js";import{URI as T}from"../../../../base/common/uri.js";import{ExtHostDocuments as O}from"../../common/extHostDocuments.js";import{ExtHostCommands as P}from"../../common/extHostCommands.js";import{nullExtensionDescription as _}from"../../../services/extensions/common/extensions.js";import{isEqual as H}from"../../../../base/common/resources.js";import{Event as g}from"../../../../base/common/event.js";import{ExtHostNotebookDocuments as R}from"../../common/extHostNotebookDocuments.js";import{SerializableObjectWithBuffers as c}from"../../../services/extensions/common/proxyIdentifier.js";import{VSBuffer as s}from"../../../../base/common/buffer.js";import"../../common/extHostTelemetry.js";import{ExtHostConsumerFileSystem as F}from"../../common/extHostFileSystemConsumer.js";import{ExtHostFileSystemInfo as K}from"../../common/extHostFileSystemInfo.js";import{ensureNoDisposablesAreLeakedInTestSuite as W}from"../../../../base/test/common/utils.js";import{ExtHostSearch as j}from"../../common/extHostSearch.js";import{URITransformerService as L}from"../../common/extHostUriTransformerService.js";suite("NotebookCell#Document",function(){let k,e,v,u,r,l,q,S;const d=T.parse("test:///notebook.file"),f=new B;teardown(function(){f.clear()}),W(),setup(async function(){k=new $,k.set(I.MainThreadCommands,new class extends D(){$registerCommand(){}}),k.set(I.MainThreadNotebook,new class extends D(){async $registerNotebookSerializer(){}async $unregisterNotebookSerializer(){}}),v=new M(k,new w),u=new O(k,v),q=new F(k,new K),S=new j(k,new L(null),new w),r=new z(k,new P(k,new w,new class extends D(){onExtensionError(){return!0}}),v,u,q,S,new w),l=new R(r);const a=r.registerNotebookSerializer(_,"test",new class extends D(){});r.$acceptDocumentAndEditorsDelta(new c({addedDocuments:[{uri:d,viewType:"test",versionId:0,cells:[{handle:0,uri:E.generate(d,0),source:["### Heading"],eol:`
`,language:"markdown",cellKind:b.Markup,outputs:[]},{handle:1,uri:E.generate(d,1),source:['console.log("aaa")','console.log("bbb")'],eol:`
`,language:"javascript",cellKind:b.Code,outputs:[]}]}],addedEditors:[{documentUri:d,id:"_notebook_editor_0",selections:[{start:0,end:1}],visibleRanges:[]}]})),r.$acceptDocumentAndEditorsDelta(new c({newActiveEditor:"_notebook_editor_0"})),e=r.notebookDocuments[0],f.add(a),f.add(e),f.add(u)}),test("cell document is vscode.TextDocument",async function(){t.strictEqual(e.apiNotebook.cellCount,2);const[a,o]=e.apiNotebook.getCells(),i=u.getDocument(a.document.uri);t.ok(i),t.strictEqual(i.languageId,a.document.languageId),t.strictEqual(i.version,1);const n=u.getDocument(o.document.uri);t.ok(n),t.strictEqual(n.languageId,o.document.languageId),t.strictEqual(n.version,1)}),test("cell document goes when notebook closes",async function(){const a=[];for(const n of e.apiNotebook.getCells())t.ok(u.getDocument(n.document.uri)),a.push(n.document.uri.toString());const o=[],i=u.onDidRemoveDocument(n=>{o.push(n.uri.toString())});r.$acceptDocumentAndEditorsDelta(new c({removedDocuments:[e.uri]})),i.dispose(),t.strictEqual(o.length,2),t.deepStrictEqual(o.sort(),a.sort())}),test("cell document is vscode.TextDocument after changing it",async function(){const a=new Promise((o,i)=>{f.add(l.onDidChangeNotebookDocument(n=>{try{t.strictEqual(n.contentChanges.length,1),t.strictEqual(n.contentChanges[0].addedCells.length,2);const[C,x]=n.contentChanges[0].addedCells,A=u.getAllDocumentData().find(N=>H(N.document.uri,C.document.uri));t.ok(A),t.strictEqual(A?.document===C.document,!0);const y=u.getAllDocumentData().find(N=>H(N.document.uri,x.document.uri));t.ok(y),t.strictEqual(y?.document===x.document,!0),o()}catch(C){i(C)}}))});l.$acceptModelChanged(d,new c({versionId:e.apiNotebook.version+1,rawEvents:[{kind:m.ModelChange,changes:[[0,0,[{handle:2,uri:E.generate(d,2),source:["Hello","World","Hello World!"],eol:`
`,language:"test",cellKind:b.Code,outputs:[]},{handle:3,uri:E.generate(d,3),source:["Hallo","Welt","Hallo Welt!"],eol:`
`,language:"test",cellKind:b.Code,outputs:[]}]]]}]}),!1),await a}),test("cell document stays open when notebook is still open",async function(){const a=[],o=[];for(const i of e.apiNotebook.getCells()){const n=u.getDocument(i.document.uri);t.ok(n),t.strictEqual(u.getDocument(i.document.uri).isClosed,!1),a.push(n),o.push({EOL:`
`,isDirty:n.isDirty,lines:n.getText().split(`
`),languageId:n.languageId,uri:n.uri,versionId:n.version})}v.$acceptDocumentsAndEditorsDelta({addedDocuments:o}),v.$acceptDocumentsAndEditorsDelta({removedDocuments:a.map(i=>i.uri)});for(const i of e.apiNotebook.getCells())t.ok(u.getDocument(i.document.uri)),t.strictEqual(u.getDocument(i.document.uri).isClosed,!1);r.$acceptDocumentAndEditorsDelta(new c({removedDocuments:[e.uri]}));for(const i of e.apiNotebook.getCells())t.throws(()=>u.getDocument(i.document.uri));for(const i of a)t.strictEqual(i.isClosed,!0)}),test("cell document goes when cell is removed",async function(){t.strictEqual(e.apiNotebook.cellCount,2);const[a,o]=e.apiNotebook.getCells();l.$acceptModelChanged(e.uri,new c({versionId:2,rawEvents:[{kind:m.ModelChange,changes:[[0,1,[]]]}]}),!1),t.strictEqual(e.apiNotebook.cellCount,1),t.strictEqual(a.document.isClosed,!0),t.strictEqual(o.document.isClosed,!1),t.throws(()=>u.getDocument(a.document.uri))}),test("cell#index",function(){t.strictEqual(e.apiNotebook.cellCount,2);const[a,o]=e.apiNotebook.getCells();t.strictEqual(a.index,0),t.strictEqual(o.index,1),l.$acceptModelChanged(e.uri,new c({versionId:e.apiNotebook.version+1,rawEvents:[{kind:m.ModelChange,changes:[[0,1,[]]]}]}),!1),t.strictEqual(e.apiNotebook.cellCount,1),t.strictEqual(o.index,0),l.$acceptModelChanged(d,new c({versionId:e.apiNotebook.version+1,rawEvents:[{kind:m.ModelChange,changes:[[0,0,[{handle:2,uri:E.generate(d,2),source:["Hello","World","Hello World!"],eol:`
`,language:"test",cellKind:b.Code,outputs:[]},{handle:3,uri:E.generate(d,3),source:["Hallo","Welt","Hallo Welt!"],eol:`
`,language:"test",cellKind:b.Code,outputs:[]}]]]}]}),!1),t.strictEqual(e.apiNotebook.cellCount,3),t.strictEqual(o.index,2)}),test("ERR MISSING extHostDocument for notebook cell: #116711",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:100,rawEvents:[{kind:m.ModelChange,changes:[[0,2,[{handle:3,uri:E.generate(d,3),source:["### Heading"],eol:`
`,language:"markdown",cellKind:b.Markup,outputs:[]},{handle:4,uri:E.generate(d,4),source:['console.log("aaa")','console.log("bbb")'],eol:`
`,language:"javascript",cellKind:b.Code,outputs:[]}]]]}]}),!1),t.strictEqual(e.apiNotebook.cellCount,2);const o=await a;t.strictEqual(o.notebook===e.apiNotebook,!0),t.strictEqual(o.contentChanges.length,1),t.strictEqual(o.contentChanges[0].range.end-o.contentChanges[0].range.start,2),t.strictEqual(o.contentChanges[0].removedCells[0].document.isClosed,!0),t.strictEqual(o.contentChanges[0].removedCells[1].document.isClosed,!0),t.strictEqual(o.contentChanges[0].addedCells.length,2),t.strictEqual(o.contentChanges[0].addedCells[0].document.isClosed,!1),t.strictEqual(o.contentChanges[0].addedCells[1].document.isClosed,!1)}),test("Opening a notebook results in VS Code firing the event onDidChangeActiveNotebookEditor twice #118470",function(){let a=0;f.add(r.onDidChangeActiveNotebookEditor(()=>a+=1)),r.$acceptDocumentAndEditorsDelta(new c({addedEditors:[{documentUri:d,id:"_notebook_editor_2",selections:[{start:0,end:1}],visibleRanges:[]}]})),r.$acceptDocumentAndEditorsDelta(new c({newActiveEditor:"_notebook_editor_2"})),t.strictEqual(a,1)}),test("unset active notebook editor",function(){const a=r.activeNotebookEditor;t.ok(a!==void 0),r.$acceptDocumentAndEditorsDelta(new c({newActiveEditor:void 0})),t.ok(r.activeNotebookEditor===a),r.$acceptDocumentAndEditorsDelta(new c({})),t.ok(r.activeNotebookEditor===a),r.$acceptDocumentAndEditorsDelta(new c({newActiveEditor:null})),t.ok(r.activeNotebookEditor===void 0)}),test("change cell language triggers onDidChange events",async function(){const a=e.apiNotebook.cellAt(0);t.strictEqual(a.document.languageId,"markdown");const o=g.toPromise(u.onDidRemoveDocument),i=g.toPromise(u.onDidAddDocument);l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[{kind:m.ChangeCellLanguage,index:0,language:"fooLang"}]}),!1);const n=await o,C=await i;t.strictEqual(a.document.languageId,"fooLang"),t.ok(n===C)}),test("onDidChangeNotebook-event, cell changes",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[{kind:m.ChangeCellMetadata,index:0,metadata:{foo:1}},{kind:m.ChangeCellMetadata,index:1,metadata:{foo:2}},{kind:m.Output,index:1,outputs:[{items:[{valueBytes:s.fromByteArray([0,2,3]),mime:"text/plain"}],outputId:"1"}]}]}),!1,void 0);const o=await a;t.strictEqual(o.notebook===e.apiNotebook,!0),t.strictEqual(o.contentChanges.length,0),t.strictEqual(o.cellChanges.length,2);const[i,n]=o.cellChanges;t.deepStrictEqual(i.metadata,i.cell.metadata),t.deepStrictEqual(i.executionSummary,void 0),t.deepStrictEqual(i.outputs,void 0),t.deepStrictEqual(i.document,void 0),t.deepStrictEqual(n.outputs,n.cell.outputs),t.deepStrictEqual(n.metadata,n.cell.metadata),t.deepStrictEqual(n.executionSummary,void 0),t.deepStrictEqual(n.document,void 0)}),test("onDidChangeNotebook-event, notebook metadata",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[]}),!1,{foo:2});const o=await a;t.strictEqual(o.notebook===e.apiNotebook,!0),t.strictEqual(o.contentChanges.length,0),t.strictEqual(o.cellChanges.length,0),t.deepStrictEqual(o.metadata,{foo:2})}),test("onDidChangeNotebook-event, froozen data",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[]}),!1,{foo:2});const o=await a;t.ok(Object.isFrozen(o)),t.ok(Object.isFrozen(o.cellChanges)),t.ok(Object.isFrozen(o.contentChanges)),t.ok(Object.isFrozen(o.notebook)),t.ok(!Object.isFrozen(o.metadata))}),test("change cell language and onDidChangeNotebookDocument",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument),o=e.apiNotebook.cellAt(0);t.strictEqual(o.document.languageId,"markdown"),l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[{kind:m.ChangeCellLanguage,index:0,language:"fooLang"}]}),!1);const i=await a;t.strictEqual(i.notebook===e.apiNotebook,!0),t.strictEqual(i.contentChanges.length,0),t.strictEqual(i.cellChanges.length,1);const[n]=i.cellChanges;t.strictEqual(n.cell===o,!0),t.ok(n.document===o.document),t.ok(n.executionSummary===void 0),t.ok(n.metadata===void 0),t.ok(n.outputs===void 0)}),test("change notebook cell document and onDidChangeNotebookDocument",async function(){const a=g.toPromise(l.onDidChangeNotebookDocument),o=e.apiNotebook.cellAt(0);l.$acceptModelChanged(e.uri,new c({versionId:12,rawEvents:[{kind:m.ChangeCellContent,index:0}]}),!1);const i=await a;t.strictEqual(i.notebook===e.apiNotebook,!0),t.strictEqual(i.contentChanges.length,0),t.strictEqual(i.cellChanges.length,1);const[n]=i.cellChanges;t.strictEqual(n.cell===o,!0),t.ok(n.document===o.document),t.ok(n.executionSummary===void 0),t.ok(n.metadata===void 0),t.ok(n.outputs===void 0)});async function h(a,o,i){const n=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:e.apiNotebook.version+1,rawEvents:[{kind:m.Output,index:a,outputs:[{outputId:o,items:i}]}]}),!1),await n}async function p(a,o,i){const n=g.toPromise(l.onDidChangeNotebookDocument);l.$acceptModelChanged(e.uri,new c({versionId:e.apiNotebook.version+1,rawEvents:[{kind:m.OutputItem,index:a,append:!0,outputId:o,outputItems:i}]}),!1),await n}test("Append multiple text/plain output items",async function(){await h(1,"1",[{mime:"text/plain",valueBytes:s.fromString("foo")}]),await p(1,"1",[{mime:"text/plain",valueBytes:s.fromString("bar")}]),await p(1,"1",[{mime:"text/plain",valueBytes:s.fromString("baz")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,3),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"text/plain"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(),"foo"),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[1].mime,"text/plain"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[1].data).toString(),"bar"),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[2].mime,"text/plain"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[2].data).toString(),"baz")}),test("Append multiple stdout stream output items to an output with another mime",async function(){await h(1,"1",[{mime:"text/plain",valueBytes:s.fromString("foo")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("bar")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("baz")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,3),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"text/plain"),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[1].mime,"application/vnd.code.notebook.stdout"),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[2].mime,"application/vnd.code.notebook.stdout")}),test("Compress multiple stdout stream output items",async function(){await h(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("foo")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("bar")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("baz")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"application/vnd.code.notebook.stdout"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(),"foobarbaz")}),test("Compress multiple stdout stream output items (with support for terminal escape code -> \x1B[A)",async function(){await h(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString(`
foo`)}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("\x1B[Abar")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"application/vnd.code.notebook.stdout"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(),"bar")}),test("Compress multiple stdout stream output items (with support for terminal escape code -> \r character)",async function(){await h(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("foo")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stdout",valueBytes:s.fromString("\rbar")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"application/vnd.code.notebook.stdout"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(),"bar")}),test("Compress multiple stderr stream output items",async function(){await h(1,"1",[{mime:"application/vnd.code.notebook.stderr",valueBytes:s.fromString("foo")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stderr",valueBytes:s.fromString("bar")}]),await p(1,"1",[{mime:"application/vnd.code.notebook.stderr",valueBytes:s.fromString("baz")}]),t.strictEqual(e.apiNotebook.cellAt(1).outputs.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items.length,1),t.strictEqual(e.apiNotebook.cellAt(1).outputs[0].items[0].mime,"application/vnd.code.notebook.stderr"),t.strictEqual(s.wrap(e.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(),"foobarbaz")})});
