import{compareBy as d,numberComparator as g}from"../../../../../../vs/base/common/arrays.js";import{BugIndicatingError as u}from"../../../../../../vs/base/common/errors.js";import{Disposable as h,toDisposable as c}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as m,observableSignal as R,observableValue as f,transaction as l}from"../../../../../../vs/base/common/observable.js";import"../../../../../../vs/editor/common/model.js";import"../../../../../../vs/platform/undoRedo/common/undoRedo.js";import{LineRangeEdit as D}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/editing.js";import{LineRange as p}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js";import{DetailedLineRangeMapping as b}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/mapping.js";import{ReentrancyBarrier as x}from"../../../../../base/common/controlFlow.js";import"./diffComputer.js";class j extends h{constructor(e,r,n){super();this.baseTextModel=e;this.textModel=r;this.diffComputer=n;const t=R("recompute");this._register(m(i=>{t.read(i),this._recompute(i)})),this._register(e.onDidChangeContent(this._barrier.makeExclusiveOrSkip(()=>{t.trigger(void 0)}))),this._register(r.onDidChangeContent(this._barrier.makeExclusiveOrSkip(()=>{t.trigger(void 0)}))),this._register(c(()=>{this._isDisposed=!0}))}_recomputeCount=0;_state=f(this,1);_diffs=f(this,[]);_barrier=new x;_isDisposed=!1;get isApplyingChange(){return this._barrier.isOccupied}get state(){return this._state}get diffs(){return this._diffs}_isInitializing=!0;_recompute(e){this._recomputeCount++;const r=this._recomputeCount;this._state.get()===1&&(this._isInitializing=!0),l(t=>{this._state.set(this._isInitializing?1:3,t,0)}),this.diffComputer.computeDiff(this.baseTextModel,this.textModel,e).then(t=>{this._isDisposed||r===this._recomputeCount&&l(i=>{t.diffs?(this._state.set(2,i,1),this._diffs.set(t.diffs,i,1)):this._state.set(4,i,1),this._isInitializing=!1})})}ensureUpToDate(){if(this.state.get()!==2)throw new u("Cannot remove diffs when the model is not up to date")}removeDiffs(e,r,n){this.ensureUpToDate(),e.sort(d(i=>i.inputRange.startLineNumber,g)),e.reverse();let t=this._diffs.get();for(const i of e){const o=t.length;if(t=t.filter(s=>s!==i),o===t.length)throw new u;this._barrier.runExclusivelyOrThrow(()=>{const s=i.getReverseLineEdit().toEdits(this.textModel.getLineCount());this.textModel.pushEditOperations(null,s,()=>null,n)}),t=t.map(s=>s.outputRange.isAfter(i.outputRange)?s.addOutputLineDelta(i.inputRange.lineCount-i.outputRange.lineCount):s)}this._diffs.set(t,r,0)}applyEditRelativeToOriginal(e,r,n){this.ensureUpToDate();const t=new b(e.range,this.baseTextModel,new p(e.range.startLineNumber,e.newLines.length),this.textModel);let i=!1,o=0;const s=new Array;for(const a of this.diffs.get()){if(a.inputRange.touches(e.range))throw new u("Edit must be conflict free.");a.inputRange.isAfter(e.range)?(i||(i=!0,s.push(t.addOutputLineDelta(o))),s.push(a.addOutputLineDelta(e.newLines.length-e.range.lineCount))):s.push(a),i||(o+=a.outputRange.lineCount-a.inputRange.lineCount)}i||(i=!0,s.push(t.addOutputLineDelta(o))),this._barrier.runExclusivelyOrThrow(()=>{const a=new D(e.range.delta(o),e.newLines).toEdits(this.textModel.getLineCount());this.textModel.pushEditOperations(null,a,()=>null,n)}),this._diffs.set(s,r,0)}findTouchingDiffs(e){return this.diffs.get().filter(r=>r.inputRange.touches(e))}getResultLine(e,r){let n=0;const t=r?this.diffs.read(r):this.diffs.get();for(const i of t){if(i.inputRange.contains(e)||i.inputRange.endLineNumberExclusive===e)return i;if(i.inputRange.endLineNumberExclusive<e)n=i.resultingDeltaFromOriginalToModified;else break}return e+n}getResultLineRange(e,r){let n=this.getResultLine(e.startLineNumber,r);typeof n!="number"&&(n=n.outputRange.startLineNumber);let t=this.getResultLine(e.endLineNumberExclusive,r);return typeof t!="number"&&(t=t.outputRange.endLineNumberExclusive),p.fromLineNumbers(n,t)}}var L=(e=>(e[e.other=0]="other",e[e.textChange=1]="textChange",e))(L||{}),_=(n=>(n[n.initializing=1]="initializing",n[n.upToDate=2]="upToDate",n[n.updating=3]="updating",n[n.error=4]="error",n))(_||{});export{L as TextModelDiffChangeReason,_ as TextModelDiffState,j as TextModelDiffs};
