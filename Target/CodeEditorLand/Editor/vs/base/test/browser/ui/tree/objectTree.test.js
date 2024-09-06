import e from"assert";import"../../../../browser/ui/list/list.js";import{CompressibleObjectTreeModel as g}from"../../../../browser/ui/tree/compressedObjectTreeModel.js";import{CompressibleObjectTree as m,ObjectTree as p}from"../../../../browser/ui/tree/objectTree.js";import"../../../../browser/ui/tree/tree.js";import{ensureNoDisposablesAreLeakedInTestSuite as v}from"../../../common/utils.js";import{ObjectTreeModel as q}from"../../../../browser/ui/tree/objectTreeModel.js";function i(o){const u=[...o.querySelectorAll(".monaco-list-row")];return u.sort((d,n)=>parseInt(d.getAttribute("data-index"))-parseInt(n.getAttribute("data-index"))),u.map(d=>d.querySelector(".monaco-tl-contents").textContent)}suite("ObjectTree",function(){suite("TreeNavigator",function(){let n,l=t=>!0;teardown(()=>{n.dispose(),l=t=>!0}),v(),setup(()=>{const t=document.createElement("div");t.style.width="200px",t.style.height="200px";const s=new class{getHeight(){return 20}getTemplateId(){return"default"}},r=new class{templateId="default";renderTemplate(a){return a}renderElement(a,c,E){E.textContent=`${a.element}`}disposeTemplate(){}};n=new p("test",t,s,[r],{filter:{filter:a=>l(a)}}),n.layout(200)}),test("should be able to navigate",()=>{n.setChildren(null,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]);const t=n.navigate();e.strictEqual(t.current(),null),e.strictEqual(t.next(),0),e.strictEqual(t.current(),0),e.strictEqual(t.next(),10),e.strictEqual(t.current(),10),e.strictEqual(t.next(),11),e.strictEqual(t.current(),11),e.strictEqual(t.next(),12),e.strictEqual(t.current(),12),e.strictEqual(t.next(),1),e.strictEqual(t.current(),1),e.strictEqual(t.next(),2),e.strictEqual(t.current(),2),e.strictEqual(t.previous(),1),e.strictEqual(t.current(),1),e.strictEqual(t.previous(),12),e.strictEqual(t.previous(),11),e.strictEqual(t.previous(),10),e.strictEqual(t.previous(),0),e.strictEqual(t.previous(),null),e.strictEqual(t.next(),0),e.strictEqual(t.next(),10),e.strictEqual(t.first(),0),e.strictEqual(t.last(),2)}),test("should skip collapsed nodes",()=>{n.setChildren(null,[{element:0,collapsed:!0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]);const t=n.navigate();e.strictEqual(t.current(),null),e.strictEqual(t.next(),0),e.strictEqual(t.next(),1),e.strictEqual(t.next(),2),e.strictEqual(t.next(),null),e.strictEqual(t.previous(),2),e.strictEqual(t.previous(),1),e.strictEqual(t.previous(),0),e.strictEqual(t.previous(),null),e.strictEqual(t.next(),0),e.strictEqual(t.first(),0),e.strictEqual(t.last(),2)}),test("should skip filtered elements",()=>{l=s=>s%2===0,n.setChildren(null,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]);const t=n.navigate();e.strictEqual(t.current(),null),e.strictEqual(t.next(),0),e.strictEqual(t.next(),10),e.strictEqual(t.next(),12),e.strictEqual(t.next(),2),e.strictEqual(t.next(),null),e.strictEqual(t.previous(),2),e.strictEqual(t.previous(),12),e.strictEqual(t.previous(),10),e.strictEqual(t.previous(),0),e.strictEqual(t.previous(),null),e.strictEqual(t.next(),0),e.strictEqual(t.next(),10),e.strictEqual(t.first(),0),e.strictEqual(t.last(),2)}),test("should be able to start from node",()=>{n.setChildren(null,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]);const t=n.navigate(1);e.strictEqual(t.current(),1),e.strictEqual(t.next(),2),e.strictEqual(t.current(),2),e.strictEqual(t.previous(),1),e.strictEqual(t.current(),1),e.strictEqual(t.previous(),12),e.strictEqual(t.previous(),11),e.strictEqual(t.previous(),10),e.strictEqual(t.previous(),0),e.strictEqual(t.previous(),null),e.strictEqual(t.next(),0),e.strictEqual(t.next(),10),e.strictEqual(t.first(),0),e.strictEqual(t.last(),2)})});class o{getHeight(){return 20}getTemplateId(){return"default"}}class u{templateId="default";renderTemplate(l){return l}renderElement(l,t,s){s.textContent=`${l.element}`}disposeTemplate(){}}class d{getId(l){return`${l%100}`}}test("traits are preserved according to string identity",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=new o,t=new u,s=new d,r=new p("test",n,l,[t],{identityProvider:s});r.layout(200),r.setChildren(null,[{element:0},{element:1},{element:2},{element:3}]),r.setFocus([1]),e.deepStrictEqual(r.getFocus(),[1]),r.setChildren(null,[{element:100},{element:101},{element:102},{element:103}]),e.deepStrictEqual(r.getFocus(),[101])}),test("swap model",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=new o,t=new u,s=new d,r=new p("test",n,l,[t],{identityProvider:s});r.layout(200),r.setChildren(null,[{element:1},{element:2},{element:3},{element:4}]),e.deepStrictEqual(i(n),["1","2","3","4"]);const a=r.getModel(),c=new q("test",{});r.setModel(c),e.deepStrictEqual(i(n),[]),c.setChildren(null,[{element:1,children:[{element:11}]},{element:2}]),e.deepStrictEqual(i(n),["1","11","2"]),r.setChildren(11,[{element:111,children:[{element:1111}]},{element:112}]),e.deepStrictEqual(i(n),["1","11","111","1111","112","2"]),r.setModel(a),e.deepStrictEqual(i(n),["1","2","3","4"])}),test("swap model events",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=new o,t=new u,s=new d,r=new p("test",n,l,[t],{identityProvider:s});r.layout(200),r.setChildren(null,[{element:1},{element:2},{element:3},{element:4}]),e.deepStrictEqual(i(n),["1","2","3","4"]);const a=new q("test",{});a.setChildren(null,[{element:1,children:[{element:11}]},{element:2}]);let c=!1,E=!1,h=!1;r.onDidChangeModel(()=>{c=!0}),r.onDidChangeRenderNodeCount(()=>{E=!0}),r.onDidChangeCollapseState(()=>{h=!0}),r.setModel(a),e.strictEqual(c,!0),e.strictEqual(E,!1),e.strictEqual(h,!1)}),test.skip("swap model TreeError uses updated user",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=new o,t=new u,s=new p("test",n,l,[t],{});s.layout(200),s.setChildren(null,[{element:1}]);const r=new q("NEW_USER_NAME",{});s.setModel(r);try{s.getViewState()}catch(a){e.strictEqual(a.message.includes("NEW_USER_NAME"),!0);return}e.fail("Expected error")})}),suite("CompressibleObjectTree",function(){class o{getHeight(){return 20}getTemplateId(){return"default"}}class u{templateId="default";renderTemplate(l){return l}renderElement(l,t,s){s.textContent=`${l.element}`}renderCompressedElements(l,t,s){s.textContent=`${l.element.elements.join("/")}`}disposeTemplate(){}}const d=v();test("empty",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px",d.add(new m("test",n,new o,[new u])).layout(200),e.strictEqual(i(n).length,0)}),test("simple",function(){const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=d.add(new m("test",n,new o,[new u]));l.layout(200),l.setChildren(null,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]),e.deepStrictEqual(i(n),["0","10","11","12","1","2"])}),test("compressed",()=>{const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=d.add(new m("test",n,new o,[new u]));l.layout(200),l.setChildren(null,[{element:1,children:[{element:11,children:[{element:111,children:[{element:1111},{element:1112},{element:1113}]}]}]}]),e.deepStrictEqual(i(n),["1/11/111","1111","1112","1113"]),l.setChildren(11,[{element:111},{element:112},{element:113}]),e.deepStrictEqual(i(n),["1/11","111","112","113"]),l.setChildren(113,[{element:1131}]),e.deepStrictEqual(i(n),["1/11","111","112","113/1131"]),l.setChildren(1131,[{element:1132}]),e.deepStrictEqual(i(n),["1/11","111","112","113/1131/1132"]),l.setChildren(1131,[{element:1132},{element:1133}]),e.deepStrictEqual(i(n),["1/11","111","112","113/1131","1132","1133"])}),test("enableCompression",()=>{const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=d.add(new m("test",n,new o,[new u]));l.layout(200),l.setChildren(null,[{element:1,children:[{element:11,children:[{element:111,children:[{element:1111},{element:1112},{element:1113}]}]}]}]),e.deepStrictEqual(i(n),["1/11/111","1111","1112","1113"]),l.updateOptions({compressionEnabled:!1}),e.deepStrictEqual(i(n),["1","11","111","1111","1112","1113"]),l.updateOptions({compressionEnabled:!0}),e.deepStrictEqual(i(n),["1/11/111","1111","1112","1113"])}),test("swapModel",()=>{const n=document.createElement("div");n.style.width="200px",n.style.height="200px";const l=d.add(new m("test",n,new o,[new u]));l.layout(200),l.setChildren(null,[{element:1,children:[{element:11,children:[{element:111,children:[{element:1111},{element:1112},{element:1113}]}]}]}]),e.deepStrictEqual(i(n),["1/11/111","1111","1112","1113"]);const t=new g("test",{});t.setChildren(null,[{element:1,children:[{element:11}]},{element:2,children:[{element:21,children:[{element:211},{element:212},{element:213}]}]}]),l.setModel(t),e.deepStrictEqual(i(n),["1/11","2/21","211","212","213"]),l.setChildren(11,[{element:111},{element:112},{element:113}]),e.deepStrictEqual(i(n),["1/11","111","112","113","2/21","211","212","213"])})});
