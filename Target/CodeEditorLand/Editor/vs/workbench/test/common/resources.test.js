import e from"assert";import{DisposableStore as u}from"../../../base/common/lifecycle.js";import{URI as r}from"../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../../../base/test/common/utils.js";import{TestConfigurationService as c}from"../../../platform/configuration/test/common/testConfigurationService.js";import"../../../platform/workspace/common/workspace.js";import{ResourceGlobMatcher as m}from"../../common/resources.js";import{TestContextService as C}from"./workbenchTestServices.js";suite("ResourceGlobMatcher",()=>{const o="test.matcher";let n,a;const s=new u;setup(()=>{n=new C,a=new c({[o]:{"**/*.md":!0,"**/*.txt":!1}})}),teardown(()=>{s.clear()}),test("Basics",async()=>{const t=s.add(new m(()=>a.getValue(o),i=>i.affectsConfiguration(o),n,a));e.equal(t.matches(r.file("/foo/bar")),!1),e.equal(t.matches(r.file("/foo/bar.md")),!0),e.equal(t.matches(r.file("/foo/bar.txt")),!1);let f=0;s.add(t.onExpressionChange(()=>f++)),await a.setUserConfiguration(o,{"**/*.foo":!0}),a.onDidChangeConfigurationEmitter.fire({affectsConfiguration:i=>i===o}),e.equal(f,1),e.equal(t.matches(r.file("/foo/bar.md")),!1),e.equal(t.matches(r.file("/foo/bar.foo")),!0),await a.setUserConfiguration(o,void 0),a.onDidChangeConfigurationEmitter.fire({affectsConfiguration:i=>i===o}),e.equal(f,2),e.equal(t.matches(r.file("/foo/bar.md")),!1),e.equal(t.matches(r.file("/foo/bar.foo")),!1),await a.setUserConfiguration(o,{"**/*.md":!0,"**/*.txt":!1,"C:/bar/**":!0,"/bar/**":!0}),a.onDidChangeConfigurationEmitter.fire({affectsConfiguration:i=>i===o}),e.equal(t.matches(r.file("/bar/foo.1")),!0),e.equal(t.matches(r.file("C:/bar/foo.1")),!0)}),l()});