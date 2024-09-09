import c from"assert";import{DisposableStore as d}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as R}from"../../../../../base/test/common/utils.js";import{MockContextKeyService as P}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{TestProfileService as m}from"../../common/testProfileService.js";import{TestRunProfileBitset as e}from"../../common/testTypes.js";import{TestStorageService as I}from"../../../../test/common/workbenchTestServices.js";suite("Workbench - TestProfileService",()=>{let s,i,b=0;teardown(()=>{i.dispose()}),R(),setup(()=>{b=0,i=new d,s=i.add(new m(new P,i.add(new I)))});const l=u=>{const t={controllerId:"ctrlId",group:e.Run,isDefault:!0,label:"profile",profileId:b++,hasConfigurationHandler:!1,tag:null,supportsContinuousRun:!1,...u};return s.addProfile({id:"ctrlId"},t),t},o=(u,t)=>{c.deepStrictEqual(s.getGroupDefaultProfiles(u).map(r=>r.label),t.map(r=>r.label))},D=(u,t)=>{const r=u.map(f=>f.label).sort(),a=t.sort();c.deepStrictEqual(r,a)};test("getGroupDefaultProfiles",()=>{l({isDefault:!0,group:e.Debug,label:"a"}),l({isDefault:!1,group:e.Debug,label:"b"}),l({isDefault:!0,group:e.Run,label:"c"}),l({isDefault:!0,group:e.Run,label:"d",controllerId:"2"}),l({isDefault:!1,group:e.Run,label:"e",controllerId:"2"}),D(s.getGroupDefaultProfiles(e.Run),["c","d"]),D(s.getGroupDefaultProfiles(e.Debug),["a"])}),suite("setGroupDefaultProfiles",()=>{test("applies simple changes",()=>{const u=l({isDefault:!1,group:e.Debug,label:"a"});l({isDefault:!1,group:e.Debug,label:"b"});const t=l({isDefault:!1,group:e.Run,label:"c"});l({isDefault:!1,group:e.Run,label:"d"}),s.setGroupDefaultProfiles(e.Run,[t]),o(e.Run,[t]),o(e.Debug,[u])}),test("syncs labels if same",()=>{const u=l({isDefault:!1,group:e.Debug,label:"a"}),t=l({isDefault:!1,group:e.Debug,label:"b"}),r=l({isDefault:!1,group:e.Run,label:"a"}),a=l({isDefault:!1,group:e.Run,label:"b"});s.setGroupDefaultProfiles(e.Run,[r]),o(e.Run,[r]),o(e.Debug,[u]),s.setGroupDefaultProfiles(e.Debug,[t]),o(e.Run,[a]),o(e.Debug,[t])}),test("does not mess up sync for multiple controllers",()=>{const u=l({isDefault:!1,controllerId:"a",group:e.Debug,label:"a"}),t=l({isDefault:!1,controllerId:"b",group:e.Debug,label:"b1"}),r=l({isDefault:!1,controllerId:"b",group:e.Debug,label:"b2"}),a=l({isDefault:!1,controllerId:"c",group:e.Debug,label:"c1"}),f=l({isDefault:!1,controllerId:"a",group:e.Run,label:"a"}),p=l({isDefault:!1,controllerId:"b",group:e.Run,label:"b1"}),g=l({isDefault:!1,controllerId:"b",group:e.Run,label:"b2"}),n=l({isDefault:!1,controllerId:"b",group:e.Run,label:"b3"});s.setGroupDefaultProfiles(e.Debug,[r]),o(e.Run,[g]),o(e.Debug,[r]),s.setGroupDefaultProfiles(e.Run,[n]),o(e.Run,[n]),o(e.Debug,[f]),s.setGroupDefaultProfiles(e.Debug,[u,t,a]),o(e.Run,[f,p,n]),o(e.Debug,[u,t,a]),s.setGroupDefaultProfiles(e.Run,[f,p,n]),o(e.Run,[f,p,n]),o(e.Debug,[u,t,a])})})});
