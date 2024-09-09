import p from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as y}from"../../../../../base/test/common/utils.js";import{IgnoreFile as b}from"../../common/ignoreFile.js";function g(e,t,i,n,m){return d=>{const r=e.endsWith("/"),a=r?e.slice(0,e.length-1):e,_=new b(t,d+i);if(m){const c=_.isPathIncludedInTraversal(d+a,r);n?p(c,`${i}: ${t} should traverse ${r?"dir":"file"} ${d}${a}`):p(!c,`${i}: ${t} should not traverse ${r?"dir":"file"} ${d}${a}`)}else{const c=_.isArbitraryPathIgnored(d+a,r);n?p(c,`${i}: ${t} should ignore ${r?"dir":"file"} ${d}${a}`):p(!c,`${i}: ${t} should not ignore ${r?"dir":"file"} ${d}${a}`)}}}function l(e,t,i){const n=g(i,e,t,!1,!0);n(""),n("/someFolder")}function u(e,t,i){const n=g(i,e,t,!0,!0);n(""),n("/someFolder")}function o(e,t,i){const n=g(i,e,t,!0,!1);n(""),n("/someFolder")}function s(e,t,i){const n=g(i,e,t,!1,!1);n(""),n("/someFolder")}suite("Parsing .gitignore files",()=>{y(),test("paths with trailing slashes do not match files",()=>{const e=`node_modules/
`;s(e,"/","/node_modules"),o(e,"/","/node_modules/"),s(e,"/","/inner/node_modules"),o(e,"/","/inner/node_modules/")}),test("parsing simple gitignore files",()=>{let e=`node_modules
out
`;o(e,"/","/node_modules"),l(e,"/","/node_modules"),o(e,"/","/node_modules/file"),o(e,"/","/dir/node_modules"),o(e,"/","/dir/node_modules/file"),o(e,"/","/out"),l(e,"/","/out"),o(e,"/","/out/file"),o(e,"/","/dir/out"),o(e,"/","/dir/out/file"),e=`/node_modules
/out
`,o(e,"/","/node_modules"),o(e,"/","/node_modules/file"),s(e,"/","/dir/node_modules"),s(e,"/","/dir/node_modules/file"),o(e,"/","/out"),o(e,"/","/out/file"),s(e,"/","/dir/out"),s(e,"/","/dir/out/file"),e=`node_modules/
out/
`,s(e,"/","/node_modules"),o(e,"/","/node_modules/"),o(e,"/","/node_modules/file"),o(e,"/","/dir/node_modules/"),s(e,"/","/dir/node_modules"),o(e,"/","/dir/node_modules/file"),o(e,"/","/out/"),s(e,"/","/out"),o(e,"/","/out/file"),s(e,"/","/dir/out"),o(e,"/","/dir/out/"),o(e,"/","/dir/out/file")}),test("parsing files-in-folder exclude",()=>{let e=`node_modules/*
`;s(e,"/","/node_modules"),s(e,"/","/node_modules/"),u(e,"/","/node_modules"),u(e,"/","/node_modules/"),o(e,"/","/node_modules/something"),l(e,"/","/node_modules/something"),o(e,"/","/node_modules/something/else"),o(e,"/","/node_modules/@types"),l(e,"/","/node_modules/@types"),e=`node_modules/**/*
`,s(e,"/","/node_modules"),s(e,"/","/node_modules/"),o(e,"/","/node_modules/something"),o(e,"/","/node_modules/something/else"),o(e,"/","/node_modules/@types")}),test("parsing simple negations",()=>{let e=`node_modules/*
!node_modules/@types
`;s(e,"/","/node_modules"),u(e,"/","/node_modules"),o(e,"/","/node_modules/something"),l(e,"/","/node_modules/something"),o(e,"/","/node_modules/something/else"),s(e,"/","/node_modules/@types"),u(e,"/","/node_modules/@types"),u(e,"/","/node_modules/@types/boop"),e=`*.log
!important.log
`,o(e,"/","/test.log"),o(e,"/","/inner/test.log"),s(e,"/","/important.log"),s(e,"/","/inner/important.log"),l(e,"/","/test.log"),l(e,"/","/inner/test.log"),u(e,"/","/important.log"),u(e,"/","/inner/important.log")}),test("nested .gitignores",()=>{let e=`node_modules
out
`;o(e,"/inner/","/inner/node_modules"),o(e,"/inner/","/inner/more/node_modules"),e=`/node_modules
/out
`,o(e,"/inner/","/inner/node_modules"),s(e,"/inner/","/inner/more/node_modules"),s(e,"/inner/","/node_modules"),e=`node_modules/
out/
`,s(e,"/inner/","/inner/node_modules"),o(e,"/inner/","/inner/node_modules/"),s(e,"/inner/","/inner/more/node_modules"),o(e,"/inner/","/inner/more/node_modules/"),s(e,"/inner/","/node_modules")}),test("file extension matches",()=>{let e=`*.js
`;s(e,"/","/myFile.ts"),o(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),e="/*.js",s(e,"/","/myFile.ts"),o(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),s(e,"/","/inner/myFile.js"),e="**/*.js",s(e,"/","/myFile.ts"),o(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),o(e,"/","/inner/more/myFile.js"),e="inner/*.js",s(e,"/","/myFile.ts"),s(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),s(e,"/","/inner/more/myFile.js"),e="/inner/*.js",s(e,"/","/myFile.ts"),s(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),s(e,"/","/inner/more/myFile.js"),e="**/inner/*.js",s(e,"/","/myFile.ts"),s(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),s(e,"/","/inner/more/myFile.js"),e="**/inner/**/*.js",s(e,"/","/myFile.ts"),s(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),o(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),o(e,"/","/inner/more/myFile.js"),e="**/more/*.js",s(e,"/","/myFile.ts"),s(e,"/","/myFile.js"),s(e,"/","/inner/myFile.ts"),s(e,"/","/inner/myFile.js"),s(e,"/","/inner/more/myFile.ts"),o(e,"/","/inner/more/myFile.js")}),test("real world example: vscode-js-debug",()=>{const e=`.cache/
			.profile/
			.cdp-profile/
			.headless-profile/
			.vscode-test/
			.DS_Store
			node_modules/
			out/
			dist
			/coverage
			/.nyc_output
			demos/web-worker/vscode-pwa-dap.log
			demos/web-worker/vscode-pwa-cdp.log
			.dynamic-testWorkspace
			**/test/**/*.actual
			/testWorkspace/web/tmp
			/testWorkspace/**/debug.log
			/testWorkspace/webview/win/true/
			*.cpuprofile`,t=["/distro","/inner/coverage","/inner/.nyc_output","/inner/demos/web-worker/vscode-pwa-dap.log","/inner/demos/web-worker/vscode-pwa-cdp.log","/testWorkspace/webview/win/true","/a/best/b/c.actual","/best/b/c.actual"],i=["/.profile/","/inner/.profile/","/.DS_Store","/inner/.DS_Store","/coverage","/.nyc_output","/demos/web-worker/vscode-pwa-dap.log","/demos/web-worker/vscode-pwa-cdp.log","/.dynamic-testWorkspace","/inner/.dynamic-testWorkspace","/test/.actual","/test/hello.actual","/a/test/.actual","/a/test/b.actual","/a/test/b/.actual","/a/test/b/c.actual","/a/b/test/.actual","/a/b/test/f/c.actual","/testWorkspace/web/tmp","/testWorkspace/debug.log","/testWorkspace/a/debug.log","/testWorkspace/a/b/debug.log","/testWorkspace/webview/win/true/","/.cpuprofile","/a.cpuprofile","/aa/a.cpuprofile","/aaa/aa/a.cpuprofile"];for(const n of t)s(e,"/",n);for(const n of i)o(e,"/",n)}),test("real world example: vscode",()=>{const e=`.DS_Store
			.cache
			npm-debug.log
			Thumbs.db
			node_modules/
			.build/
			extensions/**/dist/
			/out*/
			/extensions/**/out/
			src/vs/server
			resources/server
			build/node_modules
			coverage/
			test_data/
			test-results/
			yarn-error.log
			vscode.lsif
			vscode.db
			/.profile-oss`,t=["/inner/extensions/dist","/inner/extensions/boop/dist/test","/inner/extensions/boop/doop/dist","/inner/extensions/boop/doop/dist/test","/inner/extensions/boop/doop/dist/test","/inner/extensions/out/test","/inner/extensions/boop/out","/inner/extensions/boop/out/test","/inner/out/","/inner/out/test","/inner/out1/","/inner/out1/test","/inner/out2/","/inner/out2/test","/inner/.profile-oss","/extensions/dist","/extensions/boop/doop/dist","/extensions/boop/out"],i=["/extensions/dist/","/extensions/boop/dist/test","/extensions/boop/doop/dist/","/extensions/boop/doop/dist/test","/extensions/boop/doop/dist/test","/extensions/out/test","/extensions/boop/out/","/extensions/boop/out/test","/out/","/out/test","/out1/","/out1/test","/out2/","/out2/test","/.profile-oss"];for(const n of t)s(e,"/",n);for(const n of i)o(e,"/",n)}),test("various advanced constructs found in popular repos",()=>{const e=({pattern:t,included:i,excluded:n})=>{for(const m of i)s(t,"/",m);for(const m of n)o(t,"/",m)};e({pattern:`**/node_modules
			/packages/*/dist`,excluded:["/node_modules","/test/node_modules","/node_modules/test","/test/node_modules/test","/packages/a/dist","/packages/abc/dist","/packages/abc/dist/test"],included:["/inner/packages/a/dist","/inner/packages/abc/dist","/inner/packages/abc/dist/test","/packages/dist","/packages/dist/test","/packages/a/b/dist","/packages/a/b/dist/test"]}),e({pattern:`.yarn/*
			# !.yarn/cache
			!.yarn/patches
			!.yarn/plugins
			!.yarn/releases
			!.yarn/sdks
			!.yarn/versions`,excluded:["/.yarn/test","/.yarn/cache"],included:["/inner/.yarn/test","/inner/.yarn/cache","/.yarn/patches","/.yarn/plugins","/.yarn/releases","/.yarn/sdks","/.yarn/versions"]}),e({pattern:`[._]*s[a-w][a-z]
			[._]s[a-w][a-z]
			*.un~
			*~`,excluded:["/~","/abc~","/inner/~","/inner/abc~","/.un~","/a.un~","/test/.un~","/test/a.un~","/.saa","/....saa","/._._sby","/inner/._._sby","/_swz"],included:["/.jaa"]}),e({pattern:`*.pbxuser
			!default.pbxuser
			*.mode1v3
			!default.mode1v3
			*.mode2v3
			!default.mode2v3
			*.perspectivev3
			!default.perspectivev3`,excluded:[],included:[]}),e({pattern:`[Dd]ebug/
			[Dd]ebugPublic/
			[Rr]elease/
			[Rr]eleases/
			*.[Mm]etrics.xml
			[Tt]est[Rr]esult*/
			[Bb]uild[Ll]og.*
			bld/
			[Bb]in/
			[Oo]bj/
			[Ll]og/`,excluded:[],included:[]}),e({pattern:`Dockerfile*
			!/tests/bud/*/Dockerfile*
			!/tests/conformance/**/Dockerfile*`,excluded:[],included:[]}),e({pattern:`*.pdf
			*.html
			!author_bio.html
			!colo.html
			!copyright.html
			!cover.html
			!ix.html
			!titlepage.html
			!toc.html`,excluded:[],included:[]}),e({pattern:`/log/*
			/tmp/*
			!/log/.keep
			!/tmp/.keep`,excluded:[],included:[]})})});
