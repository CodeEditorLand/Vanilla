import e from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../../base/test/common/utils.js";import{incrementFileName as n}from"../../browser/fileActions.js";suite("Files - Increment file name simple",()=>{test("Increment file name without any version",function(){const t=n("test.js",!1,"simple");e.strictEqual(t,"test copy.js")}),test("Increment file name with suffix version",function(){const t=n("test copy.js",!1,"simple");e.strictEqual(t,"test copy 2.js")}),test("Increment file name with suffix version with leading zeros",function(){const t=n("test copy 005.js",!1,"simple");e.strictEqual(t,"test copy 6.js")}),test("Increment file name with suffix version, too big number",function(){const t=n("test copy 9007199254740992.js",!1,"simple");e.strictEqual(t,"test copy 9007199254740992 copy.js")}),test("Increment file name with just version in name",function(){const t=n("copy.js",!1,"simple");e.strictEqual(t,"copy copy.js")}),test("Increment file name with just version in name, v2",function(){const t=n("copy 2.js",!1,"simple");e.strictEqual(t,"copy 2 copy.js")}),test("Increment file name without any extension or version",function(){const t=n("test",!1,"simple");e.strictEqual(t,"test copy")}),test("Increment file name without any extension or version, trailing dot",function(){const t=n("test.",!1,"simple");e.strictEqual(t,"test copy.")}),test("Increment file name without any extension or version, leading dot",function(){const t=n(".test",!1,"simple");e.strictEqual(t,".test copy")}),test("Increment file name without any extension or version, leading dot v2",function(){const t=n("..test",!1,"simple");e.strictEqual(t,". copy.test")}),test("Increment file name without any extension but with suffix version",function(){const t=n("test copy 5",!1,"simple");e.strictEqual(t,"test copy 6")}),test("Increment folder name without any version",function(){const t=n("test",!0,"simple");e.strictEqual(t,"test copy")}),test("Increment folder name with suffix version",function(){const t=n("test copy",!0,"simple");e.strictEqual(t,"test copy 2")}),test("Increment folder name with suffix version, leading zeros",function(){const t=n("test copy 005",!0,"simple");e.strictEqual(t,"test copy 6")}),test("Increment folder name with suffix version, too big number",function(){const t=n("test copy 9007199254740992",!0,"simple");e.strictEqual(t,"test copy 9007199254740992 copy")}),test("Increment folder name with just version in name",function(){const t=n("copy",!0,"simple");e.strictEqual(t,"copy copy")}),test("Increment folder name with just version in name, v2",function(){const t=n("copy 2",!0,"simple");e.strictEqual(t,"copy 2 copy")}),test('Increment folder name "with extension" but without any version',function(){const t=n("test.js",!0,"simple");e.strictEqual(t,"test.js copy")}),test('Increment folder name "with extension" and with suffix version',function(){const t=n("test.js copy 5",!0,"simple");e.strictEqual(t,"test.js copy 6")}),test("Increment file/folder name with suffix version, special case 1",function(){const t=n("test copy 0",!0,"simple");e.strictEqual(t,"test copy")}),test("Increment file/folder name with suffix version, special case 2",function(){const t=n("test copy 1",!0,"simple");e.strictEqual(t,"test copy 2")}),i()}),suite("Files - Increment file name smart",()=>{test("Increment file name without any version",function(){const t=n("test.js",!1,"smart");e.strictEqual(t,"test.1.js")}),test("Increment folder name without any version",function(){const t=n("test",!0,"smart");e.strictEqual(t,"test.1")}),test("Increment file name with suffix version",function(){const t=n("test.1.js",!1,"smart");e.strictEqual(t,"test.2.js")}),test("Increment file name with suffix version with trailing zeros",function(){const t=n("test.001.js",!1,"smart");e.strictEqual(t,"test.002.js")}),test("Increment file name with suffix version with trailing zeros, changing length",function(){const t=n("test.009.js",!1,"smart");e.strictEqual(t,"test.010.js")}),test("Increment file name with suffix version with `-` as separator",function(){const t=n("test-1.js",!1,"smart");e.strictEqual(t,"test-2.js")}),test("Increment file name with suffix version with `-` as separator, trailing zeros",function(){const t=n("test-001.js",!1,"smart");e.strictEqual(t,"test-002.js")}),test("Increment file name with suffix version with `-` as separator, trailing zeros, changnig length",function(){const t=n("test-099.js",!1,"smart");e.strictEqual(t,"test-100.js")}),test("Increment file name with suffix version with `_` as separator",function(){const t=n("test_1.js",!1,"smart");e.strictEqual(t,"test_2.js")}),test("Increment folder name with suffix version",function(){const t=n("test.1",!0,"smart");e.strictEqual(t,"test.2")}),test("Increment folder name with suffix version, trailing zeros",function(){const t=n("test.001",!0,"smart");e.strictEqual(t,"test.002")}),test("Increment folder name with suffix version with `-` as separator",function(){const t=n("test-1",!0,"smart");e.strictEqual(t,"test-2")}),test("Increment folder name with suffix version with `_` as separator",function(){const t=n("test_1",!0,"smart");e.strictEqual(t,"test_2")}),test("Increment file name with suffix version, too big number",function(){const t=n("test.9007199254740992.js",!1,"smart");e.strictEqual(t,"test.9007199254740992.1.js")}),test("Increment folder name with suffix version, too big number",function(){const t=n("test.9007199254740992",!0,"smart");e.strictEqual(t,"test.9007199254740992.1")}),test("Increment file name with prefix version",function(){const t=n("1.test.js",!1,"smart");e.strictEqual(t,"2.test.js")}),test("Increment file name with just version in name",function(){const t=n("1.js",!1,"smart");e.strictEqual(t,"2.js")}),test("Increment file name with just version in name, too big number",function(){const t=n("9007199254740992.js",!1,"smart");e.strictEqual(t,"9007199254740992.1.js")}),test("Increment file name with prefix version, trailing zeros",function(){const t=n("001.test.js",!1,"smart");e.strictEqual(t,"002.test.js")}),test("Increment file name with prefix version with `-` as separator",function(){const t=n("1-test.js",!1,"smart");e.strictEqual(t,"2-test.js")}),test("Increment file name with prefix version with `_` as separator",function(){const t=n("1_test.js",!1,"smart");e.strictEqual(t,"2_test.js")}),test("Increment file name with prefix version, too big number",function(){const t=n("9007199254740992.test.js",!1,"smart");e.strictEqual(t,"9007199254740992.test.1.js")}),test("Increment file name with just version and no extension",function(){const t=n("001004",!1,"smart");e.strictEqual(t,"001005")}),test("Increment file name with just version and no extension, too big number",function(){const t=n("9007199254740992",!1,"smart");e.strictEqual(t,"9007199254740992.1")}),test("Increment file name with no extension and no version",function(){const t=n("file",!1,"smart");e.strictEqual(t,"file1")}),test("Increment file name with no extension",function(){const t=n("file1",!1,"smart");e.strictEqual(t,"file2")}),test("Increment file name with no extension, too big number",function(){const t=n("file9007199254740992",!1,"smart");e.strictEqual(t,"file9007199254740992.1")}),test("Increment folder name with prefix version",function(){const t=n("1.test",!0,"smart");e.strictEqual(t,"2.test")}),test("Increment folder name with prefix version, too big number",function(){const t=n("9007199254740992.test",!0,"smart");e.strictEqual(t,"9007199254740992.test.1")}),test("Increment folder name with prefix version, trailing zeros",function(){const t=n("001.test",!0,"smart");e.strictEqual(t,"002.test")}),test("Increment folder name with prefix version  with `-` as separator",function(){const t=n("1-test",!0,"smart");e.strictEqual(t,"2-test")}),i()});
