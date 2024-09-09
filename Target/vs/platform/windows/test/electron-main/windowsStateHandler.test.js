import i from"assert";import{tmpdir as p}from"os";import{join as u}from"../../../../base/common/path.js";import{URI as a}from"../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as I}from"../../../../base/test/common/utils.js";import{WindowMode as W}from"../../../window/electron-main/window.js";import{getWindowsStateStoreData as v,restoreWindowsState as f}from"../../electron-main/windowsStateHandler.js";import"../../../workspace/common/workspace.js";suite("Windows State Storing",()=>{function n(){return{x:0,y:10,width:100,height:200,mode:0}}function k(t){return{id:"1234",configPath:t}}function S(t,e,o){i.strictEqual(t&&t.toString(),e&&e.toString(),o)}function m(t,e,o){if(!t||!e){i.strictEqual(t,e,o);return}i.strictEqual(t.id,e.id,o),S(t.configPath,e.configPath,o)}function l(t,e,o){if(!t||!e){i.deepStrictEqual(t,e,o);return}i.strictEqual(t.backupPath,e.backupPath,o),S(t.folderUri,e.folderUri,o),i.strictEqual(t.remoteAuthority,e.remoteAuthority,o),m(t.workspace,e.workspace,o),i.deepStrictEqual(t.uiState,e.uiState,o)}function r(t,e,o){l(t.lastPluginDevelopmentHostWindow,e.lastPluginDevelopmentHostWindow,o),l(t.lastActiveWindow,e.lastActiveWindow,o),i.strictEqual(t.openedWindows.length,e.openedWindows.length,o);for(let s=0;s<t.openedWindows.length;s++)l(t.openedWindows[s],e.openedWindows[s],o)}function d(t,e){const o=v(t),s=f(o);r(t,s,e)}const c=u(p(),"windowStateTest","backupFolder1"),h=u(p(),"windowStateTest","backupFolder2"),b=a.file(u(p(),"windowStateTest","test.code-workspace")),w=a.file(u(p(),"windowStateTest","testFolder")),g=a.parse("foo://bar/c/d");test("storing and restoring",()=>{let t;t={openedWindows:[]},d(t,"no windows"),t={openedWindows:[{backupPath:c,uiState:n()}]},d(t,"empty workspace"),t={openedWindows:[{backupPath:c,uiState:n(),workspace:k(b)}]},d(t,"workspace"),t={openedWindows:[{backupPath:h,uiState:n(),folderUri:w}]},d(t,"folder"),t={openedWindows:[{backupPath:c,uiState:n(),folderUri:w},{backupPath:c,uiState:n(),folderUri:g,remoteAuthority:"bar"}]},d(t,"multiple windows"),t={lastActiveWindow:{backupPath:h,uiState:n(),folderUri:w},openedWindows:[]},d(t,"lastActiveWindow"),t={lastPluginDevelopmentHostWindow:{backupPath:h,uiState:n(),folderUri:w},openedWindows:[]},d(t,"lastPluginDevelopmentHostWindow")}),test("open 1_32",()=>{let e=f(JSON.parse(`{
			"openedWindows": [],
			"lastActiveWindow": {
				"workspaceIdentifier": {
					"id": "53b714b46ef1a2d4346568b4f591028c",
					"configURIPath": "file:///home/user/workspaces/testing/custom.code-workspace"
				},
				"backupPath": "/home/user/.config/code-oss-dev/Backups/53b714b46ef1a2d4346568b4f591028c",
				"uiState": {
					"mode": 0,
					"x": 0,
					"y": 27,
					"width": 2560,
					"height": 1364
				}
			}
		}`)),o={openedWindows:[],lastActiveWindow:{backupPath:"/home/user/.config/code-oss-dev/Backups/53b714b46ef1a2d4346568b4f591028c",uiState:{mode:W.Maximized,x:0,y:27,width:2560,height:1364},workspace:{id:"53b714b46ef1a2d4346568b4f591028c",configPath:a.parse("file:///home/user/workspaces/testing/custom.code-workspace")}}};r(o,e,"v1_32_workspace"),e=f(JSON.parse(`{
			"openedWindows": [],
			"lastActiveWindow": {
				"folder": "file:///home/user/workspaces/testing/folding",
				"backupPath": "/home/user/.config/code-oss-dev/Backups/1daac1621c6c06f9e916ac8062e5a1b5",
				"uiState": {
					"mode": 1,
					"x": 625,
					"y": 263,
					"width": 1718,
					"height": 953
				}
			}
		}`)),o={openedWindows:[],lastActiveWindow:{backupPath:"/home/user/.config/code-oss-dev/Backups/1daac1621c6c06f9e916ac8062e5a1b5",uiState:{mode:W.Normal,x:625,y:263,width:1718,height:953},folderUri:a.parse("file:///home/user/workspaces/testing/folding")}},r(o,e,"v1_32_folder"),e=f(JSON.parse(` {
			"openedWindows": [
			],
			"lastActiveWindow": {
				"backupPath": "/home/user/.config/code-oss-dev/Backups/1549539668998",
				"uiState": {
					"mode": 1,
					"x": 768,
					"y": 336,
					"width": 1024,
					"height": 768
				}
			}
		}`)),o={openedWindows:[],lastActiveWindow:{backupPath:"/home/user/.config/code-oss-dev/Backups/1549539668998",uiState:{mode:W.Normal,x:768,y:336,width:1024,height:768}}},r(o,e,"v1_32_empty_window")}),I()});
