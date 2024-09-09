import n from"assert";import{VSBuffer as m}from"../../../../base/common/buffer.js";import{Event as F}from"../../../../base/common/event.js";import{runWithFakedTimers as o}from"../../../../base/test/common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"../../../../base/test/common/utils.js";import{IConfigurationService as T}from"../../../configuration/common/configuration.js";import{ConfigurationScope as v,Extensions as q}from"../../../configuration/common/configurationRegistry.js";import{IFileService as S}from"../../../files/common/files.js";import{Registry as U}from"../../../registry/common/platform.js";import{IUserDataProfilesService as y}from"../../../userDataProfile/common/userDataProfile.js";import{parseSettingsSyncContent as w}from"../../common/settingsSync.js";import{IUserDataSyncStoreService as b,SyncResource as D,SyncStatus as h,UserDataSyncError as k,UserDataSyncErrorCode as E}from"../../common/userDataSync.js";import{UserDataSyncClient as d,UserDataSyncTestServer as C}from"./userDataSyncClient.js";suite("SettingsSync - Auto",()=>{const r=new C;let e,t;teardown(async()=>{await e.instantiationService.get(b).clear()});const f=p();setup(async()=>{U.as(q.Configuration).registerConfiguration({id:"settingsSync",type:"object",properties:{"settingsSync.machine":{type:"string",scope:v.MACHINE},"settingsSync.machineOverridable":{type:"string",scope:v.MACHINE_OVERRIDABLE}}}),e=f.add(new d(r)),await e.setUp(!0),t=e.getSynchronizer(D.Settings)}),test("when settings file does not exist",()=>o({useFakeTimers:!0},async()=>{const s=e.instantiationService.get(S),a=e.instantiationService.get(y).defaultProfile.settingsResource;n.deepStrictEqual(await t.getLastSyncUserData(),null);let i=await e.getResourceManifest();r.reset(),await t.sync(i),n.deepStrictEqual(r.requests,[{type:"GET",url:`${r.url}/v1/resource/${t.resource}/latest`,headers:{}}]),n.ok(!await s.exists(a));const l=await t.getLastSyncUserData(),u=await t.getRemoteUserData(null);n.deepStrictEqual(l.ref,u.ref),n.deepStrictEqual(l.syncData,u.syncData),n.strictEqual(l.syncData,null),i=await e.getResourceManifest(),r.reset(),await t.sync(i),n.deepStrictEqual(r.requests,[]),i=await e.getResourceManifest(),r.reset(),await t.sync(i),n.deepStrictEqual(r.requests,[])})),test("when settings file is empty and remote has no changes",()=>o({useFakeTimers:!0},async()=>{const s=e.instantiationService.get(S),a=e.instantiationService.get(y).defaultProfile.settingsResource;await s.writeFile(a,m.fromString("")),await t.sync(await e.getResourceManifest());const i=await t.getLastSyncUserData(),l=await t.getRemoteUserData(null);n.strictEqual(w(i.syncData.content)?.settings,"{}"),n.strictEqual(w(l.syncData.content)?.settings,"{}"),n.strictEqual((await s.readFile(a)).value.toString(),"")})),test("when settings file is empty and remote has changes",()=>o({useFakeTimers:!0},async()=>{const s=f.add(new d(r));await s.setUp(!0);const a=`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	},

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`;await s.instantiationService.get(S).writeFile(s.instantiationService.get(y).defaultProfile.settingsResource,m.fromString(a)),await s.sync();const i=e.instantiationService.get(S),l=e.instantiationService.get(y).defaultProfile.settingsResource;await i.writeFile(l,m.fromString("")),await t.sync(await e.getResourceManifest());const u=await t.getLastSyncUserData(),R=await t.getRemoteUserData(null);n.strictEqual(w(u.syncData.content)?.settings,a),n.strictEqual(w(R.syncData.content)?.settings,a),n.strictEqual((await i.readFile(l)).value.toString(),a)})),test("when settings file is created after first sync",()=>o({useFakeTimers:!0},async()=>{const s=e.instantiationService.get(S),a=e.instantiationService.get(y).defaultProfile.settingsResource;await t.sync(await e.getResourceManifest()),await s.createFile(a,m.fromString("{}"));let i=await t.getLastSyncUserData();const l=await e.getResourceManifest();r.reset(),await t.sync(l),n.deepStrictEqual(r.requests,[{type:"POST",url:`${r.url}/v1/resource/${t.resource}`,headers:{"If-Match":i?.ref}}]),i=await t.getLastSyncUserData();const u=await t.getRemoteUserData(null);n.deepStrictEqual(i.ref,u.ref),n.deepStrictEqual(i.syncData,u.syncData),n.strictEqual(w(i.syncData.content)?.settings,"{}")})),test("sync for first time to the server",()=>o({useFakeTimers:!0},async()=>{const s=`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	},

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`;await c(s,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,s)})),test("do not sync machine settings",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue"
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp"
}`)})),test("do not sync machine settings when spread across file",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"settingsSync.machine": "someValue",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machineOverridable": "someValue"
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp"
}`)})),test("do not sync machine settings when spread across file - 2",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"settingsSync.machine": "someValue",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machineOverridable": "someValue",
	"files.simpleDialog.enable": true,
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	// Always
	"files.autoSave": "afterDelay",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"files.simpleDialog.enable": true,
}`)})),test("sync when all settings are machine settings",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue"
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
}`)})),test("sync when all settings are machine settings with trailing comma",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue",
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	,
}`)})),test("local change event is triggered when settings are changed",()=>o({useFakeTimers:!0},async()=>{await c(`{
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,
}`,e),await t.sync(await e.getResourceManifest());const a=F.toPromise(t.onDidChangeLocal);await c(`{
	"files.autoSave": "off",
	"files.simpleDialog.enable": true,
}`,e),await a})),test("do not sync ignored settings",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`)})),test("do not sync ignored and machine settings",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	],

	// Machine
	"settingsSync.machine": "someValue",
}`,e),await t.sync(await e.getResourceManifest());const{content:a}=await e.read(t.resource);n.ok(a!==null);const i=g(a);n.deepStrictEqual(i,`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	],
}`)})),test("sync throws invalid content error",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	}

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`,e);try{await t.sync(await e.getResourceManifest()),n.fail("should fail with invalid content error")}catch(a){n.ok(a instanceof k),n.deepStrictEqual(a.code,E.LocalInvalidContent)}})),test("sync throws invalid content error - content is an array",()=>o({useFakeTimers:!0},async()=>{await c("[]",e);try{await t.sync(await e.getResourceManifest()),n.fail("should fail with invalid content error")}catch(s){n.ok(s instanceof k),n.deepStrictEqual(s.code,E.LocalInvalidContent)}})),test("sync when there are conflicts",()=>o({useFakeTimers:!0},async()=>{const s=f.add(new d(r));await s.setUp(!0),await c(JSON.stringify({a:1,b:2,"settingsSync.ignoredSettings":["a"]}),s),await s.sync(),await c(JSON.stringify({a:2,b:1,"settingsSync.ignoredSettings":["a"]}),e),await t.sync(await e.getResourceManifest()),n.strictEqual(t.status,h.HasConflicts),n.strictEqual(t.conflicts.conflicts[0].localResource.toString(),t.localResource.toString());const i=(await e.instantiationService.get(S).readFile(t.conflicts.conflicts[0].previewResource)).value.toString();n.strictEqual(i,"")})),test("sync profile settings",()=>o({useFakeTimers:!0},async()=>{const s=f.add(new d(r));await s.setUp(!0);const a=await s.instantiationService.get(y).createNamedProfile("profile1");await c(JSON.stringify({a:1,b:2}),s,a),await s.sync(),await e.sync(),n.strictEqual(t.status,h.Idle);const i=e.instantiationService.get(y).profiles.find(u=>u.id===a.id),l=(await e.instantiationService.get(S).readFile(i.settingsResource)).value.toString();n.deepStrictEqual(JSON.parse(l),{a:1,b:2})}))}),suite("SettingsSync - Manual",()=>{const r=new C;let e,t;teardown(async()=>{await e.instantiationService.get(b).clear()});const f=p();setup(async()=>{e=f.add(new d(r)),await e.setUp(!0),t=e.getSynchronizer(D.Settings)}),test("do not sync ignored settings",()=>o({useFakeTimers:!0},async()=>{await c(`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`,e);let a=await t.preview(await e.getResourceManifest(),{});n.strictEqual(t.status,h.Syncing),a=await t.accept(a.resourcePreviews[0].previewResource),a=await t.apply(!1);const{content:i}=await e.read(t.resource);n.ok(i!==null);const l=g(i);n.deepStrictEqual(l,`{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`)}))});function g(r){const e=JSON.parse(r);return JSON.parse(e.content).settings}async function c(r,e,t){await e.instantiationService.get(S).writeFile((t??e.instantiationService.get(y).defaultProfile).settingsResource,m.fromString(r)),await e.instantiationService.get(T).reloadConfiguration()}
