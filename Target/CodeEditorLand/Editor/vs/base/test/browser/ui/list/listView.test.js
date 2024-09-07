import r from"assert";import"../../../../browser/ui/list/list.js";import{ListView as a}from"../../../../browser/ui/list/listView.js";import{range as n}from"../../../../common/arrays.js";import{ensureNoDisposablesAreLeakedInTestSuite as o}from"../../../common/utils.js";suite("ListView",function(){o(),test("all rows get disposed",function(){const t=document.createElement("div");t.style.height="200px",t.style.width="200px";const l={getHeight(){return 20},getTemplateId(){return"template"}};let e=0;const i={templateId:"template",renderTemplate(){e++},renderElement(){},disposeTemplate(){e--}},s=new a(t,l,[i]);s.layout(200),r.strictEqual(e,0,"no templates have been allocated"),s.splice(0,0,n(100)),r.strictEqual(e,10,"some templates have been allocated"),s.dispose(),r.strictEqual(e,0,"all templates have been disposed")})});