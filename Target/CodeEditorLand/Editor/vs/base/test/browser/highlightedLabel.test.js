import t from"assert";import{HighlightedLabel as i}from"../../browser/ui/highlightedlabel/highlightedLabel.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../common/utils.js";suite("HighlightedLabel",()=>{let e;setup(()=>{e=new i(document.createElement("div"),{supportIcons:!0})}),test("empty label",function(){t.strictEqual(e.element.innerHTML,"")}),test("no decorations",function(){e.set("hello"),t.strictEqual(e.element.innerHTML,"hello")}),test("escape html",function(){e.set("hel<lo"),t.strictEqual(e.element.innerHTML,"hel&lt;lo")}),test("everything highlighted",function(){e.set("hello",[{start:0,end:5}]),t.strictEqual(e.element.innerHTML,'<span class="highlight">hello</span>')}),test("beginning highlighted",function(){e.set("hellothere",[{start:0,end:5}]),t.strictEqual(e.element.innerHTML,'<span class="highlight">hello</span>there')}),test("ending highlighted",function(){e.set("goodbye",[{start:4,end:7}]),t.strictEqual(e.element.innerHTML,'good<span class="highlight">bye</span>')}),test("middle highlighted",function(){e.set("foobarfoo",[{start:3,end:6}]),t.strictEqual(e.element.innerHTML,'foo<span class="highlight">bar</span>foo')}),test("escapeNewLines",()=>{let n=[{start:0,end:5},{start:7,end:9},{start:11,end:12}],s=i.escapeNewLines(`ACTION\r
_TYPE2`,n);t.strictEqual(s,"ACTION\u23CE_TYPE2"),t.deepStrictEqual(n,[{start:0,end:5},{start:6,end:8},{start:10,end:11}]),n=[{start:5,end:9},{start:11,end:12}],s=i.escapeNewLines(`ACTION\r
_TYPE2`,n),t.strictEqual(s,"ACTION\u23CE_TYPE2"),t.deepStrictEqual(n,[{start:5,end:8},{start:10,end:11}])}),teardown(()=>{e.dispose()}),l()});