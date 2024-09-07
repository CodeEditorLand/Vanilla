import c from"assert";import{fillInIncompleteTokens as l,renderMarkdown as d,renderMarkdownAsPlaintext as T}from"../../browser/markdownRenderer.js";import{MarkdownString as k}from"../../common/htmlContent.js";import*as o from"../../common/marked/marked.js";import{parse as w}from"../../common/marshalling.js";import{isWeb as h}from"../../common/platform.js";import{URI as f}from"../../common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as b}from"../common/utils.js";function g(i){return new DOMParser().parseFromString(i,"text/html").body.firstChild}function x(i,r){const a=g(r);c.ok(i.isEqualNode(a),`Expected: ${a.outerHTML}
Actual: ${i.outerHTML}`)}suite("MarkdownRenderer",()=>{const i=b();suite("Sanitization",()=>{test("Should not render images with unknown schemes",()=>{const r={value:"![image](no-such://example.com/cat.gif)"},a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p><img alt="image"></p>')})}),suite("Images",()=>{test("image rendering conforms to default",()=>{const r={value:"![image](http://example.com/cat.gif 'caption')"},a=i.add(d(r)).element;x(a,'<div><p><img title="caption" alt="image" src="http://example.com/cat.gif"></p></div>')}),test("image rendering conforms to default without title",()=>{const r={value:"![image](http://example.com/cat.gif)"},a=i.add(d(r)).element;x(a,'<div><p><img alt="image" src="http://example.com/cat.gif"></p></div>')}),test("image width from title params",()=>{const r=i.add(d({value:"![image](http://example.com/cat.gif|width=100px 'caption')"})).element;x(r,'<div><p><img width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>')}),test("image height from title params",()=>{const r=i.add(d({value:"![image](http://example.com/cat.gif|height=100 'caption')"})).element;x(r,'<div><p><img height="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>')}),test("image width and height from title params",()=>{const r=i.add(d({value:"![image](http://example.com/cat.gif|height=200,width=100 'caption')"})).element;x(r,'<div><p><img height="200" width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>')}),test("image with file uri should render as same origin uri",()=>{if(h)return;const r=i.add(d({value:"![image](file:///images/cat.gif)"})).element;x(r,'<div><p><img src="vscode-file://vscode-app/images/cat.gif" alt="image"></p></div>')})}),suite("Code block renderer",()=>{const r=(a,m)=>{const t=document.createElement("code");return t.textContent=m,Promise.resolve(t)};test("asyncRenderCallback should be invoked for code blocks",()=>{const a={value:"```js\n1 + 1;\n```"};return new Promise(m=>{i.add(d(a,{asyncRenderCallback:m,codeBlockRenderer:r}))})}),test("asyncRenderCallback should not be invoked if result is immediately disposed",()=>{const a={value:"```js\n1 + 1;\n```"};return new Promise((m,t)=>{d(a,{asyncRenderCallback:t,codeBlockRenderer:r}).dispose(),setTimeout(m,10)})}),test("asyncRenderCallback should not be invoked if dispose is called before code block is rendered",()=>{const a={value:"```js\n1 + 1;\n```"};return new Promise((m,t)=>{let e;const n=d(a,{asyncRenderCallback:t,codeBlockRenderer:()=>new Promise(s=>{e=s})});setTimeout(()=>{n.dispose(),e(document.createElement("code")),setTimeout(m,10)},10)})}),test("Code blocks should use leading language id (#157793)",async()=>{const a={value:"```js some other stuff\n1 + 1;\n```"},m=await new Promise(t=>{i.add(d(a,{codeBlockRenderer:async(e,n)=>(t(e),r(e,n))}))});c.strictEqual(m,"js")})}),suite("ThemeIcons Support On",()=>{test("render appendText",()=>{const r=new k(void 0,{supportThemeIcons:!0});r.appendText("$(zap) $(not a theme icon) $(add)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>")}),test("render appendMarkdown",()=>{const r=new k(void 0,{supportThemeIcons:!0});r.appendMarkdown("$(zap) $(not a theme icon) $(add)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p><span class="codicon codicon-zap"></span> $(not a theme icon) <span class="codicon codicon-add"></span></p>')}),test("render appendMarkdown with escaped icon",()=>{const r=new k(void 0,{supportThemeIcons:!0});r.appendMarkdown("\\$(zap) $(not a theme icon) $(add)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p>$(zap) $(not a theme icon) <span class="codicon codicon-add"></span></p>')}),test("render icon in link",()=>{const r=new k(void 0,{supportThemeIcons:!0});r.appendMarkdown("[$(zap)-link](#link)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p><a data-href="#link" href="" title="#link" draggable="false"><span class="codicon codicon-zap"></span>-link</a></p>')}),test("render icon in table",()=>{const r=new k(void 0,{supportThemeIcons:!0});r.appendMarkdown(`
| text   | text                 |
|--------|----------------------|
| $(zap) | [$(zap)-link](#link) |`);const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,`<table>
<thead>
<tr>
<th>text</th>
<th>text</th>
</tr>
</thead>
<tbody><tr>
<td><span class="codicon codicon-zap"></span></td>
<td><a data-href="#link" href="" title="#link" draggable="false"><span class="codicon codicon-zap"></span>-link</a></td>
</tr>
</tbody></table>
`)}),test("render icon in <a> without href (#152170)",()=>{const r=new k(void 0,{supportThemeIcons:!0,supportHtml:!0});r.appendMarkdown("<a>$(sync)</a>");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p><span class="codicon codicon-sync"></span></p>')})}),suite("ThemeIcons Support Off",()=>{test("render appendText",()=>{const r=new k(void 0,{supportThemeIcons:!1});r.appendText("$(zap) $(not a theme icon) $(add)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>")}),test("render appendMarkdown with escaped icon",()=>{const r=new k(void 0,{supportThemeIcons:!1});r.appendMarkdown("\\$(zap) $(not a theme icon) $(add)");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>$(zap) $(not a theme icon) $(add)</p>")})}),test("npm Hover Run Script not working #90855",function(){const r=JSON.parse('{"value":"[Run Script](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D \\"Run the script as a task\\")","supportThemeIcons":false,"isTrusted":true,"uris":{"__uri_e49443":{"$mid":1,"fsPath":"c:\\\\Users\\\\jrieken\\\\Code\\\\_sample\\\\foo\\\\package.json","_sep":1,"external":"file:///c%3A/Users/jrieken/Code/_sample/foo/package.json","path":"/c:/Users/jrieken/Code/_sample/foo/package.json","scheme":"file"},"command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D":{"$mid":1,"path":"npm.runScriptFromHover","scheme":"command","query":"{\\"documentUri\\":\\"__uri_e49443\\",\\"script\\":\\"echo\\"}"}}}'),m=i.add(d(r)).element.querySelector("a");c.ok(m),c.ok(m.dataset.href);const t=f.parse(m.dataset.href),e=w(decodeURIComponent(t.query));c.ok(e),c.strictEqual(e.script,"echo"),c.ok(e.documentUri.toString().startsWith("file:///c%3A/"))}),test("Should not render command links by default",()=>{const r=new k('[command1](command:doFoo) <a href="command:doFoo">command2</a>',{supportHtml:!0}),a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>command1 command2</p>")}),test("Should render command links in trusted strings",()=>{const r=new k('[command1](command:doFoo) <a href="command:doFoo">command2</a>',{isTrusted:!0,supportHtml:!0}),a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<p><a data-href="command:doFoo" href="" title="command:doFoo" draggable="false">command1</a> <a data-href="command:doFoo" href="">command2</a></p>')}),suite("PlaintextMarkdownRender",()=>{test("test code, blockquote, heading, list, listitem, paragraph, table, tablerow, tablecell, strong, em, br, del, text are rendered plaintext",()=>{const r={value:`\`code\`
>quote
# heading
- list

table | table2
--- | --- 
one | two


bo**ld**
_italic_
~~del~~
some text`},a=`code
quote
heading
list

table table2
one two
bold
italic
del
some text
`,m=T(r);c.strictEqual(m,a)}),test("test html, hr, image, link are rendered plaintext",()=>{const r={value:`<div>html</div>

---
![image](imageLink)
[text](textLink)`},a=`
text
`,m=T(r);c.strictEqual(m,a)})}),suite("supportHtml",()=>{test("supportHtml is disabled by default",()=>{const r=new k(void 0,{});r.appendMarkdown("a<b>b</b>c");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>abc</p>")}),test("Renders html when supportHtml=true",()=>{const r=new k(void 0,{supportHtml:!0});r.appendMarkdown("a<b>b</b>c");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>a<b>b</b>c</p>")}),test("Should not include scripts even when supportHtml=true",()=>{const r=new k(void 0,{supportHtml:!0});r.appendMarkdown('a<b onclick="alert(1)">b</b><script>alert(2)</script>c');const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>a<b>b</b>c</p>")}),test("Should not render html appended as text",()=>{const r=new k(void 0,{supportHtml:!0});r.appendText("a<b>b</b>c");const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,"<p>a&lt;b&gt;b&lt;/b&gt;c</p>")}),test("Should render html images",()=>{if(h)return;const r=new k(void 0,{supportHtml:!0});r.appendMarkdown('<img src="http://example.com/cat.gif">');const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<img src="http://example.com/cat.gif">')}),test("Should render html images with file uri as same origin uri",()=>{if(h)return;const r=new k(void 0,{supportHtml:!0});r.appendMarkdown('<img src="file:///images/cat.gif">');const a=i.add(d(r)).element;c.strictEqual(a.innerHTML,'<img src="vscode-file://vscode-app/images/cat.gif">')})}),suite("fillInIncompleteTokens",()=>{function r(...t){t.forEach(e=>{e.forEach(n=>n.raw="")})}const a=`| a | b |
| --- | --- |`;suite("table",()=>{test("complete table",()=>{const t=o.marked.lexer(a),e=l(t);c.equal(e,t)}),test("full header only",()=>{const e=o.marked.lexer("| a | b |"),n=o.marked.lexer(a),s=l(e);c.deepStrictEqual(s,n)}),test("full header only with trailing space",()=>{const e=o.marked.lexer("| a | b | "),n=o.marked.lexer(a),s=l(e);s&&r(s,n),c.deepStrictEqual(s,n)}),test("incomplete header",()=>{const e=o.marked.lexer("| a | b"),n=o.marked.lexer(a),s=l(e);s&&r(s,n),c.deepStrictEqual(s,n)}),test("incomplete header one column",()=>{const t="| a ",e=o.marked.lexer(t),n=o.marked.lexer(t+`|
| --- |`),s=l(e);s&&r(s,n),c.deepStrictEqual(s,n)}),test("full header with extras",()=>{const t="| a **bold** | b _italics_ |",e=o.marked.lexer(t),n=o.marked.lexer(t+`
| --- | --- |`),s=l(e);c.deepStrictEqual(s,n)}),test("full header with leading text",()=>{const t=`here is a table
| a | b |`,e=o.marked.lexer(t),n=o.marked.lexer(t+`
| --- | --- |`),s=l(e);c.deepStrictEqual(s,n)}),test("full header with leading other stuff",()=>{const t="```js\nconst xyz = 123;\n```\n| a | b |",e=o.marked.lexer(t),n=o.marked.lexer(t+`
| --- | --- |`),s=l(e);c.deepStrictEqual(s,n)}),test("full header with incomplete separator",()=>{const e=o.marked.lexer(`| a | b |
| ---`),n=o.marked.lexer(a),s=l(e);c.deepStrictEqual(s,n)}),test("full header with incomplete separator 2",()=>{const e=o.marked.lexer(`| a | b |
| --- |`),n=o.marked.lexer(a),s=l(e);c.deepStrictEqual(s,n)}),test("full header with incomplete separator 3",()=>{const e=o.marked.lexer(`| a | b |
|`),n=o.marked.lexer(a),s=l(e);c.deepStrictEqual(s,n)}),test("not a table",()=>{const e=o.marked.lexer(`| a | b |
some text`),n=l(e);c.deepStrictEqual(n,e)}),test("not a table 2",()=>{const e=o.marked.lexer(`| a | b |
| --- |
some text`),n=l(e);c.deepStrictEqual(n,e)})});function m(t,e){test(`incomplete ${t}`,()=>{const n=`${e}code`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`complete ${t}`,()=>{const n=`leading text ${e}code${e} trailing text`,s=o.marked.lexer(n),p=l(s);c.deepStrictEqual(p,s)}),test(`${t} with leading text`,()=>{const n=`some text and ${e}some code`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`single loose "${e}"`,()=>{const n=`some text and ${e}by itself
more text here`,s=o.marked.lexer(n),p=l(s);c.deepStrictEqual(p,s)}),test(`incomplete ${t} after newline`,()=>{const n=`some text
more text here and ${e}text`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`incomplete after complete ${t}`,()=>{const n=`leading text ${e}code${e} trailing text and ${e}another`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`incomplete ${t} in list`,()=>{const n=`- list item one
- list item two and ${e}text`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`incomplete ${t} in asterisk list`,()=>{const n=`* list item one
* list item two and ${e}text`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)}),test(`incomplete ${t} in numbered list`,()=>{const n=`1. list item one
2. list item two and ${e}text`,s=o.marked.lexer(n),p=l(s),u=o.marked.lexer(n+e);c.deepStrictEqual(p,u)})}suite("list",()=>{test("list with complete codeblock",()=>{const e=o.marked.lexer("-\n	```js\n	let x = 1;\n	```\n- list item two\n"),n=l(e);c.deepStrictEqual(n,e)}),test.skip("list with incomplete codeblock",()=>{const t="- list item one\n\n	```js\n	let x = 1;",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"\n	```");c.deepStrictEqual(n,s)}),test("list with subitems",()=>{const e=o.marked.lexer(`- hello
	- sub item
- text
	newline for some reason
`),n=l(e);c.deepStrictEqual(n,e)}),test("ordered list with subitems",()=>{const e=o.marked.lexer(`1. hello
	- sub item
2. text
	newline for some reason
`),n=l(e);c.deepStrictEqual(n,e)}),test("list with stuff",()=>{const e=o.marked.lexer("- list item one `codespan` **bold** [link](http://microsoft.com) more text"),n=l(e);c.deepStrictEqual(n,e)}),test("list with incomplete link text",()=>{const t=`- list item one
- item two [link`,e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("list with incomplete link target",()=>{const t=`- list item one
- item two [link](`,e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("ordered list with incomplete link target",()=>{const t=`1. list item one
2. item two [link](`,e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("ordered list with extra whitespace",()=>{const t=`1. list item one
2. item two [link](`,e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("list with extra whitespace",()=>{const t=`- list item one
- item two [link](`,e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("list with incomplete link with other stuff",()=>{const t="- list item one\n- item two [`link",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"`](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("ordered list with incomplete link with other stuff",()=>{const t="1. list item one\n1. item two [`link",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"`](https://microsoft.com)");c.deepStrictEqual(n,s)})}),suite("codespan",()=>{m("codespan","`"),test("backtick between letters",()=>{const t="a`b",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"`");c.deepStrictEqual(n,s)}),test("nested pattern",()=>{const t="sldkfjsd `abc __def__ ghi",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"`");c.deepStrictEqual(n,s)})}),suite("star",()=>{m("star","*"),test("star between letters",()=>{const t="sldkfjsd a*b",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"*");c.deepStrictEqual(n,s)}),test("nested pattern",()=>{const t="sldkfjsd *abc __def__ ghi",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"*");c.deepStrictEqual(n,s)})}),suite("double star",()=>{m("double star","**"),test("double star between letters",()=>{const t="a**b",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"**");c.deepStrictEqual(n,s)})}),suite("underscore",()=>{m("underscore","_"),test("underscore between letters",()=>{const e=o.marked.lexer("this_not_italics"),n=l(e);c.deepStrictEqual(n,e)})}),suite("double underscore",()=>{m("double underscore","__"),test("double underscore between letters",()=>{const e=o.marked.lexer("this__not__bold"),n=l(e);c.deepStrictEqual(n,e)})}),suite("link",()=>{test("incomplete link text",()=>{const t="abc [text",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("incomplete link target",()=>{const t="foo [text](http://microsoft",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("incomplete link target 2",()=>{const t="foo [text](http://microsoft.com",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("incomplete link target with extra stuff",()=>{const t="[before `text` after](http://microsoft.com",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("incomplete link target with extra stuff and incomplete arg",()=>{const t='[before `text` after](http://microsoft.com "more text ',e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+'")');c.deepStrictEqual(n,s)}),test("incomplete link target with incomplete arg",()=>{const t='foo [text](http://microsoft.com "more text here ',e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+'")');c.deepStrictEqual(n,s)}),test("incomplete link target with incomplete arg 2",()=>{const t='[text](command:_github.copilot.openRelativePath "arg',e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+'")');c.deepStrictEqual(n,s)}),test("incomplete link target with complete arg",()=>{const t='foo [text](http://microsoft.com "more text here"',e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+")");c.deepStrictEqual(n,s)}),test("link text with incomplete codespan",()=>{const t="text [`codespan",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"`](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("link text with incomplete stuff",()=>{const t="text [more text `codespan` text **bold",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"**](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("Looks like incomplete link target but isn't",()=>{const t="**bold** `codespan` text](",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t);c.deepStrictEqual(n,s)}),test.skip("incomplete link in list",()=>{const t="- [text",e=o.marked.lexer(t),n=l(e),s=o.marked.lexer(t+"](https://microsoft.com)");c.deepStrictEqual(n,s)}),test("square brace between letters",()=>{const e=o.marked.lexer("a[b"),n=l(e);c.deepStrictEqual(n,e)}),test("square brace on previous line",()=>{const e=o.marked.lexer(`text[
more text`),n=l(e);c.deepStrictEqual(n,e)}),test("complete link",()=>{const e=o.marked.lexer("text [link](http://microsoft.com)"),n=l(e);c.deepStrictEqual(n,e)})})})});