import t from"assert";import"../../../../browser/ui/list/list.js";import{List as l}from"../../../../browser/ui/list/listWidget.js";import{range as u}from"../../../../common/arrays.js";import{timeout as o}from"../../../../common/async.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../common/utils.js";suite("ListWidget",function(){const n=m();test("Page up and down",async function(){const s=document.createElement("div");s.style.height="200px",s.style.width="200px";const r={getHeight(){return 20},getTemplateId(){return"template"}};let a=0;const i={templateId:"template",renderTemplate(){a++},renderElement(){},disposeTemplate(){a--}},e=n.add(new l("test",s,r,[i]));e.layout(200),t.strictEqual(a,0,"no templates have been allocated"),e.splice(0,0,u(100)),e.focusFirst(),e.focusNextPage(),t.strictEqual(e.getFocus()[0],9,"first page down moves focus to element at bottom"),e.focusNextPage(),await o(0),t.strictEqual(e.getFocus()[0],19,"page down to next page"),e.focusPreviousPage(),t.strictEqual(e.getFocus()[0],10,"first page up moves focus to element at top"),e.focusPreviousPage(),await o(0),t.strictEqual(e.getFocus()[0],0,"page down to previous page")}),test("Page up and down with item taller than viewport #149502",async function(){const s=document.createElement("div");s.style.height="200px",s.style.width="200px";const r={getHeight(){return 200},getTemplateId(){return"template"}};let a=0;const i={templateId:"template",renderTemplate(){a++},renderElement(){},disposeTemplate(){a--}},e=n.add(new l("test",s,r,[i]));e.layout(200),t.strictEqual(a,0,"no templates have been allocated"),e.splice(0,0,u(100)),e.focusFirst(),t.strictEqual(e.getFocus()[0],0,"initial focus is first element"),e.focusNextPage(),await o(0),t.strictEqual(e.getFocus()[0],1,"page down to next page"),e.focusPreviousPage(),await o(0),t.strictEqual(e.getFocus()[0],0,"page up to next page")})});
