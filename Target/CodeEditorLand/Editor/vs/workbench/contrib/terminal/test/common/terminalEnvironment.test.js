import{deepStrictEqual as c,strictEqual as e}from"assert";import"../../../../../base/common/collections.js";import{isWindows as p,OperatingSystem as t}from"../../../../../base/common/platform.js";import{URI as u}from"../../../../../base/common/uri.js";import{addTerminalEnvironmentKeys as h,createTerminalEnvironment as T,getCwd as d,getLangEnvVariable as o,mergeEnvironments as b,preparePathForShell as n,shouldSetLangEnvVariable as s}from"../../common/terminalEnvironment.js";import{GeneralShellType as l,PosixShellType as f,WindowsShellType as r}from"../../../../../platform/terminal/common/terminal.js";import{ensureNoDisposablesAreLeakedInTestSuite as v}from"../../../../../base/test/common/utils.js";suite("Workbench - TerminalEnvironment",()=>{v(),suite("addTerminalEnvironmentKeys",()=>{test("should set expected variables",()=>{const a={};h(a,"1.2.3","en","on"),e(a.TERM_PROGRAM,"vscode"),e(a.TERM_PROGRAM_VERSION,"1.2.3"),e(a.COLORTERM,"truecolor"),e(a.LANG,"en_US.UTF-8")}),test("should use language variant for LANG that is provided in locale",()=>{const a={};h(a,"1.2.3","en-au","on"),e(a.LANG,"en_AU.UTF-8","LANG is equal to the requested locale with UTF-8")}),test("should fallback to en_US when no locale is provided",()=>{const a={FOO:"bar"};h(a,"1.2.3",void 0,"on"),e(a.LANG,"en_US.UTF-8","LANG is equal to en_US.UTF-8 as fallback.")}),test("should fallback to en_US when an invalid locale is provided",()=>{const a={LANG:"replace"};h(a,"1.2.3",void 0,"on"),e(a.LANG,"en_US.UTF-8","LANG is set to the fallback LANG")}),test("should override existing LANG",()=>{const a={LANG:"en_AU.UTF-8"};h(a,"1.2.3",void 0,"on"),e(a.LANG,"en_US.UTF-8","LANG is equal to the parent environment's LANG")})}),suite("shouldSetLangEnvVariable",()=>{test("auto",()=>{e(s({},"auto"),!0),e(s({LANG:"en-US"},"auto"),!0),e(s({LANG:"en-US.utf"},"auto"),!0),e(s({LANG:"en-US.utf8"},"auto"),!1),e(s({LANG:"en-US.UTF-8"},"auto"),!1)}),test("off",()=>{e(s({},"off"),!1),e(s({LANG:"en-US"},"off"),!1),e(s({LANG:"en-US.utf"},"off"),!1),e(s({LANG:"en-US.utf8"},"off"),!1),e(s({LANG:"en-US.UTF-8"},"off"),!1)}),test("on",()=>{e(s({},"on"),!0),e(s({LANG:"en-US"},"on"),!0),e(s({LANG:"en-US.utf"},"on"),!0),e(s({LANG:"en-US.utf8"},"on"),!0),e(s({LANG:"en-US.UTF-8"},"on"),!0)})}),suite("getLangEnvVariable",()=>{test("should fallback to en_US when no locale is provided",()=>{e(o(void 0),"en_US.UTF-8"),e(o(""),"en_US.UTF-8")}),test("should fallback to default language variants when variant isn't provided",()=>{e(o("af"),"af_ZA.UTF-8"),e(o("am"),"am_ET.UTF-8"),e(o("be"),"be_BY.UTF-8"),e(o("bg"),"bg_BG.UTF-8"),e(o("ca"),"ca_ES.UTF-8"),e(o("cs"),"cs_CZ.UTF-8"),e(o("da"),"da_DK.UTF-8"),e(o("de"),"de_DE.UTF-8"),e(o("el"),"el_GR.UTF-8"),e(o("en"),"en_US.UTF-8"),e(o("es"),"es_ES.UTF-8"),e(o("et"),"et_EE.UTF-8"),e(o("eu"),"eu_ES.UTF-8"),e(o("fi"),"fi_FI.UTF-8"),e(o("fr"),"fr_FR.UTF-8"),e(o("he"),"he_IL.UTF-8"),e(o("hr"),"hr_HR.UTF-8"),e(o("hu"),"hu_HU.UTF-8"),e(o("hy"),"hy_AM.UTF-8"),e(o("is"),"is_IS.UTF-8"),e(o("it"),"it_IT.UTF-8"),e(o("ja"),"ja_JP.UTF-8"),e(o("kk"),"kk_KZ.UTF-8"),e(o("ko"),"ko_KR.UTF-8"),e(o("lt"),"lt_LT.UTF-8"),e(o("nl"),"nl_NL.UTF-8"),e(o("no"),"no_NO.UTF-8"),e(o("pl"),"pl_PL.UTF-8"),e(o("pt"),"pt_BR.UTF-8"),e(o("ro"),"ro_RO.UTF-8"),e(o("ru"),"ru_RU.UTF-8"),e(o("sk"),"sk_SK.UTF-8"),e(o("sl"),"sl_SI.UTF-8"),e(o("sr"),"sr_YU.UTF-8"),e(o("sv"),"sv_SE.UTF-8"),e(o("tr"),"tr_TR.UTF-8"),e(o("uk"),"uk_UA.UTF-8"),e(o("zh"),"zh_CN.UTF-8")}),test("should set language variant based on full locale",()=>{e(o("en-AU"),"en_AU.UTF-8"),e(o("en-au"),"en_AU.UTF-8"),e(o("fa-ke"),"fa_KE.UTF-8")})}),suite("mergeEnvironments",()=>{test("should add keys",()=>{const a={a:"b"};b(a,{c:"d"}),c(a,{a:"b",c:"d"})}),(p?test:test.skip)("should add keys ignoring case on Windows",()=>{const a={a:"b"};b(a,{A:"c"}),c(a,{a:"c"})}),test("null values should delete keys from the parent env",()=>{const a={a:"b",c:"d"};b(a,{a:null}),c(a,{c:"d"})}),(p?test:test.skip)("null values should delete keys from the parent env ignoring case on Windows",()=>{const a={a:"b",c:"d"};b(a,{A:null}),c(a,{c:"d"})})}),suite("getCwd",()=>{function a(i,m){e(u.file(i).fsPath,u.file(m).fsPath)}test("should default to userHome for an empty workspace",async()=>{a(await d({executable:void 0,args:[]},"/userHome/",void 0,void 0,void 0),"/userHome/")}),test("should use to the workspace if it exists",async()=>{a(await d({executable:void 0,args:[]},"/userHome/",void 0,u.file("/foo"),void 0),"/foo")}),test("should use an absolute custom cwd as is",async()=>{a(await d({executable:void 0,args:[]},"/userHome/",void 0,void 0,"/foo"),"/foo")}),test("should normalize a relative custom cwd against the workspace path",async()=>{a(await d({executable:void 0,args:[]},"/userHome/",void 0,u.file("/bar"),"foo"),"/bar/foo"),a(await d({executable:void 0,args:[]},"/userHome/",void 0,u.file("/bar"),"./foo"),"/bar/foo"),a(await d({executable:void 0,args:[]},"/userHome/",void 0,u.file("/bar"),"../foo"),"/foo")}),test("should fall back for relative a custom cwd that doesn't have a workspace",async()=>{a(await d({executable:void 0,args:[]},"/userHome/",void 0,void 0,"foo"),"/userHome/"),a(await d({executable:void 0,args:[]},"/userHome/",void 0,void 0,"./foo"),"/userHome/"),a(await d({executable:void 0,args:[]},"/userHome/",void 0,void 0,"../foo"),"/userHome/")}),test("should ignore custom cwd when told to ignore",async()=>{a(await d({executable:void 0,args:[],ignoreConfigurationCwd:!0},"/userHome/",void 0,u.file("/bar"),"/foo"),"/bar")})}),suite("preparePathForShell",()=>{const a={getWslPath:async(i,m)=>{if(m==="unix-to-win"){const U=i.match(/^\/mnt\/(?<drive>[a-zA-Z])\/(?<path>.+)$/)?.groups;return U?`${U.drive}:\\${U.path.replace(/\//g,"\\")}`:i}const w=i.match(/(?<drive>[a-zA-Z]):\\(?<path>.+)/)?.groups;return w?`/mnt/${w.drive.toLowerCase()}/${w.path.replace(/\\/g,"/")}`:i}};suite("Windows frontend, Windows backend",()=>{test("Command Prompt",async()=>{e(await n("c:\\foo\\bar","cmd","cmd",r.CommandPrompt,a,t.Windows,!0),"c:\\foo\\bar"),e(await n("c:\\foo\\bar'baz","cmd","cmd",r.CommandPrompt,a,t.Windows,!0),"c:\\foo\\bar'baz"),e(await n("c:\\foo\\bar$(echo evil)baz","cmd","cmd",r.CommandPrompt,a,t.Windows,!0),'"c:\\foo\\bar$(echo evil)baz"')}),test("PowerShell",async()=>{e(await n("c:\\foo\\bar","pwsh","pwsh",l.PowerShell,a,t.Windows,!0),"c:\\foo\\bar"),e(await n("c:\\foo\\bar'baz","pwsh","pwsh",l.PowerShell,a,t.Windows,!0),"& 'c:\\foo\\bar''baz'"),e(await n("c:\\foo\\bar$(echo evil)baz","pwsh","pwsh",l.PowerShell,a,t.Windows,!0),"& 'c:\\foo\\bar$(echo evil)baz'")}),test("Git Bash",async()=>{e(await n("c:\\foo\\bar","bash","bash",r.GitBash,a,t.Windows,!0),"'c:/foo/bar'"),e(await n("c:\\foo\\bar$(echo evil)baz","bash","bash",r.GitBash,a,t.Windows,!0),"'c:/foo/bar(echo evil)baz'")}),test("WSL",async()=>{e(await n("c:\\foo\\bar","bash","bash",r.Wsl,a,t.Windows,!0),"/mnt/c/foo/bar")})}),suite("Windows frontend, Linux backend",()=>{test("Bash",async()=>{e(await n("/foo/bar","bash","bash",f.Bash,a,t.Linux,!0),"'/foo/bar'"),e(await n("/foo/bar'baz","bash","bash",f.Bash,a,t.Linux,!0),"'/foo/barbaz'"),e(await n("/foo/bar$(echo evil)baz","bash","bash",f.Bash,a,t.Linux,!0),"'/foo/bar(echo evil)baz'")})}),suite("Linux frontend, Windows backend",()=>{test("Command Prompt",async()=>{e(await n("c:\\foo\\bar","cmd","cmd",r.CommandPrompt,a,t.Windows,!1),"c:\\foo\\bar"),e(await n("c:\\foo\\bar'baz","cmd","cmd",r.CommandPrompt,a,t.Windows,!1),"c:\\foo\\bar'baz"),e(await n("c:\\foo\\bar$(echo evil)baz","cmd","cmd",r.CommandPrompt,a,t.Windows,!1),'"c:\\foo\\bar$(echo evil)baz"')}),test("PowerShell",async()=>{e(await n("c:\\foo\\bar","pwsh","pwsh",l.PowerShell,a,t.Windows,!1),"c:\\foo\\bar"),e(await n("c:\\foo\\bar'baz","pwsh","pwsh",l.PowerShell,a,t.Windows,!1),"& 'c:\\foo\\bar''baz'"),e(await n("c:\\foo\\bar$(echo evil)baz","pwsh","pwsh",l.PowerShell,a,t.Windows,!1),"& 'c:\\foo\\bar$(echo evil)baz'")}),test("Git Bash",async()=>{e(await n("c:\\foo\\bar","bash","bash",r.GitBash,a,t.Windows,!1),"'c:/foo/bar'"),e(await n("c:\\foo\\bar$(echo evil)baz","bash","bash",r.GitBash,a,t.Windows,!1),"'c:/foo/bar(echo evil)baz'")}),test("WSL",async()=>{e(await n("c:\\foo\\bar","bash","bash",r.Wsl,a,t.Windows,!1),"/mnt/c/foo/bar")})}),suite("Linux frontend, Linux backend",()=>{test("Bash",async()=>{e(await n("/foo/bar","bash","bash",f.Bash,a,t.Linux,!1),"'/foo/bar'"),e(await n("/foo/bar'baz","bash","bash",f.Bash,a,t.Linux,!1),"'/foo/barbaz'"),e(await n("/foo/bar$(echo evil)baz","bash","bash",f.Bash,a,t.Linux,!1),"'/foo/bar(echo evil)baz'")})})}),suite("createTerminalEnvironment",()=>{const a={COLORTERM:"truecolor",TERM_PROGRAM:"vscode"};test("should retain variables equal to the empty string",async()=>{c(await T({},void 0,void 0,void 0,"off",{foo:"bar",empty:""}),{foo:"bar",empty:"",...a})})})});
