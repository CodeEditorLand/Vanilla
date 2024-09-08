import i from"assert";import{Disposable as C,DisposableStore as R}from"../../../../../base/common/lifecycle.js";import{transaction as L}from"../../../../../base/common/observable.js";import{isDefined as M}from"../../../../../base/common/types.js";import"../../../../../editor/common/core/range.js";import{linesDiffComputers as I}from"../../../../../editor/common/diff/linesDiffComputers.js";import{EndOfLinePreference as m}from"../../../../../editor/common/model.js";import{createModelServices as E,createTextModel as a}from"../../../../../editor/test/common/testTextModel.js";import"../../../../../platform/instantiation/common/instantiation.js";import{NullTelemetryService as S}from"../../../../../platform/telemetry/common/telemetryUtils.js";import{toLineRange as v,toRangeMapping as y}from"../../browser/model/diffComputer.js";import{DetailedLineRangeMapping as D}from"../../browser/model/mapping.js";import{MergeEditorModel as T}from"../../browser/model/mergeEditorModel.js";import{MergeEditorTelemetry as F}from"../../browser/telemetry.js";suite("merge editor model",()=>{test("prepend line",async()=>{await g({languageId:"plaintext",base:`line1
line2`,input1:`0
line1
line2`,input2:`0
line1
line2`,result:""},e=>{i.deepStrictEqual(e.getProjections(),{base:["\u27E6\u27E7\u2080line1","line2"],input1:["\u27E60","\u27E7\u2080line1","line2"],input2:["\u27E60","\u27E7\u2080line1","line2"],result:["\u27E6\u27E7{unrecognized}\u2080"]}),e.toggleConflict(0,1),i.deepStrictEqual({result:e.getResult()},{result:`0
line1
line2`}),e.toggleConflict(0,2),i.deepStrictEqual({result:e.getResult()},{result:`0
0
line1
line2`})})}),test("empty base",async()=>{await g({languageId:"plaintext",base:"",input1:"input1",input2:"input2",result:""},e=>{i.deepStrictEqual(e.getProjections(),{base:["\u27E6\u27E7\u2080"],input1:["\u27E6input1\u27E7\u2080"],input2:["\u27E6input2\u27E7\u2080"],result:["\u27E6\u27E7{base}\u2080"]}),e.toggleConflict(0,1),i.deepStrictEqual({result:e.getResult()},{result:"input1"}),e.toggleConflict(0,2),i.deepStrictEqual({result:e.getResult()},{result:"input2"})})}),test("can merge word changes",async()=>{await g({languageId:"plaintext",base:"hello",input1:"hallo",input2:"helloworld",result:""},e=>{i.deepStrictEqual(e.getProjections(),{base:["\u27E6hello\u27E7\u2080"],input1:["\u27E6hallo\u27E7\u2080"],input2:["\u27E6helloworld\u27E7\u2080"],result:["\u27E6\u27E7{unrecognized}\u2080"]}),e.toggleConflict(0,1),e.toggleConflict(0,2),i.deepStrictEqual({result:e.getResult()},{result:"halloworld"})})}),test("can combine insertions at end of document",async()=>{await g({languageId:"plaintext",base:`Z\xFCrich
Bern
Basel
Chur
Genf
Thun`,input1:`Z\xFCrich
Bern
Chur
Davos
Genf
Thun
function f(b:boolean) {}`,input2:`Z\xFCrich
Bern
Basel (FCB)
Chur
Genf
Thun
function f(a:number) {}`,result:`Z\xFCrich
Bern
Basel
Chur
Davos
Genf
Thun`},e=>{i.deepStrictEqual(e.getProjections(),{base:["Z\xFCrich","Bern","\u27E6Basel","\u27E7\u2080Chur","\u27E6\u27E7\u2081Genf","Thun\u27E6\u27E7\u2082"],input1:["Z\xFCrich","Bern","\u27E6\u27E7\u2080Chur","\u27E6Davos","\u27E7\u2081Genf","Thun","\u27E6function f(b:boolean) {}\u27E7\u2082"],input2:["Z\xFCrich","Bern","\u27E6Basel (FCB)","\u27E7\u2080Chur","\u27E6\u27E7\u2081Genf","Thun","\u27E6function f(a:number) {}\u27E7\u2082"],result:["Z\xFCrich","Bern","\u27E6Basel","\u27E7{base}\u2080Chur","\u27E6Davos","\u27E7{1\u2713}\u2081Genf","Thun\u27E6\u27E7{base}\u2082"]}),e.toggleConflict(2,1),e.toggleConflict(2,2),i.deepStrictEqual({result:e.getResult()},{result:`Z\xFCrich
Bern
Basel
Chur
Davos
Genf
Thun
function f(b:boolean) {}
function f(a:number) {}`})})}),test("conflicts are reset",async()=>{await g({languageId:"typescript",base:`import { h } from '../../../../../../vs/base/browser/dom.js';
import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { EditorOption } from '../../../../../../vs/editor/common/config/editorOptions.js';
import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';
import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';
`,input1:`import { h } from '../../../../../../vs/base/browser/dom.js';
import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';
import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';
import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';
`,input2:`import { h } from '../../../../../../vs/base/browser/dom.js';
import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';
import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';
`,result:`import { h } from '../../../../../../vs/base/browser/dom.js';\r
import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';\r
import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';\r
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\r
<<<<<<< Updated upstream\r
import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\r
=======\r
import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';\r
>>>>>>> Stashed changes\r
import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';\r
`},e=>{i.deepStrictEqual(e.getProjections(),{base:["import { h } from '../../../../../../vs/base/browser/dom.js';","import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';","\u27E6\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';","\u27E6import { EditorOption } from '../../../../../../vs/editor/common/config/editorOptions.js';","import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';","\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",""],input1:["import { h } from '../../../../../../vs/base/browser/dom.js';","import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';","\u27E6import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';","\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';","\u27E6import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';","\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",""],input2:["import { h } from '../../../../../../vs/base/browser/dom.js';","import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';","\u27E6\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';","\u27E6import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';","\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",""],result:["import { h } from '../../../../../../vs/base/browser/dom.js';","import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';","\u27E6import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';","\u27E7{1\u2713}\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';","\u27E6<<<<<<< Updated upstream","import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';","=======","import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';",">>>>>>> Stashed changes","\u27E7{unrecognized}\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",""]})})}),test("auto-solve equal edits",async()=>{await g({languageId:"javascript",base:`const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
main(paths);

function main(paths) {
    // print the welcome message
    printMessage();

    let data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

/**
 * Prints the welcome message
*/
function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,input1:`const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
main(paths);

function main(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,input2:`const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
run(paths);

function run(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,result:`<<<<<<< uiae
>>>>>>> Stashed changes`,resetResult:!0},async e=>{await e.mergeModel.reset(),i.deepStrictEqual(e.getResult(),`const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
run(paths);

function run(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`)})})});async function g(e,n){const t=new R,r=t.add(new x(e,E(t)));await r.mergeModel.onInitialized,await n(r),t.dispose()}function p(e){const n=["\u2080","\u2081","\u2082","\u2083","\u2084","\u2085","\u2086","\u2087","\u2088","\u2089"];return e.toString().split("").map(t=>n[parseInt(t)]).join("")}class x extends C{mergeModel;constructor(n,t){super();const r=this._register(a(n.input1,n.languageId)),l=this._register(a(n.input2,n.languageId)),u=this._register(a(n.base,n.languageId)),c=this._register(a(n.result,n.languageId)),d={async computeDiff(o,s,b){return{diffs:(await I.getLegacy().computeDiff(o.getLinesContent(),s.getLinesContent(),{ignoreTrimWhitespace:!1,maxComputationTimeMs:1e4,computeMoves:!1})).changes.map(f=>new D(v(f.original),o,v(f.modified),s,f.innerChanges?.map(w=>y(w)).filter(M)))}}};this.mergeModel=this._register(t.createInstance(T,u,{textModel:r,description:"",detail:"",title:""},{textModel:l,description:"",detail:"",title:""},c,d,{resetResult:n.resetResult||!1},new F(S)))}getProjections(){function n(o,s){o.applyEdits(s.map(({range:b,label:h})=>({range:b,text:`\u27E6${o.getValueInRange(b)}\u27E7${h}`})))}const t=this.mergeModel.modifiedBaseRanges.get(),r=a(this.mergeModel.base.getValue());n(r,t.map((o,s)=>({range:o.baseRange.toRange(),label:p(s)})));const l=a(this.mergeModel.input1.textModel.getValue());n(l,t.map((o,s)=>({range:o.input1Range.toRange(),label:p(s)})));const u=a(this.mergeModel.input2.textModel.getValue());n(u,t.map((o,s)=>({range:o.input2Range.toRange(),label:p(s)})));const c=a(this.mergeModel.resultTextModel.getValue());n(c,t.map((o,s)=>({range:this.mergeModel.getLineRangeInResult(o.baseRange).toRange(),label:`{${this.mergeModel.getState(o).get()}}${p(s)}`})));const d={base:r.getValue(m.LF).split(`
`),input1:l.getValue(m.LF).split(`
`),input2:u.getValue(m.LF).split(`
`),result:c.getValue(m.LF).split(`
`)};return r.dispose(),l.dispose(),u.dispose(),c.dispose(),d}toggleConflict(n,t){const r=this.mergeModel.modifiedBaseRanges.get()[n];if(!r)throw new Error;const l=this.mergeModel.getState(r).get();L(u=>{this.mergeModel.setState(r,l.toggle(t),!0,u)})}getResult(){return this.mergeModel.resultTextModel.getValue()}}
