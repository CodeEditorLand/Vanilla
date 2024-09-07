import t from"assert";import{AsyncIterableSource as C}from"../../../../../base/common/async.js";import"../../../../../base/common/cancellation.js";import"../../../../../base/common/uri.js";import{mock as h}from"../../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as b}from"../../../../../base/test/common/utils.js";import{NotebookVariableDataSource as f}from"../../browser/contrib/notebookVariables/notebookVariablesDataSource.js";import"../../common/model/notebookTextModel.js";import"../../common/notebookKernelService.js";suite("NotebookVariableDataSource",()=>{let l;const i={uri:"one.ipynb",languages:["python"]};let d,a;const u=new class extends h(){hasVariableProvider=!0;provideVariables(e,n,r,v,c){d=!0;const s=new C;for(let o=0;o<a.length&&!c.isCancellationRequested;o++)a[o].action&&a[o].action(),s.emitOne(a[o]);return setTimeout(()=>s.resolve(),0),s.asyncIterable}},m=new class extends h(){getMatchingKernel(e){return{selected:u,all:[],suggestions:[],hidden:[]}}};b(),setup(()=>{d=!1,l=new f(m),a=[{id:1,name:"a",value:"1",hasNamedChildren:!1,indexedChildrenCount:0}]}),test("Root element should return children",async()=>{const e=await l.getChildren({kind:"root",notebook:i});t.strictEqual(e.length,1)}),test("Get children of list element",async()=>{const e={kind:"variable",notebook:i,id:"1",extHostId:1,name:"list",value:"[...]",hasNamedChildren:!1,indexedChildrenCount:5};a=[{id:2,name:"first",value:"1",hasNamedChildren:!1,indexedChildrenCount:0},{id:3,name:"second",value:"2",hasNamedChildren:!1,indexedChildrenCount:0},{id:4,name:"third",value:"3",hasNamedChildren:!1,indexedChildrenCount:0},{id:5,name:"fourth",value:"4",hasNamedChildren:!1,indexedChildrenCount:0},{id:6,name:"fifth",value:"5",hasNamedChildren:!1,indexedChildrenCount:0}];const n=await l.getChildren(e);t.strictEqual(n.length,5)}),test("Get children for large list",async()=>{const e={kind:"variable",notebook:i,id:"1",extHostId:1,name:"list",value:"[...]",hasNamedChildren:!1,indexedChildrenCount:2e3};a=[];const n=await l.getChildren(e);t(n.length>1,"We should have results for groups of children"),t(!d,"provideVariables should not be called"),t.equal(n[0].extHostId,e.extHostId,"ExtHostId should match the parent since we will use it to get the real children")}),test("Get children for very large list",async()=>{const e={kind:"variable",notebook:i,id:"1",extHostId:1,name:"list",value:"[...]",hasNamedChildren:!1,indexedChildrenCount:1e6};a=[];const n=await l.getChildren(e),r=await l.getChildren(n[99]);t(r.length===100,"We should have a full page of child groups"),t(!d,"provideVariables should not be called"),t.equal(r[0].extHostId,e.extHostId,"ExtHostId should match the parent since we will use it to get the real children")}),test("Cancel while enumerating through children",async()=>{const e={kind:"variable",notebook:i,id:"1",extHostId:1,name:"list",value:"[...]",hasNamedChildren:!1,indexedChildrenCount:10};a=[{id:2,name:"first",value:"1",hasNamedChildren:!1,indexedChildrenCount:0},{id:3,name:"second",value:"2",hasNamedChildren:!1,indexedChildrenCount:0},{id:4,name:"third",value:"3",hasNamedChildren:!1,indexedChildrenCount:0},{id:5,name:"fourth",value:"4",hasNamedChildren:!1,indexedChildrenCount:0},{id:5,name:"fifth",value:"4",hasNamedChildren:!1,indexedChildrenCount:0,action:()=>l.cancel()},{id:7,name:"sixth",value:"6",hasNamedChildren:!1,indexedChildrenCount:0},{id:8,name:"seventh",value:"7",hasNamedChildren:!1,indexedChildrenCount:0},{id:9,name:"eighth",value:"8",hasNamedChildren:!1,indexedChildrenCount:0},{id:10,name:"ninth",value:"9",hasNamedChildren:!1,indexedChildrenCount:0},{id:11,name:"tenth",value:"10",hasNamedChildren:!1,indexedChildrenCount:0}];const n=await l.getChildren(e);t.equal(n.length,5,"Iterating should have been cancelled")})});