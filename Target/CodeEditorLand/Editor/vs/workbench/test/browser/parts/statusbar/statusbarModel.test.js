import t from"assert";import{StatusbarViewModel as d}from"../../../../browser/parts/statusbar/statusbarModel.js";import{TestStorageService as l}from"../../../common/workbenchTestServices.js";import{StatusbarAlignment as i}from"../../../../services/statusbar/browser/statusbar.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../../base/test/common/utils.js";import{DisposableStore as h}from"../../../../../base/common/lifecycle.js";suite("Workbench status bar model",()=>{const s=new h;teardown(()=>{s.clear()}),test("basics",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));t.strictEqual(e.entries.length,0);const n={id:"3",alignment:i.LEFT,name:"3",priority:{primary:3,secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(n);const r={id:"2",alignment:i.LEFT,name:"2",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(r);const E={id:"1",alignment:i.LEFT,name:"1",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(E);const y={id:"1-right",alignment:i.RIGHT,name:"1-right",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(y),t.strictEqual(e.entries.length,4);const m=e.getEntries(i.LEFT);t.strictEqual(m.length,3),t.strictEqual(e.getEntries(i.RIGHT).length,1),t.strictEqual(m[0].id,"3"),t.strictEqual(m[1].id,"2"),t.strictEqual(m[2].id,"1");const c=e.entries;t.strictEqual(c[0].id,"3"),t.strictEqual(c[1].id,"2"),t.strictEqual(c[2].id,"1"),t.strictEqual(c[3].id,"1-right"),t.ok(e.findEntry(a));let o={id:"",visible:!1};s.add(e.onDidChangeEntryVisibility(g=>{o=g})),t.strictEqual(e.isHidden("1"),!1),e.hide("1"),t.strictEqual(o.id,"1"),t.strictEqual(o.visible,!1),t.strictEqual(e.isHidden("1"),!0),o={id:"",visible:!1},e.show("1"),t.strictEqual(o.id,"1"),t.strictEqual(o.visible,!0),t.strictEqual(e.isHidden("1"),!1),e.remove(n),e.remove(y),t.strictEqual(e.entries.length,2),e.remove(r),e.remove(E),t.strictEqual(e.entries.length,0)}),test("secondary priority used when primary is same",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));t.strictEqual(e.entries.length,0),e.add({id:"1",alignment:i.LEFT,name:"1",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"2",alignment:i.LEFT,name:"2",priority:{primary:1,secondary:2},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"3",alignment:i.LEFT,name:"3",priority:{primary:1,secondary:3},container:a,labelContainer:a,hasCommand:!1});const n=e.entries;t.strictEqual(n[0].id,"3"),t.strictEqual(n[1].id,"2"),t.strictEqual(n[2].id,"1")}),test("insertion order preserved when priorites are the same",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));t.strictEqual(e.entries.length,0),e.add({id:"1",alignment:i.LEFT,name:"1",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"2",alignment:i.LEFT,name:"2",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"3",alignment:i.LEFT,name:"3",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1});const n=e.entries;t.strictEqual(n[0].id,"1"),t.strictEqual(n[1].id,"2"),t.strictEqual(n[2].id,"3")}),test("entry with reference to other entry (existing)",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));e.add({id:"a",alignment:i.LEFT,name:"1",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"b",alignment:i.LEFT,name:"2",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1});let n={id:"c",alignment:i.LEFT,name:"3",priority:{primary:{id:"a",alignment:i.LEFT},secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(n);let r=e.entries;t.strictEqual(r.length,3),t.strictEqual(r[0].id,"c"),t.strictEqual(r[1].id,"a"),t.strictEqual(r[2].id,"b"),e.remove(n),n={id:"c",alignment:i.RIGHT,name:"3",priority:{primary:{id:"a",alignment:i.RIGHT},secondary:1},container:a,labelContainer:a,hasCommand:!1},e.add(n),r=e.entries,t.strictEqual(r.length,3),t.strictEqual(r[0].id,"a"),t.strictEqual(r[1].id,"c"),t.strictEqual(r[2].id,"b")}),test("entry with reference to other entry (nonexistent)",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));e.add({id:"a",alignment:i.LEFT,name:"1",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"b",alignment:i.LEFT,name:"2",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1});let n={id:"c",alignment:i.LEFT,name:"3",priority:{primary:{id:"not-existing",alignment:i.LEFT},secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(n);let r=e.entries;t.strictEqual(r.length,3),t.strictEqual(r[0].id,"a"),t.strictEqual(r[1].id,"b"),t.strictEqual(r[2].id,"c"),e.remove(n),n={id:"c",alignment:i.RIGHT,name:"3",priority:{primary:{id:"not-existing",alignment:i.RIGHT},secondary:1},container:a,labelContainer:a,hasCommand:!1},e.add(n),r=e.entries,t.strictEqual(r.length,3),t.strictEqual(r[0].id,"a"),t.strictEqual(r[1].id,"b"),t.strictEqual(r[2].id,"c")}),test("entry with reference to other entry resorts based on other entry being there or not",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));e.add({id:"a",alignment:i.LEFT,name:"1",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"b",alignment:i.LEFT,name:"2",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"c",alignment:i.LEFT,name:"3",priority:{primary:{id:"not-existing",alignment:i.LEFT},secondary:1},container:a,labelContainer:a,hasCommand:!1});let n=e.entries;t.strictEqual(n.length,3),t.strictEqual(n[0].id,"a"),t.strictEqual(n[1].id,"b"),t.strictEqual(n[2].id,"c");const r={id:"not-existing",alignment:i.LEFT,name:"not-existing",priority:{primary:3,secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(r),n=e.entries,t.strictEqual(n.length,4),t.strictEqual(n[0].id,"c"),t.strictEqual(n[1].id,"not-existing"),t.strictEqual(n[2].id,"a"),t.strictEqual(n[3].id,"b"),e.remove(r),n=e.entries,t.strictEqual(n.length,3),t.strictEqual(n[0].id,"a"),t.strictEqual(n[1].id,"b"),t.strictEqual(n[2].id,"c")}),test("entry with reference to other entry but different alignment does not explode",()=>{const a=document.createElement("div"),e=s.add(new d(s.add(new l)));e.add({id:"1-left",alignment:i.LEFT,name:"1-left",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"2-left",alignment:i.LEFT,name:"2-left",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"1-right",alignment:i.RIGHT,name:"1-right",priority:{primary:2,secondary:1},container:a,labelContainer:a,hasCommand:!1}),e.add({id:"2-right",alignment:i.RIGHT,name:"2-right",priority:{primary:1,secondary:1},container:a,labelContainer:a,hasCommand:!1}),t.strictEqual(e.getEntries(i.LEFT).length,2),t.strictEqual(e.getEntries(i.RIGHT).length,2);const n={id:"relative",alignment:i.LEFT,name:"relative",priority:{primary:{id:"1-right",alignment:i.LEFT},secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(n),t.strictEqual(e.getEntries(i.LEFT).length,3),t.strictEqual(e.getEntries(i.LEFT)[2],n),t.strictEqual(e.getEntries(i.RIGHT).length,2),e.remove(n);const r={id:"relative",alignment:i.RIGHT,name:"relative",priority:{primary:{id:"1-right",alignment:i.LEFT},secondary:1},container:a,labelContainer:a,hasCommand:!1};e.add(r),t.strictEqual(e.getEntries(i.LEFT).length,2),t.strictEqual(e.getEntries(i.RIGHT).length,3)}),u()});