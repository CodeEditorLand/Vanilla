import c from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"../../../../../base/test/common/utils.js";import{AstNodeKind as d,ListAstNode as r,TextAstNode as s}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/ast.js";import{concat23Trees as f}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees.js";import{toLength as o}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";suite("Bracket Pair Colorizer - mergeItems",()=>{p(),test("Clone",()=>{const t=r.create([new s(o(1,1)),new s(o(1,1))]);c.ok(l(t,t.deepClone()))});function l(t,e){if(t.length!==e.length||t.children.length!==e.children.length)return!1;for(let n=0;n<t.children.length;n++)if(!l(t.children[n],e.children[n]))return!1;return t.missingOpeningBracketIds.equals(e.missingOpeningBracketIds)?t.kind===d.Pair&&e.kind===d.Pair?!0:t.kind===e.kind:!1}function i(t){const e=(f(t.map(a=>a.deepClone()))||r.create([])).flattenLists(),n=r.create(t).flattenLists();c.ok(l(e,n),"merge23Trees failed")}test("Empty List",()=>{i([])}),test("Same Height Lists",()=>{const t=new s(o(1,1)),e=r.create([t.deepClone(),t.deepClone()]);i([e.deepClone(),e.deepClone(),e.deepClone(),e.deepClone(),e.deepClone()])}),test("Different Height Lists 1",()=>{const t=new s(o(1,1)),e=r.create([t.deepClone(),t.deepClone()]),n=r.create([e.deepClone(),e.deepClone()]);i([e,n])}),test("Different Height Lists 2",()=>{const t=new s(o(1,1)),e=r.create([t.deepClone(),t.deepClone()]),n=r.create([e.deepClone(),e.deepClone()]);i([n,e])}),test("Different Height Lists 3",()=>{const t=new s(o(1,1)),e=r.create([t.deepClone(),t.deepClone()]),n=r.create([e.deepClone(),e.deepClone()]);i([n,e,e,n,n])})});
