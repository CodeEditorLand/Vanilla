import e from"assert";import{URI as t}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as r}from"../../../../../base/test/common/utils.js";import{getWorkspaceIdentifier as s,getSingleFolderWorkspaceIdentifier as o}from"../../browser/workspaces.js";suite("Workspaces",()=>{test("workspace identifiers are stable",function(){e.strictEqual(s(t.parse("vscode-remote:/hello/test")).id,"474434e4"),e.strictEqual(o(t.parse("vscode-remote:/hello/test"))?.id,"474434e4")}),r()});
