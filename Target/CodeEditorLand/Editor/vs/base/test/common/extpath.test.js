import t from"assert";import{CharCode as s}from"../../common/charCode.js";import*as e from"../../common/extpath.js";import{isWindows as i}from"../../common/platform.js";import{ensureNoDisposablesAreLeakedInTestSuite as n}from"./utils.js";suite("Paths",()=>{test("toForwardSlashes",()=>{t.strictEqual(e.toSlashes("\\\\server\\share\\some\\path"),"//server/share/some/path"),t.strictEqual(e.toSlashes("c:\\test"),"c:/test"),t.strictEqual(e.toSlashes("foo\\bar"),"foo/bar"),t.strictEqual(e.toSlashes("/user/far"),"/user/far")}),test("getRoot",()=>{t.strictEqual(e.getRoot("/user/far"),"/"),t.strictEqual(e.getRoot("\\\\server\\share\\some\\path"),"//server/share/"),t.strictEqual(e.getRoot("//server/share/some/path"),"//server/share/"),t.strictEqual(e.getRoot("//server/share"),"/"),t.strictEqual(e.getRoot("//server"),"/"),t.strictEqual(e.getRoot("//server//"),"/"),t.strictEqual(e.getRoot("c:/user/far"),"c:/"),t.strictEqual(e.getRoot("c:user/far"),"c:"),t.strictEqual(e.getRoot("http://www"),""),t.strictEqual(e.getRoot("http://www/"),"http://www/"),t.strictEqual(e.getRoot("file:///foo"),"file:///"),t.strictEqual(e.getRoot("file://foo"),"")}),(i?test:test.skip)("isUNC",()=>{t.ok(!e.isUNC("foo")),t.ok(!e.isUNC("/foo")),t.ok(!e.isUNC("\\foo")),t.ok(!e.isUNC("\\\\foo")),t.ok(e.isUNC("\\\\a\\b")),t.ok(!e.isUNC("//a/b")),t.ok(e.isUNC("\\\\server\\share")),t.ok(e.isUNC("\\\\server\\share\\")),t.ok(e.isUNC("\\\\server\\share\\path"))}),test("isValidBasename",()=>{t.ok(!e.isValidBasename(null)),t.ok(!e.isValidBasename("")),t.ok(e.isValidBasename("test.txt")),t.ok(!e.isValidBasename("/test.txt")),i?(t.ok(!e.isValidBasename("\\test.txt")),t.ok(!e.isValidBasename("aux")),t.ok(!e.isValidBasename("Aux")),t.ok(!e.isValidBasename("LPT0")),t.ok(!e.isValidBasename("aux.txt")),t.ok(!e.isValidBasename("com0.abc")),t.ok(e.isValidBasename("LPT00")),t.ok(e.isValidBasename("aux1")),t.ok(e.isValidBasename("aux1.txt")),t.ok(e.isValidBasename("aux1.aux.txt")),t.ok(!e.isValidBasename("test.txt.")),t.ok(!e.isValidBasename("test.txt..")),t.ok(!e.isValidBasename("test.txt ")),t.ok(!e.isValidBasename("test.txt	")),t.ok(!e.isValidBasename("tes:t.txt")),t.ok(!e.isValidBasename('tes"t.txt'))):t.ok(e.isValidBasename("\\test.txt"))}),test("sanitizeFilePath",()=>{i?(t.strictEqual(e.sanitizeFilePath(".","C:\\the\\cwd"),"C:\\the\\cwd"),t.strictEqual(e.sanitizeFilePath("","C:\\the\\cwd"),"C:\\the\\cwd"),t.strictEqual(e.sanitizeFilePath("C:","C:\\the\\cwd"),"C:\\"),t.strictEqual(e.sanitizeFilePath("C:\\","C:\\the\\cwd"),"C:\\"),t.strictEqual(e.sanitizeFilePath("C:\\\\","C:\\the\\cwd"),"C:\\"),t.strictEqual(e.sanitizeFilePath("C:\\folder\\my.txt","C:\\the\\cwd"),"C:\\folder\\my.txt"),t.strictEqual(e.sanitizeFilePath("C:\\folder\\my","C:\\the\\cwd"),"C:\\folder\\my"),t.strictEqual(e.sanitizeFilePath("C:\\folder\\..\\my","C:\\the\\cwd"),"C:\\my"),t.strictEqual(e.sanitizeFilePath("C:\\folder\\my\\","C:\\the\\cwd"),"C:\\folder\\my"),t.strictEqual(e.sanitizeFilePath("C:\\folder\\my\\\\\\","C:\\the\\cwd"),"C:\\folder\\my"),t.strictEqual(e.sanitizeFilePath("my.txt","C:\\the\\cwd"),"C:\\the\\cwd\\my.txt"),t.strictEqual(e.sanitizeFilePath("my.txt\\","C:\\the\\cwd"),"C:\\the\\cwd\\my.txt"),t.strictEqual(e.sanitizeFilePath("\\\\localhost\\folder\\my","C:\\the\\cwd"),"\\\\localhost\\folder\\my"),t.strictEqual(e.sanitizeFilePath("\\\\localhost\\folder\\my\\","C:\\the\\cwd"),"\\\\localhost\\folder\\my")):(t.strictEqual(e.sanitizeFilePath(".","/the/cwd"),"/the/cwd"),t.strictEqual(e.sanitizeFilePath("","/the/cwd"),"/the/cwd"),t.strictEqual(e.sanitizeFilePath("/","/the/cwd"),"/"),t.strictEqual(e.sanitizeFilePath("/folder/my.txt","/the/cwd"),"/folder/my.txt"),t.strictEqual(e.sanitizeFilePath("/folder/my","/the/cwd"),"/folder/my"),t.strictEqual(e.sanitizeFilePath("/folder/../my","/the/cwd"),"/my"),t.strictEqual(e.sanitizeFilePath("/folder/my/","/the/cwd"),"/folder/my"),t.strictEqual(e.sanitizeFilePath("/folder/my///","/the/cwd"),"/folder/my"),t.strictEqual(e.sanitizeFilePath("my.txt","/the/cwd"),"/the/cwd/my.txt"),t.strictEqual(e.sanitizeFilePath("my.txt/","/the/cwd"),"/the/cwd/my.txt"))}),test("isRootOrDriveLetter",()=>{i?(t.ok(e.isRootOrDriveLetter("c:")),t.ok(e.isRootOrDriveLetter("D:")),t.ok(e.isRootOrDriveLetter("D:/")),t.ok(e.isRootOrDriveLetter("D:\\")),t.ok(!e.isRootOrDriveLetter("D:\\path")),t.ok(!e.isRootOrDriveLetter("D:/path"))):(t.ok(e.isRootOrDriveLetter("/")),t.ok(!e.isRootOrDriveLetter("/path")))}),test("hasDriveLetter",()=>{i?(t.ok(e.hasDriveLetter("c:")),t.ok(e.hasDriveLetter("D:")),t.ok(e.hasDriveLetter("D:/")),t.ok(e.hasDriveLetter("D:\\")),t.ok(e.hasDriveLetter("D:\\path")),t.ok(e.hasDriveLetter("D:/path"))):(t.ok(!e.hasDriveLetter("/")),t.ok(!e.hasDriveLetter("/path")))}),test("getDriveLetter",()=>{i?(t.strictEqual(e.getDriveLetter("c:"),"c"),t.strictEqual(e.getDriveLetter("D:"),"D"),t.strictEqual(e.getDriveLetter("D:/"),"D"),t.strictEqual(e.getDriveLetter("D:\\"),"D"),t.strictEqual(e.getDriveLetter("D:\\path"),"D"),t.strictEqual(e.getDriveLetter("D:/path"),"D")):(t.ok(!e.getDriveLetter("/")),t.ok(!e.getDriveLetter("/path")))}),test("isWindowsDriveLetter",()=>{t.ok(!e.isWindowsDriveLetter(0)),t.ok(!e.isWindowsDriveLetter(-1)),t.ok(e.isWindowsDriveLetter(s.A)),t.ok(e.isWindowsDriveLetter(s.z))}),test("indexOfPath",()=>{t.strictEqual(e.indexOfPath("/foo","/bar",!0),-1),t.strictEqual(e.indexOfPath("/foo","/FOO",!1),-1),t.strictEqual(e.indexOfPath("/foo","/FOO",!0),0),t.strictEqual(e.indexOfPath("/some/long/path","/some/long",!1),0),t.strictEqual(e.indexOfPath("/some/long/path","/PATH",!0),10)}),test("parseLineAndColumnAware",()=>{let a=e.parseLineAndColumnAware("/foo/bar");t.strictEqual(a.path,"/foo/bar"),t.strictEqual(a.line,void 0),t.strictEqual(a.column,void 0),a=e.parseLineAndColumnAware("/foo/bar:33"),t.strictEqual(a.path,"/foo/bar"),t.strictEqual(a.line,33),t.strictEqual(a.column,1),a=e.parseLineAndColumnAware("/foo/bar:33:34"),t.strictEqual(a.path,"/foo/bar"),t.strictEqual(a.line,33),t.strictEqual(a.column,34),a=e.parseLineAndColumnAware("C:\\foo\\bar"),t.strictEqual(a.path,"C:\\foo\\bar"),t.strictEqual(a.line,void 0),t.strictEqual(a.column,void 0),a=e.parseLineAndColumnAware("C:\\foo\\bar:33"),t.strictEqual(a.path,"C:\\foo\\bar"),t.strictEqual(a.line,33),t.strictEqual(a.column,1),a=e.parseLineAndColumnAware("C:\\foo\\bar:33:34"),t.strictEqual(a.path,"C:\\foo\\bar"),t.strictEqual(a.line,33),t.strictEqual(a.column,34),a=e.parseLineAndColumnAware("/foo/bar:abb"),t.strictEqual(a.path,"/foo/bar:abb"),t.strictEqual(a.line,void 0),t.strictEqual(a.column,void 0)}),test("randomPath",()=>{let a=e.randomPath("/foo/bar");t.ok(a),a=e.randomPath("/foo/bar","prefix-"),t.ok(a.indexOf("prefix-"));const r=e.randomPath("/foo/bar"),o=e.randomPath("/foo/bar");t.notStrictEqual(r,o);const l=e.randomPath("","",3);t.strictEqual(l.length,3);const c=e.randomPath();t.ok(c)}),n()});