var b=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var d=(n,o,c,r)=>{for(var e=r>1?void 0:r?D(o,c):o,t=n.length-1,u;t>=0;t--)(u=n[t])&&(e=(r?u(o,c,e):u(e))||e);return r&&e&&b(o,c,e),e},f=(n,o)=>(c,r)=>o(c,r,n);import i from"assert";import{URI as C}from"../../../../../base/common/uri.js";import"../../../../../platform/instantiation/common/instantiation.js";import{workbenchInstantiationService as N}from"../../workbenchTestServices.js";import{AbstractResourceEditorInput as v}from"../../../../common/editor/resourceEditorInput.js";import{ILabelService as L}from"../../../../../platform/label/common/label.js";import{IFileService as _}from"../../../../../platform/files/common/files.js";import{EditorInputCapabilities as T,Verbosity as m}from"../../../../common/editor.js";import{DisposableStore as R}from"../../../../../base/common/lifecycle.js";import{IFilesConfigurationService as k}from"../../../../services/filesConfiguration/common/filesConfigurationService.js";import{ensureNoDisposablesAreLeakedInTestSuite as y}from"../../../../../base/test/common/utils.js";import{ITextResourceConfigurationService as U}from"../../../../../editor/common/services/textResourceConfiguration.js";import{ConfigurationTarget as g,IConfigurationService as w}from"../../../../../platform/configuration/common/configuration.js";import{CustomEditorLabelService as a,ICustomEditorLabelService as p}from"../../../../services/editor/common/customEditorLabelService.js";import{TestConfigurationService as A}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IWorkspaceContextService as G}from"../../../../../platform/workspace/common/workspace.js";suite("ResourceEditorInput",()=>{const n=new R;let o=class extends v{typeId="test.typeId";constructor(e,t,u,E,I,h){super(e,e,t,u,E,I,h)}};o=d([f(1,L),f(2,_),f(3,k),f(4,U),f(5,p)],o);async function c(){const r=N(void 0,n),e=new A;r.stub(w,e);const t=n.add(new a(e,r.get(G)));return r.stub(p,t),[r,e,t]}teardown(()=>{n.clear()}),test("basics",async()=>{const[r]=await c(),e=C.from({scheme:"testResource",path:"thePath/of/the/resource.txt"}),t=n.add(r.createInstance(o,e));i.ok(t.getName().length>0),i.ok(t.getDescription(m.SHORT).length>0),i.ok(t.getDescription(m.MEDIUM).length>0),i.ok(t.getDescription(m.LONG).length>0),i.ok(t.getTitle(m.SHORT).length>0),i.ok(t.getTitle(m.MEDIUM).length>0),i.ok(t.getTitle(m.LONG).length>0),i.strictEqual(t.hasCapability(T.Readonly),!1),i.strictEqual(t.isReadonly(),!1),i.strictEqual(t.hasCapability(T.Untitled),!0)}),test("custom editor name",async()=>{const[r,e,t]=await c(),u=C.from({scheme:"testResource",path:"thePath/of/the/resource.txt"}),E=C.from({scheme:"testResource",path:"theOtherPath/of/the/resource.md"}),I=n.add(r.createInstance(o,u)),h=n.add(r.createInstance(o,E));await e.setUserConfiguration(a.SETTING_ID_PATTERNS,{"**/theOtherPath/**":"Label 1","**/*.txt":"Label 2","**/resource.txt":"Label 3"}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration(s){return s===a.SETTING_ID_PATTERNS},source:g.USER});let l="",S="";n.add(t.onDidChange(()=>{l=I.getName(),S=h.getName()})),await e.setUserConfiguration(a.SETTING_ID_ENABLED,!0),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration(s){return s===a.SETTING_ID_ENABLED},source:g.USER}),i.ok(l==="Label 3"),i.ok(S==="Label 1"),await e.setUserConfiguration(a.SETTING_ID_ENABLED,!1),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration(s){return s===a.SETTING_ID_ENABLED},source:g.USER}),i.ok(l==="resource.txt"),i.ok(S==="resource.md"),await e.setUserConfiguration(a.SETTING_ID_ENABLED,!0),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration(s){return s===a.SETTING_ID_ENABLED},source:g.USER}),await e.setUserConfiguration(a.SETTING_ID_PATTERNS,{"thePath/**/resource.txt":"Label 4","thePath/of/*/resource.txt":"Label 5"}),e.onDidChangeConfigurationEmitter.fire({affectsConfiguration(s){return s===a.SETTING_ID_PATTERNS},source:g.USER}),i.ok(l==="Label 5"),i.ok(S==="resource.md")}),y()});