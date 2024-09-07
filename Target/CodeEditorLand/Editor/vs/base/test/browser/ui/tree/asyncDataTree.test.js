import e from"assert";import"../../../../browser/ui/list/list.js";import{AsyncDataTree as u,CompressibleAsyncDataTree as L}from"../../../../browser/ui/tree/asyncDataTree.js";import"../../../../browser/ui/tree/compressedObjectTreeModel.js";import"../../../../browser/ui/tree/objectTree.js";import"../../../../browser/ui/tree/tree.js";import{timeout as S}from"../../../../common/async.js";import{Iterable as I}from"../../../../common/iterator.js";import{ensureNoDisposablesAreLeakedInTestSuite as T}from"../../../common/utils.js";function v(r,t){if(r.id===t)return r;if(r.children)for(const n of r.children){const i=v(n,t);if(i)return i}}class h{templateId="default";renderTemplate(t){return t}renderElement(t,n,i){i.textContent=t.element.id+(t.element.suffix||"")}disposeTemplate(t){}renderCompressedElements(t,n,i,o){const l=[];for(const a of t.element.elements)l.push(a.id+(a.suffix||""));i.textContent=l.join("/")}}class p{getId(t){return t.id}}class m{getHeight(){return 20}getTemplateId(t){return"default"}}class q{hasChildren(t){return!!t.children&&t.children.length>0}getChildren(t){return Promise.resolve(t.children||[])}}class c{constructor(t){this.root=t}get(t){const n=v(this.root,t);if(!n)throw new Error("element not found");return n}}suite("AsyncDataTree",function(){const r=T();test("Collapse state should be preserved across refresh calls",async()=>{const t=document.createElement("div"),n=new c({id:"root",children:[{id:"a"}]}),i=r.add(new u("test",t,new m,[new h],new q,{identityProvider:new p}));i.layout(200),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,0),await i.setInput(n.root),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1);const o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie");e(!o.classList.contains("collapsible")),e(!o.classList.contains("collapsed")),n.get("a").children=[{id:"aa"},{id:"ab"},{id:"ac"}],await i.updateChildren(n.root),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1),await i.expand(n.get("a")),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,4),n.get("a").children=[],await i.updateChildren(n.root),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1)}),test("issue #68648",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(s){return!!s.children&&s.children.length>0}getChildren(s){return n.push(s.id),Promise.resolve(s.children||[])}},o=new c({id:"root",children:[{id:"a"}]}),l=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));l.layout(200),await l.setInput(o.root),e.deepStrictEqual(n,["root"]);let a=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie");e(!a.classList.contains("collapsible")),e(!a.classList.contains("collapsed")),e(l.getNode().children[0].collapsed),o.get("a").children=[{id:"aa"},{id:"ab"},{id:"ac"}],await l.updateChildren(o.root),e.deepStrictEqual(n,["root","root"]),a=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(a.classList.contains("collapsible")),e(a.classList.contains("collapsed")),e(l.getNode().children[0].collapsed),o.get("a").children=[],await l.updateChildren(o.root),e.deepStrictEqual(n,["root","root","root"]),a=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(!a.classList.contains("collapsible")),e(!a.classList.contains("collapsed")),e(l.getNode().children[0].collapsed),o.get("a").children=[{id:"aa"},{id:"ab"},{id:"ac"}],await l.updateChildren(o.root),e.deepStrictEqual(n,["root","root","root","root"]),a=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(a.classList.contains("collapsible")),e(a.classList.contains("collapsed")),e(l.getNode().children[0].collapsed)}),test("issue #67722 - once resolved, refreshed collapsed nodes should only get children when expanded",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(a){return!!a.children&&a.children.length>0}getChildren(a){return n.push(a.id),Promise.resolve(a.children||[])}},o=new c({id:"root",children:[{id:"a",children:[{id:"aa"},{id:"ab"},{id:"ac"}]}]}),l=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));l.layout(200),await l.setInput(o.root),e(l.getNode(o.get("a")).collapsed),e.deepStrictEqual(n,["root"]),await l.expand(o.get("a")),e(!l.getNode(o.get("a")).collapsed),e.deepStrictEqual(n,["root","a"]),l.collapse(o.get("a")),e(l.getNode(o.get("a")).collapsed),e.deepStrictEqual(n,["root","a"]),await l.updateChildren(),e(l.getNode(o.get("a")).collapsed),e.deepStrictEqual(n,["root","a","root"],"a should not be refreshed, since it' collapsed")}),test("resolved collapsed nodes which lose children should lose twistie as well",async()=>{const t=document.createElement("div"),n=new c({id:"root",children:[{id:"a",children:[{id:"aa"},{id:"ab"},{id:"ac"}]}]}),i=r.add(new u("test",t,new m,[new h],new q,{identityProvider:new p}));i.layout(200),await i.setInput(n.root),await i.expand(n.get("a"));let o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie");e(o.classList.contains("collapsible")),e(!o.classList.contains("collapsed")),e(!i.getNode(n.get("a")).collapsed),i.collapse(n.get("a")),n.get("a").children=[],await i.updateChildren(n.root),o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(!o.classList.contains("collapsible")),e(!o.classList.contains("collapsed")),e(i.getNode(n.get("a")).collapsed)}),test("issue #192422 - resolved collapsed nodes with changed children don't show old children",async()=>{const t=document.createElement("div");let n=!1;const i=new class{hasChildren(g){return!!g.children&&g.children.length>0}async getChildren(g){if(g.id==="a")if(!n)n=!0;else return[{id:"c"}];return g.children||[]}},o=new c({id:"root",children:[{id:"a",children:[{id:"b"}]}]}),l=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));l.layout(200),await l.setInput(o.root);const a=o.get("a"),s=l.getNode(a);e(s.collapsed),await l.expand(a),e(!s.collapsed),e.equal(s.children.length,1),e.equal(s.children[0].element.id,"b");const d=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(d?.textContent,"b"),l.collapse(a),e(s.collapsed),await l.updateChildren(a);const E=o.get("a"),w=l.getNode(a);e(w.collapsed),e.equal(w.children.length,0);let C=!1;const f=l.onDidChangeCollapseState(g=>{const x=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(x,void 0),C=!0});await l.expand(E),f.dispose(),e(C);const b=l.getNode(a);e(!b.collapsed),e.equal(b.children.length,1),e.equal(b.children[0].element.id,"c");const y=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(y?.textContent,"c")}),test("issue #192422 - resolved collapsed nodes with unchanged children immediately show children",async()=>{const t=document.createElement("div"),n=new class{hasChildren(y){return!!y.children&&y.children.length>0}async getChildren(y){return y.children||[]}},i=new c({id:"root",children:[{id:"a",children:[{id:"b"}]}]}),o=r.add(new u("test",t,new m,[new h],n,{identityProvider:new p}));o.layout(200),await o.setInput(i.root);const l=i.get("a"),a=o.getNode(l);e(a.collapsed),await o.expand(l),e(!a.collapsed),e.equal(a.children.length,1),e.equal(a.children[0].element.id,"b");const s=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(s?.textContent,"b"),o.collapse(l),e(a.collapsed);const d=i.get("a"),E=o.getNode(l);e(E.collapsed),e.equal(E.children.length,1);let w=!1;const C=o.onDidChangeCollapseState(y=>{const g=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(g?.textContent,"b"),w=!0});await o.expand(d),C.dispose(),e(w);const f=o.getNode(l);e(!f.collapsed),e.equal(f.children.length,1),e.equal(f.children[0].element.id,"b");const b=t.querySelector(".monaco-list-row:nth-child(2)");e.equal(b?.textContent,"b")}),test("support default collapse state per element",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(a){return!!a.children&&a.children.length>0}getChildren(a){return n.push(a.id),Promise.resolve(a.children||[])}},o=new c({id:"root",children:[{id:"a",children:[{id:"aa"},{id:"ab"},{id:"ac"}]}]}),l=r.add(new u("test",t,new m,[new h],i,{collapseByDefault:a=>a.id!=="a"}));l.layout(200),await l.setInput(o.root),e(!l.getNode(o.get("a")).collapsed),e.deepStrictEqual(n,["root","a"])}),test("issue #80098 - concurrent refresh and expand",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(w){return!!w.children&&w.children.length>0}getChildren(w){return new Promise(C=>n.push(()=>C(w.children||[])))}},o=new c({id:"root",children:[{id:"a",children:[{id:"aa"}]}]}),l=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));l.layout(200);const a=l.setInput(o.root);n.pop()(),await a;const s=l.updateChildren(o.get("a")),d=l.expand(o.get("a"));e.strictEqual(n.length,1,"expand(a) still hasn't called getChildren(a)"),n.pop()(),e.strictEqual(n.length,0,"no pending getChildren calls"),await s,e.strictEqual(n.length,0,"expand(a) should not have forced a second refresh");const E=await d;e.strictEqual(E,!0,"expand(a) should be done")}),test("issue #80098 - first expand should call getChildren",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(E){return!!E.children&&E.children.length>0}getChildren(E){return new Promise(w=>n.push(()=>w(E.children||[])))}},o=new c({id:"root",children:[{id:"a",children:[{id:"aa"}]}]}),l=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));l.layout(200);const a=l.setInput(o.root);n.pop()(),await a;const s=l.expand(o.get("a"));e.strictEqual(n.length,1,"expand(a) should've called getChildren(a)");let d=await Promise.race([s.then(()=>"expand"),S(1).then(()=>"timeout")]);e.strictEqual(d,"timeout","expand(a) should not be yet done"),n.pop()(),e.strictEqual(n.length,0,"no pending getChildren calls"),d=await Promise.race([s.then(()=>"expand"),S(1).then(()=>"timeout")]),e.strictEqual(d,"expand","expand(a) should now be done")}),test("issue #78388 - tree should react to hasChildren toggles",async()=>{const t=document.createElement("div"),n=new c({id:"root",children:[{id:"a"}]}),i=r.add(new u("test",t,new m,[new h],new q,{identityProvider:new p}));i.layout(200),await i.setInput(n.root),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1);let o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie");e(!o.classList.contains("collapsible")),e(!o.classList.contains("collapsed")),n.get("a").children=[{id:"aa"}],await i.updateChildren(n.get("a"),!1),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1),o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(o.classList.contains("collapsible")),e(o.classList.contains("collapsed")),n.get("a").children=[],await i.updateChildren(n.get("a"),!1),e.strictEqual(t.querySelectorAll(".monaco-list-row").length,1),o=t.querySelector(".monaco-list-row:first-child .monaco-tl-twistie"),e(!o.classList.contains("collapsible")),e(!o.classList.contains("collapsed"))}),test("issues #84569, #82629 - rerender",async()=>{const t=document.createElement("div"),n=new c({id:"root",children:[{id:"a",children:[{id:"b",suffix:"1"}]}]}),i=r.add(new u("test",t,new m,[new h],new q,{identityProvider:new p}));i.layout(200),await i.setInput(n.root),await i.expand(n.get("a")),e.deepStrictEqual(Array.from(t.querySelectorAll(".monaco-list-row")).map(a=>a.textContent),["a","b1"]);const o=n.get("a"),l=n.get("b");o.children?.splice(0,1,{id:"b",suffix:"2"}),await Promise.all([i.updateChildren(o,!0,!0),i.updateChildren(l,!0,!0)]),e.deepStrictEqual(Array.from(t.querySelectorAll(".monaco-list-row")).map(a=>a.textContent),["a","b2"])}),test("issue #199264 - dispose during render",async()=>{const t=document.createElement("div"),n=new c({id:"root",children:[{id:"a",children:[{id:"aa"},{id:"ab"},{id:"ac"}]}]}),i=new c({id:"root",children:[{id:"a",children:[{id:"aa"},{id:"ab"},{id:"ac"}]}]}),o=r.add(new u("test",t,new m,[new h],new q,{identityProvider:new p}));o.layout(200),await o.setInput(n.root);const l=o.setInput(i.root);o.dispose(),await l,e.strictEqual(t.innerHTML,"")}),test("issue #121567",async()=>{const t=document.createElement("div"),n=[],i=new class{hasChildren(d){return!!d.children&&d.children.length>0}async getChildren(d){return n.push(d),d.children??I.empty()}},o=new c({id:"root",children:[{id:"a",children:[{id:"aa"}]}]}),l=o.get("a"),a=r.add(new u("test",t,new m,[new h],i,{identityProvider:new p}));a.layout(200),await a.setInput(o.root),e.strictEqual(n.length,1,"There should be a single getChildren call for the root"),e(a.isCollapsible(l),"a is collapsible"),e(a.isCollapsed(l),"a is collapsed"),await a.updateChildren(l,!1),e.strictEqual(n.length,1,"There should be no changes to the calls list, since a was collapsed"),e(a.isCollapsible(l),"a is collapsible"),e(a.isCollapsed(l),"a is collapsed");const s=l.children;l.children=[],await a.updateChildren(l,!1),e.strictEqual(n.length,1,"There should still be no changes to the calls list, since a was collapsed"),e(!a.isCollapsible(l),"a is no longer collapsible"),e(a.isCollapsed(l),"a is collapsed"),l.children=s,await a.updateChildren(l,!1),e.strictEqual(n.length,1,"There should still be no changes to the calls list, since a was collapsed"),e(a.isCollapsible(l),"a is collapsible again"),e(a.isCollapsed(l),"a is collapsed"),await a.expand(l),e.strictEqual(n.length,2,"Finally, there should be a getChildren call for a"),e(a.isCollapsible(l),"a is still collapsible"),e(!a.isCollapsed(l),"a is expanded")}),test("issue #199441",async()=>{const t=document.createElement("div"),n=new class{hasChildren(s){return!!s.children&&s.children.length>0}async getChildren(s){return s.children??I.empty()}},i=new class{isIncompressible(s){return!n.hasChildren(s)}},o=new c({id:"root",children:[{id:"a",children:[{id:"b",children:[{id:"b.txt"}]}]}]}),l=s=>!1,a=r.add(new L("test",t,new m,i,[new h],n,{identityProvider:new p,collapseByDefault:l}));a.layout(200),await a.setInput(o.root),e.deepStrictEqual(Array.from(t.querySelectorAll(".monaco-list-row")).map(s=>s.textContent),["a/b","b.txt"]),o.get("a").children.push({id:"c",children:[{id:"c.txt"}]}),await a.updateChildren(o.root,!0),e.deepStrictEqual(Array.from(t.querySelectorAll(".monaco-list-row")).map(s=>s.textContent),["a","b","b.txt","c","c.txt"])})});