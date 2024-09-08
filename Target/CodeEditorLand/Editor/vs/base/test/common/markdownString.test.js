import n from"assert";import{MarkdownString as t}from"../../common/htmlContent.js";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"./utils.js";suite("MarkdownString",()=>{i(),test("Escape leading whitespace",function(){const e=new t;e.appendText(`Hello
    Not a code block`),n.strictEqual(e.value,`Hello

&nbsp;&nbsp;&nbsp;&nbsp;Not&nbsp;a&nbsp;code&nbsp;block`)}),test("MarkdownString.appendText doesn't escape quote #109040",function(){const e=new t;e.appendText(`> Text
>More`),n.strictEqual(e.value,`\\>&nbsp;Text

\\>More`)}),test("appendText",()=>{const e=new t;e.appendText(`# foo
*bar*`),n.strictEqual(e.value,`\\#&nbsp;foo

\\*bar\\*`)}),test("appendLink",function(){function e(s,a,p,o){const d=new t;d.appendLink(s,a,p),n.strictEqual(d.value,o)}e("https://example.com\\()![](file:///Users/jrieken/Code/_samples/devfest/foo/img.png)","hello",void 0,"[hello](https://example.com\\(\\)![](file:///Users/jrieken/Code/_samples/devfest/foo/img.png\\))"),e("https://example.com","hello","title",'[hello](https://example.com "title")'),e("foo)","hello]",void 0,"[hello\\]](foo\\))"),e("foo\\)","hello]",void 0,"[hello\\]](foo\\))"),e("fo)o","hell]o",void 0,"[hell\\]o](fo\\)o)"),e("foo)","hello]",'title"','[hello\\]](foo\\) "title\\"")')}),suite("appendCodeBlock",()=>{function e(s,a,p){const o=new t;o.appendCodeblock(s,a),n.strictEqual(o.value,p)}test("common cases",()=>{e("ts","const a = 1;",`
${["```ts","const a = 1;","```"].join(`
`)}
`),e("ts","const a = `1`;",`
${["```ts","const a = `1`;","```"].join(`
`)}
`)}),test("escape fence",()=>{e("md","```\n```",`
${["````md","```\n```","````"].join(`
`)}
`),e("md","\n\n```\n```",`
${["````md","\n\n```\n```","````"].join(`
`)}
`),e("md","```\n```\n````\n````",`
${["`````md","```\n```\n````\n````","`````"].join(`
`)}
`)})}),suite("ThemeIcons",()=>{suite("Support On",()=>{test("appendText",()=>{const e=new t(void 0,{supportThemeIcons:!0});e.appendText("$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"\\\\$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;\\\\$\\(add\\)")}),test("appendMarkdown",()=>{const e=new t(void 0,{supportThemeIcons:!0});e.appendMarkdown("$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"$(zap) $(not a theme icon) $(add)")}),test("appendMarkdown with escaped icon",()=>{const e=new t(void 0,{supportThemeIcons:!0});e.appendMarkdown("\\$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"\\$(zap) $(not a theme icon) $(add)")})}),suite("Support Off",()=>{test("appendText",()=>{const e=new t(void 0,{supportThemeIcons:!1});e.appendText("$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;$\\(add\\)")}),test("appendMarkdown",()=>{const e=new t(void 0,{supportThemeIcons:!1});e.appendMarkdown("$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"$(zap) $(not a theme icon) $(add)")}),test("appendMarkdown with escaped icon",()=>{const e=new t(void 0,{supportThemeIcons:!0});e.appendMarkdown("\\$(zap) $(not a theme icon) $(add)"),n.strictEqual(e.value,"\\$(zap) $(not a theme icon) $(add)")})})})});
