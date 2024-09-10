import{compareBy as d,numberComparator as g}from"../../../../../base/common/arrays.js";import{BugIndicatingError as u}from"../../../../../base/common/errors.js";import{Disposable as h,toDisposable as c}from"../../../../../base/common/lifecycle.js";import"../../../../../editor/common/model.js";import{DetailedLineRangeMapping as m}from"./mapping.js";import{LineRangeEdit as R}from"./editing.js";import{LineRange as f}from"./lineRange.js";import{ReentrancyBarrier as D}from"../../../../../base/common/controlFlow.js";import"./diffComputer.js";import{autorun as b,observableSignal as x,observableValue as l,transaction as p}from"../../../../../base/common/observable.js";import"../../../../../platform/undoRedo/common/undoRedo.js";class j extends h{constructor(e,r,n){super();this.baseTextModel=e;this.textModel=r;this.diffComputer=n;const t=x("recompute");this._register(b(i=>{t.read(i),this._recompute(i)})),this._register(e.onDidChangeContent(this._barrier.makeExclusiveOrSkip(()=>{t.trigger(void 0)}))),this._register(r.onDidChangeContent(this._barrier.makeExclusiveOrSkip(()=>{t.trigger(void 0)}))),this._register(c(()=>{this._isDisposed=!0}))}_recomputeCount=0;_state=l(this,1);_diffs=l(this,[]);_barrier=new D;_isDisposed=!1;get isApplyingChange(){return this._barrier.isOccupied}get state(){return this._state}get diffs(){return this._diffs}_isInitializing=!0;_recompute(e){this._recomputeCount++;const r=this._recomputeCount;this._state.get()===1&&(this._isInitializing=!0),p(t=>{this._state.set(this._isInitializing?1:3,t,0)}),this.diffComputer.computeDiff(this.baseTextModel,this.textModel,e).then(t=>{this._isDisposed||r===this._recomputeCount&&p(i=>{t.diffs?(this._state.set(2,i,1),this._diffs.set(t.diffs,i,1)):this._state.set(4,i,1),this._isInitializing=!1})})}ensureUpToDate(){if(this.state.get()!==2)throw new u("Cannot remove diffs when the model is not up to date")}removeDiffs(e,r,n){this.ensureUpToDate(),e.sort(d(i=>i.inputRange.startLineNumber,g)),e.reverse();let t=this._diffs.get();for(const i of e){const o=t.length;if(t=t.filter(s=>s!==i),o===t.length)throw new u;this._barrier.runExclusivelyOrThrow(()=>{const s=i.getReverseLineEdit().toEdits(this.textModel.getLineCount());this.textModel.pushEditOperations(null,s,()=>null,n)}),t=t.map(s=>s.outputRange.isAfter(i.outputRange)?s.addOutputLineDelta(i.inputRange.lineCount-i.outputRange.lineCount):s)}this._diffs.set(t,r,0)}applyEditRelativeToOriginal(e,r,n){this.ensureUpToDate();const t=new m(e.range,this.baseTextModel,new f(e.range.startLineNumber,e.newLines.length),this.textModel);let i=!1,o=0;const s=new Array;for(const a of this.diffs.get()){if(a.inputRange.touches(e.range))throw new u("Edit must be conflict free.");a.inputRange.isAfter(e.range)?(i||(i=!0,s.push(t.addOutputLineDelta(o))),s.push(a.addOutputLineDelta(e.newLines.length-e.range.lineCount))):s.push(a),i||(o+=a.outputRange.lineCount-a.inputRange.lineCount)}i||(i=!0,s.push(t.addOutputLineDelta(o))),this._barrier.runExclusivelyOrThrow(()=>{const a=new R(e.range.delta(o),e.newLines).toEdits(this.textModel.getLineCount());this.textModel.pushEditOperations(null,a,()=>null,n)}),this._diffs.set(s,r,0)}findTouchingDiffs(e){return this.diffs.get().filter(r=>r.inputRange.touches(e))}getResultLine(e,r){let n=0;const t=r?this.diffs.read(r):this.diffs.get();for(const i of t){if(i.inputRange.contains(e)||i.inputRange.endLineNumberExclusive===e)return i;if(i.inputRange.endLineNumberExclusive<e)n=i.resultingDeltaFromOriginalToModified;else break}return e+n}getResultLineRange(e,r){let n=this.getResultLine(e.startLineNumber,r);typeof n!="number"&&(n=n.outputRange.startLineNumber);let t=this.getResultLine(e.endLineNumberExclusive,r);return typeof t!="number"&&(t=t.outputRange.endLineNumberExclusive),f.fromLineNumbers(n,t)}}var L=(e=>(e[e.other=0]="other",e[e.textChange=1]="textChange",e))(L||{}),_=(n=>(n[n.initializing=1]="initializing",n[n.upToDate=2]="upToDate",n[n.updating=3]="updating",n[n.error=4]="error",n))(_||{});export{L as TextModelDiffChangeReason,_ as TextModelDiffState,j as TextModelDiffs};
