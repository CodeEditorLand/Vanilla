import{MarkdownString as r}from"../../../../../base/common/htmlContent.js";import{assertSnapshot as o}from"../../../../../base/test/common/snapshot.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../../base/test/common/utils.js";import"../../common/chatService.js";import{annotateSpecialMarkdownContent as l,extractVulnerabilitiesFromText as c}from"../../common/annotations.js";function i(t){return{kind:"markdownContent",content:new r(t)}}suite("Annotations",function(){d(),suite("extractVulnerabilitiesFromText",()=>{test("single line",async()=>{const t="some code ",e="content with vuln",n=l([i(t),{kind:"markdownVuln",content:new r(e),vulnerabilities:[{title:"title",description:"vuln"}]},i(" after")]);await o(n);const a=n[0],s=c(a.content.value);await o(s)}),test("multiline",async()=>{const t=`some code
over
multiple lines `,e=`content with vuln
and
newlines`,n=l([i(t),{kind:"markdownVuln",content:new r(e),vulnerabilities:[{title:"title",description:"vuln"}]},i(`more code
with newline`)]);await o(n);const a=n[0],s=c(a.content.value);await o(s)}),test("multiple vulns",async()=>{const t=`some code
over
multiple lines `,e=`content with vuln
and
newlines`,n=l([i(t),{kind:"markdownVuln",content:new r(e),vulnerabilities:[{title:"title",description:"vuln"}]},i(`more code
with newline`),{kind:"markdownVuln",content:new r(e),vulnerabilities:[{title:"title",description:"vuln"}]}]);await o(n);const a=n[0],s=c(a.content.value);await o(s)})})});
