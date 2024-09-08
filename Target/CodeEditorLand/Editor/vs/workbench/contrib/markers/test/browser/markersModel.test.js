import e from"assert";import{URI as f}from"../../../../../base/common/uri.js";import{MarkerSeverity as m}from"../../../../../platform/markers/common/markers.js";import{MarkersModel as O,Marker as q,RelatedInformation as W}from"../../browser/markersModel.js";import{groupBy as j}from"../../../../../base/common/collections.js";import{ensureNoDisposablesAreLeakedInTestSuite as J}from"../../../../../base/test/common/utils.js";class E extends O{constructor(k){super();const g=j(k,d=>d.resource.toString());Object.keys(g).forEach(d=>{const p=g[d],o=p[0].resource;this.setResourceMarkers([[o,p]])})}}suite("MarkersModel Test",()=>{J(),test("marker ids are unique",function(){const r=k(3),t=k(3),s=g(3),a=g(3),n=new E([r,t,s,a]).resourceMarkers[0].markers;e.notStrictEqual(n[0].id,n[1].id),e.notStrictEqual(n[0].id,n[2].id),e.notStrictEqual(n[0].id,n[3].id),e.notStrictEqual(n[1].id,n[2].id),e.notStrictEqual(n[1].id,n[3].id),e.notStrictEqual(n[2].id,n[3].id)}),test("sort palces resources with no errors at the end",function(){const r=o("a/res1",m.Warning),t=o("a/res2"),s=o("res4"),a=o("b/res3"),c=o("res4"),n=o("c/res2",m.Info),i=new E([r,t,s,a,c,n]).resourceMarkers;e.strictEqual(5,i.length),e.ok(l(i[0],"a/res2")),e.ok(l(i[1],"b/res3")),e.ok(l(i[2],"res4")),e.ok(l(i[3],"a/res1")),e.ok(l(i[4],"c/res2"))}),test("sort resources by file path",function(){const r=o("a/res1"),t=o("a/res2"),s=o("res4"),a=o("b/res3"),c=o("res4"),n=o("c/res2"),i=new E([r,t,s,a,c,n]).resourceMarkers;e.strictEqual(5,i.length),e.ok(l(i[0],"a/res1")),e.ok(l(i[1],"a/res2")),e.ok(l(i[2],"b/res3")),e.ok(l(i[3],"c/res2")),e.ok(l(i[4],"res4"))}),test("sort markers by severity, line and column",function(){const r=g(8,1,9,3),t=g(3),s=k(8,1,9,3),a=p(5),c=d(8,1,8,4,"ab"),n=k(3),b=k(5),i=d(5),M=k(8,1,8,4,"ab"),S=k(10),I=k(8,1,8,4,"ba"),h=p(3),R=g(5),w=k(4),y=k(8,2,8,4),u=new E([r,t,s,a,c,n,b,i,M,S,I,h,R,w,y]).resourceMarkers[0].markers;e.strictEqual(u[0].marker,n),e.strictEqual(u[1].marker,w),e.strictEqual(u[2].marker,b),e.strictEqual(u[3].marker,M),e.strictEqual(u[4].marker,I),e.strictEqual(u[5].marker,s),e.strictEqual(u[6].marker,y),e.strictEqual(u[7].marker,S),e.strictEqual(u[8].marker,t),e.strictEqual(u[9].marker,R),e.strictEqual(u[10].marker,r),e.strictEqual(u[11].marker,i),e.strictEqual(u[12].marker,c),e.strictEqual(u[13].marker,h),e.strictEqual(u[14].marker,a)}),test("toString()",()=>{let r=o("a/res1");r.code="1234",e.strictEqual(JSON.stringify({...r,resource:r.resource.path},null,"	"),new q("1",r).toString()),r=o("a/res2",m.Warning),e.strictEqual(JSON.stringify({...r,resource:r.resource.path},null,"	"),new q("2",r).toString()),r=o("a/res2",m.Info,1,2,1,8,"Info",""),e.strictEqual(JSON.stringify({...r,resource:r.resource.path},null,"	"),new q("3",r).toString()),r=o("a/res2",m.Hint,1,2,1,8,"Ignore message","Ignore"),e.strictEqual(JSON.stringify({...r,resource:r.resource.path},null,"	"),new q("4",r).toString()),r=o("a/res2",m.Warning,1,2,1,8,"Warning message","",[{startLineNumber:2,startColumn:5,endLineNumber:2,endColumn:10,message:"some info",resource:f.file("a/res3")}]);const t=new q("5",r,null);t.relatedInformation=r.relatedInformation.map(s=>new W("6",r,s)),e.strictEqual(JSON.stringify({...r,resource:r.resource.path,relatedInformation:r.relatedInformation.map(s=>({...s,resource:s.resource.path}))},null,"	"),t.toString())}),test("Markers for same-document but different fragment",function(){const r=new E([k(1)]);e.strictEqual(r.total,1);const t=f.parse("foo://test/path/file"),s=f.parse("foo://test/path/file#1"),a=f.parse("foo://test/path/file#two");r.setResourceMarkers([[t,[{...o(),resource:s},{...o(),resource:a}]]]),e.strictEqual(r.total,3);const c=r.getResourceMarkers(t),n=r.getResourceMarkers(s),b=r.getResourceMarkers(a);e.ok(c===n),e.ok(c===b),r.setResourceMarkers([[t,[{...o(),resource:a}]]]),e.strictEqual(r.total,2)}),test("Problems are no sorted correctly #99135",function(){const r=new E([]);e.strictEqual(r.total,0);const t=f.parse("foo://test/path/file"),s=f.parse("foo://test/path/file#1"),a=f.parse("foo://test/path/file#2");r.setResourceMarkers([[s,[{...o(),resource:s},{...o(void 0,m.Warning),resource:s}]]]),r.setResourceMarkers([[a,[{...o(),resource:a}]]]),e.strictEqual(r.total,3);const c=r.getResourceMarkers(t)?.markers;e.deepStrictEqual(c?.map(n=>n.marker.severity),[m.Error,m.Error,m.Warning]),e.deepStrictEqual(c?.map(n=>n.marker.resource.toString()),[s.toString(),a.toString(),s.toString()])});function l(r,t){return r.resource.toString()===f.file(t).toString()}function k(r=10,t=5,s=r+1,a=t+5,c="some message"){return o("some resource",m.Error,r,t,s,a,c)}function g(r=10,t=5,s=r+1,a=t+5,c="some message"){return o("some resource",m.Warning,r,t,s,a,c)}function d(r=10,t=5,s=r+1,a=t+5,c="some message"){return o("some resource",m.Info,r,t,s,a,c)}function p(r=10,t=5,s=r+1,a=t+5,c="some message"){return o("some resource",m.Hint,r,t,s,a,c)}function o(r="some resource",t=m.Error,s=10,a=5,c=s+1,n=a+5,b="some message",i="tslint",M){return{owner:"someOwner",resource:f.file(r),severity:t,message:b,startLineNumber:s,startColumn:a,endLineNumber:c,endColumn:n,source:i,relatedInformation:M}}});
