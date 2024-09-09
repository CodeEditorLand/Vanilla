import t from"assert";import{isWindows as l}from"../../common/platform.js";import{URI as a,isUriComponents as c}from"../../common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"./utils.js";suite("URI",()=>{p(),test("file#toString",()=>{t.strictEqual(a.file("c:/win/path").toString(),"file:///c%3A/win/path"),t.strictEqual(a.file("C:/win/path").toString(),"file:///c%3A/win/path"),t.strictEqual(a.file("c:/win/path/").toString(),"file:///c%3A/win/path/"),t.strictEqual(a.file("/c:/win/path").toString(),"file:///c%3A/win/path")}),test("URI.file (win-special)",()=>{l?(t.strictEqual(a.file("c:\\win\\path").toString(),"file:///c%3A/win/path"),t.strictEqual(a.file("c:\\win/path").toString(),"file:///c%3A/win/path")):(t.strictEqual(a.file("c:\\win\\path").toString(),"file:///c%3A%5Cwin%5Cpath"),t.strictEqual(a.file("c:\\win/path").toString(),"file:///c%3A%5Cwin/path"))}),test("file#fsPath (win-special)",()=>{l?(t.strictEqual(a.file("c:\\win\\path").fsPath,"c:\\win\\path"),t.strictEqual(a.file("c:\\win/path").fsPath,"c:\\win\\path"),t.strictEqual(a.file("c:/win/path").fsPath,"c:\\win\\path"),t.strictEqual(a.file("c:/win/path/").fsPath,"c:\\win\\path\\"),t.strictEqual(a.file("C:/win/path").fsPath,"c:\\win\\path"),t.strictEqual(a.file("/c:/win/path").fsPath,"c:\\win\\path"),t.strictEqual(a.file("./c/win/path").fsPath,"\\.\\c\\win\\path")):(t.strictEqual(a.file("c:/win/path").fsPath,"c:/win/path"),t.strictEqual(a.file("c:/win/path/").fsPath,"c:/win/path/"),t.strictEqual(a.file("C:/win/path").fsPath,"c:/win/path"),t.strictEqual(a.file("/c:/win/path").fsPath,"c:/win/path"),t.strictEqual(a.file("./c/win/path").fsPath,"/./c/win/path"))}),test("URI#fsPath - no `fsPath` when no `path`",()=>{const e=a.parse("file://%2Fhome%2Fticino%2Fdesktop%2Fcpluscplus%2Ftest.cpp");t.strictEqual(e.authority,"/home/ticino/desktop/cpluscplus/test.cpp"),t.strictEqual(e.path,"/"),l?t.strictEqual(e.fsPath,"\\"):t.strictEqual(e.fsPath,"/")}),test("http#toString",()=>{t.strictEqual(a.from({scheme:"http",authority:"www.example.com",path:"/my/path"}).toString(),"http://www.example.com/my/path"),t.strictEqual(a.from({scheme:"http",authority:"www.example.com",path:"/my/path"}).toString(),"http://www.example.com/my/path"),t.strictEqual(a.from({scheme:"http",authority:"www.EXAMPLE.com",path:"/my/path"}).toString(),"http://www.example.com/my/path"),t.strictEqual(a.from({scheme:"http",authority:"",path:"my/path"}).toString(),"http:/my/path"),t.strictEqual(a.from({scheme:"http",authority:"",path:"/my/path"}).toString(),"http:/my/path"),t.strictEqual(a.from({scheme:"http",authority:"example.com",path:"/",query:"test=true"}).toString(),"http://example.com/?test%3Dtrue"),t.strictEqual(a.from({scheme:"http",authority:"example.com",path:"/",query:"",fragment:"test=true"}).toString(),"http://example.com/#test%3Dtrue")}),test("http#toString, encode=FALSE",()=>{t.strictEqual(a.from({scheme:"http",authority:"example.com",path:"/",query:"test=true"}).toString(!0),"http://example.com/?test=true"),t.strictEqual(a.from({scheme:"http",authority:"example.com",path:"/",query:"",fragment:"test=true"}).toString(!0),"http://example.com/#test=true"),t.strictEqual(a.from({scheme:"http",path:"/api/files/test.me",query:"t=1234"}).toString(!0),"http:/api/files/test.me?t=1234");const e=a.parse("file://shares/pr\xF6jects/c%23/#l12");t.strictEqual(e.authority,"shares"),t.strictEqual(e.path,"/pr\xF6jects/c#/"),t.strictEqual(e.fragment,"l12"),t.strictEqual(e.toString(),"file://shares/pr%C3%B6jects/c%23/#l12"),t.strictEqual(e.toString(!0),"file://shares/pr\xF6jects/c%23/#l12");const i=a.parse(e.toString(!0)),o=a.parse(e.toString());t.strictEqual(i.authority,o.authority),t.strictEqual(i.path,o.path),t.strictEqual(i.query,o.query),t.strictEqual(i.fragment,o.fragment)}),test("with, identity",()=>{const e=a.parse("foo:bar/path");let i=e.with(null);t.ok(e===i),i=e.with(void 0),t.ok(e===i),i=e.with({}),t.ok(e===i),i=e.with({scheme:"foo",path:"bar/path"}),t.ok(e===i)}),test("with, changes",()=>{t.strictEqual(a.parse("before:some/file/path").with({scheme:"after"}).toString(),"after:some/file/path"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"http",path:"/api/files/test.me",query:"t=1234"}).toString(),"http:/api/files/test.me?t%3D1234"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"http",authority:"",path:"/api/files/test.me",query:"t=1234",fragment:""}).toString(),"http:/api/files/test.me?t%3D1234"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"https",authority:"",path:"/api/files/test.me",query:"t=1234",fragment:""}).toString(),"https:/api/files/test.me?t%3D1234"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"HTTP",authority:"",path:"/api/files/test.me",query:"t=1234",fragment:""}).toString(),"HTTP:/api/files/test.me?t%3D1234"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"HTTPS",authority:"",path:"/api/files/test.me",query:"t=1234",fragment:""}).toString(),"HTTPS:/api/files/test.me?t%3D1234"),t.strictEqual(a.from({scheme:"s"}).with({scheme:"boo",authority:"",path:"/api/files/test.me",query:"t=1234",fragment:""}).toString(),"boo:/api/files/test.me?t%3D1234")}),test("with, remove components #8465",()=>{t.strictEqual(a.parse("scheme://authority/path").with({authority:""}).toString(),"scheme:/path"),t.strictEqual(a.parse("scheme:/path").with({authority:"authority"}).with({authority:""}).toString(),"scheme:/path"),t.strictEqual(a.parse("scheme:/path").with({authority:"authority"}).with({authority:null}).toString(),"scheme:/path"),t.strictEqual(a.parse("scheme:/path").with({authority:"authority"}).with({path:""}).toString(),"scheme://authority"),t.strictEqual(a.parse("scheme:/path").with({authority:"authority"}).with({path:null}).toString(),"scheme://authority"),t.strictEqual(a.parse("scheme:/path").with({authority:""}).toString(),"scheme:/path"),t.strictEqual(a.parse("scheme:/path").with({authority:null}).toString(),"scheme:/path")}),test("with, validation",()=>{const e=a.parse("foo:bar/path");t.throws(()=>e.with({scheme:"fai:l"})),t.throws(()=>e.with({scheme:"f\xE4il"})),t.throws(()=>e.with({authority:"fail"})),t.throws(()=>e.with({path:"//fail"}))}),test("parse",()=>{let e=a.parse("http:/api/files/test.me?t=1234");t.strictEqual(e.scheme,"http"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/api/files/test.me"),t.strictEqual(e.query,"t=1234"),t.strictEqual(e.fragment,""),e=a.parse("http://api/files/test.me?t=1234"),t.strictEqual(e.scheme,"http"),t.strictEqual(e.authority,"api"),t.strictEqual(e.path,"/files/test.me"),t.strictEqual(e.query,"t=1234"),t.strictEqual(e.fragment,""),e=a.parse("file:///c:/test/me"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/c:/test/me"),t.strictEqual(e.fragment,""),t.strictEqual(e.query,""),t.strictEqual(e.fsPath,l?"c:\\test\\me":"c:/test/me"),e=a.parse("file://shares/files/c%23/p.cs"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,"shares"),t.strictEqual(e.path,"/files/c#/p.cs"),t.strictEqual(e.fragment,""),t.strictEqual(e.query,""),t.strictEqual(e.fsPath,l?"\\\\shares\\files\\c#\\p.cs":"//shares/files/c#/p.cs"),e=a.parse("file:///c:/Source/Z%C3%BCrich%20or%20Zurich%20(%CB%88zj%CA%8A%C9%99r%C9%AAk,/Code/resources/app/plugins/c%23/plugin.json"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/c:/Source/Z\xFCrich or Zurich (\u02C8zj\u028A\u0259r\u026Ak,/Code/resources/app/plugins/c#/plugin.json"),t.strictEqual(e.fragment,""),t.strictEqual(e.query,""),e=a.parse("file:///c:/test %25/path"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/c:/test %/path"),t.strictEqual(e.fragment,""),t.strictEqual(e.query,""),e=a.parse("inmemory:"),t.strictEqual(e.scheme,"inmemory"),t.strictEqual(e.authority,""),t.strictEqual(e.path,""),t.strictEqual(e.query,""),t.strictEqual(e.fragment,""),e=a.parse("foo:api/files/test"),t.strictEqual(e.scheme,"foo"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"api/files/test"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,""),e=a.parse("file:?q"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/"),t.strictEqual(e.query,"q"),t.strictEqual(e.fragment,""),e=a.parse("file:#d"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,"d"),e=a.parse("f3ile:#d"),t.strictEqual(e.scheme,"f3ile"),t.strictEqual(e.authority,""),t.strictEqual(e.path,""),t.strictEqual(e.query,""),t.strictEqual(e.fragment,"d"),e=a.parse("foo+bar:path"),t.strictEqual(e.scheme,"foo+bar"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"path"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,""),e=a.parse("foo-bar:path"),t.strictEqual(e.scheme,"foo-bar"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"path"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,""),e=a.parse("foo.bar:path"),t.strictEqual(e.scheme,"foo.bar"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"path"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,"")}),test("parse, disallow //path when no authority",()=>{t.throws(()=>a.parse("file:////shares/files/p.cs"))}),test("URI#file, win-speciale",()=>{if(l){let e=a.file("c:\\test\\drive");t.strictEqual(e.path,"/c:/test/drive"),t.strictEqual(e.toString(),"file:///c%3A/test/drive"),e=a.file("\\\\sh\xE4res\\path\\c#\\plugin.json"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,"sh\xE4res"),t.strictEqual(e.path,"/path/c#/plugin.json"),t.strictEqual(e.fragment,""),t.strictEqual(e.query,""),t.strictEqual(e.toString(),"file://sh%C3%A4res/path/c%23/plugin.json"),e=a.file("\\\\localhost\\c$\\GitDevelopment\\express"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.path,"/c$/GitDevelopment/express"),t.strictEqual(e.fsPath,"\\\\localhost\\c$\\GitDevelopment\\express"),t.strictEqual(e.query,""),t.strictEqual(e.fragment,""),t.strictEqual(e.toString(),"file://localhost/c%24/GitDevelopment/express"),e=a.file("c:\\test with %\\path"),t.strictEqual(e.path,"/c:/test with %/path"),t.strictEqual(e.toString(),"file:///c%3A/test%20with%20%25/path"),e=a.file("c:\\test with %25\\path"),t.strictEqual(e.path,"/c:/test with %25/path"),t.strictEqual(e.toString(),"file:///c%3A/test%20with%20%2525/path"),e=a.file("c:\\test with %25\\c#code"),t.strictEqual(e.path,"/c:/test with %25/c#code"),t.strictEqual(e.toString(),"file:///c%3A/test%20with%20%2525/c%23code"),e=a.file("\\\\shares"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,"shares"),t.strictEqual(e.path,"/"),e=a.file("\\\\shares\\"),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,"shares"),t.strictEqual(e.path,"/")}}),test("VSCode URI module's driveLetterPath regex is incorrect, #32961",function(){const e=a.parse("file:///_:/path");t.strictEqual(e.fsPath,l?"\\_:\\path":"/_:/path")}),test("URI#file, no path-is-uri check",()=>{const e=a.file("file://path/to/file");t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/file://path/to/file")}),test("URI#file, always slash",()=>{let e=a.file("a.file");t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/a.file"),t.strictEqual(e.toString(),"file:///a.file"),e=a.parse(e.toString()),t.strictEqual(e.scheme,"file"),t.strictEqual(e.authority,""),t.strictEqual(e.path,"/a.file"),t.strictEqual(e.toString(),"file:///a.file")}),test("URI.toString, only scheme and query",()=>{const e=a.parse("stuff:?q\xFCery");t.strictEqual(e.toString(),"stuff:?q%C3%BCery")}),test("URI#toString, upper-case percent espaces",()=>{const e=a.parse("file://sh%c3%a4res/path");t.strictEqual(e.toString(),"file://sh%C3%A4res/path")}),test("URI#toString, lower-case windows drive letter",()=>{t.strictEqual(a.parse("untitled:c:/Users/jrieken/Code/abc.txt").toString(),"untitled:c%3A/Users/jrieken/Code/abc.txt"),t.strictEqual(a.parse("untitled:C:/Users/jrieken/Code/abc.txt").toString(),"untitled:c%3A/Users/jrieken/Code/abc.txt")}),test("URI#toString, escape all the bits",()=>{const e=a.file("/Users/jrieken/Code/_samples/18500/M\xF6del + Other Th\xEEng\xDF/model.js");t.strictEqual(e.toString(),"file:///Users/jrieken/Code/_samples/18500/M%C3%B6del%20%2B%20Other%20Th%C3%AEng%C3%9F/model.js")}),test("URI#toString, don't encode port",()=>{let e=a.parse("http://localhost:8080/far");t.strictEqual(e.toString(),"http://localhost:8080/far"),e=a.from({scheme:"http",authority:"l\xF6calhost:8080",path:"/far",query:void 0,fragment:void 0}),t.strictEqual(e.toString(),"http://l%C3%B6calhost:8080/far")}),test("URI#toString, user information in authority",()=>{let e=a.parse("http://foo:bar@localhost/far");t.strictEqual(e.toString(),"http://foo:bar@localhost/far"),e=a.parse("http://foo@localhost/far"),t.strictEqual(e.toString(),"http://foo@localhost/far"),e=a.parse("http://foo:bAr@localhost:8080/far"),t.strictEqual(e.toString(),"http://foo:bAr@localhost:8080/far"),e=a.parse("http://foo@localhost:8080/far"),t.strictEqual(e.toString(),"http://foo@localhost:8080/far"),e=a.from({scheme:"http",authority:"f\xF6\xF6:b\xF6r@l\xF6calhost:8080",path:"/far",query:void 0,fragment:void 0}),t.strictEqual(e.toString(),"http://f%C3%B6%C3%B6:b%C3%B6r@l%C3%B6calhost:8080/far")}),test("correctFileUriToFilePath2",()=>{const e=(i,o)=>{const r=a.parse(i);t.strictEqual(r.fsPath,o,"Result for "+i);const h=a.file(r.fsPath);t.strictEqual(h.fsPath,o,"Result for "+i),t.strictEqual(r.toString(),h.toString())};e("file:///c:/alex.txt",l?"c:\\alex.txt":"c:/alex.txt"),e("file:///c:/Source/Z%C3%BCrich%20or%20Zurich%20(%CB%88zj%CA%8A%C9%99r%C9%AAk,/Code/resources/app/plugins",l?"c:\\Source\\Z\xFCrich or Zurich (\u02C8zj\u028A\u0259r\u026Ak,\\Code\\resources\\app\\plugins":"c:/Source/Z\xFCrich or Zurich (\u02C8zj\u028A\u0259r\u026Ak,/Code/resources/app/plugins"),e("file://monacotools/folder/isi.txt",l?"\\\\monacotools\\folder\\isi.txt":"//monacotools/folder/isi.txt"),e("file://monacotools1/certificates/SSL/",l?"\\\\monacotools1\\certificates\\SSL\\":"//monacotools1/certificates/SSL/")}),test("URI - http, query & toString",function(){let e=a.parse("https://go.microsoft.com/fwlink/?LinkId=518008");t.strictEqual(e.query,"LinkId=518008"),t.strictEqual(e.toString(!0),"https://go.microsoft.com/fwlink/?LinkId=518008"),t.strictEqual(e.toString(),"https://go.microsoft.com/fwlink/?LinkId%3D518008");let i=a.parse(e.toString());t.strictEqual(i.query,"LinkId=518008"),t.strictEqual(i.query,e.query),e=a.parse("https://go.microsoft.com/fwlink/?LinkId=518008&fo\xF6&k\xE9\xA5=\xFC\xFC"),t.strictEqual(e.query,"LinkId=518008&fo\xF6&k\xE9\xA5=\xFC\xFC"),t.strictEqual(e.toString(!0),"https://go.microsoft.com/fwlink/?LinkId=518008&fo\xF6&k\xE9\xA5=\xFC\xFC"),t.strictEqual(e.toString(),"https://go.microsoft.com/fwlink/?LinkId%3D518008%26fo%C3%B6%26k%C3%A9%C2%A5%3D%C3%BC%C3%BC"),i=a.parse(e.toString()),t.strictEqual(i.query,"LinkId=518008&fo\xF6&k\xE9\xA5=\xFC\xFC"),t.strictEqual(i.query,e.query),e=a.parse("https://twitter.com/search?src=typd&q=%23tag"),t.strictEqual(e.toString(!0),"https://twitter.com/search?src=typd&q=%23tag")}),test("class URI cannot represent relative file paths #34449",function(){let e="/foo/bar";t.strictEqual(a.file(e).path,e),e="foo/bar",t.strictEqual(a.file(e).path,"/foo/bar"),e="./foo/bar",t.strictEqual(a.file(e).path,"/./foo/bar");const i=a.parse("file:foo/bar");t.strictEqual(i.path,"/foo/bar"),t.strictEqual(i.authority,"");const o=i.toString();t.strictEqual(o,"file:///foo/bar");const r=a.parse(o);t.strictEqual(r.path,"/foo/bar"),t.strictEqual(r.authority,"")}),test("Ctrl click to follow hash query param url gets urlencoded #49628",function(){let e="http://localhost:3000/#/foo?bar=baz",i=a.parse(e);t.strictEqual(i.toString(!0),e),e="http://localhost:3000/foo?bar=baz",i=a.parse(e),t.strictEqual(i.toString(!0),e)}),test("Unable to open '%A0.txt': URI malformed #76506",function(){let e=a.file("/foo/%A0.txt"),i=a.parse(e.toString());t.strictEqual(e.scheme,i.scheme),t.strictEqual(e.path,i.path),e=a.file("/foo/%2e.txt"),i=a.parse(e.toString()),t.strictEqual(e.scheme,i.scheme),t.strictEqual(e.path,i.path)}),test("Bug in URI.isUri() that fails `thing` type comparison #114971",function(){const e=a.file("/foo/bazz.txt");t.strictEqual(a.isUri(e),!0),t.strictEqual(a.isUri(e.toJSON()),!1),t.strictEqual(a.isUri({scheme:"file",authority:"",path:"/foo/bazz.txt",get fsPath(){return"/foo/bazz.txt"},query:"",fragment:"",with(){return this},toString(){return""}}),!0),t.strictEqual(a.isUri({scheme:"file",authority:"",path:"/foo/bazz.txt",fsPath:"/foo/bazz.txt",query:"",fragment:"",with(){return this},toString(){return""}}),!0)}),test("isUriComponents",function(){t.ok(c(a.file("a"))),t.ok(c(a.file("a").toJSON())),t.ok(c(a.file(""))),t.ok(c(a.file("").toJSON())),t.strictEqual(c(1),!1),t.strictEqual(c(!0),!1),t.strictEqual(c("true"),!1),t.strictEqual(c({}),!1),t.strictEqual(c({scheme:""}),!0),t.strictEqual(c({scheme:"fo"}),!0),t.strictEqual(c({scheme:"fo",path:"/p"}),!0),t.strictEqual(c({path:"/p"}),!1)}),test("from, from(strict), revive",function(){t.throws(()=>a.from({scheme:""},!0)),t.strictEqual(a.from({scheme:""}).scheme,"file"),t.strictEqual(a.revive({scheme:""}).scheme,"")}),test("Unable to open '%A0.txt': URI malformed #76506, part 2",function(){t.strictEqual(a.parse("file://some/%.txt").toString(),"file://some/%25.txt"),t.strictEqual(a.parse("file://some/%A0.txt").toString(),"file://some/%25A0.txt")}),test.skip("Links in markdown are broken if url contains encoded parameters #79474",function(){const e="https://myhost.com/Redirect?url=http%3A%2F%2Fwww.bing.com%3Fsearch%3Dtom",i=a.parse(e),o=i.toString(),r=a.parse(o);t.strictEqual(i.scheme,r.scheme),t.strictEqual(i.authority,r.authority),t.strictEqual(i.path,r.path),t.strictEqual(i.query,r.query),t.strictEqual(i.fragment,r.fragment),t.strictEqual(e,o)}),test.skip("Uri#parse can break path-component #45515",function(){const e="https://firebasestorage.googleapis.com/v0/b/brewlangerie.appspot.com/o/products%2FzVNZkudXJyq8bPGTXUxx%2FBetterave-Sesame.jpg?alt=media&token=0b2310c4-3ea6-4207-bbde-9c3710ba0437",i=a.parse(e),o=i.toString(),r=a.parse(o);t.strictEqual(i.scheme,r.scheme),t.strictEqual(i.authority,r.authority),t.strictEqual(i.path,r.path),t.strictEqual(i.query,r.query),t.strictEqual(i.fragment,r.fragment),t.strictEqual(e,o)}),test("URI - (de)serialize",function(){const e=[a.parse("http://localhost:8080/far"),a.file("c:\\test with %25\\c#code"),a.file("\\\\sh\xE4res\\path\\c#\\plugin.json"),a.parse("http://api/files/test.me?t=1234"),a.parse("http://api/files/test.me?t=1234#fff"),a.parse("http://api/files/test.me#fff")];for(const i of e){const o=i.toJSON(),r=a.revive(o);t.strictEqual(r.scheme,i.scheme),t.strictEqual(r.authority,i.authority),t.strictEqual(r.path,i.path),t.strictEqual(r.query,i.query),t.strictEqual(r.fragment,i.fragment),t.strictEqual(r.fsPath,i.fsPath),t.strictEqual(r.toString(),i.toString())}});function s(e,i,o,r=!0){const h=a.parse(e),u=a.joinPath(h,i).toString(!0);if(t.strictEqual(u,o),r){const f=new URL(i,e).href;t.strictEqual(f,o,"DIFFERENT from URL")}}test("URI#joinPath",function(){s("file:///foo/","../../bazz","file:///bazz"),s("file:///foo","../../bazz","file:///bazz"),s("file:///foo","../../bazz","file:///bazz"),s("file:///foo/bar/","./bazz","file:///foo/bar/bazz"),s("file:///foo/bar","./bazz","file:///foo/bar/bazz",!1),s("file:///foo/bar","bazz","file:///foo/bar/bazz",!1),s("file:","bazz","file:///bazz"),s("http://domain","bazz","http://domain/bazz"),s("https://domain","bazz","https://domain/bazz"),s("http:","bazz","http:/bazz",!1),s("https:","bazz","https:/bazz",!1),s("foo:/","bazz","foo:/bazz"),s("foo://bar/","bazz","foo://bar/bazz"),t.throws(()=>s("foo:","bazz","")),t.throws(()=>new URL("bazz","foo:")),t.throws(()=>s("foo://bar","bazz",""))}),test("URI#joinPath (posix)",function(){l&&this.skip(),s("file:///c:/foo/","../../bazz","file:///bazz",!1),s("file://server/share/c:/","../../bazz","file://server/bazz",!1),s("file://server/share/c:","../../bazz","file://server/bazz",!1),s("file://ser/foo/","../../bazz","file://ser/bazz",!1),s("file://ser/foo","../../bazz","file://ser/bazz",!1)}),test("URI#joinPath (windows)",function(){l||this.skip(),s("file:///c:/foo/","../../bazz","file:///c:/bazz",!1),s("file://server/share/c:/","../../bazz","file://server/share/bazz",!1),s("file://server/share/c:","../../bazz","file://server/share/bazz",!1),s("file://ser/foo/","../../bazz","file://ser/foo/bazz",!1),s("file://ser/foo","../../bazz","file://ser/foo/bazz",!1),s("file:///c:/foo/bar","./other/foo.img","file:///c:/foo/bar/other/foo.img",!1)}),test("vscode-uri: URI.toString() wrongly encode IPv6 literals #154048",function(){t.strictEqual(a.parse("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:80/index.html").toString(),"http://[fedc:ba98:7654:3210:fedc:ba98:7654:3210]:80/index.html"),t.strictEqual(a.parse("http://user@[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:80/index.html").toString(),"http://user@[fedc:ba98:7654:3210:fedc:ba98:7654:3210]:80/index.html"),t.strictEqual(a.parse("http://us[er@[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:80/index.html").toString(),"http://us%5Ber@[fedc:ba98:7654:3210:fedc:ba98:7654:3210]:80/index.html")})});
