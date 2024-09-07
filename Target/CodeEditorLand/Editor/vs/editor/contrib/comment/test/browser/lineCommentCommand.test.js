var k=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var v=(n,l,s,m)=>{for(var i=m>1?void 0:m?y(l,s):l,e=n.length-1,r;e>=0;e--)(r=n[e])&&(i=(m?r(l,s,i):r(i))||i);return m&&i&&k(l,s,i),i},L=(n,l)=>(s,m)=>l(s,m,n);import o from"assert";import{Disposable as I,DisposableStore as R}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as x}from"../../../../../base/test/common/utils.js";import{Selection as t}from"../../../../common/core/selection.js";import"../../../../common/editorCommon.js";import{ColorId as D,MetadataConsts as q}from"../../../../common/encodedTokenAttributes.js";import{EncodedTokenizationResult as N,TokenizationRegistry as _}from"../../../../common/languages.js";import{ILanguageService as b}from"../../../../common/languages/language.js";import"../../../../common/languages/languageConfiguration.js";import{ILanguageConfigurationService as f}from"../../../../common/languages/languageConfigurationRegistry.js";import{NullState as O}from"../../../../common/languages/nullTokenize.js";import{LineCommentCommand as c,Type as a}from"../../browser/lineCommentCommand.js";import{testCommand as T}from"../../../../test/browser/testCommand.js";import{TestLanguageConfigurationService as A}from"../../../../test/common/modes/testLanguageConfigurationService.js";import{IInstantiationService as z}from"../../../../../platform/instantiation/common/instantiation.js";function p(n,l){return(s,m,i,e)=>{const r="commentMode";T(s,r,m,l,i,e,!1,(d,C)=>{const w=d.get(f),u=d.get(b);C.add(u.registerLanguage({id:r})),C.add(w.register(r,{comments:n}))})}}suite("Editor Contrib - Line Comment Command",()=>{x();const n=p({lineComment:"!@#",blockComment:["<!@#","#@!>"]},(i,e)=>new c(i.get(f),e,4,a.Toggle,!0,!0)),l=p({lineComment:"!@#",blockComment:["<!@#","#@!>"]},(i,e)=>new c(i.get(f),e,4,a.ForceAdd,!0,!0));test("comment single line",function(){n(["some text","	some more text"],new t(1,1,1,1),["!@# some text","	some more text"],new t(1,5,1,5))}),test("case insensitive",function(){p({lineComment:"rem"},(e,r)=>new c(e.get(f),r,4,a.Toggle,!0,!0))(["REM some text"],new t(1,1,1,1),["some text"],new t(1,1,1,1))});function s(i){return{getLineContent:e=>i[e-1]}}function m(i){return i.map(e=>({ignore:!1,commentStr:e,commentStrOffset:0,commentStrLength:e.length}))}test("_analyzeLines",()=>{const i=new R;let e;if(e=c._analyzeLines(a.Toggle,!0,s(["		","    ","    c","		d"]),m(["//","rem","!@#","!@#"]),1,!0,!1,i.add(new A)),!e.supported)throw new Error("unexpected");if(o.strictEqual(e.shouldRemoveComments,!1),o.strictEqual(e.lines[0].commentStr,"//"),o.strictEqual(e.lines[1].commentStr,"rem"),o.strictEqual(e.lines[2].commentStr,"!@#"),o.strictEqual(e.lines[3].commentStr,"!@#"),o.strictEqual(e.lines[0].ignore,!0),o.strictEqual(e.lines[1].ignore,!0),o.strictEqual(e.lines[2].ignore,!1),o.strictEqual(e.lines[3].ignore,!1),o.strictEqual(e.lines[0].commentStrOffset,2),o.strictEqual(e.lines[1].commentStrOffset,4),o.strictEqual(e.lines[2].commentStrOffset,4),o.strictEqual(e.lines[3].commentStrOffset,2),e=c._analyzeLines(a.Toggle,!0,s(["		","    rem ","    !@# c","		!@#d"]),m(["//","rem","!@#","!@#"]),1,!0,!1,i.add(new A)),!e.supported)throw new Error("unexpected");o.strictEqual(e.shouldRemoveComments,!0),o.strictEqual(e.lines[0].commentStr,"//"),o.strictEqual(e.lines[1].commentStr,"rem"),o.strictEqual(e.lines[2].commentStr,"!@#"),o.strictEqual(e.lines[3].commentStr,"!@#"),o.strictEqual(e.lines[0].ignore,!0),o.strictEqual(e.lines[1].ignore,!1),o.strictEqual(e.lines[2].ignore,!1),o.strictEqual(e.lines[3].ignore,!1),o.strictEqual(e.lines[0].commentStrOffset,2),o.strictEqual(e.lines[1].commentStrOffset,4),o.strictEqual(e.lines[2].commentStrOffset,4),o.strictEqual(e.lines[3].commentStrOffset,2),o.strictEqual(e.lines[0].commentStrLength,2),o.strictEqual(e.lines[1].commentStrLength,4),o.strictEqual(e.lines[2].commentStrLength,4),o.strictEqual(e.lines[3].commentStrLength,3),i.dispose()}),test("_normalizeInsertionPoint",()=>{const i=(e,r,g,d)=>{const C=s(e.filter((h,S)=>S%2===0)),w=e.filter((h,S)=>S%2===1).map(h=>({commentStrOffset:h,ignore:!1}));c._normalizeInsertionPoint(C,w,1,r);const u=w.map(h=>h.commentStrOffset);o.deepStrictEqual(u,g,d)};i(["  XX",2,"    YY",4],4,[0,0],"Bug 16696"),i(["			XX",3,"    	YY",5,"        ZZ",8,"		TT",2],4,[2,5,8,2],"Test1"),i(["			   XX",6,"    				YY",8,"        ZZ",8,"		    TT",6],4,[2,5,8,2],"Test2"),i(["		",2,"			",3,"				",4,"			",3],4,[2,2,2,2],"Test3"),i(["		",2,"			",3,"				",4,"			",3,"    ",4],2,[2,2,2,2,4],"Test4"),i(["		",2,"			",3,"				",4,"			",3,"    ",4],4,[1,1,1,1,4],"Test5"),i([" 	",2,"  	",3,"   	",4,"    ",4,"	",1],4,[2,3,4,4,1],"Test6"),i([" 		",3,"  		",4,"   		",5,"    	",5,"	",1],4,[2,3,4,4,1],"Test7"),i(["	",1,"    ",4],4,[1,4],"Test8:4"),i(["	",1,"   ",3],4,[0,0],"Test8:3"),i(["	",1,"  ",2],4,[0,0],"Test8:2"),i(["	",1," ",1],4,[0,0],"Test8:1"),i(["	",1,"",0],4,[0,0],"Test8:0")}),test("detects indentation",function(){n(["	some text","	some more text"],new t(2,2,1,1),["	!@# some text","	!@# some more text"],new t(2,2,1,1))}),test("detects mixed indentation",function(){n(["	some text","    some more text"],new t(2,2,1,1),["	!@# some text","    !@# some more text"],new t(2,2,1,1))}),test("ignores whitespace lines",function(){n(["	some text","	   ","","	some more text"],new t(4,2,1,1),["	!@# some text","	   ","","	!@# some more text"],new t(4,2,1,1))}),test("removes its own",function(){n(["	!@# some text","	   ","		!@# some more text"],new t(3,2,1,1),["	some text","	   ","		some more text"],new t(3,2,1,1))}),test("works in only whitespace",function(){n(["	    ","	","		some more text"],new t(3,1,1,1),["	!@#     ","	!@# ","		some more text"],new t(3,1,1,1))}),test("bug 9697 - whitespace before comment token",function(){n(["	 !@#first","	second line"],new t(1,1,1,1),["	 first","	second line"],new t(1,1,1,1))}),test("bug 10162 - line comment before caret",function(){n(["first!@#","	second line"],new t(1,1,1,1),["!@# first!@#","	second line"],new t(1,5,1,5))}),test("comment single line - leading whitespace",function(){n(["first!@#","	second line"],new t(2,3,2,1),["first!@#","	!@# second line"],new t(2,7,2,1))}),test("ignores invisible selection",function(){n(["first","	second line","third line","fourth line","fifth"],new t(2,1,1,1),["!@# first","	second line","third line","fourth line","fifth"],new t(2,1,1,5))}),test("multiple lines",function(){n(["first","	second line","third line","fourth line","fifth"],new t(2,4,1,1),["!@# first","!@# 	second line","third line","fourth line","fifth"],new t(2,8,1,5))}),test("multiple modes on multiple lines",function(){n(["first","	second line","third line","fourth line","fifth"],new t(4,4,3,1),["first","	second line","!@# third line","!@# fourth line","fifth"],new t(4,8,3,5))}),test("toggle single line",function(){n(["first","	second line","third line","fourth line","fifth"],new t(1,1,1,1),["!@# first","	second line","third line","fourth line","fifth"],new t(1,5,1,5)),n(["!@# first","	second line","third line","fourth line","fifth"],new t(1,4,1,4),["first","	second line","third line","fourth line","fifth"],new t(1,1,1,1))}),test("toggle multiple lines",function(){n(["first","	second line","third line","fourth line","fifth"],new t(2,4,1,1),["!@# first","!@# 	second line","third line","fourth line","fifth"],new t(2,8,1,5)),n(["!@# first","!@# 	second line","third line","fourth line","fifth"],new t(2,7,1,4),["first","	second line","third line","fourth line","fifth"],new t(2,3,1,1))}),test("issue #5964: Ctrl+/ to create comment when cursor is at the beginning of the line puts the cursor in a strange position",()=>{n(["first","	second line","third line","fourth line","fifth"],new t(1,1,1,1),["!@# first","	second line","third line","fourth line","fifth"],new t(1,5,1,5))}),test("issue #35673: Comment hotkeys throws the cursor before the comment",()=>{n(["first","","	second line","third line","fourth line","fifth"],new t(2,1,2,1),["first","!@# ","	second line","third line","fourth line","fifth"],new t(2,5,2,5)),n(["first","	","	second line","third line","fourth line","fifth"],new t(2,2,2,2),["first","	!@# ","	second line","third line","fourth line","fifth"],new t(2,6,2,6))}),test('issue #2837 "Add Line Comment" fault when blank lines involved',function(){l(['    if displayName == "":',"        displayName = groupName",'    description = getAttr(attributes, "description")','    mailAddress = getAttr(attributes, "mail")',"",'    print "||Group name|%s|" % displayName','    print "||Description|%s|" % description','    print "||Email address|[mailto:%s]|" % mailAddress`'],new t(1,1,8,56),['    !@# if displayName == "":',"    !@#     displayName = groupName",'    !@# description = getAttr(attributes, "description")','    !@# mailAddress = getAttr(attributes, "mail")',"",'    !@# print "||Group name|%s|" % displayName','    !@# print "||Description|%s|" % description','    !@# print "||Email address|[mailto:%s]|" % mailAddress`'],new t(1,1,8,60))}),test("issue #47004: Toggle comments shouldn't move cursor",()=>{l(["    A line","    Another line"],new t(2,7,1,1),["    !@# A line","    !@# Another line"],new t(2,11,1,1))}),test("insertSpace false",()=>{p({lineComment:"!@#"},(e,r)=>new c(e.get(f),r,4,a.Toggle,!1,!0))(["some text"],new t(1,1,1,1),["!@#some text"],new t(1,4,1,4))}),test("insertSpace false does not remove space",()=>{p({lineComment:"!@#"},(e,r)=>new c(e.get(f),r,4,a.Toggle,!1,!0))(["!@#    some text"],new t(1,1,1,1),["    some text"],new t(1,1,1,1))})}),suite("ignoreEmptyLines false",()=>{x();const n=p({lineComment:"!@#",blockComment:["<!@#","#@!>"]},(l,s)=>new c(l.get(f),s,4,a.Toggle,!0,!1));test("does not ignore whitespace lines",()=>{n(["	some text","	   ","","	some more text"],new t(4,2,1,1),["!@# 	some text","!@# 	   ","!@# ","!@# 	some more text"],new t(4,6,1,5))}),test("removes its own",function(){n(["	!@# some text","	   ","		!@# some more text"],new t(3,2,1,1),["	some text","	   ","		some more text"],new t(3,2,1,1))}),test("works in only whitespace",function(){n(["	    ","	","		some more text"],new t(3,1,1,1),["	!@#     ","	!@# ","		some more text"],new t(3,1,1,1))}),test("comments single line",function(){n(["some text","	some more text"],new t(1,1,1,1),["!@# some text","	some more text"],new t(1,5,1,5))}),test("detects indentation",function(){n(["	some text","	some more text"],new t(2,2,1,1),["	!@# some text","	!@# some more text"],new t(2,2,1,1))})}),suite("Editor Contrib - Line Comment As Block Comment",()=>{x();const n=p({lineComment:"",blockComment:["(",")"]},(l,s)=>new c(l.get(f),s,4,a.Toggle,!0,!0));test("fall back to block comment command",function(){n(["first","	second line","third line","fourth line","fifth"],new t(1,1,1,1),["( first )","	second line","third line","fourth line","fifth"],new t(1,3,1,3))}),test("fall back to block comment command - toggle",function(){n(["(first)","	second line","third line","fourth line","fifth"],new t(1,7,1,2),["first","	second line","third line","fourth line","fifth"],new t(1,6,1,1))}),test("bug 9513 - expand single line to uncomment auto block",function(){n(["first","	second line","third line","fourth line","fifth"],new t(1,1,1,1),["( first )","	second line","third line","fourth line","fifth"],new t(1,3,1,3))}),test("bug 9691 - always expand selection to line boundaries",function(){n(["first","	second line","third line","fourth line","fifth"],new t(3,2,1,3),["( first","	second line","third line )","fourth line","fifth"],new t(3,2,1,5)),n(["(first","	second line","third line)","fourth line","fifth"],new t(3,11,1,2),["first","	second line","third line","fourth line","fifth"],new t(3,11,1,1))})}),suite("Editor Contrib - Line Comment As Block Comment 2",()=>{x();const n=p({lineComment:null,blockComment:["<!@#","#@!>"]},(l,s)=>new c(l.get(f),s,4,a.Toggle,!0,!0));test("no selection => uses indentation",function(){n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(1,1,1,1),["		<!@# first	     #@!>","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(1,1,1,1)),n(["		<!@#first	    #@!>","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(1,1,1,1),["		first	   ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(1,1,1,1))}),test("can remove",function(){n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,1,5,1),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,1,5,1)),n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,3,5,3),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,3,5,3)),n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,4,5,4),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,3,5,3)),n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,16,5,3),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,8,5,3)),n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,12,5,7),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,8,5,3)),n(["		first	    ","		second line","	third line","fourth line","		<!@#fifth#@!>		"],new t(5,18,5,18),["		first	    ","		second line","	third line","fourth line","		fifth		"],new t(5,10,5,10))}),test("issue #993: Remove comment does not work consistently in HTML",()=>{n(["     asd qwe","     asd qwe",""],new t(1,1,3,1),["     <!@# asd qwe","     asd qwe #@!>",""],new t(1,1,3,1)),n(["     <!@#asd qwe","     asd qwe#@!>",""],new t(1,1,3,1),["     asd qwe","     asd qwe",""],new t(1,1,3,1))})}),suite("Editor Contrib - Line Comment in mixed modes",()=>{x();const n="outerMode",l="innerMode";let s=class extends I{languageId=n;constructor(r,g,d){super(),this._register(g.registerLanguage({id:this.languageId})),this._register(d.register(this.languageId,{comments:r})),this._register(_.register(this.languageId,{getInitialState:()=>O,tokenize:()=>{throw new Error("not implemented")},tokenizeEncoded:(C,w,u)=>{const h=/^  /.test(C)?l:n,S=g.languageIdCodec.encodeLanguageId(h),E=new Uint32Array(2);return E[0]=0,E[1]=D.DefaultForeground<<q.FOREGROUND_OFFSET|S<<q.LANGUAGEID_OFFSET,new N(E,u)}}))}};s=v([L(1,b),L(2,f)],s);let m=class extends I{languageId=l;constructor(r,g,d){super(),this._register(g.registerLanguage({id:this.languageId})),this._register(d.register(this.languageId,{comments:r}))}};m=v([L(1,b),L(2,f)],m);function i(e,r,g,d){T(e,n,r,(w,u)=>new c(w.get(f),u,4,a.Toggle,!0,!0),g,d,!0,(w,u)=>{const h=w.get(z);u.add(h.createInstance(s,{lineComment:"//",blockComment:["/*","*/"]})),u.add(h.createInstance(m,{lineComment:null,blockComment:["{/*","*/}"]}))})}test("issue #24047 (part 1): Commenting code in JSX files",()=>{i(["import React from 'react';","const Loader = () => (","  <div>","    Loading...","  </div>",");","export default Loader;"],new t(1,1,7,22),["// import React from 'react';","// const Loader = () => (","//   <div>","//     Loading...","//   </div>","// );","// export default Loader;"],new t(1,4,7,25))}),test("issue #24047 (part 2): Commenting code in JSX files",()=>{i(["import React from 'react';","const Loader = () => (","  <div>","    Loading...","  </div>",");","export default Loader;"],new t(3,4,3,4),["import React from 'react';","const Loader = () => (","  {/* <div> */}","    Loading...","  </div>",");","export default Loader;"],new t(3,8,3,8))}),test("issue #36173: Commenting code in JSX tag body",()=>{i(["<div>","  {123}","</div>"],new t(2,4,2,4),["<div>","  {/* {123} */}","</div>"],new t(2,8,2,8))})});