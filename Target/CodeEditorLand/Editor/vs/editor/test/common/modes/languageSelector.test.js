import n from"assert";import{URI as i}from"../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../base/test/common/utils.js";import{score as t}from"../../../common/languageSelector.js";suite("LanguageSelector",function(){d();const u={language:"farboo",uri:i.parse("file:///testbed/file.fb")};test("score, invalid selector",function(){n.strictEqual(t({},u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t(void 0,u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t(null,u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t("",u.uri,u.language,!0,void 0,void 0),0)}),test("score, any language",function(){n.strictEqual(t({language:"*"},u.uri,u.language,!0,void 0,void 0),5),n.strictEqual(t("*",u.uri,u.language,!0,void 0,void 0),5),n.strictEqual(t("*",i.parse("foo:bar"),u.language,!0,void 0,void 0),5),n.strictEqual(t("farboo",i.parse("foo:bar"),u.language,!0,void 0,void 0),10)}),test("score, default schemes",function(){const e=i.parse("git:foo/file.txt"),a="farboo";n.strictEqual(t("*",e,a,!0,void 0,void 0),5),n.strictEqual(t("farboo",e,a,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo",scheme:""},e,a,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo",scheme:"git"},e,a,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo",scheme:"*"},e,a,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo"},e,a,!0,void 0,void 0),10),n.strictEqual(t({language:"*"},e,a,!0,void 0,void 0),5),n.strictEqual(t({scheme:"*"},e,a,!0,void 0,void 0),5),n.strictEqual(t({scheme:"git"},e,a,!0,void 0,void 0),10)}),test("score, filter",function(){n.strictEqual(t("farboo",u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo"},u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo",scheme:"file"},u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t({language:"farboo",scheme:"http"},u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t({pattern:"**/*.fb"},u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t({pattern:"**/*.fb",scheme:"file"},u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t({pattern:"**/*.fb"},i.parse("foo:bar"),u.language,!0,void 0,void 0),0),n.strictEqual(t({pattern:"**/*.fb",scheme:"foo"},i.parse("foo:bar"),u.language,!0,void 0,void 0),0);const e={uri:i.parse("git:/my/file.js"),langId:"javascript"};n.strictEqual(t("javascript",e.uri,e.langId,!0,void 0,void 0),10),n.strictEqual(t({language:"javascript",scheme:"git"},e.uri,e.langId,!0,void 0,void 0),10),n.strictEqual(t("*",e.uri,e.langId,!0,void 0,void 0),5),n.strictEqual(t("fooLang",e.uri,e.langId,!0,void 0,void 0),0),n.strictEqual(t(["fooLang","*"],e.uri,e.langId,!0,void 0,void 0),5)}),test("score, max(filters)",function(){const e={language:"farboo",scheme:"file"},a={language:"farboo",scheme:"http"};n.strictEqual(t(e,u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t(a,u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t([e,a],u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t([a,a],u.uri,u.language,!0,void 0,void 0),0),n.strictEqual(t(["farboo","*"],u.uri,u.language,!0,void 0,void 0),10),n.strictEqual(t(["*","farboo"],u.uri,u.language,!0,void 0,void 0),10)}),test("score hasAccessToAllModels",function(){const e={uri:i.parse("file:/my/file.js"),langId:"javascript"};n.strictEqual(t("javascript",e.uri,e.langId,!1,void 0,void 0),0),n.strictEqual(t({language:"javascript",scheme:"file"},e.uri,e.langId,!1,void 0,void 0),0),n.strictEqual(t("*",e.uri,e.langId,!1,void 0,void 0),0),n.strictEqual(t("fooLang",e.uri,e.langId,!1,void 0,void 0),0),n.strictEqual(t(["fooLang","*"],e.uri,e.langId,!1,void 0,void 0),0),n.strictEqual(t({language:"javascript",scheme:"file",hasAccessToAllModels:!0},e.uri,e.langId,!1,void 0,void 0),10),n.strictEqual(t(["fooLang","*",{language:"*",hasAccessToAllModels:!0}],e.uri,e.langId,!1,void 0,void 0),5)}),test("score, notebookType",function(){const e={uri:i.parse("vscode-notebook-cell:///my/file.js#blabla"),langId:"javascript",notebookType:"fooBook",notebookUri:i.parse("file:///my/file.js")};n.strictEqual(t("javascript",e.uri,e.langId,!0,void 0,void 0),10),n.strictEqual(t("javascript",e.uri,e.langId,!0,e.notebookUri,e.notebookType),10),n.strictEqual(t({notebookType:"fooBook"},e.uri,e.langId,!0,e.notebookUri,e.notebookType),10),n.strictEqual(t({notebookType:"fooBook",language:"javascript",scheme:"file"},e.uri,e.langId,!0,e.notebookUri,e.notebookType),10),n.strictEqual(t({notebookType:"fooBook",language:"*"},e.uri,e.langId,!0,e.notebookUri,e.notebookType),10),n.strictEqual(t({notebookType:"*",language:"*"},e.uri,e.langId,!0,e.notebookUri,e.notebookType),5),n.strictEqual(t({notebookType:"*",language:"javascript"},e.uri,e.langId,!0,e.notebookUri,e.notebookType),10)}),test("Snippet choices lost #149363",function(){const e={scheme:"vscode-notebook-cell",pattern:"/some/path/file.py",language:"python"},a=i.parse("vscode-notebook-cell:///some/path/file.py"),r=i.parse("file:///some/path/file.py");n.strictEqual(t(e,a,"python",!0,r,"jupyter"),10);const o={...e,notebookType:"jupyter"};n.strictEqual(t(o,a,"python",!0,r,"jupyter"),0)}),test("Document selector match - unexpected result value #60232",function(){const a=t({language:"json",scheme:"file",pattern:"**/*.interface.json"},i.parse("file:///C:/Users/zlhe/Desktop/test.interface.json"),"json",!0,void 0,void 0);n.strictEqual(a,10)}),test("Document selector match - platform paths #99938",function(){const a=t({pattern:{base:"/home/user/Desktop",pattern:"*.json"}},i.file("/home/user/Desktop/test.json"),"json",!0,void 0,void 0);n.strictEqual(a,10)}),test("NotebookType without notebook",function(){const e={uri:i.parse("file:///my/file.bat"),langId:"bat"};let a=t({language:"bat",notebookType:"xxx"},e.uri,e.langId,!0,void 0,void 0);n.strictEqual(a,0),a=t({language:"bat",notebookType:"*"},e.uri,e.langId,!0,void 0,void 0),n.strictEqual(a,0)})});