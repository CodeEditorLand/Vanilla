import i from"assert";import{tmpdir as k}from"os";import{join as u}from"../../../../base/common/path.js";import{URI as s}from"../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as y}from"../../../../base/test/common/utils.js";import{NullLogService as R}from"../../../log/common/log.js";import"../../../workspace/common/workspace.js";import{isRecentFolder as S,restoreRecentlyOpened as U,toStoreData as q}from"../../common/workspaces.js";suite("History Storage",()=>{function c(e){return{id:"1234",configPath:e}}function f(e,t,r){i.strictEqual(e&&e.toString(),t&&t.toString(),r)}function h(e,t,r){if(!e||!t){i.strictEqual(e,t,r);return}i.strictEqual(e.id,t.id,r),f(e.configPath,t.configPath,r)}function w(e,t,r){i.strictEqual(e.files.length,t.files.length,r);for(let o=0;o<e.files.length;o++)f(e.files[o].fileUri,t.files[o].fileUri,r),i.strictEqual(e.files[o].label,t.files[o].label),i.strictEqual(e.files[o].remoteAuthority,t.files[o].remoteAuthority);i.strictEqual(e.workspaces.length,t.workspaces.length,r);for(let o=0;o<e.workspaces.length;o++){const p=t.workspaces[o],n=e.workspaces[o];S(n)?f(n.folderUri,p.folderUri,r):h(n.workspace,p.workspace,r),i.strictEqual(n.label,p.label),i.strictEqual(n.remoteAuthority,n.remoteAuthority)}}function l(e,t){const r=q(e),o=U(r,new R);w(e,o,t)}const a=s.file(u(k(),"windowStateTest","test.code-workspace")),m=s.file(u(k(),"windowStateTest","testFile.txt")),b=s.file(u(k(),"windowStateTest","testFolder")),d=s.parse("foo://bar/c/e"),I=s.parse("foo://bar/c/d.txt"),g=s.parse("foo://bar/c/test.code-workspace");test("storing and restoring",()=>{let e;e={files:[],workspaces:[]},l(e,"empty"),e={files:[{fileUri:m}],workspaces:[]},l(e,"file"),e={files:[],workspaces:[{folderUri:b}]},l(e,"folder"),e={files:[],workspaces:[{workspace:c(a)},{folderUri:b}]},l(e,"workspaces and folders"),e={files:[{fileUri:I}],workspaces:[{workspace:c(g)},{folderUri:d}]},l(e,"remote workspaces and folders"),e={files:[{label:"abc",fileUri:m}],workspaces:[{label:"def",workspace:c(a)},{folderUri:d}]},l(e,"labels"),e={files:[{label:"abc",remoteAuthority:"test",fileUri:I}],workspaces:[{label:"def",remoteAuthority:"test",workspace:c(a)},{folderUri:d,remoteAuthority:"test"}]},l(e,"authority")}),test("open 1_55",()=>{const t=U(JSON.parse(`{
			"entries": [
				{
					"folderUri": "foo://bar/23/43",
					"remoteAuthority": "test+test"
				},
				{
					"workspace": {
						"id": "53b714b46ef1a2d4346568b4f591028c",
						"configPath": "file:///home/user/workspaces/testing/custom.code-workspace"
					}
				},
				{
					"folderUri": "file:///home/user/workspaces/testing/folding",
					"label": "abc"
				},
				{
					"fileUri": "file:///home/user/.config/code-oss-dev/storage.json",
					"label": "def"
				}
			]
		}`),new R),r={files:[{label:"def",fileUri:s.parse("file:///home/user/.config/code-oss-dev/storage.json")}],workspaces:[{folderUri:s.parse("foo://bar/23/43"),remoteAuthority:"test+test"},{workspace:{id:"53b714b46ef1a2d4346568b4f591028c",configPath:s.parse("file:///home/user/workspaces/testing/custom.code-workspace")}},{label:"abc",folderUri:s.parse("file:///home/user/workspaces/testing/folding")}]};w(t,r,"v1_33")}),y()});
