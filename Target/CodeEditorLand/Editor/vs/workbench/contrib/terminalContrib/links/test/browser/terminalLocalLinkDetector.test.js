import{isWindows as I,OperatingSystem as p}from"../../../../../../base/common/platform.js";import{format as C}from"../../../../../../base/common/strings.js";import{IConfigurationService as x}from"../../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as T}from"../../../../../../platform/configuration/test/common/testConfigurationService.js";import{TestInstantiationService as E}from"../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{TerminalBuiltinLinkType as l}from"../../browser/links.js";import{TerminalLocalLinkDetector as g}from"../../browser/terminalLocalLinkDetector.js";import{TerminalCapabilityStore as L}from"../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";import{assertLinkHelper as P}from"./linkTestUtils.js";import{timeout as z}from"../../../../../../base/common/async.js";import{strictEqual as $}from"assert";import{TerminalLinkResolver as v}from"../../browser/terminalLinkResolver.js";import{IFileService as W}from"../../../../../../platform/files/common/files.js";import{createFileStat as U}from"../../../../../test/common/workbenchTestServices.js";import{URI as e}from"../../../../../../base/common/uri.js";import{NullLogService as D}from"../../../../../../platform/log/common/log.js";import{ITerminalLogService as R}from"../../../../../../platform/terminal/common/terminal.js";import{importAMDNodeModule as A}from"../../../../../../amdX.js";import{ensureNoDisposablesAreLeakedInTestSuite as H}from"../../../../../../base/test/common/utils.js";const M=["/foo","/foo/bar","/foo/[bar]","/foo/[bar].baz","/foo/[bar]/baz","/foo/bar+more",{link:"file:///foo",resource:e.file("/foo")},{link:"file:///foo/bar",resource:e.file("/foo/bar")},{link:"file:///foo/bar%20baz",resource:e.file("/foo/bar baz")},{link:"~/foo",resource:e.file("/home/foo")},{link:"./foo",resource:e.file("/parent/cwd/foo")},{link:"./$foo",resource:e.file("/parent/cwd/$foo")},{link:"../foo",resource:e.file("/parent/foo")},{link:"foo/bar",resource:e.file("/parent/cwd/foo/bar")},{link:"foo/bar+more",resource:e.file("/parent/cwd/foo/bar+more")}],q=["c:\\foo",{link:"\\\\?\\C:\\foo",resource:e.file("C:\\foo")},"c:/foo","c:/foo/bar","c:\\foo\\bar","c:\\foo\\bar+more","c:\\foo/bar\\baz",{link:"file:///c:/foo",resource:e.file("c:\\foo")},{link:"file:///c:/foo/bar",resource:e.file("c:\\foo\\bar")},{link:"file:///c:/foo/bar%20baz",resource:e.file("c:\\foo\\bar baz")},{link:"~\\foo",resource:e.file("C:\\Home\\foo")},{link:"~/foo",resource:e.file("C:\\Home\\foo")},{link:".\\foo",resource:e.file("C:\\Parent\\Cwd\\foo")},{link:"./foo",resource:e.file("C:\\Parent\\Cwd\\foo")},{link:"./$foo",resource:e.file("C:\\Parent\\Cwd\\$foo")},{link:"..\\foo",resource:e.file("C:\\Parent\\foo")},{link:"foo/bar",resource:e.file("C:\\Parent\\Cwd\\foo\\bar")},{link:"foo/bar",resource:e.file("C:\\Parent\\Cwd\\foo\\bar")},{link:"foo/[bar]",resource:e.file("C:\\Parent\\Cwd\\foo\\[bar]")},{link:"foo/[bar].baz",resource:e.file("C:\\Parent\\Cwd\\foo\\[bar].baz")},{link:"foo/[bar]/baz",resource:e.file("C:\\Parent\\Cwd\\foo\\[bar]/baz")},{link:"foo\\bar",resource:e.file("C:\\Parent\\Cwd\\foo\\bar")},{link:"foo\\[bar].baz",resource:e.file("C:\\Parent\\Cwd\\foo\\[bar].baz")},{link:"foo\\[bar]\\baz",resource:e.file("C:\\Parent\\Cwd\\foo\\[bar]\\baz")},{link:"foo\\bar+more",resource:e.file("C:\\Parent\\Cwd\\foo\\bar+more")}],F=[{urlFormat:"{0}"},{urlFormat:'{0}" on line {1}',line:"5"},{urlFormat:'{0}" on line {1}, column {2}',line:"5",column:"3"},{urlFormat:'{0}":line {1}',line:"5"},{urlFormat:'{0}":line {1}, column {2}',line:"5",column:"3"},{urlFormat:'{0}": line {1}',line:"5"},{urlFormat:'{0}": line {1}, col {2}',line:"5",column:"3"},{urlFormat:"{0}({1})",line:"5"},{urlFormat:"{0} ({1})",line:"5"},{urlFormat:"{0}({1},{2})",line:"5",column:"3"},{urlFormat:"{0} ({1},{2})",line:"5",column:"3"},{urlFormat:"{0}: ({1},{2})",line:"5",column:"3"},{urlFormat:"{0}({1}, {2})",line:"5",column:"3"},{urlFormat:"{0} ({1}, {2})",line:"5",column:"3"},{urlFormat:"{0}: ({1}, {2})",line:"5",column:"3"},{urlFormat:"{0}:{1}",line:"5"},{urlFormat:"{0}:{1}:{2}",line:"5",column:"3"},{urlFormat:"{0} {1}:{2}",line:"5",column:"3"},{urlFormat:"{0}[{1}]",line:"5"},{urlFormat:"{0} [{1}]",line:"5"},{urlFormat:"{0}[{1},{2}]",line:"5",column:"3"},{urlFormat:"{0} [{1},{2}]",line:"5",column:"3"},{urlFormat:"{0}: [{1},{2}]",line:"5",column:"3"},{urlFormat:"{0}[{1}, {2}]",line:"5",column:"3"},{urlFormat:"{0} [{1}, {2}]",line:"5",column:"3"},{urlFormat:"{0}: [{1}, {2}]",line:"5",column:"3"},{urlFormat:'{0}",{1}',line:"5"},{urlFormat:"{0}',{1}",line:"5"},{urlFormat:"{0}#{1}",line:"5"},{urlFormat:"{0}#{1}:{2}",line:"5",column:"5"}],N=["C:\\foo bar","C:\\foo bar\\baz","C:\\foo\\bar baz","C:\\foo/bar baz"],y=[{urlFormat:'File "{0}"',linkCellStartOffset:5},{urlFormat:'File "{0}", line {1}',line:"5",linkCellStartOffset:5},{urlFormat:" FILE  {0}",linkCellStartOffset:7},{urlFormat:" FILE  {0}:{1}",line:"5",linkCellStartOffset:7},{urlFormat:" FILE  {0}:{1}:{2}",line:"5",column:"3",linkCellStartOffset:7},{urlFormat:"{0}({1}) :",line:"5",linkCellEndOffset:-2},{urlFormat:"{0}({1},{2}) :",line:"5",column:"3",linkCellEndOffset:-2},{urlFormat:"{0}({1}, {2}) :",line:"5",column:"3",linkCellEndOffset:-2},{urlFormat:"{0}({1}):",line:"5",linkCellEndOffset:-1},{urlFormat:"{0}({1},{2}):",line:"5",column:"3",linkCellEndOffset:-1},{urlFormat:"{0}({1}, {2}):",line:"5",column:"3",linkCellEndOffset:-1},{urlFormat:"{0}:{1} :",line:"5",linkCellEndOffset:-2},{urlFormat:"{0}:{1}:{2} :",line:"5",column:"3",linkCellEndOffset:-2},{urlFormat:"{0}:{1}:",line:"5",linkCellEndOffset:-1},{urlFormat:"{0}:{1}:{2}:",line:"5",column:"3",linkCellEndOffset:-1},{urlFormat:"{0}>",linkCellEndOffset:-1},{urlFormat:"{0}"}];suite("Workbench - TerminalLocalLinkDetector",()=>{const b=H();let c,h,d,k,w,t;async function i(r,o,n){let f;const a=await Promise.race([P(o,n,d,r).then(()=>"success"),(f=z(2)).then(()=>"timeout")]);$(a,"success",`Awaiting link assertion for "${o}" timed out`),f.cancel()}async function m(r,o){const n=o??e.file(r);await i(l.LocalFile,r,[{uri:n,range:[[1,1],[r.length,1]]}]),await i(l.LocalFile,` ${r} `,[{uri:n,range:[[2,1],[r.length+1,1]]}]),await i(l.LocalFile,`(${r})`,[{uri:n,range:[[2,1],[r.length+1,1]]}]),await i(l.LocalFile,`[${r}]`,[{uri:n,range:[[2,1],[r.length+1,1]]}])}setup(async()=>{c=b.add(new E),h=new T,c.stub(x,h),c.stub(W,{async stat(o){if(!t.map(n=>n.path).includes(o.path))throw new Error("Doesn't exist");return U(o)}}),c.stub(R,new D),k=c.createInstance(v),t=[];const r=(await A("@xterm/xterm","lib/xterm.js")).Terminal;w=new r({allowProposedApi:!0,cols:80,rows:30})}),suite("platform independent",()=>{setup(()=>{d=c.createInstance(g,w,b.add(new L),{initialCwd:"/parent/cwd",os:p.Linux,remoteAuthority:void 0,userHome:"/home",backend:void 0},k)}),test("should support multiple link results",async()=>{t=[e.file("/parent/cwd/foo"),e.file("/parent/cwd/bar")],await i(l.LocalFile,"./foo ./bar",[{range:[[1,1],[5,1]],uri:e.file("/parent/cwd/foo")},{range:[[7,1],[11,1]],uri:e.file("/parent/cwd/bar")}])}),test("should support trimming extra quotes",async()=>{t=[e.file("/parent/cwd/foo")],await i(l.LocalFile,'"foo"" on line 5',[{range:[[1,1],[16,1]],uri:e.file("/parent/cwd/foo")}])}),test("should support trimming extra square brackets",async()=>{t=[e.file("/parent/cwd/foo")],await i(l.LocalFile,'"foo]" on line 5',[{range:[[1,1],[16,1]],uri:e.file("/parent/cwd/foo")}])})}),suite("macOS/Linux",()=>{setup(()=>{d=c.createInstance(g,w,b.add(new L),{initialCwd:"/parent/cwd",os:p.Linux,remoteAuthority:void 0,userHome:"/home",backend:void 0},k)});for(const r of M){const o=typeof r=="string"?r:r.link,n=typeof r=="string"?e.file(r):r.resource;suite(`Link: ${o}`,()=>{for(let f=0;f<F.length;f++){const a=F[f],s=C(a.urlFormat,o,a.line,a.column);test(`should detect in "${s}"`,async()=>{t=[n],await m(s,n)})}})}test("Git diff links",async()=>{t=[e.file("/parent/cwd/foo/bar")],await i(l.LocalFile,"diff --git a/foo/bar b/foo/bar",[{uri:t[0],range:[[14,1],[20,1]]},{uri:t[0],range:[[24,1],[30,1]]}]),await i(l.LocalFile,"--- a/foo/bar",[{uri:t[0],range:[[7,1],[13,1]]}]),await i(l.LocalFile,"+++ b/foo/bar",[{uri:t[0],range:[[7,1],[13,1]]}])})}),I&&suite("Windows",()=>{const r=new Map;setup(()=>{d=c.createInstance(g,w,b.add(new L),{initialCwd:"C:\\Parent\\Cwd",os:p.Windows,remoteAuthority:void 0,userHome:"C:\\Home",backend:{async getWslPath(o,n){return n==="unix-to-win"?r.get(o)??o:o}}},k),r.clear()});for(const o of q){const n=typeof o=="string"?o:o.link,f=typeof o=="string"?e.file(o):o.resource;suite(`Link "${n}"`,()=>{for(let a=0;a<F.length;a++){const s=F[a],u=C(s.urlFormat,n,s.line,s.column);test(`should detect in "${u}"`,async()=>{t=[f],await m(u,f)})}})}for(const o of N){const n=typeof o=="string"?o:o.link,f=typeof o=="string"?e.file(o):o.resource;suite(`Fallback link "${n}"`,()=>{for(let a=0;a<y.length;a++){const s=y[a],u=C(s.urlFormat,n,s.line,s.column),O=s.linkCellStartOffset??0,S=s.linkCellEndOffset??0;test(`should detect in "${u}"`,async()=>{t=[f],await i(l.LocalFile,u,[{uri:f,range:[[1+O,1],[u.length+S,1]]}])})}})}test("Git diff links",async()=>{const o=e.file("C:\\Parent\\Cwd\\foo\\bar");t=[o],await i(l.LocalFile,"diff --git a/foo/bar b/foo/bar",[{uri:o,range:[[14,1],[20,1]]},{uri:o,range:[[24,1],[30,1]]}]),await i(l.LocalFile,"--- a/foo/bar",[{uri:o,range:[[7,1],[13,1]]}]),await i(l.LocalFile,"+++ b/foo/bar",[{uri:o,range:[[7,1],[13,1]]}])}),suite("WSL",()=>{test("Unix -> Windows /mnt/ style links",async()=>{r.set("/mnt/c/foo/bar","C:\\foo\\bar"),t=[e.file("C:\\foo\\bar")],await m("/mnt/c/foo/bar",t[0])}),test("Windows -> Unix \\\\wsl$\\ style links",async()=>{t=[e.file("\\\\wsl$\\Debian\\home\\foo\\bar")],await m("\\\\wsl$\\Debian\\home\\foo\\bar")}),test("Windows -> Unix \\\\wsl.localhost\\ style links",async()=>{t=[e.file("\\\\wsl.localhost\\Debian\\home\\foo\\bar")],await m("\\\\wsl.localhost\\Debian\\home\\foo\\bar")})})})});