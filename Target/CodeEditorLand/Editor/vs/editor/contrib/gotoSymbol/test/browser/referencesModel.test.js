import n from"assert";import{URI as r}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as a}from"../../../../../base/test/common/utils.js";import{Position as o}from"../../../../common/core/position.js";import{Range as i}from"../../../../common/core/range.js";import{ReferencesModel as s}from"../../browser/referencesModel.js";suite("references",function(){a(),test("nearestReference",()=>{const t=new s([{uri:r.file("/out/obj/can"),range:new i(1,1,1,1)},{uri:r.file("/out/obj/can2"),range:new i(1,1,1,1)},{uri:r.file("/src/can"),range:new i(1,1,1,1)}],"FOO");let e=t.nearestReference(r.file("/src/can"),new o(1,1));n.strictEqual(e.uri.path,"/src/can"),e=t.nearestReference(r.file("/src/someOtherFileInSrc"),new o(1,1)),n.strictEqual(e.uri.path,"/src/can"),e=t.nearestReference(r.file("/out/someOtherFile"),new o(1,1)),n.strictEqual(e.uri.path,"/out/obj/can"),e=t.nearestReference(r.file("/out/obj/can2222"),new o(1,1)),n.strictEqual(e.uri.path,"/out/obj/can2")})});