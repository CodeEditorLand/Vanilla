import i from"assert";import{$ as o}from"../../../../browser/dom.js";import{GridView as E,Orientation as l,Sizing as n}from"../../../../browser/ui/grid/gridview.js";import{nodesToArrays as u,TestView as w}from"./util.js";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"../../../common/utils.js";suite("Gridview",function(){const I=p();function c(){const e=I.add(new E),t=o(".container");return t.style.position="absolute",t.style.width="200px",t.style.height="200px",t.appendChild(e.element),e}test("empty gridview is empty",function(){const e=c();i.deepStrictEqual(u(e.getView()),[])}),test("gridview addView",function(){const e=c(),t=I.add(new w(20,20,20,20));i.throws(()=>e.addView(t,200,[]),"empty location"),i.throws(()=>e.addView(t,200,[1]),"index overflow"),i.throws(()=>e.addView(t,200,[0,0]),"hierarchy overflow");const d=[I.add(new w(20,20,20,20)),I.add(new w(20,20,20,20)),I.add(new w(20,20,20,20))];e.addView(d[0],200,[0]),e.addView(d[1],200,[1]),e.addView(d[2],200,[2]),i.deepStrictEqual(u(e.getView()),d)}),test("gridview addView nested",function(){const e=c(),t=[I.add(new w(20,20,20,20)),[I.add(new w(20,20,20,20)),I.add(new w(20,20,20,20))]];e.addView(t[0],200,[0]),e.addView(t[1][0],200,[1]),e.addView(t[1][1],200,[1,1]),i.deepStrictEqual(u(e.getView()),t)}),test("gridview addView deep nested",function(){const e=c(),t=I.add(new w(20,20,20,20));e.addView(t,200,[0]),i.deepStrictEqual(u(e.getView()),[t]);const d=I.add(new w(20,20,20,20));e.addView(d,200,[1]),i.deepStrictEqual(u(e.getView()),[t,d]);const a=I.add(new w(20,20,20,20));e.addView(a,200,[1,0]),i.deepStrictEqual(u(e.getView()),[t,[a,d]]);const r=I.add(new w(20,20,20,20));e.addView(r,200,[1,0,0]),i.deepStrictEqual(u(e.getView()),[t,[[r,a],d]]);const s=I.add(new w(20,20,20,20));e.addView(s,200,[1,0]),i.deepStrictEqual(u(e.getView()),[t,[s,[r,a],d]]);const S=I.add(new w(20,20,20,20));e.addView(S,200,[2]),i.deepStrictEqual(u(e.getView()),[t,[s,[r,a],d],S]);const V=I.add(new w(20,20,20,20));e.addView(V,200,[1,1]),i.deepStrictEqual(u(e.getView()),[t,[s,V,[r,a],d],S]);const N=I.add(new w(20,20,20,20));e.addView(N,200,[1,1,0]),i.deepStrictEqual(u(e.getView()),[t,[s,[N,V],[r,a],d],S])}),test("simple layout",function(){const e=c();e.layout(800,600);const t=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(t,200,[0]),i.deepStrictEqual(t.size,[800,600]),i.deepStrictEqual(e.getViewSize([0]),{width:800,height:600});const d=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(d,200,[0]),i.deepStrictEqual(t.size,[800,400]),i.deepStrictEqual(e.getViewSize([1]),{width:800,height:400}),i.deepStrictEqual(d.size,[800,200]),i.deepStrictEqual(e.getViewSize([0]),{width:800,height:200});const a=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(a,200,[1,1]),i.deepStrictEqual(t.size,[600,400]),i.deepStrictEqual(e.getViewSize([1,0]),{width:600,height:400}),i.deepStrictEqual(d.size,[800,200]),i.deepStrictEqual(e.getViewSize([0]),{width:800,height:200}),i.deepStrictEqual(a.size,[200,400]),i.deepStrictEqual(e.getViewSize([1,1]),{width:200,height:400});const r=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(r,200,[0,0]),i.deepStrictEqual(t.size,[600,400]),i.deepStrictEqual(e.getViewSize([1,0]),{width:600,height:400}),i.deepStrictEqual(d.size,[600,200]),i.deepStrictEqual(e.getViewSize([0,1]),{width:600,height:200}),i.deepStrictEqual(a.size,[200,400]),i.deepStrictEqual(e.getViewSize([1,1]),{width:200,height:400}),i.deepStrictEqual(r.size,[200,200]),i.deepStrictEqual(e.getViewSize([0,0]),{width:200,height:200});const s=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(s,100,[1,0,1]),i.deepStrictEqual(t.size,[600,300]),i.deepStrictEqual(e.getViewSize([1,0,0]),{width:600,height:300}),i.deepStrictEqual(d.size,[600,200]),i.deepStrictEqual(e.getViewSize([0,1]),{width:600,height:200}),i.deepStrictEqual(a.size,[200,400]),i.deepStrictEqual(e.getViewSize([1,1]),{width:200,height:400}),i.deepStrictEqual(r.size,[200,200]),i.deepStrictEqual(e.getViewSize([0,0]),{width:200,height:200}),i.deepStrictEqual(s.size,[600,100]),i.deepStrictEqual(e.getViewSize([1,0,1]),{width:600,height:100})}),test("simple layout with automatic size distribution",function(){const e=c();e.layout(800,600);const t=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(t,n.Distribute,[0]),i.deepStrictEqual(t.size,[800,600]),i.deepStrictEqual(e.getViewSize([0]),{width:800,height:600});const d=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(d,n.Distribute,[0]),i.deepStrictEqual(t.size,[800,300]),i.deepStrictEqual(d.size,[800,300]);const a=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(a,n.Distribute,[1,1]),i.deepStrictEqual(t.size,[400,300]),i.deepStrictEqual(d.size,[800,300]),i.deepStrictEqual(a.size,[400,300]);const r=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(r,n.Distribute,[0,0]),i.deepStrictEqual(t.size,[400,300]),i.deepStrictEqual(d.size,[400,300]),i.deepStrictEqual(a.size,[400,300]),i.deepStrictEqual(r.size,[400,300]);const s=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(s,n.Distribute,[1,0,1]),i.deepStrictEqual(t.size,[400,150]),i.deepStrictEqual(d.size,[400,300]),i.deepStrictEqual(a.size,[400,300]),i.deepStrictEqual(r.size,[400,300]),i.deepStrictEqual(s.size,[400,150])}),test("addviews before layout call 1",function(){const e=c(),t=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(t,200,[0]);const d=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(d,200,[0]);const a=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(a,200,[1,1]),e.layout(800,600),i.deepStrictEqual(t.size,[400,300]),i.deepStrictEqual(d.size,[800,300]),i.deepStrictEqual(a.size,[400,300])}),test("addviews before layout call 2",function(){const e=c(),t=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(t,200,[0]);const d=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(d,200,[0]);const a=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(a,200,[0,0]),e.layout(800,600),i.deepStrictEqual(t.size,[800,300]),i.deepStrictEqual(d.size,[400,300]),i.deepStrictEqual(a.size,[400,300])}),test("flipping orientation should preserve absolute offsets",function(){const e=c(),t=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(t,200,[0]);const d=I.add(new w(50,Number.POSITIVE_INFINITY,50,Number.POSITIVE_INFINITY));e.addView(d,200,[1]),e.layout(800,600,100,200),i.deepStrictEqual([t.top,t.left],[100,200]),i.deepStrictEqual([d.top,d.left],[400,200]),e.orientation=l.HORIZONTAL,i.deepStrictEqual([t.top,t.left],[100,200]),i.deepStrictEqual([d.top,d.left],[100,600])})});
