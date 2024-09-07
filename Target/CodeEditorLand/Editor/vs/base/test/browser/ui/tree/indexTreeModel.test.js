import e from"assert";import{IndexTreeModel as d}from"../../../../browser/ui/tree/indexTreeModel.js";import{TreeVisibility as a}from"../../../../browser/ui/tree/tree.js";import{timeout as L}from"../../../../common/async.js";import{ensureNoDisposablesAreLeakedInTestSuite as V}from"../../../common/utils.js";import{DisposableStore as j}from"../../../../common/lifecycle.js";function r(o,l){return l.onDidSpliceRenderedNodes(({start:t,deleteCount:s,elements:i})=>{o.splice(t,s,...i)})}function n(o){return o.map(l=>l.element)}function I(o){return o.children?.length?{e:o.element,children:o.children.map(I)}:o.element}const T={getId:o=>String(o)};function m(o){o({}),o({diffIdentityProvider:T})}suite("IndexTreeModel",()=>{V();const o=new j;teardown(()=>{o.clear()}),test("ctor",()=>{const l=[],t=new d("test",-1);e(t),e.strictEqual(l.length,0)}),test("insert",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0},{element:1},{element:2}],l),e.deepStrictEqual(t.length,3),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,1),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,1),e.deepStrictEqual(t[2].element,2),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,1),i.dispose()})),test("deep insert",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]),e.deepStrictEqual(t.length,6),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,10),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,2),e.deepStrictEqual(t[2].element,11),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,2),e.deepStrictEqual(t[3].element,12),e.deepStrictEqual(t[3].collapsed,!1),e.deepStrictEqual(t[3].depth,2),e.deepStrictEqual(t[4].element,1),e.deepStrictEqual(t[4].collapsed,!1),e.deepStrictEqual(t[4].depth,1),e.deepStrictEqual(t[5].element,2),e.deepStrictEqual(t[5].collapsed,!1),e.deepStrictEqual(t[5].depth,1),i.dispose()})),test("deep insert collapsed",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,collapsed:!0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,3),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!0),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,1),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,1),e.deepStrictEqual(t[2].element,2),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,1),i.dispose()})),test("delete",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0},{element:1},{element:2}],l),e.deepStrictEqual(t.length,3),s.splice([1],1,void 0,l),e.deepStrictEqual(t.length,2),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,2),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,1),s.splice([0],2,void 0,l),e.deepStrictEqual(t.length,0),i.dispose()})),test("nested delete",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,6),s.splice([1],2,void 0,l),e.deepStrictEqual(t.length,4),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,10),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,2),e.deepStrictEqual(t[2].element,11),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,2),e.deepStrictEqual(t[3].element,12),e.deepStrictEqual(t[3].collapsed,!1),e.deepStrictEqual(t[3].depth,2),i.dispose()})),test("deep delete",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,6),s.splice([0],1,void 0,l),e.deepStrictEqual(t.length,2),e.deepStrictEqual(t[0].element,1),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,2),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,1),i.dispose()})),test("smart splice deep",()=>{const l=[],t=new d("test",-1),s=r(l,t);t.splice([0],0,[{element:0},{element:1},{element:2},{element:3}],{diffIdentityProvider:T}),e.deepStrictEqual(l.filter(i=>i.depth===1).map(I),[0,1,2,3]),t.splice([0],3,[{element:-.5},{element:0,children:[{element:.1}]},{element:1},{element:2,children:[{element:2.1},{element:2.2,children:[{element:2.21}]}]}],{diffIdentityProvider:T,diffDepth:1/0}),e.deepStrictEqual(l.filter(i=>i.depth===1).map(I),[-.5,{e:0,children:[.1]},1,{e:2,children:[2.1,{e:2.2,children:[2.21]}]},3]),s.dispose()}),test("hidden delete",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,collapsed:!0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,3),s.splice([0,1],1,void 0,l),e.deepStrictEqual(t.length,3),s.splice([0,0],2,void 0,l),e.deepStrictEqual(t.length,3),i.dispose()})),test("collapse",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,6),s.setCollapsed([0],!0),e.deepStrictEqual(t.length,3),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!0),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,1),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,1),e.deepStrictEqual(t[2].element,2),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,1),i.dispose()})),test("expand",()=>m(l=>{const t=[],s=new d("test",-1),i=r(t,s);s.splice([0],0,[{element:0,collapsed:!0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}],l),e.deepStrictEqual(t.length,3),s.expandTo([0,1]),e.deepStrictEqual(t.length,6),e.deepStrictEqual(t[0].element,0),e.deepStrictEqual(t[0].collapsed,!1),e.deepStrictEqual(t[0].depth,1),e.deepStrictEqual(t[1].element,10),e.deepStrictEqual(t[1].collapsed,!1),e.deepStrictEqual(t[1].depth,2),e.deepStrictEqual(t[2].element,11),e.deepStrictEqual(t[2].collapsed,!1),e.deepStrictEqual(t[2].depth,2),e.deepStrictEqual(t[3].element,12),e.deepStrictEqual(t[3].collapsed,!1),e.deepStrictEqual(t[3].depth,2),e.deepStrictEqual(t[4].element,1),e.deepStrictEqual(t[4].collapsed,!1),e.deepStrictEqual(t[4].depth,1),e.deepStrictEqual(t[5].element,2),e.deepStrictEqual(t[5].collapsed,!1),e.deepStrictEqual(t[5].depth,1),i.dispose()})),test("smart diff consistency",()=>{for(let c=0;c<500;c++){const p=[],x={diffIdentityProvider:{getId:q=>String(q)}},w=new d("test",-1),v=r(p,w),N=[],h=[];let y=0;for(let q=Math.random()*9+1;q>0;q--){const E=Math.floor(Math.random()*p.length),b=Math.ceil(Math.random()*(p.length-E)),C=Math.floor(Math.random()*5+1),S=[];for(let u=0;u<C;u++){const g=y++;S.push({element:g,children:[]})}if(Math.random()<.5){const u=p.slice(E,E+Math.floor(b/2));S.push(...u.map(({element:g})=>({element:g,children:[]})))}w.splice([E],b,S,x),h.splice(E,b,...S.map(u=>u.element));const f=p.map(u=>u.element);N.push(`splice(${E}, ${b}, [${S.map(u=>u.element).join(", ")}]) -> ${f.join(", ")}`),e.deepStrictEqual(h,f,`Expected ${f.join(", ")} to equal ${h.join(", ")}. Steps:

${N.join(`
`)}`)}v.dispose()}}),test("collapse should recursively adjust visible count",()=>{const l=[],t=new d("test",-1),s=r(l,t);t.splice([0],0,[{element:1,children:[{element:11,children:[{element:111}]}]},{element:2,children:[{element:21}]}]),e.deepStrictEqual(l.length,5),e.deepStrictEqual(n(l),[1,11,111,2,21]),t.setCollapsed([0,0],!0),e.deepStrictEqual(l.length,4),e.deepStrictEqual(n(l),[1,11,2,21]),t.setCollapsed([1],!0),e.deepStrictEqual(l.length,3),e.deepStrictEqual(n(l),[1,11,2]),s.dispose()}),test("setCollapsible",()=>{const l=[],t=new d("test",-1),s=r(l,t);t.splice([0],0,[{element:0,children:[{element:10}]}]),e.deepStrictEqual(l.length,2),t.setCollapsible([0],!1),e.deepStrictEqual(l.length,2),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!1),e.deepStrictEqual(l[0].collapsed,!1),e.deepStrictEqual(l[1].element,10),e.deepStrictEqual(l[1].collapsible,!1),e.deepStrictEqual(l[1].collapsed,!1),e.deepStrictEqual(t.setCollapsed([0],!0),!1),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!1),e.deepStrictEqual(l[0].collapsed,!1),e.deepStrictEqual(l[1].element,10),e.deepStrictEqual(l[1].collapsible,!1),e.deepStrictEqual(l[1].collapsed,!1),e.deepStrictEqual(t.setCollapsed([0],!1),!1),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!1),e.deepStrictEqual(l[0].collapsed,!1),e.deepStrictEqual(l[1].element,10),e.deepStrictEqual(l[1].collapsible,!1),e.deepStrictEqual(l[1].collapsed,!1),t.setCollapsible([0],!0),e.deepStrictEqual(l.length,2),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!0),e.deepStrictEqual(l[0].collapsed,!1),e.deepStrictEqual(l[1].element,10),e.deepStrictEqual(l[1].collapsible,!1),e.deepStrictEqual(l[1].collapsed,!1),e.deepStrictEqual(t.setCollapsed([0],!0),!0),e.deepStrictEqual(l.length,1),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!0),e.deepStrictEqual(l[0].collapsed,!0),e.deepStrictEqual(t.setCollapsed([0],!1),!0),e.deepStrictEqual(l[0].element,0),e.deepStrictEqual(l[0].collapsible,!0),e.deepStrictEqual(l[0].collapsed,!1),e.deepStrictEqual(l[1].element,10),e.deepStrictEqual(l[1].collapsible,!1),e.deepStrictEqual(l[1].collapsed,!1),s.dispose()}),test("simple filter",()=>{const l=[],t=new class{filter(c){return c%2===0?a.Visible:a.Hidden}},s=new d("test",-1,{filter:t}),i=r(l,s);s.splice([0],0,[{element:0,children:[{element:1},{element:2},{element:3},{element:4},{element:5},{element:6},{element:7}]}]),e.deepStrictEqual(l.length,4),e.deepStrictEqual(n(l),[0,2,4,6]),s.setCollapsed([0],!0),e.deepStrictEqual(n(l),[0]),s.setCollapsed([0],!1),e.deepStrictEqual(n(l),[0,2,4,6]),i.dispose()}),test("recursive filter on initial model",()=>{const l=[],t=new class{filter(c){return c===0?a.Recurse:a.Hidden}},s=new d("test",-1,{filter:t}),i=r(l,s);s.splice([0],0,[{element:0,children:[{element:1},{element:2}]}]),e.deepStrictEqual(n(l),[]),i.dispose()}),test("refilter",()=>{const l=[];let t=!1;const s=new class{filter(p){return!t||p%2===0?a.Visible:a.Hidden}},i=new d("test",-1,{filter:s}),c=r(l,i);i.splice([0],0,[{element:0,children:[{element:1},{element:2},{element:3},{element:4},{element:5},{element:6},{element:7}]}]),e.deepStrictEqual(n(l),[0,1,2,3,4,5,6,7]),i.refilter(),e.deepStrictEqual(n(l),[0,1,2,3,4,5,6,7]),t=!0,i.refilter(),e.deepStrictEqual(n(l),[0,2,4,6]),t=!1,i.refilter(),e.deepStrictEqual(n(l),[0,1,2,3,4,5,6,7]),c.dispose()}),test("recursive filter",()=>{const l=[];let t=new RegExp("");const s=new class{filter(p){return t.test(p)?a.Visible:a.Recurse}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"vscode",children:[{element:".build"},{element:"git"},{element:"github",children:[{element:"calendar.yml"},{element:"endgame"},{element:"build.js"}]},{element:"build",children:[{element:"lib"},{element:"gulpfile.js"}]}]}]),e.deepStrictEqual(l.length,10),t=/build/,i.refilter(),e.deepStrictEqual(n(l),["vscode",".build","github","build.js","build"]),i.setCollapsed([0],!0),e.deepStrictEqual(n(l),["vscode"]),i.setCollapsed([0],!1),e.deepStrictEqual(n(l),["vscode",".build","github","build.js","build"]),c.dispose()}),test("recursive filter updates when children change (#133272)",async()=>{const l=[];let t="";const s=new class{filter(p){return p.includes(t)?a.Visible:a.Recurse}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"a",children:[{element:"b"}]}]),e.deepStrictEqual(n(l),["a","b"]),t="visible",i.refilter(),e.deepStrictEqual(n(l),[]),i.splice([0,0,0],0,[{element:"visible",children:[]}]),await L(0),e.deepStrictEqual(n(l),["a","b","visible"]),c.dispose()}),test("recursive filter with collapse",()=>{const l=[];let t=new RegExp("");const s=new class{filter(p){return t.test(p)?a.Visible:a.Recurse}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"vscode",children:[{element:".build"},{element:"git"},{element:"github",children:[{element:"calendar.yml"},{element:"endgame"},{element:"build.js"}]},{element:"build",children:[{element:"lib"},{element:"gulpfile.js"}]}]}]),e.deepStrictEqual(l.length,10),t=/gulp/,i.refilter(),e.deepStrictEqual(n(l),["vscode","build","gulpfile.js"]),i.setCollapsed([0,3],!0),e.deepStrictEqual(n(l),["vscode","build"]),i.setCollapsed([0],!0),e.deepStrictEqual(n(l),["vscode"]),c.dispose()}),test("recursive filter while collapsed",()=>{const l=[];let t=new RegExp("");const s=new class{filter(p){return t.test(p)?a.Visible:a.Recurse}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"vscode",collapsed:!0,children:[{element:".build"},{element:"git"},{element:"github",children:[{element:"calendar.yml"},{element:"endgame"},{element:"build.js"}]},{element:"build",children:[{element:"lib"},{element:"gulpfile.js"}]}]}]),e.deepStrictEqual(n(l),["vscode"]),t=/gulp/,i.refilter(),e.deepStrictEqual(n(l),["vscode"]),i.setCollapsed([0],!1),e.deepStrictEqual(n(l),["vscode","build","gulpfile.js"]),i.setCollapsed([0],!0),e.deepStrictEqual(n(l),["vscode"]),t=new RegExp(""),i.refilter(),e.deepStrictEqual(n(l),["vscode"]),i.setCollapsed([0],!1),e.deepStrictEqual(l.length,10),c.dispose()}),suite("getNodeLocation",()=>{test("simple",()=>{const l=[],t=new d("test",-1),s=r(l,t);t.splice([0],0,[{element:0,children:[{element:10},{element:11},{element:12}]},{element:1},{element:2}]),e.deepStrictEqual(t.getNodeLocation(l[0]),[0]),e.deepStrictEqual(t.getNodeLocation(l[1]),[0,0]),e.deepStrictEqual(t.getNodeLocation(l[2]),[0,1]),e.deepStrictEqual(t.getNodeLocation(l[3]),[0,2]),e.deepStrictEqual(t.getNodeLocation(l[4]),[1]),e.deepStrictEqual(t.getNodeLocation(l[5]),[2]),s.dispose()}),test("with filter",()=>{const l=[],t=new class{filter(c){return c%2===0?a.Visible:a.Hidden}},s=new d("test",-1,{filter:t}),i=r(l,s);s.splice([0],0,[{element:0,children:[{element:1},{element:2},{element:3},{element:4},{element:5},{element:6},{element:7}]}]),e.deepStrictEqual(s.getNodeLocation(l[0]),[0]),e.deepStrictEqual(s.getNodeLocation(l[1]),[0,1]),e.deepStrictEqual(s.getNodeLocation(l[2]),[0,3]),e.deepStrictEqual(s.getNodeLocation(l[3]),[0,5]),i.dispose()})}),test("refilter with filtered out nodes",()=>{const l=[];let t=new RegExp("");const s=new class{filter(p){return t.test(p)}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"silver"},{element:"gold"},{element:"platinum"}]),e.deepStrictEqual(n(l),["silver","gold","platinum"]),t=/platinum/,i.refilter(),e.deepStrictEqual(n(l),["platinum"]),i.splice([0],Number.POSITIVE_INFINITY,[{element:"silver"},{element:"gold"},{element:"platinum"}]),e.deepStrictEqual(n(l),["platinum"]),i.refilter(),e.deepStrictEqual(n(l),["platinum"]),c.dispose()}),test("explicit hidden nodes should have renderNodeCount == 0, issue #83211",()=>{const l=[];let t=new RegExp("");const s=new class{filter(p){return t.test(p)}},i=new d("test","root",{filter:s}),c=r(l,i);i.splice([0],0,[{element:"a",children:[{element:"aa"}]},{element:"b",children:[{element:"bb"}]}]),e.deepStrictEqual(n(l),["a","aa","b","bb"]),e.deepStrictEqual(i.getListIndex([0]),0),e.deepStrictEqual(i.getListIndex([0,0]),1),e.deepStrictEqual(i.getListIndex([1]),2),e.deepStrictEqual(i.getListIndex([1,0]),3),t=/b/,i.refilter(),e.deepStrictEqual(n(l),["b","bb"]),e.deepStrictEqual(i.getListIndex([0]),-1),e.deepStrictEqual(i.getListIndex([0,0]),-1),e.deepStrictEqual(i.getListIndex([1]),0),e.deepStrictEqual(i.getListIndex([1,0]),1),c.dispose()})});