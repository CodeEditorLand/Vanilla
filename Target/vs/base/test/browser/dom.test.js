import t from"assert";import{$ as n,asCssValueWithDefault as E,h as e,multibyteAwareBtoa as f,trackAttributes as g,copyAttributes as w,disposableWindowInterval as v,getWindows as y,getWindowsCount as I,getWindowId as A,getWindowById as L,hasWindow as D,getWindow as h,getDocument as N,isHTMLElement as d,SafeTriangle as q}from"../../browser/dom.js";import{ensureCodeWindow as C,isAuxiliaryWindow as V,mainWindow as r}from"../../browser/window.js";import{DeferredPromise as W,timeout as b}from"../../common/async.js";import{runWithFakedTimers as p}from"../common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as k}from"../common/utils.js";suite("dom",()=>{test("hasClass",()=>{const s=document.createElement("div");s.className="foobar boo far",t(s.classList.contains("foobar")),t(s.classList.contains("boo")),t(s.classList.contains("far")),t(!s.classList.contains("bar")),t(!s.classList.contains("foo")),t(!s.classList.contains(""))}),test("removeClass",()=>{let s=document.createElement("div");s.className="foobar boo far",s.classList.remove("boo"),t(s.classList.contains("far")),t(!s.classList.contains("boo")),t(s.classList.contains("foobar")),t.strictEqual(s.className,"foobar far"),s=document.createElement("div"),s.className="foobar boo far",s.classList.remove("far"),t(!s.classList.contains("far")),t(s.classList.contains("boo")),t(s.classList.contains("foobar")),t.strictEqual(s.className,"foobar boo"),s.classList.remove("boo"),t(!s.classList.contains("far")),t(!s.classList.contains("boo")),t(s.classList.contains("foobar")),t.strictEqual(s.className,"foobar"),s.classList.remove("foobar"),t(!s.classList.contains("far")),t(!s.classList.contains("boo")),t(!s.classList.contains("foobar")),t.strictEqual(s.className,"")}),test("removeClass should consider hyphens",function(){const s=document.createElement("div");s.classList.add("foo-bar"),s.classList.add("bar"),t(s.classList.contains("foo-bar")),t(s.classList.contains("bar")),s.classList.remove("bar"),t(s.classList.contains("foo-bar")),t(!s.classList.contains("bar")),s.classList.remove("foo-bar"),t(!s.classList.contains("foo-bar")),t(!s.classList.contains("bar"))}),test("multibyteAwareBtoa",()=>{t.ok(f("hello world").length>0),t.ok(f("\u5E73\u4EEE\u540D").length>0),t.ok(f(new Array(1e5).fill("vs").join("")).length>0)}),suite("$",()=>{test("should build simple nodes",()=>{const s=n("div");t(s),t(d(s)),t.strictEqual(s.tagName,"DIV"),t(!s.firstChild)}),test("should build nodes with id",()=>{const s=n("div#foo");t(s),t(d(s)),t.strictEqual(s.tagName,"DIV"),t.strictEqual(s.id,"foo")}),test("should build nodes with class-name",()=>{const s=n("div.foo");t(s),t(d(s)),t.strictEqual(s.tagName,"DIV"),t.strictEqual(s.className,"foo")}),test("should build nodes with attributes",()=>{let s=n("div",{class:"test"});t.strictEqual(s.className,"test"),s=n("div",void 0),t.strictEqual(s.className,"")}),test("should build nodes with children",()=>{let s=n("div",void 0,n("span",{id:"demospan"}));const a=s.firstChild;t.strictEqual(a.tagName,"SPAN"),t.strictEqual(a.id,"demospan"),s=n("div",void 0,"hello"),t.strictEqual(s.firstChild&&s.firstChild.textContent,"hello")}),test("should build nodes with text children",()=>{const a=n("div",void 0,"foobar").firstChild;t.strictEqual(a.tagName,void 0),t.strictEqual(a.textContent,"foobar")})}),suite("h",()=>{test("should build simple nodes",()=>{const s=e("div");t(d(s.root)),t.strictEqual(s.root.tagName,"DIV");const a=e("span");t(d(a.root)),t.strictEqual(a.root.tagName,"SPAN");const i=e("img");t(d(i.root)),t.strictEqual(i.root.tagName,"IMG")}),test("should handle ids and classes",()=>{const s=e("div#myid");t.strictEqual(s.root.tagName,"DIV"),t.strictEqual(s.root.id,"myid");const a=e("div.a");t.strictEqual(a.root.tagName,"DIV"),t.strictEqual(a.root.classList.length,1),t(a.root.classList.contains("a"));const i=e("div.a.b.c");t.strictEqual(i.root.tagName,"DIV"),t.strictEqual(i.root.classList.length,3),t(i.root.classList.contains("a")),t(i.root.classList.contains("b")),t(i.root.classList.contains("c"));const o=e("div#myid.a.b.c");t.strictEqual(o.root.tagName,"DIV"),t.strictEqual(o.root.id,"myid"),t.strictEqual(o.root.classList.length,3),t(o.root.classList.contains("a")),t(o.root.classList.contains("b")),t(o.root.classList.contains("c"));const l=e("span#myid");t.strictEqual(l.root.tagName,"SPAN"),t.strictEqual(l.root.id,"myid");const c=e("span.a");t.strictEqual(c.root.tagName,"SPAN"),t.strictEqual(c.root.classList.length,1),t(c.root.classList.contains("a"));const m=e("span.a.b.c");t.strictEqual(m.root.tagName,"SPAN"),t.strictEqual(m.root.classList.length,3),t(m.root.classList.contains("a")),t(m.root.classList.contains("b")),t(m.root.classList.contains("c"));const u=e("span#myid.a.b.c");t.strictEqual(u.root.tagName,"SPAN"),t.strictEqual(u.root.id,"myid"),t.strictEqual(u.root.classList.length,3),t(u.root.classList.contains("a")),t(u.root.classList.contains("b")),t(u.root.classList.contains("c"))}),test("should implicitly handle ids and classes",()=>{const s=e("#myid");t.strictEqual(s.root.tagName,"DIV"),t.strictEqual(s.root.id,"myid");const a=e(".a");t.strictEqual(a.root.tagName,"DIV"),t.strictEqual(a.root.classList.length,1),t(a.root.classList.contains("a"));const i=e(".a.b.c");t.strictEqual(i.root.tagName,"DIV"),t.strictEqual(i.root.classList.length,3),t(i.root.classList.contains("a")),t(i.root.classList.contains("b")),t(i.root.classList.contains("c"));const o=e("#myid.a.b.c");t.strictEqual(o.root.tagName,"DIV"),t.strictEqual(o.root.id,"myid"),t.strictEqual(o.root.classList.length,3),t(o.root.classList.contains("a")),t(o.root.classList.contains("b")),t(o.root.classList.contains("c"))}),test("should handle @ identifiers",()=>{const s=e("@el");t.strictEqual(s.root,s.el),t.strictEqual(s.el.tagName,"DIV");const a=e("div@el");t.strictEqual(a.root,a.el),t.strictEqual(a.el.tagName,"DIV");const i=e("#myid@el");t.strictEqual(i.root,i.el),t.strictEqual(i.el.tagName,"DIV"),t.strictEqual(i.root.id,"myid");const o=e("div#myid@el");t.strictEqual(o.root,o.el),t.strictEqual(o.el.tagName,"DIV"),t.strictEqual(o.root.id,"myid");const l=e(".a@el");t.strictEqual(l.root,l.el),t.strictEqual(l.el.tagName,"DIV"),t.strictEqual(l.root.classList.length,1),t(l.root.classList.contains("a"));const c=e("div.a@el");t.strictEqual(c.root,c.el),t.strictEqual(c.el.tagName,"DIV"),t.strictEqual(c.root.classList.length,1),t(c.root.classList.contains("a"))})}),test("should recurse",()=>{const s=e("div.code-view",[e("div.title@title"),e("div.container",[e("div.gutter@gutterDiv"),e("span@editor")])]);t.strictEqual(s.root.tagName,"DIV"),t.strictEqual(s.root.className,"code-view"),t.strictEqual(s.root.childElementCount,2),t.strictEqual(s.root.firstElementChild,s.title),t.strictEqual(s.title.tagName,"DIV"),t.strictEqual(s.title.className,"title"),t.strictEqual(s.title.childElementCount,0),t.strictEqual(s.gutterDiv.tagName,"DIV"),t.strictEqual(s.gutterDiv.className,"gutter"),t.strictEqual(s.gutterDiv.childElementCount,0),t.strictEqual(s.editor.tagName,"SPAN"),t.strictEqual(s.editor.className,""),t.strictEqual(s.editor.childElementCount,0)}),test("cssValueWithDefault",()=>{t.strictEqual(E("red","blue"),"red"),t.strictEqual(E(void 0,"blue"),"blue"),t.strictEqual(E("var(--my-var)","blue"),"var(--my-var, blue)"),t.strictEqual(E("var(--my-var, red)","blue"),"var(--my-var, red)"),t.strictEqual(E("var(--my-var, var(--my-var2))","blue"),"var(--my-var, var(--my-var2, blue))")}),test("copyAttributes",()=>{const s=document.createElement("div");s.setAttribute("foo","bar"),s.setAttribute("bar","foo");const a=document.createElement("div");w(s,a),t.strictEqual(a.getAttribute("foo"),"bar"),t.strictEqual(a.getAttribute("bar"),"foo")}),test("trackAttributes (unfiltered)",async()=>p({useFakeTimers:!0},async()=>{const s=document.createElement("div"),a=document.createElement("div"),i=g(s,a);s.setAttribute("foo","bar"),s.setAttribute("bar","foo"),await b(1),t.strictEqual(a.getAttribute("foo"),"bar"),t.strictEqual(a.getAttribute("bar"),"foo"),i.dispose()})),test("trackAttributes (filtered)",async()=>p({useFakeTimers:!0},async()=>{const s=document.createElement("div"),a=document.createElement("div"),i=g(s,a,["foo"]);s.setAttribute("foo","bar"),s.setAttribute("bar","foo"),await b(1),t.strictEqual(a.getAttribute("foo"),"bar"),t.strictEqual(a.getAttribute("bar"),null),i.dispose()})),test("window utilities",()=>{const s=Array.from(y());t.strictEqual(s.length,1),t.strictEqual(I(),1);const a=A(r);t.ok(typeof a=="number"),t.strictEqual(L(a)?.window,r),t.strictEqual(L(void 0,!0).window,r),t.strictEqual(D(a),!0),t.strictEqual(V(r),!1),C(r,1),t.ok(typeof r.vscodeWindowId=="number");const i=document.createElement("div");t.strictEqual(h(i),r),t.strictEqual(N(i),r.document);const o=document.createEvent("MouseEvent");t.strictEqual(h(o),r),t.strictEqual(N(o),r.document)}),suite("disposableWindowInterval",()=>{test("basics",async()=>{let s=0;const a=new W,i=v(r,()=>(s++,s===3?(a.complete(void 0),!0):!1),0,10);await a.p,t.strictEqual(s,3),i.dispose()}),test("iterations",async()=>{let s=0;const a=v(r,()=>(s++,!1),0,0);await b(5),t.strictEqual(s,0),a.dispose()}),test("dispose",async()=>{let s=0;v(r,()=>(s++,!1),0,10).dispose(),await b(5),t.strictEqual(s,0)})}),suite("SafeTriangle",()=>{const s=(a,i,o,l)=>({getBoundingClientRect:()=>({left:a,right:i,top:o,bottom:l})});test("works",()=>{const a=new q(0,0,s(10,20,10,20));t.strictEqual(a.contains(5,5),!0),t.strictEqual(a.contains(15,5),!1),t.strictEqual(a.contains(25,5),!1),t.strictEqual(a.contains(5,15),!1),t.strictEqual(a.contains(15,15),!0),t.strictEqual(a.contains(25,15),!1),t.strictEqual(a.contains(5,25),!1),t.strictEqual(a.contains(15,25),!1),t.strictEqual(a.contains(25,25),!1)}),test("other dirations",()=>{const a=new q(30,30,s(10,20,10,20));t.strictEqual(a.contains(25,25),!0);const i=new q(0,30,s(10,20,10,20));t.strictEqual(i.contains(5,25),!0);const o=new q(30,0,s(10,20,10,20));t.strictEqual(o.contains(25,5),!0)})}),k()});
