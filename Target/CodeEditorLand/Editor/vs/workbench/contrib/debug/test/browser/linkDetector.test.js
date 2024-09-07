import e from"assert";import{isHTMLAnchorElement as l}from"../../../../../base/browser/dom.js";import{isWindows as i}from"../../../../../base/common/platform.js";import{URI as c}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../../base/test/common/utils.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{ITunnelService as p}from"../../../../../platform/tunnel/common/tunnel.js";import{WorkspaceFolder as h}from"../../../../../platform/workspace/common/workspace.js";import{LinkDetector as d}from"../../browser/linkDetector.js";import{workbenchInstantiationService as m}from"../../../../test/browser/workbenchTestServices.js";suite("Debug - Link Detector",()=>{const o=u();let a;setup(()=>{const n=m(void 0,o);n.stub(p,{canTunnel:()=>!1}),a=n.createInstance(d)});function r(n){e(l(n))}test("noLinks",()=>{const n="I am a string",s="<span>I am a string</span>",t=a.linkify(n);e.strictEqual(0,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual(s,t.outerHTML)}),test("trailingNewline",()=>{const n=`I am a string
`,s=`<span>I am a string
</span>`,t=a.linkify(n);e.strictEqual(0,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual(s,t.outerHTML)}),test("trailingNewlineSplit",()=>{const n=`I am a string
`,s=`<span>I am a string
</span>`,t=a.linkify(n,!0);e.strictEqual(0,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual(s,t.outerHTML)}),test("singleLineLink",()=>{const n=i?"C:\\foo\\bar.js:12:34":"/Users/foo/bar.js:12:34",s=i?'<span><a tabindex="0">C:\\foo\\bar.js:12:34</a></span>':'<span><a tabindex="0">/Users/foo/bar.js:12:34</a></span>',t=a.linkify(n);e.strictEqual(1,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("A",t.firstElementChild.tagName),e.strictEqual(s,t.outerHTML),r(t.firstElementChild),e.strictEqual(i?"C:\\foo\\bar.js:12:34":"/Users/foo/bar.js:12:34",t.firstElementChild.textContent)}),test("relativeLink",()=>{const n="./foo/bar.js",s="<span>./foo/bar.js</span>",t=a.linkify(n);e.strictEqual(0,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual(s,t.outerHTML)}),test("relativeLinkWithWorkspace",async()=>{const s=a.linkify("./foo/bar.js",!1,new h({uri:c.file("/path/to/workspace"),name:"ws",index:0}));e.strictEqual("SPAN",s.tagName),e.ok(s.outerHTML.indexOf("link")>=0)}),test("singleLineLinkAndText",function(){const n=i?"The link: C:/foo/bar.js:12:34":"The link: /Users/foo/bar.js:12:34",s=/^<span>The link: <a tabindex="0">.*\/foo\/bar.js:12:34<\/a><\/span>$/,t=a.linkify(n);e.strictEqual(1,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("A",t.children[0].tagName),e(s.test(t.outerHTML)),r(t.children[0]),e.strictEqual(i?"C:/foo/bar.js:12:34":"/Users/foo/bar.js:12:34",t.children[0].textContent)}),test("singleLineMultipleLinks",()=>{const n=i?"Here is a link C:/foo/bar.js:12:34 and here is another D:/boo/far.js:56:78":"Here is a link /Users/foo/bar.js:12:34 and here is another /Users/boo/far.js:56:78",s=/^<span>Here is a link <a tabindex="0">.*\/foo\/bar.js:12:34<\/a> and here is another <a tabindex="0">.*\/boo\/far.js:56:78<\/a><\/span>$/,t=a.linkify(n);e.strictEqual(2,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("A",t.children[0].tagName),e.strictEqual("A",t.children[1].tagName),e(s.test(t.outerHTML)),r(t.children[0]),r(t.children[1]),e.strictEqual(i?"C:/foo/bar.js:12:34":"/Users/foo/bar.js:12:34",t.children[0].textContent),e.strictEqual(i?"D:/boo/far.js:56:78":"/Users/boo/far.js:56:78",t.children[1].textContent)}),test("multilineNoLinks",()=>{const n=`Line one
Line two
Line three`,s=/^<span><span>Line one\n<\/span><span>Line two\n<\/span><span>Line three<\/span><\/span>$/,t=a.linkify(n,!0);e.strictEqual(3,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("SPAN",t.children[0].tagName),e.strictEqual("SPAN",t.children[1].tagName),e.strictEqual("SPAN",t.children[2].tagName),e(s.test(t.outerHTML))}),test("multilineTrailingNewline",()=>{const n=`I am a string
And I am another
`,s=`<span><span>I am a string
</span><span>And I am another
</span></span>`,t=a.linkify(n,!0);e.strictEqual(2,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("SPAN",t.children[0].tagName),e.strictEqual("SPAN",t.children[1].tagName),e.strictEqual(s,t.outerHTML)}),test("multilineWithLinks",()=>{const n=i?`I have a link for you
Here it is: C:/foo/bar.js:12:34
Cool, huh?`:`I have a link for you
Here it is: /Users/foo/bar.js:12:34
Cool, huh?`,s=/^<span><span>I have a link for you\n<\/span><span>Here it is: <a tabindex="0">.*\/foo\/bar.js:12:34<\/a>\n<\/span><span>Cool, huh\?<\/span><\/span>$/,t=a.linkify(n,!0);e.strictEqual(3,t.children.length),e.strictEqual("SPAN",t.tagName),e.strictEqual("SPAN",t.children[0].tagName),e.strictEqual("SPAN",t.children[1].tagName),e.strictEqual("SPAN",t.children[2].tagName),e.strictEqual("A",t.children[1].children[0].tagName),e(s.test(t.outerHTML)),r(t.children[1].children[0]),e.strictEqual(i?"C:/foo/bar.js:12:34":"/Users/foo/bar.js:12:34",t.children[1].children[0].textContent)})});