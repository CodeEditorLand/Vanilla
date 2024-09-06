import r from"assert";import{Emitter as u,Event as d}from"../../../../../base/common/event.js";import{ensureNoDisposablesAreLeakedInTestSuite as h}from"../../../../../base/test/common/utils.js";import{AuthenticationAccessService as g}from"../../browser/authenticationAccessService.js";import{AuthenticationService as P}from"../../browser/authenticationService.js";import"../../common/authentication.js";import{TestEnvironmentService as A}from"../../../../test/browser/workbenchTestServices.js";import{TestExtensionService as p,TestProductService as m,TestStorageService as S}from"../../../../test/common/workbenchTestServices.js";function v(){return{id:"session1",accessToken:"token1",account:{id:"account",label:"Account"},scopes:["test"]}}function o(a={}){return{supportsMultipleAccounts:!1,onDidChangeSessions:new u().event,id:"test",label:"Test",getSessions:async()=>[],createSession:async()=>v(),removeSession:async()=>{},...a}}suite("AuthenticationService",()=>{const a=h();let t;setup(()=>{const i=a.add(new S),e=a.add(new g(i,m));t=a.add(new P(new p,e,A))}),teardown(()=>{t.dispose()}),suite("declaredAuthenticationProviders",()=>{test("registerDeclaredAuthenticationProvider",async()=>{const i=d.toPromise(t.onDidChangeDeclaredProviders),e={id:"github",label:"GitHub"};t.registerDeclaredAuthenticationProvider(e),r.equal(t.declaredProviders.length,1),r.deepEqual(t.declaredProviders[0],e),await i}),test("unregisterDeclaredAuthenticationProvider",async()=>{const i={id:"github",label:"GitHub"};t.registerDeclaredAuthenticationProvider(i);const e=d.toPromise(t.onDidChangeDeclaredProviders);t.unregisterDeclaredAuthenticationProvider(i.id),r.equal(t.declaredProviders.length,0),await e})}),suite("authenticationProviders",()=>{test("isAuthenticationProviderRegistered",async()=>{const i=d.toPromise(t.onDidRegisterAuthenticationProvider),e=o();r.equal(t.isAuthenticationProviderRegistered(e.id),!1),t.registerAuthenticationProvider(e.id,e),r.equal(t.isAuthenticationProviderRegistered(e.id),!0);const n=await i;r.deepEqual(n,{id:e.id,label:e.label})}),test("unregisterAuthenticationProvider",async()=>{const i=d.toPromise(t.onDidUnregisterAuthenticationProvider),e=o();t.registerAuthenticationProvider(e.id,e),r.equal(t.isAuthenticationProviderRegistered(e.id),!0),t.unregisterAuthenticationProvider(e.id),r.equal(t.isAuthenticationProviderRegistered(e.id),!1);const n=await i;r.deepEqual(n,{id:e.id,label:e.label})}),test("getProviderIds",()=>{const i=o({id:"provider1",label:"Provider 1"}),e=o({id:"provider2",label:"Provider 2"});t.registerAuthenticationProvider(i.id,i),t.registerAuthenticationProvider(e.id,e);const n=t.getProviderIds();r.deepEqual(n,[i.id,e.id])}),test("getProvider",()=>{const i=o();t.registerAuthenticationProvider(i.id,i);const e=t.getProvider(i.id);r.deepEqual(e,i)})}),suite("authenticationSessions",()=>{test("getSessions",async()=>{let i=!1;const e=o({getSessions:async()=>(i=!0,[v()])});t.registerAuthenticationProvider(e.id,e);const n=await t.getSessions(e.id);r.equal(n.length,1),r.ok(i)}),test("createSession",async()=>{const i=new u,e=o({onDidChangeSessions:i.event,createSession:async()=>{const l=v();return i.fire({added:[l],removed:[],changed:[]}),l}}),n=d.toPromise(t.onDidChangeSessions);t.registerAuthenticationProvider(e.id,e);const s=await t.createSession(e.id,["repo"]);r.ok(s);const c=await n;r.deepEqual(c,{providerId:e.id,label:e.label,event:{added:[s],removed:[],changed:[]}})}),test("removeSession",async()=>{const i=new u,e=v(),n=o({onDidChangeSessions:i.event,removeSession:async()=>i.fire({added:[],removed:[e],changed:[]})}),s=d.toPromise(t.onDidChangeSessions);t.registerAuthenticationProvider(n.id,n),await t.removeSession(n.id,e.id);const c=await s;r.deepEqual(c,{providerId:n.id,label:n.label,event:{added:[],removed:[e],changed:[]}})}),test("onDidChangeSessions",async()=>{const i=new u,e=o({onDidChangeSessions:i.event,getSessions:async()=>[]});t.registerAuthenticationProvider(e.id,e);const n=d.toPromise(t.onDidChangeSessions),s=v();i.fire({added:[],removed:[],changed:[s]});const c=await n;r.deepEqual(c,{providerId:e.id,label:e.label,event:{added:[],removed:[],changed:[s]}})})})});
