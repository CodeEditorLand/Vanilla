import{$ as B}from"../../../../../base/browser/dom.js";import{CompareResult as O}from"../../../../../base/common/arrays.js";import{LineRange as T}from"../model/lineRange.js";import{join as P}from"../utils.js";import{ActionsSource as W,ConflictActionsFactory as v}from"./conflictActions.js";import{getAlignments as _}from"./lineAlignment.js";class K{constructor(s,o,e){this.input1Editor=s;this.input2Editor=o;this.resultEditor=e}conflictActionsFactoryInput1=new v(this.input1Editor);conflictActionsFactoryInput2=new v(this.input2Editor);conflictActionsFactoryResult=new v(this.resultEditor);computeViewZones(s,o,e){let a=0,V=0,Z=0,I=0;const h=[],L=[],w=[],y=[],R=o.model,D=R.baseResultDiffs.read(s),S=P(R.modifiedBaseRanges.read(s),D,(n,r)=>n.baseRange.touches(r.inputRange)?O.neitherLessOrGreaterThan:T.compareByStart(n.baseRange,r.inputRange)),F=e.codeLensesVisible,j=e.showNonConflictingChanges;let d,p;for(const n of S){if(F&&n.left&&(n.left.isConflicting||j||!R.isHandled(n.left).read(s))){const t=new W(o,n.left);(e.shouldAlignResult||!t.inputIsEmpty.read(s))&&(h.push(new E(this.conflictActionsFactoryInput1,n.left.input1Range.startLineNumber-1,t.itemsInput1)),L.push(new E(this.conflictActionsFactoryInput2,n.left.input2Range.startLineNumber-1,t.itemsInput2)),e.shouldAlignBase&&w.push(new H(n.left.baseRange.startLineNumber-1,16)));const f=n.left.baseRange.startLineNumber+(p?.resultingDeltaFromOriginalToModified??0)-1;y.push(new E(this.conflictActionsFactoryResult,f,t.resultItems))}const r=n.rights.at(-1);r&&(p=r);let u;n.left?(u=_(n.left).map(t=>({input1Line:t[0],baseLine:t[1],input2Line:t[2],resultLine:void 0})),d=n.left,u[u.length-1].resultLine=n.left.baseRange.endLineNumberExclusive+(p?p.resultingDeltaFromOriginalToModified:0)):u=[{baseLine:r.inputRange.endLineNumberExclusive,input1Line:r.inputRange.endLineNumberExclusive+(d?d.input1Range.endLineNumberExclusive-d.baseRange.endLineNumberExclusive:0),input2Line:r.inputRange.endLineNumberExclusive+(d?d.input2Range.endLineNumberExclusive-d.baseRange.endLineNumberExclusive:0),resultLine:r.outputRange.endLineNumberExclusive}];for(const{input1Line:t,baseLine:f,input2Line:c,resultLine:g}of u){if(!e.shouldAlignBase&&(t===void 0||c===void 0))continue;const N=t!==void 0?t+a:-1,C=c!==void 0?c+V:-1,M=f+Z,x=g!==void 0?g+I:-1,m=Math.max(e.shouldAlignBase?M:0,N,C,e.shouldAlignResult?x:0);if(t!==void 0){const i=m-N;i>0&&(h.push(new b(t-1,i)),a+=i)}if(c!==void 0){const i=m-C;i>0&&(L.push(new b(c-1,i)),V+=i)}if(e.shouldAlignBase){const i=m-M;i>0&&(w.push(new b(f-1,i)),Z+=i)}if(e.shouldAlignResult&&g!==void 0){const i=m-x;i>0&&(y.push(new b(g-1,i)),I+=i)}}}return new G(h,L,w,y)}}class G{constructor(s,o,e,a){this.input1ViewZones=s;this.input2ViewZones=o;this.baseViewZones=e;this.resultViewZones=a}}class A{}class b extends A{constructor(o,e){super();this.afterLineNumber=o;this.heightInLines=e}create(o,e,a){e.push(o.addZone({afterLineNumber:this.afterLineNumber,heightInLines:this.heightInLines,domNode:B("div.diagonal-fill")}))}}class H extends A{constructor(o,e){super();this.afterLineNumber=o;this.heightPx=e}create(o,e,a){e.push(o.addZone({afterLineNumber:this.afterLineNumber,heightInPx:this.heightPx,domNode:B("div.conflict-actions-placeholder")}))}}class E extends A{constructor(o,e,a){super();this.conflictActionsFactory=o;this.lineNumber=e;this.items=a}create(o,e,a){a.add(this.conflictActionsFactory.createWidget(o,this.lineNumber,this.items,e))}}export{A as MergeEditorViewZone,G as MergeEditorViewZones,K as ViewZoneComputer};
