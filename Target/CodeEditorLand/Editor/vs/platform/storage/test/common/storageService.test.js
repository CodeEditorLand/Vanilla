import{deepStrictEqual as u,ok as f,strictEqual as n}from"assert";import{DisposableStore as A}from"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as h}from"../../../../base/test/common/utils.js";import{InMemoryStorageService as b,StorageScope as r,StorageTarget as s}from"../../common/storage.js";function O(C){let e;const l=new A;setup(async()=>{e=await C.setup()}),teardown(()=>(l.clear(),C.teardown(e))),test("Get Data, Integer, Boolean (application)",()=>{E(r.APPLICATION)}),test("Get Data, Integer, Boolean (profile)",()=>{E(r.PROFILE)}),test("Get Data, Integer, Boolean, Object (workspace)",()=>{E(r.WORKSPACE)}),test("Storage change source",()=>{const t=[];e.onDidChangeValue(r.WORKSPACE,void 0,l)(a=>t.push(a),void 0,l),e.storeAll([{key:"testExternalChange",value:"foobar",scope:r.WORKSPACE,target:s.MACHINE}],!0);let g=t.find(a=>a.key==="testExternalChange");n(g?.external,!0),e.storeAll([{key:"testChange",value:"barfoo",scope:r.WORKSPACE,target:s.MACHINE}],!1),g=t.find(a=>a.key==="testChange"),n(g?.external,!1),e.store("testChange","foobar",r.WORKSPACE,s.MACHINE),g=t.find(a=>a.key==="testChange"),n(g?.external,!1)}),test("Storage change event scope (all keys)",()=>{const t=[];e.onDidChangeValue(r.WORKSPACE,void 0,l)(g=>t.push(g),void 0,l),e.store("testChange","foobar",r.WORKSPACE,s.MACHINE),e.store("testChange2","foobar",r.WORKSPACE,s.MACHINE),e.store("testChange","foobar",r.APPLICATION,s.MACHINE),e.store("testChange","foobar",r.PROFILE,s.MACHINE),e.store("testChange2","foobar",r.PROFILE,s.MACHINE),n(t.length,2)}),test("Storage change event scope (specific key)",()=>{const t=[];e.onDidChangeValue(r.WORKSPACE,"testChange",l)(a=>t.push(a),void 0,l),e.store("testChange","foobar",r.WORKSPACE,s.MACHINE),e.store("testChange","foobar",r.PROFILE,s.USER),e.store("testChange","foobar",r.APPLICATION,s.MACHINE),e.store("testChange2","foobar",r.WORKSPACE,s.MACHINE);const g=t.find(a=>a.key==="testChange");f(g),n(t.length,1)});function E(t){let g=[];e.onDidChangeValue(t,void 0,l)(o=>g.push(o),void 0,l),n(e.get("test.get",t,"foobar"),"foobar"),n(e.get("test.get",t,""),""),n(e.getNumber("test.getNumber",t,5),5),n(e.getNumber("test.getNumber",t,0),0),n(e.getBoolean("test.getBoolean",t,!0),!0),n(e.getBoolean("test.getBoolean",t,!1),!1),u(e.getObject("test.getObject",t,{foo:"bar"}),{foo:"bar"}),u(e.getObject("test.getObject",t,{}),{}),u(e.getObject("test.getObject",t,[]),[]),e.store("test.get","foobar",t,s.MACHINE),n(e.get("test.get",t,void 0),"foobar");let a=g.find(o=>o.key==="test.get");n(a?.scope,t),n(a?.key,"test.get"),g=[],e.store("test.get","",t,s.MACHINE),n(e.get("test.get",t,void 0),""),a=g.find(o=>o.key==="test.get"),n(a.scope,t),n(a.key,"test.get"),e.store("test.getNumber",5,t,s.MACHINE),n(e.getNumber("test.getNumber",t,void 0),5),e.store("test.getNumber",0,t,s.MACHINE),n(e.getNumber("test.getNumber",t,void 0),0),e.store("test.getBoolean",!0,t,s.MACHINE),n(e.getBoolean("test.getBoolean",t,void 0),!0),e.store("test.getBoolean",!1,t,s.MACHINE),n(e.getBoolean("test.getBoolean",t,void 0),!1),e.store("test.getObject",{},t,s.MACHINE),u(e.getObject("test.getObject",t,void 0),{}),e.store("test.getObject",[42],t,s.MACHINE),u(e.getObject("test.getObject",t,void 0),[42]),e.store("test.getObject",{foo:{}},t,s.MACHINE),u(e.getObject("test.getObject",t,void 0),{foo:{}}),n(e.get("test.getDefault",t,"getDefault"),"getDefault"),n(e.getNumber("test.getNumberDefault",t,5),5),n(e.getBoolean("test.getBooleanDefault",t,!0),!0),u(e.getObject("test.getObjectDefault",t,{foo:42}),{foo:42}),e.storeAll([{key:"test.storeAll1",value:"foobar",scope:t,target:s.MACHINE},{key:"test.storeAll2",value:4,scope:t,target:s.MACHINE},{key:"test.storeAll3",value:null,scope:t,target:s.MACHINE}],!1),n(e.get("test.storeAll1",t,"foobar"),"foobar"),n(e.get("test.storeAll2",t,"4"),"4"),n(e.get("test.storeAll3",t,"null"),"null")}test("Remove Data (application)",()=>{i(r.APPLICATION)}),test("Remove Data (profile)",()=>{i(r.PROFILE)}),test("Remove Data (workspace)",()=>{i(r.WORKSPACE)});function i(t){const g=[];e.onDidChangeValue(t,void 0,l)(o=>g.push(o),void 0,l),e.store("test.remove","foobar",t,s.MACHINE),n("foobar",e.get("test.remove",t,void 0)),e.remove("test.remove",t),f(!e.get("test.remove",t,void 0));const a=g.find(o=>o.key==="test.remove");n(a?.scope,t),n(a?.key,"test.remove")}test("Keys (in-memory)",()=>{let t;e.onDidChangeTarget(a=>t=a,void 0,l);for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION])for(const o of[s.MACHINE,s.USER])n(e.keys(a,o).length,0);let g;for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION]){e.onDidChangeValue(a,void 0,l)(o=>g=o,void 0,l);for(const o of[s.MACHINE,s.USER])t=Object.create(null),g=Object.create(null),e.store("test.target1","value1",a,o),n(e.keys(a,o).length,1),n(t?.scope,a),n(g?.key,"test.target1"),n(g?.scope,a),n(g?.target,o),t=void 0,g=Object.create(null),e.store("test.target1","otherValue1",a,o),n(e.keys(a,o).length,1),n(t,void 0),n(g?.key,"test.target1"),n(g?.scope,a),n(g?.target,o),e.store("test.target2","value2",a,o),e.store("test.target3","value3",a,o),n(e.keys(a,o).length,3)}for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION])for(const o of[s.MACHINE,s.USER]){const d=e.keys(a,o).length;e.store("test.target4","value1",a,o),n(e.keys(a,o).length,d+1),t=Object.create(null),g=Object.create(null),e.remove("test.target4",a),n(e.keys(a,o).length,d),n(t?.scope,a),n(g?.key,"test.target4"),n(g?.scope,a)}for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION])for(const o of[s.MACHINE,s.USER]){const d=e.keys(a,o);for(const I of d)e.remove(I,a);n(e.keys(a,o).length,0)}for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION])for(const o of[s.MACHINE,s.USER])e.store("test.target1","value1",a,o),n(e.keys(a,o).length,1),t=Object.create(null),e.store("test.target1",void 0,a,o),n(e.keys(a,o).length,0),n(t?.scope,a),e.store("test.target1","",a,o),n(e.keys(a,o).length,1),e.store("test.target1",null,a,o),n(e.keys(a,o).length,0);for(const a of[r.WORKSPACE,r.PROFILE,r.APPLICATION])t=void 0,e.store("test.target5","value1",a,s.MACHINE),f(t),t=void 0,e.store("test.target5","value1",a,s.USER),f(t),t=void 0,e.store("test.target5","value1",a,s.MACHINE),f(t),t=void 0,e.store("test.target5","value1",a,s.MACHINE),f(!t)})}suite("StorageService (in-memory)",function(){const C=new A;teardown(()=>{C.clear()}),O({setup:async()=>C.add(new b),teardown:async()=>{}}),h()});export{O as createSuite};
