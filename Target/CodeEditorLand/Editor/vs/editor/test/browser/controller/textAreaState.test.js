import r from"assert";import{Disposable as S}from"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as H}from"../../../../base/test/common/utils.js";import{TextAreaState as t}from"../../../browser/controller/editContext/textArea/textAreaEditContextState.js";import{Range as i}from"../../../common/core/range.js";import{Selection as u}from"../../../common/core/selection.js";import{createTextModel as g}from"../../common/testTextModel.js";import{PagedScreenReaderStrategy as _}from"../../../browser/controller/editContext/screenReaderUtils.js";class f extends S{_value;_selectionStart;_selectionEnd;constructor(){super(),this._value="",this._selectionStart=0,this._selectionEnd=0}getValue(){return this._value}setValue(n,o){this._value=o,this._selectionStart=this._value.length,this._selectionEnd=this._value.length}getSelectionStart(){return this._selectionStart}getSelectionEnd(){return this._selectionEnd}setSelectionRange(n,o,e){o<0&&(o=0),o>this._value.length&&(o=this._value.length),e<0&&(e=0),e>this._value.length&&(e=this._value.length),this._selectionStart=o,this._selectionEnd=e}}function m(a,n){return a.value===n.value&&a.selectionStart===n.selectionStart&&a.selectionEnd===n.selectionEnd&&i.equalsRange(a.selection,n.selection)&&a.newlineCountBeforeSelection===n.newlineCountBeforeSelection}suite("TextAreaState",()=>{H();function a(e,l,d,c){const s=new t(l,d,c,null,void 0);r.ok(m(s,e),s.toString()+" == "+e.toString())}test("fromTextArea",()=>{const e=new f;e._value="Hello world!",e._selectionStart=1,e._selectionEnd=12;let l=t.readFromTextArea(e,null);a(l,"Hello world!",1,12),r.strictEqual(l.value,"Hello world!"),r.strictEqual(l.selectionStart,1),l=l.collapseSelection(),a(l,"Hello world!",12,12),e.dispose()}),test("applyToTextArea",()=>{const e=new f;e._value="Hello world!",e._selectionStart=1,e._selectionEnd=12;let l=new t("Hi world!",2,2,null,void 0);l.writeToTextArea("test",e,!1),r.strictEqual(e._value,"Hi world!"),r.strictEqual(e._selectionStart,9),r.strictEqual(e._selectionEnd,9),l=new t("Hi world!",3,3,null,void 0),l.writeToTextArea("test",e,!1),r.strictEqual(e._value,"Hi world!"),r.strictEqual(e._selectionStart,9),r.strictEqual(e._selectionEnd,9),l=new t("Hi world!",0,2,null,void 0),l.writeToTextArea("test",e,!0),r.strictEqual(e._value,"Hi world!"),r.strictEqual(e._selectionStart,0),r.strictEqual(e._selectionEnd,2),e.dispose()});function n(e,l,d,c,s,x,p){e=e||t.EMPTY;const L=new f;L._value=l,L._selectionStart=d,L._selectionEnd=c;const w=t.readFromTextArea(L,null),h=t.deduceInput(e,w,s);r.deepStrictEqual(h,{text:x,replacePrevCharCnt:p,replaceNextCharCnt:0,positionDelta:0}),L.dispose()}test("extractNewText - no previous state with selection",()=>{n(null,"a",0,1,!0,"a",0)}),test("issue #2586: Replacing selected end-of-line with newline locks up the document",()=>{n(new t(`]
`,1,2,null,void 0),`]
`,2,2,!0,`
`,0)}),test("extractNewText - no previous state without selection",()=>{n(null,"a",1,1,!0,"a",0)}),test("extractNewText - typing does not cause a selection",()=>{n(t.EMPTY,"a",0,1,!0,"a",0)}),test("extractNewText - had the textarea empty",()=>{n(t.EMPTY,"a",1,1,!0,"a",0)}),test("extractNewText - had the entire line selected",()=>{n(new t("Hello world!",0,12,null,void 0),"H",1,1,!0,"H",0)}),test("extractNewText - had previous text 1",()=>{n(new t("Hello world!",12,12,null,void 0),"Hello world!a",13,13,!0,"a",0)}),test("extractNewText - had previous text 2",()=>{n(new t("Hello world!",0,0,null,void 0),"aHello world!",1,1,!0,"a",0)}),test("extractNewText - had previous text 3",()=>{n(new t("Hello world!",6,11,null,void 0),"Hello other!",11,11,!0,"other",0)}),test("extractNewText - IME",()=>{n(t.EMPTY,"\u3053\u308C\u306F",3,3,!0,"\u3053\u308C\u306F",0)}),test("extractNewText - isInOverwriteMode",()=>{n(new t("Hello world!",0,0,null,void 0),"Aello world!",1,1,!0,"A",0)}),test("extractMacReplacedText - does nothing if there is selection",()=>{n(new t("Hello world!",5,5,null,void 0),"Hell\xF6 world!",4,5,!0,"\xF6",0)}),test("extractMacReplacedText - does nothing if there is more than one extra char",()=>{n(new t("Hello world!",5,5,null,void 0),"Hell\xF6\xF6 world!",5,5,!0,"\xF6\xF6",1)}),test("extractMacReplacedText - does nothing if there is more than one changed char",()=>{n(new t("Hello world!",5,5,null,void 0),"Hel\xF6\xF6 world!",5,5,!0,"\xF6\xF6",2)}),test("extractMacReplacedText",()=>{n(new t("Hello world!",5,5,null,void 0),"Hell\xF6 world!",5,5,!0,"\xF6",1)}),test("issue #25101 - First key press ignored",()=>{n(new t("a",0,1,null,void 0),"a",1,1,!0,"a",0)}),test("issue #16520 - Cmd-d of single character followed by typing same character as has no effect",()=>{n(new t("x x",0,1,null,void 0),"x x",1,1,!0,"x",0)});function o(e,l,d,c,s,x,p,L){e=e||t.EMPTY;const w=new f;w._value=l,w._selectionStart=d,w._selectionEnd=c;const h=t.readFromTextArea(w,null),T=t.deduceAndroidCompositionInput(e,h);r.deepStrictEqual(T,{text:s,replacePrevCharCnt:x,replaceNextCharCnt:p,positionDelta:L}),w.dispose()}test("Android composition input 1",()=>{o(new t("Microsoft",4,4,null,void 0),"Microsoft",4,4,"",0,0,0)}),test("Android composition input 2",()=>{o(new t("Microsoft",4,4,null,void 0),"Microsoft",0,9,"",0,0,5)}),test("Android composition input 3",()=>{o(new t("Microsoft",0,9,null,void 0),"Microsoft's",11,11,"'s",0,0,0)}),test("Android backspace",()=>{o(new t("undefinedVariable",2,2,null,void 0),"udefinedVariable",1,1,"",1,0,0)}),suite("PagedScreenReaderStrategy",()=>{function e(l,d,c){const s=g(l.join(`
`)),x=_.fromEditorSelection(s,d,10,!0),p=t.fromScreenReaderContentState(x);r.ok(m(p,c)),s.dispose()}test("simple",()=>{e(["Hello world!"],new u(1,13,1,13),new t("Hello world!",12,12,new i(1,13,1,13),0)),e(["Hello world!"],new u(1,1,1,1),new t("Hello world!",0,0,new i(1,1,1,1),0)),e(["Hello world!"],new u(1,1,1,6),new t("Hello world!",0,5,new i(1,1,1,6),0))}),test("multiline",()=>{e(["Hello world!","How are you?"],new u(1,1,1,1),new t(`Hello world!
How are you?`,0,0,new i(1,1,1,1),0)),e(["Hello world!","How are you?"],new u(2,1,2,1),new t(`Hello world!
How are you?`,13,13,new i(2,1,2,1),1))}),test("page",()=>{e([`L1
L2
L3
L4
L5
L6
L7
L8
L9
L10
L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
L21`],new u(1,1,1,1),new t(`L1
L2
L3
L4
L5
L6
L7
L8
L9
L10
`,0,0,new i(1,1,1,1),0)),e([`L1
L2
L3
L4
L5
L6
L7
L8
L9
L10
L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
L21`],new u(11,1,11,1),new t(`L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
`,0,0,new i(11,1,11,1),0)),e([`L1
L2
L3
L4
L5
L6
L7
L8
L9
L10
L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
L21`],new u(12,1,12,1),new t(`L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
`,4,4,new i(12,1,12,1),1)),e([`L1
L2
L3
L4
L5
L6
L7
L8
L9
L10
L11
L12
L13
L14
L15
L16
L17
L18
L19
L20
L21`],new u(21,1,21,1),new t("L21",0,0,new i(21,1,21,1),0))})})});
