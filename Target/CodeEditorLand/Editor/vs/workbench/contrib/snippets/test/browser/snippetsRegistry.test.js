import g from"assert";import{getNonWhitespacePrefix as o}from"../../browser/snippetsService.js";import{Position as r}from"../../../../../editor/common/core/position.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../../base/test/common/utils.js";suite("getNonWhitespacePrefix",()=>{m();function e(t,i,n){const s=o({getLineContent:a=>t},new r(1,i));g.strictEqual(s,n)}test("empty line",()=>{e("",1,"")}),test("singleWordLine",()=>{e("something",1,""),e("something",2,"s"),e("something",3,"so"),e("something",4,"som"),e("something",5,"some"),e("something",6,"somet"),e("something",7,"someth"),e("something",8,"somethi"),e("something",9,"somethin"),e("something",10,"something")}),test("two word line",()=>{e("something interesting",1,""),e("something interesting",2,"s"),e("something interesting",3,"so"),e("something interesting",4,"som"),e("something interesting",5,"some"),e("something interesting",6,"somet"),e("something interesting",7,"someth"),e("something interesting",8,"somethi"),e("something interesting",9,"somethin"),e("something interesting",10,"something"),e("something interesting",11,""),e("something interesting",12,"i"),e("something interesting",13,"in"),e("something interesting",14,"int"),e("something interesting",15,"inte"),e("something interesting",16,"inter"),e("something interesting",17,"intere"),e("something interesting",18,"interes"),e("something interesting",19,"interest"),e("something interesting",20,"interesti"),e("something interesting",21,"interestin"),e("something interesting",22,"interesting")}),test("many separators",()=>{e("something interesting",22,"interesting"),e("something	interesting",22,"interesting"),e("something\finteresting",22,"interesting"),e("something\vinteresting",22,"interesting"),e("something\xA0interesting",22,"interesting"),e("something\u2000interesting",22,"interesting"),e("something\u2028interesting",22,"interesting"),e("something\u3000interesting",22,"interesting"),e("something\uFEFFinteresting",22,"interesting")})});
