import e from"assert";import{TestContextService as $,TestStorageService as B,TestWorkingCopy as d}from"../../../../test/common/workbenchTestServices.js";import{NullLogService as V}from"../../../../../platform/log/common/log.js";import{FileService as z}from"../../../../../platform/files/common/fileService.js";import{Schemas as T}from"../../../../../base/common/network.js";import{URI as G}from"../../../../../base/common/uri.js";import{CancellationToken as t,CancellationTokenSource as J}from"../../../../../base/common/cancellation.js";import"../../common/workingCopyHistory.js";import"../../../../../platform/files/common/files.js";import{UriIdentityService as K}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";import{LabelService as O}from"../../../label/common/labelService.js";import{TestEnvironmentService as Q,TestLifecycleService as X,TestPathService as Y,TestRemoteAgentService as R,TestWillShutdownEvent as h}from"../../../../test/browser/workbenchTestServices.js";import{TestConfigurationService as Z}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{NativeWorkingCopyHistoryService as ee}from"../../common/workingCopyHistoryService.js";import{joinPath as k,dirname as _,basename as b}from"../../../../../base/common/resources.js";import{InMemoryFileSystemProvider as M}from"../../../../../platform/files/common/inMemoryFilesystemProvider.js";import{generateUuid as te}from"../../../../../base/common/uuid.js";import{join as re}from"../../../../../base/common/path.js";import{VSBuffer as A}from"../../../../../base/common/buffer.js";import{ensureNoDisposablesAreLeakedInTestSuite as oe}from"../../../../../base/test/common/utils.js";import{DisposableStore as se}from"../../../../../base/common/lifecycle.js";class q extends ee{_fileService;_configurationService;_lifecycleService;constructor(N,f){const v=Q,o=new V;f||(f=N.add(new z(o)),N.add(f.registerProvider(T.inMemory,N.add(new M))),N.add(f.registerProvider(T.vscodeUserData,N.add(new M))));const E=new R,y=N.add(new K(f)),p=N.add(new X),P=N.add(new O(v,new $,new Y,new R,N.add(new B),p)),F=new Z;super(f,E,v,y,P,p,o,F),this._fileService=f,this._configurationService=F,this._lifecycleService=p}}suite("WorkingCopyHistoryService",()=>{const g=new se;let N,f,v,o,E,y,p,P;const F="Hello Foo",U=["Lorem ipsum ","dolor \xF6\xE4\xFC sit amet ","adipiscing \xDF\xDF elit","consectetur "].join(""),j="Hello Bar";setup(async()=>{N=G.file(re(te(),"vsctests","workingcopyhistoryservice")).with({scheme:T.inMemory}),f=k(N,"User","History"),v=k(N,"work"),o=g.add(new q(g)),E=o._fileService,await E.createFolder(f),await E.createFolder(v),y=k(v,"foo.txt"),p=k(v,"bar.txt"),P=k(v,"foo-bar.txt"),await E.writeFile(y,A.fromString(F)),await E.writeFile(p,A.fromString(U)),await E.writeFile(P,A.fromString(j))});let L=1;async function l(r,s,i=!0){const c=await o.addEntry({...r,timestamp:L++},s);return i&&(e.ok(c,"Unexpected undefined local history entry"),e.strictEqual(await E.exists(c.location),!0,"Unexpected local history not stored")),c}teardown(()=>{g.clear()}),test("addEntry",async()=>{const r=[];g.add(o.onDidAddEntry(H=>r.push(H)));const s=g.add(new d(y)),i=g.add(new d(p)),c=await l({resource:s.resource},t.None),u=await l({resource:i.resource,source:"My Source"},t.None);e.strictEqual((await E.readFile(c.location)).value.toString(),F),e.strictEqual((await E.readFile(u.location)).value.toString(),U),e.strictEqual(r.length,2),e.strictEqual(r[0].entry.workingCopy.resource.toString(),s.resource.toString()),e.strictEqual(r[1].entry.workingCopy.resource.toString(),i.resource.toString()),e.strictEqual(r[1].entry.source,"My Source");const a=await l({resource:s.resource},t.None),w=await l({resource:i.resource},t.None);e.strictEqual((await E.readFile(a.location)).value.toString(),F),e.strictEqual((await E.readFile(w.location)).value.toString(),U),e.strictEqual(r.length,4),e.strictEqual(r[2].entry.workingCopy.resource.toString(),s.resource.toString()),e.strictEqual(r[3].entry.workingCopy.resource.toString(),i.resource.toString());const m=new J,n=l({resource:s.resource},m.token,!1);m.dispose(!0);const C=await n;e.ok(!C),e.strictEqual(r.length,4);const x=g.add(new d(p.with({scheme:"unsupported"}))),W=await l({resource:x.resource},t.None,!1);e.ok(!W),e.strictEqual(r.length,4)}),test("renameEntry",async()=>{const r=[];g.add(o.onDidChangeEntry(a=>r.push(a)));const s=g.add(new d(y)),i=await l({resource:s.resource},t.None);await l({resource:s.resource},t.None),await l({resource:s.resource,source:"My Source"},t.None);let c=await o.getEntries(s.resource,t.None);e.strictEqual(c.length,3),await o.updateEntry(i,{source:"Hello Rename"},t.None),e.strictEqual(r.length,1),e.strictEqual(r[0].entry,i),c=await o.getEntries(s.resource,t.None),e.strictEqual(c[0].source,"Hello Rename");const u=new h;o._lifecycleService.fireWillShutdown(u),await Promise.allSettled(u.value),o.dispose(),o=g.add(new q(g,E)),c=await o.getEntries(s.resource,t.None),e.strictEqual(c.length,3),e.strictEqual(c[0].source,"Hello Rename")}),test("removeEntry",async()=>{const r=[];g.add(o.onDidRemoveEntry(w=>r.push(w)));const s=g.add(new d(y));await l({resource:s.resource},t.None);const i=await l({resource:s.resource},t.None);await l({resource:s.resource},t.None),await l({resource:s.resource,source:"My Source"},t.None);let c=await o.getEntries(s.resource,t.None);e.strictEqual(c.length,4);let u=await o.removeEntry(i,t.None);e.strictEqual(u,!0),e.strictEqual(r.length,1),e.strictEqual(r[0].entry,i),u=await o.removeEntry(i,t.None),e.strictEqual(u,!1),c=await o.getEntries(s.resource,t.None),e.strictEqual(c.length,3);const a=new h;o._lifecycleService.fireWillShutdown(a),await Promise.allSettled(a.value),o.dispose(),o=g.add(new q(g,E)),c=await o.getEntries(s.resource,t.None),e.strictEqual(c.length,3)}),test("removeEntry - deletes history entries folder when last entry removed",async()=>{const r=g.add(new d(y));let s=await l({resource:r.resource},t.None),i=new h;o._lifecycleService.fireWillShutdown(i),await Promise.allSettled(i.value),o.dispose(),o=g.add(new q(g,E)),e.strictEqual(await E.exists(_(s.location)),!0),s=(await o.getEntries(r.resource,t.None)).at(0),e.ok(s),await o.removeEntry(s,t.None),i=new h,o._lifecycleService.fireWillShutdown(i),await Promise.allSettled(i.value),o.dispose(),o=g.add(new q(g,E)),e.strictEqual(await E.exists(_(s.location)),!1)}),test("removeAll",async()=>{let r=!1;g.add(o.onDidRemoveEntries(()=>r=!0));const s=g.add(new d(y)),i=g.add(new d(p));await l({resource:s.resource},t.None),await l({resource:s.resource},t.None),await l({resource:i.resource},t.None),await l({resource:i.resource,source:"My Source"},t.None);let c=await o.getEntries(s.resource,t.None);e.strictEqual(c.length,2),c=await o.getEntries(i.resource,t.None),e.strictEqual(c.length,2),await o.removeAll(t.None),e.strictEqual(r,!0),c=await o.getEntries(s.resource,t.None),e.strictEqual(c.length,0),c=await o.getEntries(i.resource,t.None),e.strictEqual(c.length,0);const u=new h;o._lifecycleService.fireWillShutdown(u),await Promise.allSettled(u.value),o.dispose(),o=g.add(new q(g,E)),c=await o.getEntries(s.resource,t.None),e.strictEqual(c.length,0),c=await o.getEntries(i.resource,t.None),e.strictEqual(c.length,0)}),test("getEntries - simple",async()=>{const r=g.add(new d(y)),s=g.add(new d(p));let i=await o.getEntries(r.resource,t.None);e.strictEqual(i.length,0);const c=await l({resource:r.resource,source:"test-source"},t.None);i=await o.getEntries(r.resource,t.None),e.strictEqual(i.length,1),S(i[0],c);const u=await l({resource:r.resource,source:"test-source"},t.None);i=await o.getEntries(r.resource,t.None),e.strictEqual(i.length,2),S(i[1],u),i=await o.getEntries(s.resource,t.None),e.strictEqual(i.length,0);const a=await l({resource:s.resource,source:"other-test-source"},t.None);i=await o.getEntries(s.resource,t.None),e.strictEqual(i.length,1),S(i[0],a)}),test("getEntries - metadata preserved when stored",async()=>{const r=g.add(new d(y)),s=g.add(new d(p)),i=await l({resource:r.resource,source:"test-source"},t.None),c=await l({resource:s.resource},t.None),u=await l({resource:s.resource,source:"other-source"},t.None),a=new h;o._lifecycleService.fireWillShutdown(a),await Promise.allSettled(a.value),o.dispose(),o=g.add(new q(g,E));let w=await o.getEntries(r.resource,t.None);e.strictEqual(w.length,1),S(w[0],i),w=await o.getEntries(s.resource,t.None),e.strictEqual(w.length,2),S(w[0],c),S(w[1],u)}),test("getEntries - corrupt meta.json is no problem",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource},t.None),i=new h;o._lifecycleService.fireWillShutdown(i),await Promise.allSettled(i.value),o.dispose(),o=g.add(new q(g,E));const c=k(_(s.location),"entries.json");e.ok(await E.exists(c)),await E.del(c);const u=await o.getEntries(r.resource,t.None);e.strictEqual(u.length,1),S(u[0],s,!1)}),test("getEntries - missing entries from meta.json is no problem",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource},t.None),i=await l({resource:r.resource},t.None),c=new h;o._lifecycleService.fireWillShutdown(c),await Promise.allSettled(c.value),o.dispose(),o=g.add(new q(g,E)),await E.del(s.location);const u=await o.getEntries(r.resource,t.None);e.strictEqual(u.length,1),S(u[0],i)}),test("getEntries - in-memory and on-disk entries are merged",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource,source:"test-source"},t.None),i=await l({resource:r.resource,source:"other-source"},t.None),c=new h;o._lifecycleService.fireWillShutdown(c),await Promise.allSettled(c.value),o.dispose(),o=g.add(new q(g,E));const u=await l({resource:r.resource,source:"test-source"},t.None),a=await l({resource:r.resource,source:"other-source"},t.None),w=await o.getEntries(r.resource,t.None);e.strictEqual(w.length,4),S(w[0],s),S(w[1],i),S(w[2],u),S(w[3],a)}),test("getEntries - configured max entries respected",async()=>{const r=g.add(new d(y));await l({resource:r.resource},t.None),await l({resource:r.resource},t.None);const s=await l({resource:r.resource,source:"Test source"},t.None),i=await l({resource:r.resource},t.None);o._configurationService.setUserConfiguration("workbench.localHistory.maxFileEntries",2);let c=await o.getEntries(r.resource,t.None);e.strictEqual(c.length,2),S(c[0],s),S(c[1],i),o._configurationService.setUserConfiguration("workbench.localHistory.maxFileEntries",4),c=await o.getEntries(r.resource,t.None),e.strictEqual(c.length,4),o._configurationService.setUserConfiguration("workbench.localHistory.maxFileEntries",5),c=await o.getEntries(r.resource,t.None),e.strictEqual(c.length,4)}),test("getAll",async()=>{const r=g.add(new d(y)),s=g.add(new d(p));let i=await o.getAll(t.None);e.strictEqual(i.length,0),await l({resource:r.resource,source:"test-source"},t.None),await l({resource:r.resource,source:"test-source"},t.None),await l({resource:s.resource,source:"test-source"},t.None),await l({resource:s.resource,source:"test-source"},t.None),i=await o.getAll(t.None),e.strictEqual(i.length,2);for(const a of i)a.toString()!==r.resource.toString()&&a.toString()!==s.resource.toString()&&e.fail(`Unexpected history resource: ${a.toString()}`);const c=new h;o._lifecycleService.fireWillShutdown(c),await Promise.allSettled(c.value),o.dispose(),o=g.add(new q(g,E));const u=g.add(new d(P));await l({resource:u.resource,source:"test-source"},t.None),i=await o.getAll(t.None),e.strictEqual(i.length,3);for(const a of i)a.toString()!==r.resource.toString()&&a.toString()!==s.resource.toString()&&a.toString()!==u.resource.toString()&&e.fail(`Unexpected history resource: ${a.toString()}`)}),test("getAll - ignores resource when no entries exist",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource,source:"test-source"},t.None);let i=await o.getAll(t.None);e.strictEqual(i.length,1),await o.removeEntry(s,t.None),i=await o.getAll(t.None),e.strictEqual(i.length,0);const c=new h;o._lifecycleService.fireWillShutdown(c),await Promise.allSettled(c.value),o.dispose(),o=g.add(new q(g,E)),i=await o.getAll(t.None),e.strictEqual(i.length,0)});function S(r,s,i=!0){e.strictEqual(r.id,s.id),e.strictEqual(r.location.toString(),s.location.toString()),i&&e.strictEqual(r.timestamp,s.timestamp),e.strictEqual(r.source,s.source),e.strictEqual(r.workingCopy.name,s.workingCopy.name),e.strictEqual(r.workingCopy.resource.toString(),s.workingCopy.resource.toString())}test("entries cleaned up on shutdown",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource,source:"test-source"},t.None),i=await l({resource:r.resource,source:"other-source"},t.None),c=await l({resource:r.resource,source:"other-source"},t.None),u=await l({resource:r.resource,source:"other-source"},t.None);o._configurationService.setUserConfiguration("workbench.localHistory.maxFileEntries",2);let a=new h;o._lifecycleService.fireWillShutdown(a),await Promise.allSettled(a.value),e.ok(!await E.exists(s.location)),e.ok(!await E.exists(i.location)),e.ok(await E.exists(c.location)),e.ok(await E.exists(u.location)),o.dispose(),o=g.add(new q(g,E));let w=await o.getEntries(r.resource,t.None);e.strictEqual(w.length,2),S(w[0],c),S(w[1],u),o._configurationService.setUserConfiguration("workbench.localHistory.maxFileEntries",3);const m=await l({resource:r.resource,source:"other-source"},t.None);a=new h,o._lifecycleService.fireWillShutdown(a),await Promise.allSettled(a.value),e.ok(await E.exists(c.location)),e.ok(await E.exists(u.location)),e.ok(await E.exists(m.location)),o.dispose(),o=g.add(new q(g,E)),w=await o.getEntries(r.resource,t.None),e.strictEqual(w.length,3),S(w[0],c),S(w[1],u),S(w[2],m)}),test("entries are merged when source is same",async()=>{let r;g.add(o.onDidReplaceEntry(w=>r=w.entry));const s=g.add(new d(y));o._configurationService.setUserConfiguration("workbench.localHistory.mergeWindow",1);const i=await l({resource:s.resource,source:"test-source"},t.None);e.strictEqual(r,void 0);const c=await l({resource:s.resource,source:"test-source"},t.None);e.strictEqual(r,i);const u=await l({resource:s.resource,source:"test-source"},t.None);e.strictEqual(r,c);let a=await o.getEntries(s.resource,t.None);e.strictEqual(a.length,1),S(a[0],u),o._configurationService.setUserConfiguration("workbench.localHistory.mergeWindow",void 0),await l({resource:s.resource,source:"test-source"},t.None),await l({resource:s.resource,source:"test-source"},t.None),a=await o.getEntries(s.resource,t.None),e.strictEqual(a.length,3)}),test("move entries (file rename)",async()=>{const r=g.add(new d(y)),s=await l({resource:r.resource,source:"test-source"},t.None),i=await l({resource:r.resource,source:"test-source"},t.None),c=await l({resource:r.resource,source:"test-source"},t.None);let u=await o.getEntries(r.resource,t.None);e.strictEqual(u.length,3);const a=k(_(r.resource),"renamed.txt");await E.move(r.resource,a);const w=await o.moveEntries(r.resource,a);e.strictEqual(w.length,1),e.strictEqual(w[0].toString(),a.toString()),u=await o.getEntries(r.resource,t.None),e.strictEqual(u.length,0),u=await o.getEntries(a,t.None),e.strictEqual(u.length,4),e.strictEqual(u[0].id,s.id),e.strictEqual(u[0].timestamp,s.timestamp),e.strictEqual(u[0].source,s.source),e.ok(!u[0].sourceDescription),e.notStrictEqual(u[0].location,s.location),e.strictEqual(u[0].workingCopy.resource.toString(),a.toString()),e.strictEqual(u[1].id,i.id),e.strictEqual(u[1].timestamp,i.timestamp),e.strictEqual(u[1].source,i.source),e.ok(!u[1].sourceDescription),e.notStrictEqual(u[1].location,i.location),e.strictEqual(u[1].workingCopy.resource.toString(),a.toString()),e.strictEqual(u[2].id,c.id),e.strictEqual(u[2].timestamp,c.timestamp),e.strictEqual(u[2].source,c.source),e.notStrictEqual(u[2].location,c.location),e.strictEqual(u[2].workingCopy.resource.toString(),a.toString()),e.ok(!u[2].sourceDescription),e.strictEqual(u[3].source,"renamed.source"),e.ok(u[3].sourceDescription);const m=await o.getAll(t.None);e.strictEqual(m.length,1),e.strictEqual(m[0].toString(),a.toString())}),test("entries moved (folder rename)",async()=>{const r=g.add(new d(y)),s=g.add(new d(p)),i=await l({resource:r.resource,source:"test-source"},t.None),c=await l({resource:r.resource,source:"test-source"},t.None),u=await l({resource:r.resource,source:"test-source"},t.None),a=await l({resource:s.resource,source:"test-source"},t.None),w=await l({resource:s.resource,source:"test-source"},t.None),m=await l({resource:s.resource,source:"test-source"},t.None);let n=await o.getEntries(r.resource,t.None);e.strictEqual(n.length,3),n=await o.getEntries(s.resource,t.None),e.strictEqual(n.length,3);const C=k(_(v),"renamed");await E.move(v,C);const x=await o.moveEntries(v,C),W=k(C,b(r.resource)),H=k(C,b(s.resource));e.strictEqual(x.length,2);for(const I of x)I.toString()!==W.toString()&&I.toString()!==H.toString()&&e.fail(`Unexpected history resource: ${I.toString()}`);n=await o.getEntries(r.resource,t.None),e.strictEqual(n.length,0),n=await o.getEntries(s.resource,t.None),e.strictEqual(n.length,0),n=await o.getEntries(W,t.None),e.strictEqual(n.length,4),e.strictEqual(n[0].id,i.id),e.strictEqual(n[0].timestamp,i.timestamp),e.strictEqual(n[0].source,i.source),e.notStrictEqual(n[0].location,i.location),e.strictEqual(n[0].workingCopy.resource.toString(),W.toString()),e.strictEqual(n[1].id,c.id),e.strictEqual(n[1].timestamp,c.timestamp),e.strictEqual(n[1].source,c.source),e.notStrictEqual(n[1].location,c.location),e.strictEqual(n[1].workingCopy.resource.toString(),W.toString()),e.strictEqual(n[2].id,u.id),e.strictEqual(n[2].timestamp,u.timestamp),e.strictEqual(n[2].source,u.source),e.notStrictEqual(n[2].location,u.location),e.strictEqual(n[2].workingCopy.resource.toString(),W.toString()),n=await o.getEntries(H,t.None),e.strictEqual(n.length,4),e.strictEqual(n[0].id,a.id),e.strictEqual(n[0].timestamp,a.timestamp),e.strictEqual(n[0].source,a.source),e.notStrictEqual(n[0].location,a.location),e.strictEqual(n[0].workingCopy.resource.toString(),H.toString()),e.strictEqual(n[1].id,w.id),e.strictEqual(n[1].timestamp,w.timestamp),e.strictEqual(n[1].source,w.source),e.notStrictEqual(n[1].location,w.location),e.strictEqual(n[1].workingCopy.resource.toString(),H.toString()),e.strictEqual(n[2].id,m.id),e.strictEqual(n[2].timestamp,m.timestamp),e.strictEqual(n[2].source,m.source),e.notStrictEqual(n[2].location,m.location),e.strictEqual(n[2].workingCopy.resource.toString(),H.toString()),e.strictEqual(n[3].source,"moved.source"),e.ok(n[3].sourceDescription);const D=await o.getAll(t.None);e.strictEqual(D.length,2);for(const I of D)I.toString()!==W.toString()&&I.toString()!==H.toString()&&e.fail(`Unexpected history resource: ${I.toString()}`)}),test("move entries (file rename) - preserves previous entries (no new entries)",async()=>{const r=g.add(new d(y)),s=g.add(new d(p)),i=await l({resource:r.resource,source:"test-source1"},t.None),c=await l({resource:r.resource,source:"test-source2"},t.None),u=await l({resource:r.resource,source:"test-source3"},t.None);let a=await o.getEntries(r.resource,t.None);e.strictEqual(a.length,3),a=await o.getEntries(s.resource,t.None),e.strictEqual(a.length,0),await E.move(s.resource,r.resource,!0);const w=await o.moveEntries(s.resource,r.resource);e.strictEqual(w.length,1),e.strictEqual(w[0].toString(),r.resource.toString()),a=await o.getEntries(s.resource,t.None),e.strictEqual(a.length,0),a=await o.getEntries(r.resource,t.None),e.strictEqual(a.length,4),e.strictEqual(a[0].id,i.id),e.strictEqual(a[0].timestamp,i.timestamp),e.strictEqual(a[0].source,i.source),e.notStrictEqual(a[0].location,i.location),e.strictEqual(a[0].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(a[1].id,c.id),e.strictEqual(a[1].timestamp,c.timestamp),e.strictEqual(a[1].source,c.source),e.notStrictEqual(a[1].location,c.location),e.strictEqual(a[1].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(a[2].id,u.id),e.strictEqual(a[2].timestamp,u.timestamp),e.strictEqual(a[2].source,u.source),e.notStrictEqual(a[2].location,u.location),e.strictEqual(a[2].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(a[3].source,"renamed.source"),e.ok(a[3].sourceDescription);const m=await o.getAll(t.None);e.strictEqual(m.length,1),e.strictEqual(m[0].toString(),r.resource.toString())}),test("move entries (file rename) - preserves previous entries (new entries)",async()=>{const r=g.add(new d(y)),s=g.add(new d(p)),i=await l({resource:r.resource,source:"test-target1"},t.None),c=await l({resource:r.resource,source:"test-target2"},t.None),u=await l({resource:r.resource,source:"test-target3"},t.None),a=await l({resource:s.resource,source:"test-source1"},t.None),w=await l({resource:s.resource,source:"test-source2"},t.None),m=await l({resource:s.resource,source:"test-source3"},t.None);let n=await o.getEntries(r.resource,t.None);e.strictEqual(n.length,3),n=await o.getEntries(s.resource,t.None),e.strictEqual(n.length,3),await E.move(s.resource,r.resource,!0);const C=await o.moveEntries(s.resource,r.resource);e.strictEqual(C.length,1),e.strictEqual(C[0].toString(),r.resource.toString()),n=await o.getEntries(s.resource,t.None),e.strictEqual(n.length,0),n=await o.getEntries(r.resource,t.None),e.strictEqual(n.length,7),e.strictEqual(n[0].id,i.id),e.strictEqual(n[0].timestamp,i.timestamp),e.strictEqual(n[0].source,i.source),e.notStrictEqual(n[0].location,i.location),e.strictEqual(n[0].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[1].id,c.id),e.strictEqual(n[1].timestamp,c.timestamp),e.strictEqual(n[1].source,c.source),e.notStrictEqual(n[1].location,c.location),e.strictEqual(n[1].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[2].id,u.id),e.strictEqual(n[2].timestamp,u.timestamp),e.strictEqual(n[2].source,u.source),e.notStrictEqual(n[2].location,u.location),e.strictEqual(n[2].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[3].id,a.id),e.strictEqual(n[3].timestamp,a.timestamp),e.strictEqual(n[3].source,a.source),e.notStrictEqual(n[3].location,a.location),e.strictEqual(n[3].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[4].id,w.id),e.strictEqual(n[4].timestamp,w.timestamp),e.strictEqual(n[4].source,w.source),e.notStrictEqual(n[4].location,w.location),e.strictEqual(n[4].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[5].id,m.id),e.strictEqual(n[5].timestamp,m.timestamp),e.strictEqual(n[5].source,m.source),e.notStrictEqual(n[5].location,m.location),e.strictEqual(n[5].workingCopy.resource.toString(),r.resource.toString()),e.strictEqual(n[6].source,"renamed.source"),e.ok(n[6].sourceDescription);const x=await o.getAll(t.None);e.strictEqual(x.length,1),e.strictEqual(x[0].toString(),r.resource.toString())}),oe()});export{q as TestWorkingCopyHistoryService};