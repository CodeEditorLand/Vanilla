import s from"assert";import{DisposableStore as ot}from"../../../../../base/common/lifecycle.js";import{isFirefox as T}from"../../../../../base/common/platform.js";import{ensureNoDisposablesAreLeakedInTestSuite as nt}from"../../../../../base/test/common/utils.js";import{CoreEditingCommands as st}from"../../../../browser/coreCommands.js";import"../../../../browser/editorBrowser.js";import"../../../../browser/editorExtensions.js";import{Position as i}from"../../../../common/core/position.js";import{Selection as E}from"../../../../common/core/selection.js";import{ILanguageService as it}from"../../../../common/languages/language.js";import{ILanguageConfigurationService as rt}from"../../../../common/languages/languageConfigurationRegistry.js";import"../../../../common/viewModel/viewModelImpl.js";import{CursorWordAccessibilityLeft as ct,CursorWordAccessibilityLeftSelect as lt,CursorWordAccessibilityRight as at,CursorWordAccessibilityRightSelect as dt,CursorWordEndLeft as ut,CursorWordEndLeftSelect as gt,CursorWordEndRight as Et,CursorWordEndRightSelect as wt,CursorWordLeft as mt,CursorWordLeftSelect as St,CursorWordRight as ft,CursorWordRightSelect as Lt,CursorWordStartLeft as pt,CursorWordStartLeftSelect as Wt,CursorWordStartRight as ht,CursorWordStartRightSelect as Pt,DeleteInsideWord as qt,DeleteWordEndLeft as Ct,DeleteWordEndRight as xt,DeleteWordLeft as yt,DeleteWordRight as Mt,DeleteWordStartLeft as Tt,DeleteWordStartRight as Rt}from"../../browser/wordOperations.js";import{deserializePipePositions as l,serializePipePositions as a,testRepeatedActionAndExtractPositions as d}from"./wordTestUtils.js";import{createCodeEditorServices as bt,instantiateTestCodeEditor as _t,withTestCodeEditor as c}from"../../../../test/browser/testCodeEditor.js";import{instantiateTextModel as Dt}from"../../../../test/common/testTextModel.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";suite("WordOperations",()=>{const R=new pt,b=new ut,_=new mt,D=new Wt,V=new gt,v=new St,I=new ht,A=new Et,j=new ft,X=new Pt,J=new wt,F=new Lt,k=new ct,z=new lt,H=new at,B=new dt,N=new yt,O=new Tt,U=new Ct,G=new Mt,K=new Rt,Q=new xt,Y=new qt;let f,L,P,q;setup(()=>{f=new ot,L=bt(f),P=L.get(rt),q=L.get(it)}),teardown(()=>{f.dispose()}),nt();function g(t,o){L.invokeFunction(n=>{o.runEditorCommand(n,t,null)})}function m(t,o=!1){g(t,o?v:_)}function Z(t,o=!1){g(t,o?k:z)}function $(t,o=!1){g(t,o?B:H)}function W(t,o=!1){g(t,o?D:R)}function tt(t,o=!1){g(t,o?V:b)}function p(t,o=!1){g(t,o?F:j)}function et(t,o=!1){g(t,o?J:A)}function h(t,o=!1){g(t,o?X:I)}function w(t){g(t,N)}function C(t){g(t,O)}function x(t){g(t,U)}function S(t){g(t,G)}function y(t){g(t,K)}function M(t){g(t,Q)}function u(t){Y.run(null,t,null)}test("cursorWordLeft - simple",()=>{const t=["|    	|My |First |Line	 ","|	|My |Second |Line","|    |Third |Line\u{1F436}","|","|1"].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>m(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordLeft - with selection",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},t=>{t.setPosition(new i(5,2)),m(t,!0),s.deepStrictEqual(t.getSelection(),new E(5,2,5,1))})}),test("cursorWordLeft - issue #832",()=>{const t=["|   |/* |Just |some   |more   |text |a|+= |3 |+|5-|3 |+ |7 |*/  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>m(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordLeft - issue #48046: Word selection doesn't work as usual",()=>{const t=["|deep.|object.|property"].join(`
`),[o]=l(t),n=d(o,new i(1,21),e=>m(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordLeft - Recognize words",function(){if(T)return this.skip();const t=["|/* |\u3053\u308C|\u306F|\u30C6\u30B9\u30C8|\u3067\u3059 |/*"].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>m(e,!0),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1)),{wordSegmenterLocales:"ja"}),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordLeft - Does not recognize words",()=>{const t=["|/* |\u3053\u308C\u306F\u30C6\u30B9\u30C8\u3067\u3059 |/*"].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>m(e,!0),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1)),{wordSegmenterLocales:""}),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordLeft - issue #169904: cursors out of sync",()=>{c([".grid1 {","  display: grid;","  grid-template-columns:","    [full-start] minmax(1em, 1fr)","    [main-start] minmax(0, 40em) [main-end]","    minmax(1em, 1fr) [full-end];","}",".grid2 {","  display: grid;","  grid-template-columns:","    [full-start] minmax(1em, 1fr)","    [main-start] minmax(0, 40em) [main-end] minmax(1em, 1fr) [full-end];","}"],{},o=>{o.setSelections([new E(5,44,5,44),new E(6,32,6,32),new E(12,44,12,44),new E(12,72,12,72)]),m(o,!1),s.deepStrictEqual(o.getSelections(),[new E(5,43,5,43),new E(6,31,6,31),new E(12,43,12,43),new E(12,71,12,71)])})}),test("cursorWordLeftSelect - issue #74369: cursorWordLeft and cursorWordLeftSelect do not behave consistently",()=>{const t=["|this.|is.|a.|test"].join(`
`),[o]=l(t),n=d(o,new i(1,15),e=>m(e,!0),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordStartLeft",()=>{const t=["|   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>W(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordStartLeft - issue #51119: regression makes VS compatibility impossible",()=>{const t=["|this|.|is|.|a|.|test"].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>W(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("issue #51275 - cursorWordStartLeft does not push undo/redo stack element",()=>{function t(o,n){for(let r=0;r<n.length;r++)o.type(n.charAt(r),"keyboard")}c("",{},(o,n)=>{t(n,"foo bar baz"),s.strictEqual(o.getValue(),"foo bar baz"),W(o),W(o),t(n,"q"),s.strictEqual(o.getValue(),"foo qbar baz"),st.Undo.runEditorCommand(null,o,null),s.strictEqual(o.getValue(),"foo bar baz")})}),test("cursorWordEndLeft",()=>{const t=["|   /*| Just| some|   more|   text| a|+=| 3| +|5|-|3| +| 7| */|  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>tt(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordRight - simple",()=>{const t=["    	My| First| Line|	 |","	My| Second| Line|","    Third| Line\u{1F436}|","|","1|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>p(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(5,2))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordRight - selection",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{t.setPosition(new i(1,1)),p(t,!0),s.deepStrictEqual(t.getSelection(),new E(1,1,1,8))})}),test("cursorWordRight - issue #832",()=>{const t=["   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>p(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,50))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordRight - issue #41199",()=>{const t=["console|.log|(err|)|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>p(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,17))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordRight - Recognize words",function(){if(T)return this.skip();const t=["/*| \u3053\u308C|\u306F|\u30C6\u30B9\u30C8|\u3067\u3059|/*|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>p(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,14)),{wordSegmenterLocales:"ja"}),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordRight - Does not recognize words",()=>{const t=["/*| \u3053\u308C\u306F\u30C6\u30B9\u30C8\u3067\u3059|/*|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>p(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,14)),{wordSegmenterLocales:""}),r=a(o,n);s.deepStrictEqual(r,t)}),test("moveWordEndRight",()=>{const t=["   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>et(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,50))),r=a(o,n);s.deepStrictEqual(r,t)}),test("moveWordStartRight",()=>{const t=["   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  |"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>h(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,50))),r=a(o,n);s.deepStrictEqual(r,t)}),test("issue #51119: cursorWordStartRight regression makes VS compatibility impossible",()=>{const t=["this|.|is|.|a|.|test|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>h(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,15))),r=a(o,n);s.deepStrictEqual(r,t)}),test("issue #64810: cursorWordStartRight skips first word after newline",()=>{const t=["Hello |World|","|Hei |mailman|"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>h(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(2,12))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordAccessibilityLeft",()=>{const t=["|   /* |Just |some   |more   |text |a+= |3 +|5-|3 + |7 */  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e3),e=>Z(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,1))),r=a(o,n);s.deepStrictEqual(r,t)}),test("cursorWordAccessibilityRight",()=>{const t=["   /* |Just |some   |more   |text |a+= |3 +|5-|3 + |7 */  |"].join(`
`),[o]=l(t),n=d(o,new i(1,1),e=>$(e),e=>e.getPosition(),e=>e.getPosition().equals(new i(1,50))),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordLeft for non-empty selection",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setSelection(new E(3,7,3,9)),w(t),s.strictEqual(n.getLineContent(3),"    Thd Line\u{1F436}"),s.deepStrictEqual(t.getPosition(),new i(3,7))})}),test("deleteWordLeft for cursor at beginning of document",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,1)),w(t),s.strictEqual(n.getLineContent(1),"    	My First Line	 "),s.deepStrictEqual(t.getPosition(),new i(1,1))})}),test("deleteWordLeft for cursor at end of whitespace",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(3,11)),w(t),s.strictEqual(n.getLineContent(3),"    Line\u{1F436}"),s.deepStrictEqual(t.getPosition(),new i(3,5))})}),test("deleteWordLeft for cursor just behind a word",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,11)),w(t),s.strictEqual(n.getLineContent(2),"	My  Line"),s.deepStrictEqual(t.getPosition(),new i(2,5))})}),test("deleteWordLeft for cursor inside of a word",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,12)),w(t),s.strictEqual(n.getLineContent(1),"    	My st Line	 "),s.deepStrictEqual(t.getPosition(),new i(1,9))})}),test("deleteWordRight for non-empty selection",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setSelection(new E(3,7,3,9)),S(t),s.strictEqual(n.getLineContent(3),"    Thd Line\u{1F436}"),s.deepStrictEqual(t.getPosition(),new i(3,7))})}),test("deleteWordRight for cursor at end of document",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(5,3)),S(t),s.strictEqual(n.getLineContent(5),"1"),s.deepStrictEqual(t.getPosition(),new i(5,2))})}),test("deleteWordRight for cursor at beggining of whitespace",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(3,1)),S(t),s.strictEqual(n.getLineContent(3),"Third Line\u{1F436}"),s.deepStrictEqual(t.getPosition(),new i(3,1))})}),test("deleteWordRight for cursor just before a word",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,5)),S(t),s.strictEqual(n.getLineContent(2),"	My  Line"),s.deepStrictEqual(t.getPosition(),new i(2,5))})}),test("deleteWordRight for cursor inside of a word",()=>{c(["    	My First Line	 ","	My Second Line","    Third Line\u{1F436}","","1"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,11)),S(t),s.strictEqual(n.getLineContent(1),"    	My Fi Line	 "),s.deepStrictEqual(t.getPosition(),new i(1,11))})}),test("deleteWordLeft - issue #832",()=>{const t=["|   |/* |Just |some |text |a|+= |3 |+|5 |*/|  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e4),e=>w(e),e=>e.getPosition(),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordStartLeft",()=>{const t=["|   |/* |Just |some |text |a|+= |3 |+|5 |*/  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e4),e=>C(e),e=>e.getPosition(),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordEndLeft",()=>{const t=["|   /*| Just| some| text| a|+=| 3| +|5| */|  "].join(`
`),[o]=l(t),n=d(o,new i(1e3,1e4),e=>x(e),e=>e.getPosition(),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordLeft - issue #24947",()=>{c(["{","}"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,1)),w(t),s.strictEqual(n.getLineContent(1),"{}")}),c(["{","}"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,1)),C(t),s.strictEqual(n.getLineContent(1),"{}")}),c(["{","}"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,1)),x(t),s.strictEqual(n.getLineContent(1),"{}")})}),test("deleteWordRight - issue #832",()=>{const t="   |/*| Just| some| text| a|+=| 3| +|5|-|3| */|  |",[o]=l(t),n=d(o,new i(1,1),e=>S(e),e=>new i(1,o.length-e.getValue().length+1),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordRight - issue #3882",()=>{c(["public void Add( int x,","                 int y )"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,24)),S(t),s.strictEqual(n.getLineContent(1),"public void Add( int x,int y )","001")})}),test("deleteWordStartRight - issue #3882",()=>{c(["public void Add( int x,","                 int y )"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,24)),y(t),s.strictEqual(n.getLineContent(1),"public void Add( int x,int y )","001")})}),test("deleteWordEndRight - issue #3882",()=>{c(["public void Add( int x,","                 int y )"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,24)),M(t),s.strictEqual(n.getLineContent(1),"public void Add( int x,int y )","001")})}),test("deleteWordStartRight",()=>{const t="   |/* |Just |some |text |a|+= |3 |+|5|-|3 |*/  |",[o]=l(t),n=d(o,new i(1,1),e=>y(e),e=>new i(1,o.length-e.getValue().length+1),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordEndRight",()=>{const t="   /*| Just| some| text| a|+=| 3| +|5|-|3| */|  |",[o]=l(t),n=d(o,new i(1,1),e=>M(e),e=>new i(1,o.length-e.getValue().length+1),e=>e.getValue().length===0),r=a(o,n);s.deepStrictEqual(r,t)}),test("deleteWordRight - issue #3882 (1): Ctrl+Delete removing entire line when used at the end of line",()=>{c(["A line with text.","   And another one"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,18)),S(t),s.strictEqual(n.getLineContent(1),"A line with text.And another one","001")})}),test("deleteWordLeft - issue #3882 (2): Ctrl+Delete removing entire line when used at the end of line",()=>{c(["A line with text.","   And another one"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,1)),w(t),s.strictEqual(n.getLineContent(1),"A line with text.   And another one","001")})}),test("deleteWordLeft - issue #91855: Matching (quote, bracket, paren) doesn't get deleted when hitting Ctrl+Backspace",()=>{const t="myTestMode";f.add(q.registerLanguage({id:t})),f.add(P.register(t,{autoClosingPairs:[{open:'"',close:'"'}]}));const o=f.add(Dt(L,'a ""',t)),n=f.add(_t(L,o,{autoClosingDelete:"always"}));n.setPosition(new i(1,4)),w(n),s.strictEqual(o.getLineContent(1),"a ")}),test("deleteInsideWord - empty line",()=>{c(["Line1","","Line2"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(2,1)),u(t),s.strictEqual(n.getValue(),`Line1
Line2`)})}),test("deleteInsideWord - in whitespace 1",()=>{c(["Just  some text."],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,6)),u(t),s.strictEqual(n.getValue(),"Justsome text.")})}),test("deleteInsideWord - in whitespace 2",()=>{c(["Just     some text."],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,6)),u(t),s.strictEqual(n.getValue(),"Justsome text.")})}),test("deleteInsideWord - in whitespace 3",()=>{c(['Just     "some text.'],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,6)),u(t),s.strictEqual(n.getValue(),'Just"some text.'),u(t),s.strictEqual(n.getValue(),'"some text.'),u(t),s.strictEqual(n.getValue(),"some text."),u(t),s.strictEqual(n.getValue(),"text."),u(t),s.strictEqual(n.getValue(),"."),u(t),s.strictEqual(n.getValue(),""),u(t),s.strictEqual(n.getValue(),"")})}),test("deleteInsideWord - in non-words",()=>{c(["x=3+4+5+6"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,7)),u(t),s.strictEqual(n.getValue(),"x=3+45+6"),u(t),s.strictEqual(n.getValue(),"x=3++6"),u(t),s.strictEqual(n.getValue(),"x=36"),u(t),s.strictEqual(n.getValue(),"x="),u(t),s.strictEqual(n.getValue(),"x"),u(t),s.strictEqual(n.getValue(),""),u(t),s.strictEqual(n.getValue(),"")})}),test("deleteInsideWord - in words 1",()=>{c(["This is interesting"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,7)),u(t),s.strictEqual(n.getValue(),"This interesting"),u(t),s.strictEqual(n.getValue(),"This"),u(t),s.strictEqual(n.getValue(),""),u(t),s.strictEqual(n.getValue(),"")})}),test("deleteInsideWord - in words 2",()=>{c(["This  is  interesting"],{},(t,o)=>{const n=t.getModel();t.setPosition(new i(1,7)),u(t),s.strictEqual(n.getValue(),"This  interesting"),u(t),s.strictEqual(n.getValue(),"This"),u(t),s.strictEqual(n.getValue(),""),u(t),s.strictEqual(n.getValue(),"")})})});