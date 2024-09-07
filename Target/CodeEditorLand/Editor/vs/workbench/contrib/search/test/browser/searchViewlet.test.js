import t from"assert";import{URI as b}from"../../../../../base/common/uri.js";import{ILanguageConfigurationService as N}from"../../../../../editor/common/languages/languageConfigurationRegistry.js";import{IModelService as R}from"../../../../../editor/common/services/model.js";import{TestLanguageConfigurationService as x}from"../../../../../editor/test/common/modes/testLanguageConfigurationService.js";import{FileService as k}from"../../../../../platform/files/common/fileService.js";import{TestInstantiationService as q}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{ILabelService as E}from"../../../../../platform/label/common/label.js";import{ILogService as P,NullLogService as I}from"../../../../../platform/log/common/log.js";import{IUriIdentityService as Q}from"../../../../../platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as U}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";import{IWorkspaceContextService as $}from"../../../../../platform/workspace/common/workspace.js";import{TestWorkspace as A}from"../../../../../platform/workspace/test/common/testWorkspace.js";import{FileMatch as D,FolderMatch as O,Match as u,searchComparer as s,searchMatchComparer as f,SearchModel as F}from"../../browser/searchModel.js";import{MockLabelService as W}from"../../../../services/label/test/common/mockLabelService.js";import{OneLineRange as n,QueryType as v,SearchSortOrder as d}from"../../../../services/search/common/search.js";import{TestContextService as V}from"../../../../test/common/workbenchTestServices.js";import{INotebookEditorService as j}from"../../../notebook/browser/services/notebookEditorService.js";import{createFileUriFromPathFromRoot as p,getRootName as T,stubModelService as z,stubNotebookEditorService as B}from"./searchTestCommon.js";import{ensureNoDisposablesAreLeakedInTestSuite as G}from"../../../../../base/test/common/utils.js";suite("Search - Viewlet",()=>{let c;const m=G();setup(()=>{c=new q,c.stub(N,x),c.stub(R,z(c,o=>m.add(o))),c.stub(j,B(c,o=>m.add(o))),c.set($,new V(A));const e=new k(new I);m.add(e);const r=new U(e);m.add(r),c.stub(Q,r),c.stub(E,new W),c.stub(P,new I)}),teardown(()=>{c.dispose()}),test("Data Source",function(){const e=w();e.query={type:v.Text,contentPattern:{pattern:"foo"},folderQueries:[{folder:p()}]},e.add([{resource:p("/foo"),results:[{previewText:"bar",rangeLocations:[{preview:{startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:1},source:{startLineNumber:1,startColumn:0,endLineNumber:1,endColumn:1}}]}]}],"",!1);const r=e.matches()[0],o=r.matches()[0];t.strictEqual(r.id(),b.file(`${T()}/foo`).toString()),t.strictEqual(o.id(),`${b.file(`${T()}/foo`).toString()}>[2,1 -> 2,2]b`)}),test("Comparer",()=>{const e=l("/foo"),r=l("/with/path"),o=l("/with/path/foo"),i=new u(e,["bar"],new n(0,1,1),new n(0,1,1),!1),a=new u(e,["bar"],new n(0,1,1),new n(2,1,1),!1),h=new u(e,["bar"],new n(0,1,1),new n(2,1,1),!1);t(f(e,r)<0),t(f(r,e)>0),t(f(e,e)===0),t(f(r,o)<0),t(f(i,a)<0),t(f(a,i)>0),t(f(a,h)===0)}),test("Advanced Comparer",()=>{const e=l("/with/path/foo10"),r=l("/with/path2/foo1"),o=l("/with/path/bar.a"),i=l("/with/path/bar.b");t(f(e,r)<0),t(f(e,r,d.FileNames)>0),t(f(o,i,d.Type)<0)}),test("Cross-type Comparer",()=>{const e=w(),r=M("/voo",0,e),o=M("/with",1,e),i=l("/voo/foo.a",r),a=l("/with/path.c",o),h=l("/with/path/bar.b",o),g=new u(i,["bar"],new n(0,1,1),new n(0,1,1),!1),y=new u(i,["bar"],new n(0,1,1),new n(2,1,1),!1),C=new u(a,["barfoo"],new n(0,1,1),new n(0,1,1),!1),S=new u(a,["fooooo"],new n(0,1,1),new n(2,1,1),!1),L=new u(h,["foobar"],new n(0,1,1),new n(2,1,1),!1);t(s(i,h)<0),t(s(a,h)<0),t(s(o,a)<0),t(s(S,L)<0),t(s(g,C)<0),t(s(y,o)<0),t(s(i,h,d.FileNames)<0),t(s(h,a,d.FileNames)<0),t(s(h,S,d.FileNames)<0),t(s(h,a,d.Type)<0),t(s(h,S,d.Type)<0)});function l(e,r,...o){const i={resource:b.file("/"+e),results:o},a=c.createInstance(D,{pattern:""},void 0,void 0,r??M("",0),i,null,"");return a.createMatches(!1),m.add(a),a}function M(e,r,o){const i=c.createInstance(F);m.add(i);const a=c.createInstance(O,p(e),e,r,{type:v.Text,folderQueries:[{folder:p()}],contentPattern:{pattern:""}},o??w().folderMatches()[0],i.searchResult,null);return m.add(a),a}function w(){const e=c.createInstance(F);return m.add(e),e.searchResult.query={type:v.Text,folderQueries:[{folder:p()}],contentPattern:{pattern:""}},e.searchResult}});