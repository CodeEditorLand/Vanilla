import e from"assert";import{renderFormattedText as s,renderText as a}from"../../browser/formattedTextRenderer.js";import{DisposableStore as c}from"../../common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as o}from"../common/utils.js";suite("FormattedTextRenderer",()=>{const r=new c;setup(()=>{r.clear()}),teardown(()=>{r.clear()}),test("render simple element",()=>{const t=a("testing");e.strictEqual(t.nodeType,document.ELEMENT_NODE),e.strictEqual(t.textContent,"testing"),e.strictEqual(t.tagName,"DIV")}),test("render element with class",()=>{const t=a("testing",{className:"testClass"});e.strictEqual(t.nodeType,document.ELEMENT_NODE),e.strictEqual(t.className,"testClass")}),test("simple formatting",()=>{let t=s("**bold**");e.strictEqual(t.children.length,1),e.strictEqual(t.firstChild.textContent,"bold"),e.strictEqual(t.firstChild.tagName,"B"),e.strictEqual(t.innerHTML,"<b>bold</b>"),t=s("__italics__"),e.strictEqual(t.innerHTML,"<i>italics</i>"),t=s("``code``"),e.strictEqual(t.innerHTML,"``code``"),t=s("``code``",{renderCodeSegments:!0}),e.strictEqual(t.innerHTML,"<code>code</code>"),t=s("this string has **bold**, __italics__, and ``code``!!",{renderCodeSegments:!0}),e.strictEqual(t.innerHTML,"this string has <b>bold</b>, <i>italics</i>, and <code>code</code>!!")}),test("no formatting",()=>{const t=s("this is just a string");e.strictEqual(t.innerHTML,"this is just a string")}),test("preserve newlines",()=>{const t=s(`line one
line two`);e.strictEqual(t.innerHTML,"line one<br>line two")}),test("action",()=>{let t=!1;const n=s("[[action]]",{actionHandler:{callback(l){e.strictEqual(l,"0"),t=!0},disposables:r}});e.strictEqual(n.innerHTML,"<a>action</a>");const i=document.createEvent("MouseEvent");i.initEvent("click",!0,!0),n.firstChild.dispatchEvent(i),e.strictEqual(t,!0)}),test("fancy action",()=>{let t=!1;const n=s("__**[[action]]**__",{actionHandler:{callback(l){e.strictEqual(l,"0"),t=!0},disposables:r}});e.strictEqual(n.innerHTML,"<i><b><a>action</a></b></i>");const i=document.createEvent("MouseEvent");i.initEvent("click",!0,!0),n.firstChild.firstChild.firstChild.dispatchEvent(i),e.strictEqual(t,!0)}),test("fancier action",()=>{let t=!1;const n=s("``__**[[action]]**__``",{renderCodeSegments:!0,actionHandler:{callback(l){e.strictEqual(l,"0"),t=!0},disposables:r}});e.strictEqual(n.innerHTML,"<code><i><b><a>action</a></b></i></code>");const i=document.createEvent("MouseEvent");i.initEvent("click",!0,!0),n.firstChild.firstChild.firstChild.firstChild.dispatchEvent(i),e.strictEqual(t,!0)}),test("escaped formatting",()=>{const t=s("\\*\\*bold\\*\\*");e.strictEqual(t.children.length,0),e.strictEqual(t.innerHTML,"**bold**")}),o()});
