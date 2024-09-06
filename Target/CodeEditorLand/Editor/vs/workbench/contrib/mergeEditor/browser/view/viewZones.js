import{$ as D}from"../../../../../../vs/base/browser/dom.js";import{CompareResult as T,lastOrDefault as P}from"../../../../../../vs/base/common/arrays.js";import"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/base/common/observable.js";import"../../../../../../vs/editor/browser/editorBrowser.js";import{LineRange as W}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js";import"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/mapping.js";import"../../../../../../vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange.js";import{join as _}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/utils.js";import{ActionsSource as j,ConflictActionsFactory as v}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/view/conflictActions.js";import{getAlignments as G}from"../../../../../../vs/workbench/contrib/mergeEditor/browser/view/lineAlignment.js";import"../../../../../../vs/workbench/contrib/mergeEditor/browser/view/viewModel.js";class fe{constructor(s,o,e){this.input1Editor=s;this.input2Editor=o;this.resultEditor=e}conflictActionsFactoryInput1=new v(this.input1Editor);conflictActionsFactoryInput2=new v(this.input2Editor);conflictActionsFactoryResult=new v(this.resultEditor);computeViewZones(s,o,e){let a=0,V=0,Z=0,I=0;const h=[],L=[],w=[],R=[],A=o.model,S=A.baseResultDiffs.read(s),B=_(A.modifiedBaseRanges.read(s),S,(n,r)=>n.baseRange.touches(r.inputRange)?T.neitherLessOrGreaterThan:W.compareByStart(n.baseRange,r.inputRange)),F=e.codeLensesVisible,O=e.showNonConflictingChanges;let d,f;for(const n of B){if(F&&n.left&&(n.left.isConflicting||O||!A.isHandled(n.left).read(s))){const t=new j(o,n.left);(e.shouldAlignResult||!t.inputIsEmpty.read(s))&&(h.push(new E(this.conflictActionsFactoryInput1,n.left.input1Range.startLineNumber-1,t.itemsInput1)),L.push(new E(this.conflictActionsFactoryInput2,n.left.input2Range.startLineNumber-1,t.itemsInput2)),e.shouldAlignBase&&w.push(new U(n.left.baseRange.startLineNumber-1,16)));const p=n.left.baseRange.startLineNumber+(f?.resultingDeltaFromOriginalToModified??0)-1;R.push(new E(this.conflictActionsFactoryResult,p,t.resultItems))}const r=P(n.rights);r&&(f=r);let u;n.left?(u=G(n.left).map(t=>({input1Line:t[0],baseLine:t[1],input2Line:t[2],resultLine:void 0})),d=n.left,u[u.length-1].resultLine=n.left.baseRange.endLineNumberExclusive+(f?f.resultingDeltaFromOriginalToModified:0)):u=[{baseLine:r.inputRange.endLineNumberExclusive,input1Line:r.inputRange.endLineNumberExclusive+(d?d.input1Range.endLineNumberExclusive-d.baseRange.endLineNumberExclusive:0),input2Line:r.inputRange.endLineNumberExclusive+(d?d.input2Range.endLineNumberExclusive-d.baseRange.endLineNumberExclusive:0),resultLine:r.outputRange.endLineNumberExclusive}];for(const{input1Line:t,baseLine:p,input2Line:c,resultLine:g}of u){if(!e.shouldAlignBase&&(t===void 0||c===void 0))continue;const N=t!==void 0?t+a:-1,C=c!==void 0?c+V:-1,M=p+Z,x=g!==void 0?g+I:-1,m=Math.max(e.shouldAlignBase?M:0,N,C,e.shouldAlignResult?x:0);if(t!==void 0){const i=m-N;i>0&&(h.push(new b(t-1,i)),a+=i)}if(c!==void 0){const i=m-C;i>0&&(L.push(new b(c-1,i)),V+=i)}if(e.shouldAlignBase){const i=m-M;i>0&&(w.push(new b(p-1,i)),Z+=i)}if(e.shouldAlignResult&&g!==void 0){const i=m-x;i>0&&(R.push(new b(g-1,i)),I+=i)}}}return new H(h,L,w,R)}}class H{constructor(s,o,e,a){this.input1ViewZones=s;this.input2ViewZones=o;this.baseViewZones=e;this.resultViewZones=a}}class y{}class b extends y{constructor(o,e){super();this.afterLineNumber=o;this.heightInLines=e}create(o,e,a){e.push(o.addZone({afterLineNumber:this.afterLineNumber,heightInLines:this.heightInLines,domNode:D("div.diagonal-fill")}))}}class U extends y{constructor(o,e){super();this.afterLineNumber=o;this.heightPx=e}create(o,e,a){e.push(o.addZone({afterLineNumber:this.afterLineNumber,heightInPx:this.heightPx,domNode:D("div.conflict-actions-placeholder")}))}}class E extends y{constructor(o,e,a){super();this.conflictActionsFactory=o;this.lineNumber=e;this.items=a}create(o,e,a){a.add(this.conflictActionsFactory.createWidget(o,this.lineNumber,this.items,e))}}export{y as MergeEditorViewZone,H as MergeEditorViewZones,fe as ViewZoneComputer};