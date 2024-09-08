import c from"assert";import{buildReplaceStringWithCasePreserved as u}from"../../../../../base/common/search.js";import{ensureNoDisposablesAreLeakedInTestSuite as w}from"../../../../../base/test/common/utils.js";import{parseReplaceString as h,ReplacePattern as b,ReplacePiece as a}from"../../browser/replacePattern.js";suite("Replace Pattern test",()=>{w(),test("parse replace string",()=>{const e=(t,l)=>{const o=h(t),i=new b(l);c.deepStrictEqual(o,i,"Parsing "+t)};e("hello",[a.staticValue("hello")]),e("\\thello",[a.staticValue("	hello")]),e("h\\tello",[a.staticValue("h	ello")]),e("hello\\t",[a.staticValue("hello	")]),e("\\nhello",[a.staticValue(`
hello`)]),e("\\\\thello",[a.staticValue("\\thello")]),e("h\\\\tello",[a.staticValue("h\\tello")]),e("hello\\\\t",[a.staticValue("hello\\t")]),e("\\\\\\thello",[a.staticValue("\\	hello")]),e("\\\\\\\\thello",[a.staticValue("\\\\thello")]),e("hello\\",[a.staticValue("hello\\")]),e("hello\\x",[a.staticValue("hello\\x")]),e("hello\\0",[a.staticValue("hello\\0")]),e("hello$&",[a.staticValue("hello"),a.matchIndex(0)]),e("hello$0",[a.staticValue("hello"),a.matchIndex(0)]),e("hello$02",[a.staticValue("hello"),a.matchIndex(0),a.staticValue("2")]),e("hello$1",[a.staticValue("hello"),a.matchIndex(1)]),e("hello$2",[a.staticValue("hello"),a.matchIndex(2)]),e("hello$9",[a.staticValue("hello"),a.matchIndex(9)]),e("$9hello",[a.matchIndex(9),a.staticValue("hello")]),e("hello$12",[a.staticValue("hello"),a.matchIndex(12)]),e("hello$99",[a.staticValue("hello"),a.matchIndex(99)]),e("hello$99a",[a.staticValue("hello"),a.matchIndex(99),a.staticValue("a")]),e("hello$1a",[a.staticValue("hello"),a.matchIndex(1),a.staticValue("a")]),e("hello$100",[a.staticValue("hello"),a.matchIndex(10),a.staticValue("0")]),e("hello$100a",[a.staticValue("hello"),a.matchIndex(10),a.staticValue("0a")]),e("hello$10a0",[a.staticValue("hello"),a.matchIndex(10),a.staticValue("a0")]),e("hello$$",[a.staticValue("hello$")]),e("hello$$0",[a.staticValue("hello$0")]),e("hello$`",[a.staticValue("hello$`")]),e("hello$'",[a.staticValue("hello$'")])}),test("parse replace string with case modifiers",()=>{const e=(l,o)=>{const i=h(l),s=new b(o);c.deepStrictEqual(i,s,"Parsing "+l)};function t(l,o,i,s){const r=h(i),n=o.exec(l),f=r.buildReplaceString(n);c.strictEqual(f,s,`${l}.replace(${o}, ${i}) === ${s}`)}e("hello\\U$1",[a.staticValue("hello"),a.caseOps(1,["U"])]),t("func privateFunc(",/func (\w+)\(/,"func \\U$1(","func PRIVATEFUNC("),e("hello\\u$1",[a.staticValue("hello"),a.caseOps(1,["u"])]),t("func privateFunc(",/func (\w+)\(/,"func \\u$1(","func PrivateFunc("),e("hello\\L$1",[a.staticValue("hello"),a.caseOps(1,["L"])]),t("func privateFunc(",/func (\w+)\(/,"func \\L$1(","func privatefunc("),e("hello\\l$1",[a.staticValue("hello"),a.caseOps(1,["l"])]),t("func PrivateFunc(",/func (\w+)\(/,"func \\l$1(","func privateFunc("),e("hello$1\\u\\u\\U$4goodbye",[a.staticValue("hello"),a.matchIndex(1),a.caseOps(4,["u","u","U"]),a.staticValue("goodbye")]),t("hellogooDbye",/hello(\w+)/,"hello\\u\\u\\l\\l\\U$1","helloGOodBYE")}),test("replace has JavaScript semantics",()=>{const e=(t,l,o,i)=>{const s=h(o),r=l.exec(t),n=s.buildReplaceString(r);c.deepStrictEqual(n,i,`${t}.replace(${l}, ${o})`)};e("hi",/hi/,"hello","hi".replace(/hi/,"hello")),e("hi",/hi/,"\\t","hi".replace(/hi/,"	")),e("hi",/hi/,"\\n","hi".replace(/hi/,`
`)),e("hi",/hi/,"\\\\t","hi".replace(/hi/,"\\t")),e("hi",/hi/,"\\\\n","hi".replace(/hi/,"\\n")),e("hi",/hi/,"hello$&","hi".replace(/hi/,"hello$&")),e("hi",/hi/,"hello$0","hi".replace(/hi/,"hello$&")),e("hi",/hi/,"hello$&1","hi".replace(/hi/,"hello$&1")),e("hi",/hi/,"hello$01","hi".replace(/hi/,"hello$&1")),e("hi",/(hi)/,"hello$10","hi".replace(/(hi)/,"hello$10")),e("hi",/(hi)()()()()()()()()()/,"hello$10","hi".replace(/(hi)()()()()()()()()()/,"hello$10")),e("hi",/(hi)/,"hello$100","hi".replace(/(hi)/,"hello$100")),e("hi",/(hi)/,"hello$20","hi".replace(/(hi)/,"hello$20"))}),test("get replace string if given text is a complete match",()=>{function e(l,o,i,s){const r=h(i),n=o.exec(l),f=r.buildReplaceString(n);c.strictEqual(f,s,`${l}.replace(${o}, ${i}) === ${s}`)}e("bla",/bla/,"hello","hello"),e("bla",/(bla)/,"hello","hello"),e("bla",/(bla)/,"hello$0","hellobla");const t=/let\s+(\w+)\s*=\s*require\s*\(\s*['"]([\w\.\-/]+)\s*['"]\s*\)\s*/;e("let fs = require('fs')",t,"import * as $1 from '$2';","import * as fs from 'fs';"),e("let something = require('fs')",t,"import * as $1 from '$2';","import * as something from 'fs';"),e("let something = require('fs')",t,"import * as $1 from '$1';","import * as something from 'something';"),e("let something = require('fs')",t,"import * as $2 from '$1';","import * as fs from 'something';"),e("let something = require('fs')",t,"import * as $0 from '$0';","import * as let something = require('fs') from 'let something = require('fs')';"),e("let fs = require('fs')",t,"import * as $1 from '$2';","import * as fs from 'fs';"),e("for ()",/for(.*)/,"cat$1","cat ()"),e("HRESULT OnAmbientPropertyChange(DISPID   dispid);",/\b\s{3}\b/," "," ")}),test("get replace string if match is sub-string of the text",()=>{function e(t,l,o,i){const s=h(o),r=l.exec(t),n=s.buildReplaceString(r);c.strictEqual(n,i,`${t}.replace(${l}, ${o}) === ${i}`)}e("this is a bla text",/bla/,"hello","hello"),e("this is a bla text",/this(?=.*bla)/,"that","that"),e("this is a bla text",/(th)is(?=.*bla)/,"$1at","that"),e("this is a bla text",/(th)is(?=.*bla)/,"$1e","the"),e("this is a bla text",/(th)is(?=.*bla)/,"$1ere","there"),e("this is a bla text",/(th)is(?=.*bla)/,"$1","th"),e("this is a bla text",/(th)is(?=.*bla)/,"ma$1","math"),e("this is a bla text",/(th)is(?=.*bla)/,"ma$1s","maths"),e("this is a bla text",/(th)is(?=.*bla)/,"$0","this"),e("this is a bla text",/(th)is(?=.*bla)/,"$0$1","thisth"),e("this is a bla text",/bla(?=\stext$)/,"foo","foo"),e("this is a bla text",/b(la)(?=\stext$)/,"f$1","fla"),e("this is a bla text",/b(la)(?=\stext$)/,"f$0","fbla"),e("this is a bla text",/b(la)(?=\stext$)/,"$0ah","blaah")}),test("issue #19740 Find and replace capture group/backreference inserts `undefined` instead of empty string",()=>{const e=h("a{$1}"),t=/a(z)?/.exec("abcd"),l=e.buildReplaceString(t);c.strictEqual(l,"a{}")}),test("buildReplaceStringWithCasePreserved test",()=>{function e(t,l,o){let i="";i=u(t,l),c.strictEqual(i,o)}e(["abc"],"Def","def"),e(["Abc"],"Def","Def"),e(["ABC"],"Def","DEF"),e(["abc","Abc"],"Def","def"),e(["Abc","abc"],"Def","Def"),e(["ABC","abc"],"Def","DEF"),e(["aBc","abc"],"Def","def"),e(["AbC"],"Def","Def"),e(["aBC"],"Def","def"),e(["aBc"],"DeF","deF"),e(["Foo-Bar"],"newfoo-newbar","Newfoo-Newbar"),e(["Foo-Bar-Abc"],"newfoo-newbar-newabc","Newfoo-Newbar-Newabc"),e(["Foo-Bar-abc"],"newfoo-newbar","Newfoo-newbar"),e(["foo-Bar"],"newfoo-newbar","newfoo-Newbar"),e(["foo-BAR"],"newfoo-newbar","newfoo-NEWBAR"),e(["foO-BAR"],"NewFoo-NewBar","newFoo-NEWBAR"),e(["Foo_Bar"],"newfoo_newbar","Newfoo_Newbar"),e(["Foo_Bar_Abc"],"newfoo_newbar_newabc","Newfoo_Newbar_Newabc"),e(["Foo_Bar_abc"],"newfoo_newbar","Newfoo_newbar"),e(["Foo_Bar-abc"],"newfoo_newbar-abc","Newfoo_newbar-abc"),e(["foo_Bar"],"newfoo_newbar","newfoo_Newbar"),e(["Foo_BAR"],"newfoo_newbar","Newfoo_NEWBAR")}),test("preserve case",()=>{function e(t,l,o){const s=h(l).buildReplaceString(t,!0);c.strictEqual(s,o)}e(["abc"],"Def","def"),e(["Abc"],"Def","Def"),e(["ABC"],"Def","DEF"),e(["abc","Abc"],"Def","def"),e(["Abc","abc"],"Def","Def"),e(["ABC","abc"],"Def","DEF"),e(["aBc","abc"],"Def","def"),e(["AbC"],"Def","Def"),e(["aBC"],"Def","def"),e(["aBc"],"DeF","deF"),e(["Foo-Bar"],"newfoo-newbar","Newfoo-Newbar"),e(["Foo-Bar-Abc"],"newfoo-newbar-newabc","Newfoo-Newbar-Newabc"),e(["Foo-Bar-abc"],"newfoo-newbar","Newfoo-newbar"),e(["foo-Bar"],"newfoo-newbar","newfoo-Newbar"),e(["foo-BAR"],"newfoo-newbar","newfoo-NEWBAR"),e(["foO-BAR"],"NewFoo-NewBar","newFoo-NEWBAR"),e(["Foo_Bar"],"newfoo_newbar","Newfoo_Newbar"),e(["Foo_Bar_Abc"],"newfoo_newbar_newabc","Newfoo_Newbar_Newabc"),e(["Foo_Bar_abc"],"newfoo_newbar","Newfoo_newbar"),e(["Foo_Bar-abc"],"newfoo_newbar-abc","Newfoo_newbar-abc"),e(["foo_Bar"],"newfoo_newbar","newfoo_Newbar"),e(["foo_BAR"],"newfoo_newbar","newfoo_NEWBAR")})});
