import h from"assert";import{Constants as p}from"../../../../base/common/uint.js";import{ensureNoDisposablesAreLeakedInTestSuite as E}from"../../../../base/test/common/utils.js";import{Range as f}from"../../../common/core/range.js";import{DiffComputer as S}from"../../../common/diff/legacyLinesDiffComputer.js";import"../../../common/model.js";import{createTextModel as A}from"../testTextModel.js";function o(e,i,n,l=!0,c=!1,m=!1){const b=new S(e,i,{shouldComputeCharChanges:l,shouldPostProcessCharChanges:c,shouldIgnoreTrimWhitespace:m,shouldMakePrettyDiff:!0,maxComputationTime:0}).computeDiff().changes,N=d=>({originalStartLineNumber:d.originalStartLineNumber,originalStartColumn:d.originalStartColumn,originalEndLineNumber:d.originalEndLineNumber,originalEndColumn:d.originalEndColumn,modifiedStartLineNumber:d.modifiedStartLineNumber,modifiedStartColumn:d.modifiedStartColumn,modifiedEndLineNumber:d.modifiedEndLineNumber,modifiedEndColumn:d.modifiedEndColumn}),T=b.map(d=>({originalStartLineNumber:d.originalStartLineNumber,originalEndLineNumber:d.originalEndLineNumber,modifiedStartLineNumber:d.modifiedStartLineNumber,modifiedEndLineNumber:d.modifiedEndLineNumber,charChanges:d.charChanges?d.charChanges.map(N):void 0}));if(h.deepStrictEqual(T,n),!m){const d=A(i.join(`
`)),w=d.getValue();{const u=A(e.join(`
`));u.applyEdits(b.map(x=>y(x,d))),h.deepStrictEqual(u.getValue(),w),u.dispose()}if(l){const u=A(e.join(`
`));u.applyEdits(b.flatMap(x=>D(x,d))),h.deepStrictEqual(u.getValue(),w),u.dispose()}d.dispose()}}function D(e,i){return e.charChanges?e.charChanges.map(n=>{const l=new f(n.originalStartLineNumber,n.originalStartColumn,n.originalEndLineNumber,n.originalEndColumn),c=new f(n.modifiedStartLineNumber,n.modifiedStartColumn,n.modifiedEndLineNumber,n.modifiedEndColumn);return{range:l,text:i.getValueInRange(c)}}):[y(e,i)]}function y(e,i){let n;e.originalEndLineNumber===0?n=new g(e.originalStartLineNumber+1,0):n=new g(e.originalStartLineNumber,e.originalEndLineNumber-e.originalStartLineNumber+1);let l;e.modifiedEndLineNumber===0?l=new g(e.modifiedStartLineNumber+1,0):l=new g(e.modifiedStartLineNumber,e.modifiedEndLineNumber-e.modifiedStartLineNumber+1);const[c,m]=_(n,l);return{range:c,text:i.getValueInRange(m)}}function _(e,i){return e.startLineNumber===1||i.startLineNumber===1?!e.isEmpty&&!i.isEmpty?[new f(e.startLineNumber,1,e.endLineNumberExclusive-1,p.MAX_SAFE_SMALL_INTEGER),new f(i.startLineNumber,1,i.endLineNumberExclusive-1,p.MAX_SAFE_SMALL_INTEGER)]:[new f(e.startLineNumber,1,e.endLineNumberExclusive,1),new f(i.startLineNumber,1,i.endLineNumberExclusive,1)]:[new f(e.startLineNumber-1,p.MAX_SAFE_SMALL_INTEGER,e.endLineNumberExclusive-1,p.MAX_SAFE_SMALL_INTEGER),new f(i.startLineNumber-1,p.MAX_SAFE_SMALL_INTEGER,i.endLineNumberExclusive-1,p.MAX_SAFE_SMALL_INTEGER)]}class g{constructor(i,n){this.startLineNumber=i;this.lineCount=n}get isEmpty(){return this.lineCount===0}get endLineNumberExclusive(){return this.startLineNumber+this.lineCount}}function a(e,i,n){return{originalStartLineNumber:e,originalEndLineNumber:i,modifiedStartLineNumber:n,modifiedEndLineNumber:0,charChanges:void 0}}function s(e,i,n){return{originalStartLineNumber:n,originalEndLineNumber:0,modifiedStartLineNumber:e,modifiedEndLineNumber:i,charChanges:void 0}}function r(e,i,n,l,c){return{originalStartLineNumber:e,originalEndLineNumber:i,modifiedStartLineNumber:n,modifiedEndLineNumber:l,charChanges:c}}function t(e,i,n,l,c,m,L,b){return{originalStartLineNumber:e,originalStartColumn:i,originalEndLineNumber:n,originalEndColumn:l,modifiedStartLineNumber:c,modifiedStartColumn:m,modifiedEndLineNumber:L,modifiedEndColumn:b}}suite("Editor Diff - DiffComputer",()=>{E(),test("one inserted line below",()=>{const e=["line"],i=["line","new line"],n=[s(2,2,1)];o(e,i,n)}),test("two inserted lines below",()=>{const e=["line"],i=["line","new line","another new line"],n=[s(2,3,1)];o(e,i,n)}),test("one inserted line above",()=>{const e=["line"],i=["new line","line"],n=[s(1,1,0)];o(e,i,n)}),test("two inserted lines above",()=>{const e=["line"],i=["new line","another new line","line"],n=[s(1,2,0)];o(e,i,n)}),test("one inserted line in middle",()=>{const e=["line1","line2","line3","line4"],i=["line1","line2","new line","line3","line4"],n=[s(3,3,2)];o(e,i,n)}),test("two inserted lines in middle",()=>{const e=["line1","line2","line3","line4"],i=["line1","line2","new line","another new line","line3","line4"],n=[s(3,4,2)];o(e,i,n)}),test("two inserted lines in middle interrupted",()=>{const e=["line1","line2","line3","line4"],i=["line1","line2","new line","line3","another new line","line4"],n=[s(3,3,2),s(5,5,3)];o(e,i,n)}),test("one deleted line below",()=>{const e=["line","new line"],i=["line"],n=[a(2,2,1)];o(e,i,n)}),test("two deleted lines below",()=>{const e=["line","new line","another new line"],i=["line"],n=[a(2,3,1)];o(e,i,n)}),test("one deleted lines above",()=>{const e=["new line","line"],i=["line"],n=[a(1,1,0)];o(e,i,n)}),test("two deleted lines above",()=>{const e=["new line","another new line","line"],i=["line"],n=[a(1,2,0)];o(e,i,n)}),test("one deleted line in middle",()=>{const e=["line1","line2","new line","line3","line4"],i=["line1","line2","line3","line4"],n=[a(3,3,2)];o(e,i,n)}),test("two deleted lines in middle",()=>{const e=["line1","line2","new line","another new line","line3","line4"],i=["line1","line2","line3","line4"],n=[a(3,4,2)];o(e,i,n)}),test("two deleted lines in middle interrupted",()=>{const e=["line1","line2","new line","line3","another new line","line4"],i=["line1","line2","line3","line4"],n=[a(3,3,2),a(5,5,3)];o(e,i,n)}),test("one line changed: chars inserted at the end",()=>{const e=["line"],i=["line changed"],n=[r(1,1,1,1,[t(1,5,1,5,1,5,1,13)])];o(e,i,n)}),test("one line changed: chars inserted at the beginning",()=>{const e=["line"],i=["my line"],n=[r(1,1,1,1,[t(1,1,1,1,1,1,1,4)])];o(e,i,n)}),test("one line changed: chars inserted in the middle",()=>{const e=["abba"],i=["abzzba"],n=[r(1,1,1,1,[t(1,3,1,3,1,3,1,5)])];o(e,i,n)}),test("one line changed: chars inserted in the middle (two spots)",()=>{const e=["abba"],i=["abzzbzza"],n=[r(1,1,1,1,[t(1,3,1,3,1,3,1,5),t(1,4,1,4,1,6,1,8)])];o(e,i,n)}),test("one line changed: chars deleted 1",()=>{const e=["abcdefg"],i=["abcfg"],n=[r(1,1,1,1,[t(1,4,1,6,1,4,1,4)])];o(e,i,n)}),test("one line changed: chars deleted 2",()=>{const e=["abcdefg"],i=["acfg"],n=[r(1,1,1,1,[t(1,2,1,3,1,2,1,2),t(1,4,1,6,1,3,1,3)])];o(e,i,n)}),test("two lines changed 1",()=>{const e=["abcd","efgh"],i=["abcz"],n=[r(1,2,1,1,[t(1,4,2,5,1,4,1,5)])];o(e,i,n)}),test("two lines changed 2",()=>{const e=["foo","abcd","efgh","BAR"],i=["foo","abcz","BAR"],n=[r(2,3,2,2,[t(2,4,3,5,2,4,2,5)])];o(e,i,n)}),test("two lines changed 3",()=>{const e=["foo","abcd","efgh","BAR"],i=["foo","abcz","zzzzefgh","BAR"],n=[r(2,3,2,3,[t(2,4,2,5,2,4,2,5),t(3,1,3,1,3,1,3,5)])];o(e,i,n)}),test("two lines changed 4",()=>{const e=["abc"],i=["","","axc",""],n=[r(1,1,1,4,[t(1,1,1,1,1,1,3,1),t(1,2,1,3,3,2,3,3),t(1,4,1,4,3,4,4,1)])];o(e,i,n)}),test("empty original sequence in char diff",()=>{const e=["abc","","xyz"],i=["abc","qwe","rty","xyz"],n=[r(2,2,2,3)];o(e,i,n)}),test("three lines changed",()=>{const e=["foo","abcd","efgh","BAR"],i=["foo","zzzefgh","xxx","BAR"],n=[r(2,3,2,3,[t(2,1,3,1,2,1,2,4),t(3,5,3,5,2,8,3,4)])];o(e,i,n)}),test("big change part 1",()=>{const e=["foo","abcd","efgh","BAR"],i=["hello","foo","zzzefgh","xxx","BAR"],n=[s(1,1,0),r(2,3,3,4,[t(2,1,3,1,3,1,3,4),t(3,5,3,5,3,8,4,4)])];o(e,i,n)}),test("big change part 2",()=>{const e=["foo","abcd","efgh","BAR","RAB"],i=["hello","foo","zzzefgh","xxx","BAR"],n=[s(1,1,0),r(2,3,3,4,[t(2,1,3,1,3,1,3,4),t(3,5,3,5,3,8,4,4)]),a(5,5,5)];o(e,i,n)}),test("char change postprocessing merges",()=>{const e=["abba"],i=["azzzbzzzbzzza"],n=[r(1,1,1,1,[t(1,2,1,4,1,2,1,13)])];o(e,i,n,!0,!0)}),test("ignore trim whitespace",()=>{const e=["		 foo ","abcd","efgh","		 BAR		"],i=["  hello	","	 foo   	","zzzefgh","xxx","   BAR   	"],n=[s(1,1,0),r(2,3,3,4,[t(2,1,2,5,3,1,3,4),t(3,5,3,5,4,1,4,4)])];o(e,i,n,!0,!1,!0)}),test("issue #12122 r.hasOwnProperty is not a function",()=>{const e=["hasOwnProperty"],i=["hasOwnProperty","and another line"],n=[s(2,2,1)];o(e,i,n)}),test("empty diff 1",()=>{const e=[""],i=["something"],n=[r(1,1,1,1,void 0)];o(e,i,n,!0,!1,!0)}),test("empty diff 2",()=>{const e=[""],i=["something","something else"],n=[r(1,1,1,2,void 0)];o(e,i,n,!0,!1,!0)}),test("empty diff 3",()=>{const e=["something","something else"],i=[""],n=[r(1,2,1,1,void 0)];o(e,i,n,!0,!1,!0)}),test("empty diff 4",()=>{const e=["something"],i=[""],n=[r(1,1,1,1,void 0)];o(e,i,n,!0,!1,!0)}),test("empty diff 5",()=>{o([""],[""],[],!0,!1,!0)}),test("pretty diff 1",()=>{const e=["suite(function () {","	test1() {","		assert.ok(true);","	}","","	test2() {","		assert.ok(true);","	}","});",""],i=["// An insertion","suite(function () {","	test1() {","		assert.ok(true);","	}","","	test2() {","		assert.ok(true);","	}","","	test3() {","		assert.ok(true);","	}","});",""],n=[s(1,1,0),s(10,13,8)];o(e,i,n,!0,!1,!0)}),test("pretty diff 2",()=>{const e=["// Just a comment","","function compute(a, b, c, d) {","	if (a) {","		if (b) {","			if (c) {","				return 5;","			}","		}","		// These next lines will be deleted","		if (d) {","			return -1;","		}","		return 0;","	}","}"],i=["// Here is an inserted line","// and another inserted line","// and another one","// Just a comment","","function compute(a, b, c, d) {","	if (a) {","		if (b) {","			if (c) {","				return 5;","			}","		}","		return 0;","	}","}"],n=[s(1,3,0),a(10,13,12)];o(e,i,n,!0,!1,!0)}),test("pretty diff 3",()=>{const e=["class A {","	/**","	 * m1","	 */","	method1() {}","","	/**","	 * m3","	 */","	method3() {}","}"],i=["class A {","	/**","	 * m1","	 */","	method1() {}","","	/**","	 * m2","	 */","	method2() {}","","	/**","	 * m3","	 */","	method3() {}","}"],n=[s(7,11,6)];o(e,i,n,!0,!1,!0)}),test("issue #23636",()=>{const e=["if(!TextDrawLoad[playerid])","{","","	TextDrawHideForPlayer(playerid,TD_AppleJob[3]);","	TextDrawHideForPlayer(playerid,TD_AppleJob[4]);","	if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])","	{","		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[5+i]);","	}","	else","	{","		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[15+i]);","	}","}","else","{","	TextDrawHideForPlayer(playerid,TD_AppleJob[3]);","	TextDrawHideForPlayer(playerid,TD_AppleJob[27]);","	if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])","	{","		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[28+i]);","	}","	else","	{","		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[38+i]);","	}","}"],i=["	if(!TextDrawLoad[playerid])","	{","	","		TextDrawHideForPlayer(playerid,TD_AppleJob[3]);","		TextDrawHideForPlayer(playerid,TD_AppleJob[4]);","		if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])","		{","			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[5+i]);","		}","		else","		{","			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[15+i]);","		}","	}","	else","	{","		TextDrawHideForPlayer(playerid,TD_AppleJob[3]);","		TextDrawHideForPlayer(playerid,TD_AppleJob[27]);","		if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])","		{","			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[28+i]);","		}","		else","		{","			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[38+i]);","		}","	}"],n=[r(1,27,1,27,[t(1,1,1,1,1,1,1,2),t(2,1,2,1,2,1,2,2),t(3,1,3,1,3,1,3,2),t(4,1,4,1,4,1,4,2),t(5,1,5,1,5,1,5,2),t(6,1,6,1,6,1,6,2),t(7,1,7,1,7,1,7,2),t(8,1,8,1,8,1,8,2),t(9,1,9,1,9,1,9,2),t(10,1,10,1,10,1,10,2),t(11,1,11,1,11,1,11,2),t(12,1,12,1,12,1,12,2),t(13,1,13,1,13,1,13,2),t(14,1,14,1,14,1,14,2),t(15,1,15,1,15,1,15,2),t(16,1,16,1,16,1,16,2),t(17,1,17,1,17,1,17,2),t(18,1,18,1,18,1,18,2),t(19,1,19,1,19,1,19,2),t(20,1,20,1,20,1,20,2),t(21,1,21,1,21,1,21,2),t(22,1,22,1,22,1,22,2),t(23,1,23,1,23,1,23,2),t(24,1,24,1,24,1,24,2),t(25,1,25,1,25,1,25,2),t(26,1,26,1,26,1,26,2),t(27,1,27,1,27,1,27,2)])];o(e,i,n,!0,!0,!1)}),test("issue #43922",()=>{const e=[" * `yarn [install]` -- Install project NPM dependencies. This is automatically done when you first create the project. You should only need to run this if you add dependencies in `package.json`."],i=[" * `yarn` -- Install project NPM dependencies. You should only need to run this if you add dependencies in `package.json`."],n=[r(1,1,1,1,[t(1,9,1,19,1,9,1,9),t(1,58,1,120,1,48,1,48)])];o(e,i,n,!0,!0,!1)}),test("issue #42751",()=>{const e=["    1","  2"],i=["    1","   3"],n=[r(2,2,2,2,[t(2,3,2,4,2,3,2,5)])];o(e,i,n,!0,!0,!1)}),test("does not give character changes",()=>{const e=["    1","  2","A"],i=["    1","   3"," A"],n=[r(2,3,2,3)];o(e,i,n,!1,!1,!1)}),test("issue #44422: Less than ideal diff results",()=>{const e=["export class C {","","	public m1(): void {","		{","		//2","		//3","		//4","		//5","		//6","		//7","		//8","		//9","		//10","		//11","		//12","		//13","		//14","		//15","		//16","		//17","		//18","		}","	}","","	public m2(): void {","		if (a) {","			if (b) {","				//A1","				//A2","				//A3","				//A4","				//A5","				//A6","				//A7","				//A8","			}","		}","","		//A9","		//A10","		//A11","		//A12","		//A13","		//A14","		//A15","	}","","	public m3(): void {","		if (a) {","			//B1","		}","		//B2","		//B3","	}","","	public m4(): boolean {","		//1","		//2","		//3","		//4","	}","","}"],i=["export class C {","","	constructor() {","","","","","	}","","	public m1(): void {","		{","		//2","		//3","		//4","		//5","		//6","		//7","		//8","		//9","		//10","		//11","		//12","		//13","		//14","		//15","		//16","		//17","		//18","		}","	}","","	public m4(): boolean {","		//1","		//2","		//3","		//4","	}","","}"],n=[r(2,0,3,9),r(25,55,31,0)];o(e,i,n,!1,!1,!1)}),test("gives preference to matching longer lines",()=>{const e=["A","A","BB","C"],i=["A","BB","A","D","E","A","C"],n=[r(2,2,1,0),r(3,0,3,6)];o(e,i,n,!1,!1,!1)}),test("issue #119051: gives preference to fewer diff hunks",()=>{const e=["1","","","2",""],i=["1","","1.5","","","2","","3",""],n=[r(2,0,3,4),r(5,0,8,9)];o(e,i,n,!1,!1,!1)}),test("issue #121436: Diff chunk contains an unchanged line part 1",()=>{const e=["if (cond) {","    cmd","}"],i=["if (cond) {","    if (other_cond) {","        cmd","    }","}"],n=[r(1,0,2,2),r(2,0,4,4)];o(e,i,n,!1,!1,!0)}),test("issue #121436: Diff chunk contains an unchanged line part 2",()=>{const e=["if (cond) {","    cmd","}"],i=["if (cond) {","    if (other_cond) {","        cmd","    }","}"],n=[r(1,0,2,2),r(2,2,3,3),r(2,0,4,4)];o(e,i,n,!1,!1,!1)}),test("issue #169552: Assertion error when having both leading and trailing whitespace diffs",()=>{const e=["if True:","    print(2)"],i=["if True:","	print(2) "],n=[r(2,2,2,2,[t(2,1,2,5,2,1,2,2),t(2,13,2,13,2,10,2,11)])];o(e,i,n,!0,!1,!1)})});
