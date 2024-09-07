import d from"assert";import{VSBuffer as n}from"../../../../base/common/buffer.js";import{dirname as T,joinPath as p}from"../../../../base/common/resources.js";import{ensureNoDisposablesAreLeakedInTestSuite as k}from"../../../../base/test/common/utils.js";import{IEnvironmentService as v}from"../../../environment/common/environment.js";import{IFileService as f}from"../../../files/common/files.js";import{IUserDataProfilesService as g}from"../../../userDataProfile/common/userDataProfile.js";import{IUserDataSyncEnablementService as m,IUserDataSyncService as l,SyncResource as w,SyncStatus as y}from"../../common/userDataSync.js";import{UserDataSyncClient as o,UserDataSyncTestServer as S}from"./userDataSyncClient.js";suite("UserDataSyncService",()=>{const c=k();test("test first time sync ever",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/tasks`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test first time sync ever when a sync resource is disabled",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),t.instantiationService.get(m).setResourceEnablement(w.Settings,!1),await(await t.instantiationService.get(l).createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/tasks`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test first time sync ever with no data",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(!0),await(await t.instantiationService.get(l).createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test first time sync from the client with no changes - merge",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(l);e.reset(),await(await r.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test first time sync from the client with changes - merge",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(f),a=s.instantiationService.get(v),i=s.instantiationService.get(g);await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(p(T(i.defaultProfile.settingsResource),"tasks.json"),n.fromString(JSON.stringify({})));const u=s.instantiationService.get(l);e.reset(),await(await u.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test first time sync from the client with changes - merge with profile",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(f),a=s.instantiationService.get(v),i=s.instantiationService.get(g);await i.createNamedProfile("1"),await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(p(T(i.defaultProfile.settingsResource),"tasks.json"),n.fromString(JSON.stringify({})));const u=s.instantiationService.get(l);e.reset(),await(await u.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/collection`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/profiles`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/collection/1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/extensions/latest`,headers:{}}])}),test("test sync when there are no changes",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset(),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}}])}),test("test sync when there are local changes",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset();const r=t.instantiationService.get(f),a=t.instantiationService.get(v),i=t.instantiationService.get(g);await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"1"}}])}),test("test sync when there are local changes with profile",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset();const r=t.instantiationService.get(f),a=t.instantiationService.get(v),i=t.instantiationService.get(g);await i.createNamedProfile("1"),await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/collection`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/profiles`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/collection/1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/extensions/latest`,headers:{}}])}),test("test sync when there are local changes and sync resource is disabled",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset();const r=t.instantiationService.get(f),a=t.instantiationService.get(v),i=t.instantiationService.get(g);await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),t.instantiationService.get(m).setResourceEnablement(w.Snippets,!1),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"1"}}])}),test("test sync when there are remote changes",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(l);await(await r.createSyncTask(null)).run();const a=t.instantiationService.get(f),i=t.instantiationService.get(v),u=t.instantiationService.get(g);await a.writeFile(u.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await a.writeFile(u.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await a.writeFile(p(u.defaultProfile.snippetsHome,"html.json"),n.fromString('{ "a": "changed" }')),await a.writeFile(i.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await t.instantiationService.get(l).createSyncTask(null)).run(),e.reset(),await(await r.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{"If-None-Match":"1"}}])}),test("test sync when there are remote changes with profile",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(l);await(await r.createSyncTask(null)).run();const a=t.instantiationService.get(f),i=t.instantiationService.get(v),u=t.instantiationService.get(g);await u.createNamedProfile("1"),await a.writeFile(u.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await a.writeFile(u.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await a.writeFile(p(u.defaultProfile.snippetsHome,"html.json"),n.fromString('{ "a": "changed" }')),await a.writeFile(i.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await t.instantiationService.get(l).createSyncTask(null)).run(),e.reset(),await(await r.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{"If-None-Match":"0"}},{type:"GET",url:`${e.url}/v1/collection/1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/extensions/latest`,headers:{}}])}),test("test delete",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset(),await s.reset(),d.deepStrictEqual(e.requests,[{type:"DELETE",url:`${e.url}/v1/collection`,headers:{}},{type:"DELETE",url:`${e.url}/v1/resource`,headers:{}}])}),test("test delete and sync",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),await s.reset(),e.reset(),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/tasks/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/tasks`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/resource/extensions/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{}}])}),test("test sync status",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l),r=[],a=s.onDidChangeStatus(i=>r.push(i));await(await s.createSyncTask(null)).run(),a.dispose(),d.deepStrictEqual(r,[y.Syncing,y.Idle,y.Syncing,y.Idle,y.Syncing,y.Idle,y.Syncing,y.Idle,y.Syncing,y.Idle,y.Syncing,y.Idle,y.Syncing,y.Idle])}),test("test sync conflicts status",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();let s=t.instantiationService.get(f),r=t.instantiationService.get(g);await s.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await(await t.instantiationService.get(l).createSyncTask(null)).run();const a=c.add(new o(e));await a.setUp(),s=a.instantiationService.get(f),r=a.instantiationService.get(g),await s.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":16})));const i=a.instantiationService.get(l);await(await i.createSyncTask(null)).run(),d.deepStrictEqual(i.status,y.HasConflicts),d.deepStrictEqual(i.conflicts.map(({syncResource:u})=>u),[w.Settings])}),test("test sync will sync other non conflicted areas",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(f);let r=t.instantiationService.get(g);await s.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await(await t.instantiationService.get(l).createSyncTask(null)).run();const a=c.add(new o(e));await a.setUp();const i=a.instantiationService.get(f);r=a.instantiationService.get(g),await i.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":16})));const u=a.instantiationService.get(l);await(await u.createSyncTask(null)).run(),await s.writeFile(r.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await(await t.instantiationService.get(l).createSyncTask(null)).run(),e.reset();const h=[],$=u.onDidChangeStatus(E=>h.push(E));await(await u.createSyncTask(null)).run(),$.dispose(),d.deepStrictEqual(h,[]),d.deepStrictEqual(u.status,y.HasConflicts),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{"If-None-Match":"1"}}])}),test("test stop sync reset status",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();let s=t.instantiationService.get(f),r=t.instantiationService.get(g);await s.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await(await t.instantiationService.get(l).createSyncTask(null)).run();const a=c.add(new o(e));await a.setUp(),s=a.instantiationService.get(f),r=a.instantiationService.get(g),await s.writeFile(r.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":16})));const i=a.instantiationService.get(l),u=await i.createSyncTask(null);u.run().then(null,()=>null),await u.stop(),d.deepStrictEqual(i.status,y.Idle),d.deepStrictEqual(i.conflicts,[])}),test("test sync send execution id header",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();for(const r of e.requestsWithAllHeaders){const a=r.headers&&r.headers["X-Execution-Id"]&&r.headers["X-Execution-Id"].length>0;d.ok(a,`Should have execution header: ${r.url}`)}}),test("test can run sync taks only once",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const r=await t.instantiationService.get(l).createSyncTask(null);await r.run();try{await r.run(),d.fail("Should fail running the task again")}catch{}}),test("test sync when there are local profile that uses default profile",async()=>{const e=new S,t=c.add(new o(e));await t.setUp();const s=t.instantiationService.get(l);await(await s.createSyncTask(null)).run(),e.reset();const r=t.instantiationService.get(f),a=t.instantiationService.get(v),i=t.instantiationService.get(g);await i.createNamedProfile("1",{useDefaultFlags:{settings:!0}}),await r.writeFile(i.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await r.writeFile(i.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await r.writeFile(p(i.defaultProfile.snippetsHome,"html.json"),n.fromString("{}")),await r.writeFile(a.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await s.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/settings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/keybindings`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/snippets`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/resource/globalState`,headers:{"If-Match":"1"}},{type:"POST",url:`${e.url}/v1/collection`,headers:{}},{type:"POST",url:`${e.url}/v1/resource/profiles`,headers:{"If-Match":"0"}},{type:"GET",url:`${e.url}/v1/collection/1/resource/keybindings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/extensions/latest`,headers:{}}])}),test("test sync when there is a remote profile that uses default profile",async()=>{const e=new S,t=c.add(new o(e));await t.setUp(),await(await t.instantiationService.get(l).createSyncTask(null)).run();const s=c.add(new o(e));await s.setUp();const r=s.instantiationService.get(l);await(await r.createSyncTask(null)).run();const a=t.instantiationService.get(f),i=t.instantiationService.get(v),u=t.instantiationService.get(g);await u.createNamedProfile("1",{useDefaultFlags:{keybindings:!0}}),await a.writeFile(u.defaultProfile.settingsResource,n.fromString(JSON.stringify({"editor.fontSize":14}))),await a.writeFile(u.defaultProfile.keybindingsResource,n.fromString(JSON.stringify([{command:"abcd",key:"cmd+c"}]))),await a.writeFile(p(u.defaultProfile.snippetsHome,"html.json"),n.fromString('{ "a": "changed" }')),await a.writeFile(i.argvResource,n.fromString(JSON.stringify({locale:"de"}))),await(await t.instantiationService.get(l).createSyncTask(null)).run(),e.reset(),await(await r.createSyncTask(null)).run(),d.deepStrictEqual(e.requests,[{type:"GET",url:`${e.url}/v1/manifest`,headers:{}},{type:"GET",url:`${e.url}/v1/resource/settings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/keybindings/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/snippets/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/globalState/latest`,headers:{"If-None-Match":"1"}},{type:"GET",url:`${e.url}/v1/resource/profiles/latest`,headers:{"If-None-Match":"0"}},{type:"GET",url:`${e.url}/v1/collection/1/resource/settings/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/snippets/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/tasks/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/globalState/latest`,headers:{}},{type:"GET",url:`${e.url}/v1/collection/1/resource/extensions/latest`,headers:{}}])})});