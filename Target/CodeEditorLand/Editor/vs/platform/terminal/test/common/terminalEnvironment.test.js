import{strictEqual as o}from"assert";import{OperatingSystem as e,OS as s}from"../../../../base/common/platform.js";import{ensureNoDisposablesAreLeakedInTestSuite as t}from"../../../../base/test/common/utils.js";import{collapseTildePath as a,sanitizeCwd as r}from"../../common/terminalEnvironment.js";suite("terminalEnvironment",()=>{t(),suite("collapseTildePath",()=>{test("should return empty string for a falsy path",()=>{o(a("","/foo","/"),""),o(a(void 0,"/foo","/"),"")}),test("should return path for a falsy user home",()=>{o(a("/foo","","/"),"/foo"),o(a("/foo",void 0,"/"),"/foo")}),test("should not collapse when user home isn't present",()=>{o(a("/foo","/bar","/"),"/foo"),o(a("C:\\foo","C:\\bar","\\"),"C:\\foo")}),test("should collapse with Windows separators",()=>{o(a("C:\\foo\\bar","C:\\foo","\\"),"~\\bar"),o(a("C:\\foo\\bar","C:\\foo\\","\\"),"~\\bar"),o(a("C:\\foo\\bar\\baz","C:\\foo\\","\\"),"~\\bar\\baz"),o(a("C:\\foo\\bar\\baz","C:\\foo","\\"),"~\\bar\\baz")}),test("should collapse mixed case with Windows separators",()=>{o(a("c:\\foo\\bar","C:\\foo","\\"),"~\\bar"),o(a("C:\\foo\\bar\\baz","c:\\foo","\\"),"~\\bar\\baz")}),test("should collapse with Posix separators",()=>{o(a("/foo/bar","/foo","/"),"~/bar"),o(a("/foo/bar","/foo/","/"),"~/bar"),o(a("/foo/bar/baz","/foo","/"),"~/bar/baz"),o(a("/foo/bar/baz","/foo/","/"),"~/bar/baz")})}),suite("sanitizeCwd",()=>{s===e.Windows&&test("should make the Windows drive letter uppercase",()=>{o(r("c:\\foo\\bar"),"C:\\foo\\bar")}),test("should remove any wrapping quotes",()=>{o(r("'/foo/bar'"),"/foo/bar"),o(r('"/foo/bar"'),"/foo/bar")})})});