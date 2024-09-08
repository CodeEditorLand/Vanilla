import t from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as c}from"../../../../base/test/common/utils.js";import{Parser as u}from"../../common/contextkey.js";function o(e){const n=new u,s=[],a=(...r)=>{r.forEach(p=>s.push(p))},i=n.parse(e);return i===void 0?(n.lexingErrors.length>0&&(a("Lexing errors:",`

`),n.lexingErrors.forEach(r=>a(`Unexpected token '${r.lexeme}' at offset ${r.offset}. ${r.additionalInfo}`,`
`))),n.parsingErrors.length>0&&(n.lexingErrors.length>0&&a(`
 --- 
`),a("Parsing errors:",`

`),n.parsingErrors.forEach(r=>a(`Unexpected '${r.lexeme}' at offset ${r.offset}.`,`
`)))):a(i.serialize()),s.join("")}suite("Context Key Parser",()=>{c(),test(" foo",()=>{t.deepStrictEqual(o(" foo"),"foo")}),test("!foo",()=>{t.deepStrictEqual(o("!foo"),"!foo")}),test("foo =~ /bar/",()=>{t.deepStrictEqual(o("foo =~ /bar/"),"foo =~ /bar/")}),test("foo || (foo =~ /bar/ && baz)",()=>{t.deepStrictEqual(o("foo || (foo =~ /bar/ && baz)"),"foo || baz && foo =~ /bar/")}),test("foo || (foo =~ /bar/ || baz)",()=>{t.deepStrictEqual(o("foo || (foo =~ /bar/ || baz)"),"baz || foo || foo =~ /bar/")}),test("(foo || bar) && (jee || jar)",()=>{t.deepStrictEqual(o("(foo || bar) && (jee || jar)"),"bar && jar || bar && jee || foo && jar || foo && jee")}),test("foo && foo =~ /zee/i",()=>{t.deepStrictEqual(o("foo && foo =~ /zee/i"),"foo && foo =~ /zee/i")}),test("foo.bar==enabled",()=>{t.deepStrictEqual(o("foo.bar==enabled"),"foo.bar == 'enabled'")}),test("foo.bar == 'enabled'",()=>{t.deepStrictEqual(o("foo.bar == 'enabled'"),"foo.bar == 'enabled'")}),test("foo.bar:zed==completed - equality with no space",()=>{t.deepStrictEqual(o("foo.bar:zed==completed"),"foo.bar:zed == 'completed'")}),test("a && b || c",()=>{t.deepStrictEqual(o("a && b || c"),"c || a && b")}),test("fooBar && baz.jar && fee.bee<K-loo+1>",()=>{t.deepStrictEqual(o("fooBar && baz.jar && fee.bee<K-loo+1>"),"baz.jar && fee.bee<K-loo+1> && fooBar")}),test("foo.barBaz<C-r> < 2",()=>{t.deepStrictEqual(o("foo.barBaz<C-r> < 2"),"foo.barBaz<C-r> < 2")}),test("foo.bar >= -1",()=>{t.deepStrictEqual(o("foo.bar >= -1"),"foo.bar >= -1")}),test("key contains &nbsp: view == vsc-packages-activitybar-folders\xA0&& vsc-packages-folders-loaded",()=>{t.deepStrictEqual(o("view == vsc-packages-activitybar-folders\xA0&& vsc-packages-folders-loaded"),"vsc-packages-folders-loaded && view == 'vsc-packages-activitybar-folders'")}),test("foo.bar <= -1",()=>{t.deepStrictEqual(o("foo.bar <= -1"),"foo.bar <= -1")}),test("!cmake:hideBuildCommand && cmake:enableFullFeatureSet",()=>{t.deepStrictEqual(o("!cmake:hideBuildCommand && cmake:enableFullFeatureSet"),"cmake:enableFullFeatureSet && !cmake:hideBuildCommand")}),test("!(foo && bar)",()=>{t.deepStrictEqual(o("!(foo && bar)"),"!bar || !foo")}),test("!(foo && bar || boar) || deer",()=>{t.deepStrictEqual(o("!(foo && bar || boar) || deer"),"deer || !bar && !boar || !boar && !foo")}),test("!(!foo)",()=>{t.deepStrictEqual(o("!(!foo)"),"foo")}),suite("controversial",()=>{test('debugState == "stopped"',()=>{t.deepStrictEqual(o('debugState == "stopped"'),`debugState == '"stopped"'`)}),test(" viewItem == VSCode WorkSpace",()=>{t.deepStrictEqual(o(" viewItem == VSCode WorkSpace"),`Parsing errors:

Unexpected 'WorkSpace' at offset 20.
`)})}),suite("regex",()=>{test("resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/",()=>{t.deepStrictEqual(o("resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/"),"resource =~ /\\/foo\\/(barr|door\\/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(\\/.*)*$/")}),test("resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/",()=>{t.deepStrictEqual(o("resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/"),"resource =~ /((\\/scratch\\/(?!update)(.*)\\/)|((\\/src\\/).*\\/)).*$/")}),test("resourcePath =~ /.md(.yml|.txt)*$/giym",()=>{t.deepStrictEqual(o("resourcePath =~ /.md(.yml|.txt)*$/giym"),"resourcePath =~ /.md(.yml|.txt)*$/im")})}),suite("error handling",()=>{test("/foo",()=>{t.deepStrictEqual(o("/foo"),`Lexing errors:

Unexpected token '/foo' at offset 0. Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/'.

 --- 
Parsing errors:

Unexpected '/foo' at offset 0.
`)}),test("!b == 'true'",()=>{t.deepStrictEqual(o("!b == 'true'"),`Parsing errors:

Unexpected '==' at offset 3.
`)}),test("!foo &&  in bar",()=>{t.deepStrictEqual(o("!foo &&  in bar"),`Parsing errors:

Unexpected 'in' at offset 9.
`)}),test("vim<c-r> == 1 && vim<2<=3",()=>{t.deepStrictEqual(o("vim<c-r> == 1 && vim<2<=3"),`Lexing errors:

Unexpected token '=' at offset 23. Did you mean == or =~?

 --- 
Parsing errors:

Unexpected '=' at offset 23.
`)}),test("foo && 'bar",()=>{t.deepStrictEqual(o("foo && 'bar"),`Lexing errors:

Unexpected token ''bar' at offset 7. Did you forget to open or close the quote?

 --- 
Parsing errors:

Unexpected ''bar' at offset 7.
`)}),test("config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo",()=>{t.deepStrictEqual(o("config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo"),`Parsing errors:

Unexpected '&&' at offset 15.
`)}),test("!foo == 'test'",()=>{t.deepStrictEqual(o("!foo == 'test'"),`Parsing errors:

Unexpected '==' at offset 5.
`)}),test("!!foo",function(){t.deepStrictEqual(o("!!foo"),`Parsing errors:

Unexpected '!' at offset 1.
`)})})});
