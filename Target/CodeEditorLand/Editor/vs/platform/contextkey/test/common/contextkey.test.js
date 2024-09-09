import t from"assert";import{isLinux as b,isMacintosh as d,isWindows as f}from"../../../../base/common/platform.js";import{ensureNoDisposablesAreLeakedInTestSuite as q}from"../../../../base/test/common/utils.js";import{ContextKeyExpr as e,implies as c}from"../../common/contextkey.js";function u(a){return{getValue:s=>a[s]}}suite("ContextKeyExpr",()=>{q(),test("ContextKeyExpr.equals",()=>{const a=e.and(e.has("a1"),e.and(e.has("and.a")),e.has("a2"),e.regex("d3",/d.*/),e.regex("d4",/\*\*3*/),e.equals("b1","bb1"),e.equals("b2","bb2"),e.notEquals("c1","cc1"),e.notEquals("c2","cc2"),e.not("d1"),e.not("d2")),s=e.and(e.equals("b2","bb2"),e.notEquals("c1","cc1"),e.not("d1"),e.regex("d4",/\*\*3*/),e.notEquals("c2","cc2"),e.has("a2"),e.equals("b1","bb1"),e.regex("d3",/d.*/),e.has("a1"),e.and(e.equals("and.a",!0)),e.not("d2"));t(a.equals(s),"expressions should be equal")}),test("issue #134942: Equals in comparator expressions",()=>{function a(s,l){const r=e.deserialize(l);t.ok(s),t.ok(r),t.strictEqual(s.equals(r),!0,l)}a(e.greater("value",0),"value > 0"),a(e.greaterEquals("value",0),"value >= 0"),a(e.smaller("value",0),"value < 0"),a(e.smallerEquals("value",0),"value <= 0")}),test("normalize",()=>{const a=e.equals("key1",!0),s=e.notEquals("key1",!1),l=e.equals("key1",!1),r=e.notEquals("key1",!0);t.ok(a.equals(e.has("key1"))),t.ok(s.equals(e.has("key1"))),t.ok(l.equals(e.not("key1"))),t.ok(r.equals(e.not("key1")))}),test("evaluate",()=>{const a=u({a:!0,b:!1,c:"5",d:"d"});function s(r,i){const n=e.deserialize(r);t.strictEqual(n.evaluate(a),i,r)}function l(r,i){s(r,!!i),s(r+" == true",!!i),s(r+" != true",!i),s(r+" == false",!i),s(r+" != false",!!i),s(r+" == 5",i=="5"),s(r+" != 5",i!="5"),s("!"+r,!i),s(r+" =~ /d.*/",/d.*/.test(i)),s(r+" =~ /D/i",/D/i.test(i))}l("a",!0),l("b",!1),l("c","5"),l("d","d"),l("z",void 0),s("true",!0),s("false",!1),s("a && !b",!0),s("a && b",!1),s("a && !b && c == 5",!0),s("d =~ /e.*/",!1),s("b && a || a",!0),s("a || b",!0),s("b || b",!1),s("b && a || a && b",!1)}),test("negate",()=>{function a(s,l){const r=e.deserialize(s).negate().serialize();t.strictEqual(r,l)}a("true","false"),a("false","true"),a("a","!a"),a("a && b || c","!a && !c || !b && !c"),a("a && b || c || d","!a && !c && !d || !b && !c && !d"),a("!a && !b || !c && !d","a && c || a && d || b && c || b && d"),a("!a && !b || !c && !d || !e && !f","a && c && e || a && c && f || a && d && e || a && d && f || b && c && e || b && c && f || b && d && e || b && d && f")}),test("false, true",()=>{function a(s,l){const r=e.deserialize(s).serialize();t.strictEqual(r,l)}a("true","true"),a("!true","false"),a("false","false"),a("!false","true"),a("a && true","a"),a("a && false","false"),a("a || true","true"),a("a || false","a"),a("isMac",d?"true":"false"),a("isLinux",b?"true":"false"),a("isWindows",f?"true":"false")}),test("issue #101015: distribute OR",()=>{function a(s,l,r){const i=e.deserialize(s),n=e.deserialize(l),o=e.and(i,n)?.serialize();t.strictEqual(o,r)}a("a","b","a && b"),a("a || b","c","a && c || b && c"),a("a || b","c || d","a && c || a && d || b && c || b && d"),a("a || b","c && d","a && c && d || b && c && d"),a("a || b","c && d || e","a && e || b && e || a && c && d || b && c && d")}),test("ContextKeyInExpr",()=>{const a=e.deserialize("a in b");t.strictEqual(a.evaluate(u({a:3,b:[3,2,1]})),!0),t.strictEqual(a.evaluate(u({a:3,b:[1,2,3]})),!0),t.strictEqual(a.evaluate(u({a:3,b:[1,2]})),!1),t.strictEqual(a.evaluate(u({a:3})),!1),t.strictEqual(a.evaluate(u({a:3,b:null})),!1),t.strictEqual(a.evaluate(u({a:"x",b:["x"]})),!0),t.strictEqual(a.evaluate(u({a:"x",b:["y"]})),!1),t.strictEqual(a.evaluate(u({a:"x",b:{}})),!1),t.strictEqual(a.evaluate(u({a:"x",b:{x:!1}})),!0),t.strictEqual(a.evaluate(u({a:"x",b:{x:!0}})),!0),t.strictEqual(a.evaluate(u({a:"prototype",b:{}})),!1)}),test("ContextKeyNotInExpr",()=>{const a=e.deserialize("a not in b");t.strictEqual(a.evaluate(u({a:3,b:[3,2,1]})),!1),t.strictEqual(a.evaluate(u({a:3,b:[1,2,3]})),!1),t.strictEqual(a.evaluate(u({a:3,b:[1,2]})),!0),t.strictEqual(a.evaluate(u({a:3})),!0),t.strictEqual(a.evaluate(u({a:3,b:null})),!0),t.strictEqual(a.evaluate(u({a:"x",b:["x"]})),!1),t.strictEqual(a.evaluate(u({a:"x",b:["y"]})),!0),t.strictEqual(a.evaluate(u({a:"x",b:{}})),!0),t.strictEqual(a.evaluate(u({a:"x",b:{x:!1}})),!1),t.strictEqual(a.evaluate(u({a:"x",b:{x:!0}})),!1),t.strictEqual(a.evaluate(u({a:"prototype",b:{}})),!0)}),test("issue #106524: distributing AND should normalize",()=>{const a=e.and(e.or(e.has("a"),e.has("b")),e.has("c")),s=e.or(e.and(e.has("a"),e.has("c")),e.and(e.has("b"),e.has("c")));t.strictEqual(a.equals(s),!0)}),test("issue #129625: Removes duplicated terms in OR expressions",()=>{const a=e.or(e.has("A"),e.has("B"),e.has("A"));t.strictEqual(a.serialize(),"A || B")}),test("Resolves true constant OR expressions",()=>{const a=e.or(e.has("A"),e.not("A"));t.strictEqual(a.serialize(),"true")}),test("Resolves false constant AND expressions",()=>{const a=e.and(e.has("A"),e.not("A"));t.strictEqual(a.serialize(),"false")}),test("issue #129625: Removes duplicated terms in AND expressions",()=>{const a=e.and(e.has("A"),e.has("B"),e.has("A"));t.strictEqual(a.serialize(),"A && B")}),test("issue #129625: Remove duplicated terms when negating",()=>{const a=e.and(e.has("A"),e.or(e.has("B1"),e.has("B2")));t.strictEqual(a.serialize(),"A && B1 || A && B2"),t.strictEqual(a.negate().serialize(),"!A || !A && !B1 || !A && !B2 || !B1 && !B2"),t.strictEqual(a.negate().negate().serialize(),"A && B1 || A && B2"),t.strictEqual(a.negate().negate().negate().serialize(),"!A || !A && !B1 || !A && !B2 || !B1 && !B2")}),test("issue #129625: remove redundant terms in OR expressions",()=>{function a(s,l){const r=e.deserialize(s),i=e.deserialize(l);return c(r,i)}t.strictEqual(a("a && b","a"),!0),t.strictEqual(a("a","a && b"),!1)}),test("implies",()=>{function a(s,l){const r=e.deserialize(s),i=e.deserialize(l);return c(r,i)}t.strictEqual(a("a","a"),!0),t.strictEqual(a("a","a || b"),!0),t.strictEqual(a("a","a && b"),!1),t.strictEqual(a("a","a && b || a && c"),!1),t.strictEqual(a("a && b","a"),!0),t.strictEqual(a("a && b","b"),!0),t.strictEqual(a("a && b","a && b || c"),!0),t.strictEqual(a("a || b","a || c"),!1),t.strictEqual(a("a || b","a || b"),!0),t.strictEqual(a("a && b","a && b"),!0),t.strictEqual(a("a || b","a || b || c"),!0),t.strictEqual(a("c && a && b","c && a"),!0)}),test("Greater, GreaterEquals, Smaller, SmallerEquals evaluate",()=>{function a(s,l,r){const i=e.deserialize(s);t.strictEqual(i.evaluate(u(l)),r)}a("a > 1",{},!1),a("a > 1",{a:0},!1),a("a > 1",{a:1},!1),a("a > 1",{a:2},!0),a("a > 1",{a:"0"},!1),a("a > 1",{a:"1"},!1),a("a > 1",{a:"2"},!0),a("a > 1",{a:"a"},!1),a("a > 10",{a:2},!1),a("a > 10",{a:11},!0),a("a > 10",{a:"11"},!0),a("a > 10",{a:"2"},!1),a("a > 10",{a:"11"},!0),a("a > 1.1",{a:1},!1),a("a > 1.1",{a:2},!0),a("a > 1.1",{a:11},!0),a("a > 1.1",{a:"1.1"},!1),a("a > 1.1",{a:"2"},!0),a("a > 1.1",{a:"11"},!0),a("a > b",{a:"b"},!1),a("a > b",{a:"c"},!1),a("a > b",{a:1e3},!1),a("a >= 2",{a:"1"},!1),a("a >= 2",{a:"2"},!0),a("a >= 2",{a:"3"},!0),a("a < 2",{a:"1"},!0),a("a < 2",{a:"2"},!1),a("a < 2",{a:"3"},!1),a("a <= 2",{a:"1"},!0),a("a <= 2",{a:"2"},!0),a("a <= 2",{a:"3"},!1)}),test("Greater, GreaterEquals, Smaller, SmallerEquals negate",()=>{function a(s,l){const i=e.deserialize(s).negate();t.strictEqual(i.serialize(),l)}a("a > 1","a <= 1"),a("a > 1.1","a <= 1.1"),a("a > b","a <= b"),a("a >= 1","a < 1"),a("a >= 1.1","a < 1.1"),a("a >= b","a < b"),a("a < 1","a >= 1"),a("a < 1.1","a >= 1.1"),a("a < b","a >= b"),a("a <= 1","a > 1"),a("a <= 1.1","a > 1.1"),a("a <= b","a > b")}),test("issue #111899: context keys can use `<` or `>` ",()=>{const a=e.deserialize("editorTextFocus && vim.active && vim.use<C-r>");t.ok(a.equals(e.and(e.has("editorTextFocus"),e.has("vim.active"),e.has("vim.use<C-r>"))))})});
