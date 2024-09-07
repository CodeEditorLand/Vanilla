import t from"assert";import{Event as c}from"../../../../../base/common/event.js";import"../../../../../base/common/lifecycle.js";import{URI as n}from"../../../../../base/common/uri.js";import{mock as r}from"../../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"../../../../../base/test/common/utils.js";import"../../../../../platform/accessibility/common/accessibility.js";import{TestConfigurationService as u}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../../../platform/files/common/files.js";import"../../../../../platform/storage/common/storage.js";import"../../../../../platform/uriIdentity/common/uriIdentity.js";import{NotebookProviderInfoStore as v}from"../../browser/services/notebookServiceImpl.js";import"../../common/notebookEditorModelResolverService.js";import{NotebookProviderInfo as l}from"../../common/notebookProvider.js";import{EditorResolverService as b}from"../../../../services/editor/browser/editorResolverService.js";import{RegisteredEditorPriority as m}from"../../../../services/editor/common/editorResolverService.js";import{nullExtensionDescription as f}from"../../../../services/extensions/common/extensions.js";import{workbenchInstantiationService as S}from"../../../../test/browser/workbenchTestServices.js";suite("NotebookProviderInfoStore",function(){const s=p();test("Can't open untitled notebooks in test #119363",function(){const d=S(void 0,s),o=new v(new class extends r(){get(){return""}store(){}getObject(){return{}}},new class extends r(){onDidRegisterExtensions=c.None},s.add(d.createInstance(b)),new u,new class extends r(){onDidChangeScreenReaderOptimized=c.None},d,new class extends r(){hasProvider(){return!0}},new class extends r(){},new class extends r(){});s.add(o);const a=new l({extension:f.identifier,id:"foo",displayName:"foo",selectors:[{filenamePattern:"*.foo"}],priority:m.default,providerDisplayName:"foo"}),i=new l({extension:f.identifier,id:"bar",displayName:"bar",selectors:[{filenamePattern:"*.bar"}],priority:m.default,providerDisplayName:"bar"});o.add(a),o.add(i),t.ok(o.get("foo")),t.ok(o.get("bar")),t.ok(!o.get("barfoo"));let e=o.getContributedNotebook(n.parse("file:///test/nb.foo"));t.strictEqual(e.length,1),t.strictEqual(e[0]===a,!0),e=o.getContributedNotebook(n.parse("file:///test/nb.bar")),t.strictEqual(e.length,1),t.strictEqual(e[0]===i,!0),e=o.getContributedNotebook(n.parse("untitled:///Untitled-1")),t.strictEqual(e.length,2),t.strictEqual(e[0]===a,!0),t.strictEqual(e[1]===i,!0),e=o.getContributedNotebook(n.parse("untitled:///test/nb.bar")),t.strictEqual(e.length,1),t.strictEqual(e[0]===i,!0)})});