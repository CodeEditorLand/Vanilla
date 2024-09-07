import{deepStrictEqual as o}from"assert";import{TestExtensionService as u,TestHistoryService as y,TestStorageService as f}from"../../../../test/common/workbenchTestServices.js";import{EnvironmentVariableService as A}from"../../common/environmentVariableService.js";import{EnvironmentVariableMutatorType as e}from"../../../../../platform/terminal/common/environmentVariable.js";import{IStorageService as x}from"../../../../../platform/storage/common/storage.js";import{TestInstantiationService as I}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{IExtensionService as p}from"../../../../services/extensions/common/extensions.js";import{Emitter as g}from"../../../../../base/common/event.js";import"../../../../../base/common/platform.js";import{IHistoryService as E}from"../../../../services/history/common/history.js";import{URI as m}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as M}from"../../../../../base/test/common/utils.js";class b extends A{persistCollections(){this._persistCollections()}notifyCollectionUpdates(){this._notifyCollectionUpdates()}}suite("EnvironmentVariable - EnvironmentVariableService",()=>{const s=M();let a,t,c;setup(()=>{c=s.add(new g),a=s.add(new I),a.stub(p,u),a.stub(x,s.add(new f)),a.stub(E,new y),a.stub(p,u),a.stub(p,"onDidChangeExtensions",c.event),a.stub(p,"extensions",[{identifier:{value:"ext1"}},{identifier:{value:"ext2"}},{identifier:{value:"ext3"}}]),t=s.add(a.createInstance(b))}),test("should persist collections to the storage service and be able to restore from them",()=>{const n=new Map;n.set("A-key",{value:"a",type:e.Replace,variable:"A"}),n.set("B-key",{value:"b",type:e.Append,variable:"B"}),n.set("C-key",{value:"c",type:e.Prepend,variable:"C",options:{applyAtProcessCreation:!0,applyAtShellIntegration:!0}}),t.set("ext1",{map:n,persistent:!0}),o([...t.mergedCollection.getVariableMap(void 0).entries()],[["A",[{extensionIdentifier:"ext1",type:e.Replace,value:"a",variable:"A",options:void 0}]],["B",[{extensionIdentifier:"ext1",type:e.Append,value:"b",variable:"B",options:void 0}]],["C",[{extensionIdentifier:"ext1",type:e.Prepend,value:"c",variable:"C",options:{applyAtProcessCreation:!0,applyAtShellIntegration:!0}}]]]),t.persistCollections();const i=s.add(a.createInstance(b));o([...i.mergedCollection.getVariableMap(void 0).entries()],[["A",[{extensionIdentifier:"ext1",type:e.Replace,value:"a",variable:"A",options:void 0}]],["B",[{extensionIdentifier:"ext1",type:e.Append,value:"b",variable:"B",options:void 0}]],["C",[{extensionIdentifier:"ext1",type:e.Prepend,value:"c",variable:"C",options:{applyAtProcessCreation:!0,applyAtShellIntegration:!0}}]]])}),suite("mergedCollection",()=>{test("should overwrite any other variable with the first extension that replaces",()=>{const n=new Map,i=new Map,r=new Map;n.set("A-key",{value:"a1",type:e.Append,variable:"A"}),n.set("B-key",{value:"b1",type:e.Replace,variable:"B"}),i.set("A-key",{value:"a2",type:e.Replace,variable:"A"}),i.set("B-key",{value:"b2",type:e.Append,variable:"B"}),r.set("A-key",{value:"a3",type:e.Prepend,variable:"A"}),r.set("B-key",{value:"b3",type:e.Replace,variable:"B"}),t.set("ext1",{map:n,persistent:!0}),t.set("ext2",{map:i,persistent:!0}),t.set("ext3",{map:r,persistent:!0}),o([...t.mergedCollection.getVariableMap(void 0).entries()],[["A",[{extensionIdentifier:"ext2",type:e.Replace,value:"a2",variable:"A",options:void 0},{extensionIdentifier:"ext1",type:e.Append,value:"a1",variable:"A",options:void 0}]],["B",[{extensionIdentifier:"ext1",type:e.Replace,value:"b1",variable:"B",options:void 0}]]])}),test("should correctly apply the environment values from multiple extension contributions in the correct order",async()=>{const n=new Map,i=new Map,r=new Map;n.set("A-key",{value:":a1",type:e.Append,variable:"A"}),i.set("A-key",{value:"a2:",type:e.Prepend,variable:"A"}),r.set("A-key",{value:"a3",type:e.Replace,variable:"A"}),t.set("ext1",{map:n,persistent:!0}),t.set("ext2",{map:i,persistent:!0}),t.set("ext3",{map:r,persistent:!0}),o([...t.mergedCollection.getVariableMap(void 0).entries()],[["A",[{extensionIdentifier:"ext3",type:e.Replace,value:"a3",variable:"A",options:void 0},{extensionIdentifier:"ext2",type:e.Prepend,value:"a2:",variable:"A",options:void 0},{extensionIdentifier:"ext1",type:e.Append,value:":a1",variable:"A",options:void 0}]]]);const l={A:"foo"};await t.mergedCollection.applyToProcessEnvironment(l,void 0),o(l,{A:"a2:a3:a1"})}),test("should correctly apply the workspace specific environment values from multiple extension contributions in the correct order",async()=>{const n={workspaceFolder:{uri:m.file("workspace1"),name:"workspace1",index:0}},i={workspaceFolder:{uri:m.file("workspace2"),name:"workspace2",index:3}},r=new Map,l=new Map,v=new Map;r.set("A-key",{value:":a1",type:e.Append,scope:n,variable:"A"}),l.set("A-key",{value:"a2:",type:e.Prepend,variable:"A"}),v.set("A-key",{value:"a3",type:e.Replace,scope:i,variable:"A"}),t.set("ext1",{map:r,persistent:!0}),t.set("ext2",{map:l,persistent:!0}),t.set("ext3",{map:v,persistent:!0}),o([...t.mergedCollection.getVariableMap(n).entries()],[["A",[{extensionIdentifier:"ext2",type:e.Prepend,value:"a2:",variable:"A",options:void 0},{extensionIdentifier:"ext1",type:e.Append,value:":a1",scope:n,variable:"A",options:void 0}]]]);const d={A:"foo"};await t.mergedCollection.applyToProcessEnvironment(d,n),o(d,{A:"a2:foo:a1"})})})});