import t from"assert";import"../../../../../base/common/lifecycle.js";import{URI as b}from"../../../../../base/common/uri.js";import{Position as r}from"../../../../common/core/position.js";import{Range as s}from"../../../../common/core/range.js";import"../../../../common/model/textModel.js";import{CompletionItemKind as a}from"../../../../common/languages.js";import{CompletionOptions as l,provideSuggestionItems as p,SnippetSortOrder as f}from"../../browser/suggest.js";import{createTextModel as w}from"../../../../test/common/testTextModel.js";import{LanguageFeatureRegistry as q}from"../../../../common/languageFeatureRegistry.js";import{ensureNoDisposablesAreLeakedInTestSuite as E}from"../../../../../base/test/common/utils.js";suite("Suggest",function(){let n,u,i;setup(function(){i=new q,n=w(`FOO
barBAR
foo`,void 0,void 0,b.parse("foo:bar/path")),u=i.register({pattern:"bar/path",scheme:"foo"},{_debugDisplayName:"test",provideCompletionItems(e,o){return{incomplete:!1,suggestions:[{label:"aaa",kind:a.Snippet,insertText:"aaa",range:s.fromPositions(o)},{label:"zzz",kind:a.Snippet,insertText:"zzz",range:s.fromPositions(o)},{label:"fff",kind:a.Property,insertText:"fff",range:s.fromPositions(o)}]}}})}),teardown(()=>{u.dispose(),n.dispose()}),E(),test("sort - snippet inline",async function(){const{items:e,disposable:o}=await p(i,n,new r(1,1),new l(f.Inline));t.strictEqual(e.length,3),t.strictEqual(e[0].completion.label,"aaa"),t.strictEqual(e[1].completion.label,"fff"),t.strictEqual(e[2].completion.label,"zzz"),o.dispose()}),test("sort - snippet top",async function(){const{items:e,disposable:o}=await p(i,n,new r(1,1),new l(f.Top));t.strictEqual(e.length,3),t.strictEqual(e[0].completion.label,"aaa"),t.strictEqual(e[1].completion.label,"zzz"),t.strictEqual(e[2].completion.label,"fff"),o.dispose()}),test("sort - snippet bottom",async function(){const{items:e,disposable:o}=await p(i,n,new r(1,1),new l(f.Bottom));t.strictEqual(e.length,3),t.strictEqual(e[0].completion.label,"fff"),t.strictEqual(e[1].completion.label,"aaa"),t.strictEqual(e[2].completion.label,"zzz"),o.dispose()}),test("sort - snippet none",async function(){const{items:e,disposable:o}=await p(i,n,new r(1,1),new l(void 0,new Set().add(a.Snippet)));t.strictEqual(e.length,1),t.strictEqual(e[0].completion.label,"fff"),o.dispose()}),test("only from",function(e){const o={triggerCharacters:[],provideCompletionItems(){return{currentWord:"",incomplete:!1,suggestions:[{label:"jjj",type:"property",insertText:"jjj"}]}}},m=i.register({pattern:"bar/path",scheme:"foo"},o);p(i,n,new r(1,1),new l(void 0,void 0,new Set().add(o))).then(({items:c,disposable:d})=>{m.dispose(),t.strictEqual(c.length,1),t.ok(c[0].provider===o),d.dispose(),e()})}),test("Ctrl+space completions stopped working with the latest Insiders, #97650",async function(){const e=new class{_debugDisplayName="test";triggerCharacters=[];provideCompletionItems(){return{suggestions:[{label:"one",kind:a.Class,insertText:"one",range:{insert:new s(0,0,0,0),replace:new s(0,0,0,10)}},{label:"two",kind:a.Class,insertText:"two",range:{insert:new s(0,0,0,0),replace:new s(0,1,0,10)}}]}}},o=i.register({pattern:"bar/path",scheme:"foo"},e),{items:m,disposable:c}=await p(i,n,new r(0,0),new l(void 0,void 0,new Set().add(e)));o.dispose(),t.strictEqual(m.length,2);const[d,g]=m;t.strictEqual(d.completion.label,"one"),t.strictEqual(d.isInvalid,!1),t.strictEqual(g.completion.label,"two"),t.strictEqual(g.isInvalid,!0),c.dispose()})});
