import{MarkdownString as r}from"../../../../../base/common/htmlContent.js";import{assertSnapshot as a}from"../../../../../base/test/common/snapshot.js";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../../base/test/common/utils.js";import{ChatMarkdownRenderer as l}from"../../browser/chatMarkdownRenderer.js";import{ITrustedDomainService as m}from"../../../url/browser/trustedDomainService.js";import{MockTrustedDomainService as c}from"../../../url/test/browser/mockTrustedDomainService.js";import{workbenchInstantiationService as u}from"../../../../test/browser/workbenchTestServices.js";suite("ChatMarkdownRenderer",()=>{const n=i();let s;setup(()=>{const e=n.add(u(void 0,n));e.stub(m,new c(["http://allowed.com"])),s=e.createInstance(l,{})}),test("simple",async()=>{const e=new r("a"),t=n.add(s.render(e));await a(t.element.textContent)}),test("supportHtml with one-line markdown",async()=>{const e=new r("**hello**");e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML);const d=new r("1. [_hello_](https://example.com) test **text**");d.supportHtml=!0;const o=n.add(s.render(d));await a(o.element.outerHTML)}),test("invalid HTML",async()=>{const e=new r("1<canvas>2<details>3</details></canvas>4");e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("invalid HTML with attributes",async()=>{const e=new r('1<details id="id1" style="display: none">2<details id="my id 2">3</details></details>4');e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("valid HTML",async()=>{const e=new r(`
<h1>heading</h1>
<ul>
	<li>1</li>
	<li><b>hi</b></li>
</ul>
<pre><code>code here</code></pre>`);e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("mixed valid and invalid HTML",async()=>{const e=new r(`
<h1>heading</h1>
<details>
<ul>
	<li><span><details><i>1</i></details></span></li>
	<li><b>hi</b></li>
</ul>
</details>
<pre><canvas>canvas here</canvas></pre><details></details>`);e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("self-closing elements",async()=>{const e=new r('<area><hr><br><input type="text" value="test">');e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("html comments",async()=>{const e=new r("<!-- comment1 <div></div> --><div>content</div><!-- comment2 -->");e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("CDATA",async()=>{const e=new r("<![CDATA[<div>content</div>]]>");e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)}),test("remote images",async()=>{const e=new r('<img src="http://allowed.com/image.jpg"> <img src="http://disallowed.com/image.jpg">');e.supportHtml=!0;const t=n.add(s.render(e));await a(t.element.outerHTML)})});
