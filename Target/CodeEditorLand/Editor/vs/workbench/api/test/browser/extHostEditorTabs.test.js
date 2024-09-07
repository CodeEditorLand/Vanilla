import a from"assert";import{URI as b}from"../../../../base/common/uri.js";import{mock as n}from"../../../../base/test/common/mock.js";import{TabInputKind as T,TabModelOperationKind as d}from"../../common/extHost.protocol.js";import{ExtHostEditorTabs as l}from"../../common/extHostEditorTabs.js";import{SingleProxyRPCProtocol as u}from"../common/testRPCProtocol.js";import{TextMergeTabInput as f,TextTabInput as v}from"../../common/extHostTypes.js";import{ensureNoDisposablesAreLeakedInTestSuite as q}from"../../../../base/test/common/utils.js";suite("ExtHostEditorTabs",function(){const h={id:"uniquestring",input:{kind:T.TextInput,uri:b.parse("file://abc/def.txt")},isActive:!0,isDirty:!0,isPinned:!0,isPreview:!1,label:"label1"};function r(t){return{...h,...t}}const g=q();test("Ensure empty model throws when accessing active group",function(){const t=new l(u(new class extends n(){}));a.strictEqual(t.tabGroups.all.length,0),a.throws(()=>t.tabGroups.activeTabGroup)}),test("single tab",function(){const t=new l(u(new class extends n(){})),e=r({id:"uniquestring",isActive:!0,isDirty:!0,isPinned:!0,label:"label1"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e]}]),a.strictEqual(t.tabGroups.all.length,1);const[i]=t.tabGroups.all;a.ok(i.activeTab),a.strictEqual(i.tabs.indexOf(i.activeTab),0);{t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e]}]),a.strictEqual(t.tabGroups.all.length,1);const[s]=t.tabGroups.all;a.ok(s.activeTab),a.strictEqual(s.tabs.indexOf(s.activeTab),0)}}),test("Empty tab group",function(){const t=new l(u(new class extends n(){}));t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[]}]),a.strictEqual(t.tabGroups.all.length,1);const[e]=t.tabGroups.all;a.strictEqual(e.activeTab,void 0),a.strictEqual(e.tabs.length,0)}),test("Ensure tabGroup change events fires",function(){const t=new l(u(new class extends n(){}));let e=0;g.add(t.tabGroups.onDidChangeTabGroups(()=>e++)),a.strictEqual(e,0),t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[]}]),a.ok(t.tabGroups.activeTabGroup);const i=t.tabGroups.activeTabGroup;a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(i.tabs.length,0),a.strictEqual(e,1)}),test("Check TabGroupChangeEvent properties",function(){const t=new l(u(new class extends n(){})),e={isActive:!0,viewColumn:0,groupId:12,tabs:[]},i={...e,groupId:13},s=[];g.add(t.tabGroups.onDidChangeTabGroups(p=>s.push(p))),t.$acceptEditorTabModel([e]),a.deepStrictEqual(s,[{changed:[],closed:[],opened:[t.tabGroups.activeTabGroup]}]),s.length=0,t.$acceptEditorTabModel([{...e,isActive:!1},i]),a.deepStrictEqual(s,[{changed:[t.tabGroups.all[0]],closed:[],opened:[t.tabGroups.all[1]]}]),s.length=0,t.$acceptEditorTabModel([e,{...i,isActive:!1}]),a.deepStrictEqual(s,[{changed:t.tabGroups.all,closed:[],opened:[]}]),s.length=0;const o=t.tabGroups.activeTabGroup;t.$acceptEditorTabModel([i]),a.deepStrictEqual(s,[{changed:t.tabGroups.all,closed:[o],opened:[]}])}),test("Ensure reference equality for activeTab and activeGroup",function(){const t=new l(u(new class extends n(){})),e=r({id:"uniquestring",isActive:!0,isDirty:!0,isPinned:!0,label:"label1",editorId:"default"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e]}]),a.strictEqual(t.tabGroups.all.length,1);const[i]=t.tabGroups.all;a.ok(i.activeTab),a.strictEqual(i.tabs.indexOf(i.activeTab),0),a.strictEqual(i.activeTab,i.tabs[0]),a.strictEqual(t.tabGroups.activeTabGroup,i)}),test("TextMergeTabInput surfaces in the UI",function(){const t=new l(u(new class extends n(){})),e=r({input:{kind:T.TextMergeInput,base:b.from({scheme:"test",path:"base"}),input1:b.from({scheme:"test",path:"input1"}),input2:b.from({scheme:"test",path:"input2"}),result:b.from({scheme:"test",path:"result"})}});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e]}]),a.strictEqual(t.tabGroups.all.length,1);const[i]=t.tabGroups.all;a.ok(i.activeTab),a.strictEqual(i.tabs.indexOf(i.activeTab),0),a.ok(i.activeTab.input instanceof f)}),test("Ensure reference stability",function(){const t=new l(u(new class extends n(){})),e=r();t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e]}]);let i=t.tabGroups.all.map(E=>E.tabs).flat();a.strictEqual(i.length,1);const s=i[0];a.ok(s.input instanceof v),a.strictEqual(e.input.kind,T.TextInput);const o=e.input.uri;a.strictEqual(s.input.uri.toString(),b.revive(o).toString()),a.strictEqual(s.isDirty,!0);const p={...e,isDirty:!1};t.$acceptTabOperation({kind:d.TAB_UPDATE,index:0,tabDto:p,groupId:12}),i=t.tabGroups.all.map(E=>E.tabs).flat(),a.strictEqual(i.length,1);const c=i[0];a.ok(s.input instanceof v),a.strictEqual(s.input.uri.toString(),b.revive(o).toString()),a.strictEqual(c.isDirty,!1),a.strictEqual(s===c,!0)}),test("Tab.isActive working",function(){const t=new l(u(new class extends n(){})),e=r({id:"AAA",isActive:!0,isDirty:!0,isPinned:!0,label:"label1",input:{kind:T.TextInput,uri:b.parse("file://abc/AAA.txt")},editorId:"default"}),i=r({id:"BBB",isActive:!1,isDirty:!0,isPinned:!0,label:"label1",input:{kind:T.TextInput,uri:b.parse("file://abc/BBB.txt")},editorId:"default"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e,i]}]);const s=t.tabGroups.all.map(G=>G.tabs).flat();a.strictEqual(s.length,2);const o=t.tabGroups.activeTabGroup?.activeTab;a.ok(o?.input instanceof v),a.strictEqual(e.input.kind,T.TextInput);const p=e.input.uri;a.strictEqual(o?.input?.uri.toString(),b.revive(p)?.toString()),a.strictEqual(o?.isActive,!0),t.$acceptTabOperation({groupId:12,index:1,kind:d.TAB_UPDATE,tabDto:{...i,isActive:!0}});const c=t.tabGroups.activeTabGroup?.activeTab;a.ok(c?.input instanceof v),a.strictEqual(i.input.kind,T.TextInput);const E=i.input.uri;a.strictEqual(c?.input?.uri.toString(),b.revive(E)?.toString()),a.strictEqual(c?.isActive,!0),a.strictEqual(o?.isActive,!1)}),test("vscode.window.tagGroups is immutable",function(){const t=new l(u(new class extends n(){}));a.throws(()=>{t.tabGroups.activeTabGroup=void 0}),a.throws(()=>{t.tabGroups.all.length=0}),a.throws(()=>{t.tabGroups.onDidChangeActiveTabGroup=void 0}),a.throws(()=>{t.tabGroups.onDidChangeTabGroups=void 0})}),test("Ensure close is called with all tab ids",function(){const t=[],e=new l(u(new class extends n(){async $closeTab(o,p){return t.push(o),!0}})),i=r({id:"uniquestring",isActive:!0,isDirty:!0,isPinned:!0,label:"label1",editorId:"default"});e.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[i]}]),a.strictEqual(e.tabGroups.all.length,1);const s=e.tabGroups.activeTabGroup?.activeTab;a.ok(s),e.tabGroups.close(s,!1),a.strictEqual(t.length,1),a.deepStrictEqual(t[0],["uniquestring"]),e.tabGroups.close([s],!1),a.strictEqual(t.length,2),a.deepStrictEqual(t[1],["uniquestring"])}),test("Update tab only sends tab change event",async function(){const t=[],e=new l(u(new class extends n(){async $closeTab(c,E){return t.push(c),!0}})),i=r({id:"uniquestring",isActive:!0,isDirty:!0,isPinned:!0,label:"label1",editorId:"default"});e.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[i]}]),a.strictEqual(e.tabGroups.all.length,1),a.strictEqual(e.tabGroups.all.map(c=>c.tabs).flat().length,1);const s=e.tabGroups.all[0].tabs[0],o=new Promise(c=>g.add(e.tabGroups.onDidChangeTabs(c)));e.$acceptTabOperation({groupId:12,index:0,kind:d.TAB_UPDATE,tabDto:{...i,label:"NEW LABEL"}});const p=(await o).changed[0];a.ok(s===p),a.strictEqual(p.label,"NEW LABEL")}),test("Active tab",function(){const t=new l(u(new class extends n(){})),e=r({id:"uniquestring",isActive:!0,isDirty:!0,isPinned:!0,label:"label1"}),i=r({isActive:!1,id:"uniquestring2"}),s=r({isActive:!1,id:"uniquestring3"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e,i,s]}]),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,3),a.strictEqual(t.tabGroups.activeTabGroup?.activeTab,t.tabGroups.activeTabGroup?.tabs[0]),e.isActive=!1,i.isActive=!0,t.$acceptTabOperation({groupId:12,index:0,kind:d.TAB_UPDATE,tabDto:e}),t.$acceptTabOperation({groupId:12,index:1,kind:d.TAB_UPDATE,tabDto:i}),a.strictEqual(t.tabGroups.activeTabGroup?.activeTab,t.tabGroups.activeTabGroup?.tabs[1]),s.isActive=!0,t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[s]}]),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,1),a.strictEqual(t.tabGroups.activeTabGroup?.activeTab,t.tabGroups.activeTabGroup?.tabs[0]),t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[]}]),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,0),a.strictEqual(t.tabGroups.activeTabGroup?.activeTab,void 0)}),test("Tab operations patches open and close correctly",function(){const t=new l(u(new class extends n(){})),e=r({id:"uniquestring",isActive:!0,label:"label1"}),i=r({isActive:!1,id:"uniquestring2",label:"label2"}),s=r({isActive:!1,id:"uniquestring3",label:"label3"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e,i,s]}]),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,3),t.$acceptTabOperation({groupId:12,index:1,kind:d.TAB_CLOSE,tabDto:i}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,2),t.$acceptTabOperation({groupId:12,index:0,kind:d.TAB_CLOSE,tabDto:e}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,1),s.isActive=!0,t.$acceptTabOperation({groupId:12,index:0,kind:d.TAB_UPDATE,tabDto:s}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,1),a.strictEqual(t.tabGroups.all[0]?.activeTab?.label,"label3"),t.$acceptTabOperation({groupId:12,index:1,kind:d.TAB_OPEN,tabDto:i}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,2),a.strictEqual(t.tabGroups.all[0]?.tabs[1]?.label,"label2")}),test("Tab operations patches move correctly",function(){const t=new l(u(new class extends n(){})),e=r({id:"uniquestring",isActive:!0,label:"label1"}),i=r({isActive:!1,id:"uniquestring2",label:"label2"}),s=r({isActive:!1,id:"uniquestring3",label:"label3"});t.$acceptEditorTabModel([{isActive:!0,viewColumn:0,groupId:12,tabs:[e,i,s]}]),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,3),t.$acceptTabOperation({groupId:12,index:0,oldIndex:1,kind:d.TAB_MOVE,tabDto:i}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,3),a.strictEqual(t.tabGroups.all[0]?.tabs[0]?.label,"label2"),t.$acceptTabOperation({groupId:12,index:1,oldIndex:2,kind:d.TAB_MOVE,tabDto:s}),a.strictEqual(t.tabGroups.all.length,1),a.strictEqual(t.tabGroups.all.map(o=>o.tabs).flat().length,3),a.strictEqual(t.tabGroups.all[0]?.tabs[1]?.label,"label3"),a.strictEqual(t.tabGroups.all[0]?.tabs[0]?.label,"label2"),a.strictEqual(t.tabGroups.all[0]?.tabs[2]?.label,"label1")})});