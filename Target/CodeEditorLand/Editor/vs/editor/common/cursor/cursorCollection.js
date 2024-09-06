import{compareBy as C}from"../../../base/common/arrays.js";import{findFirstMin as P,findLastMax as y}from"../../../base/common/arraysFind.js";import{Position as g}from"../core/position.js";import{Range as A}from"../core/range.js";import{Selection as b}from"../core/selection.js";import{CursorState as v}from"../cursorCommon.js";import"./cursorContext.js";import{Cursor as w}from"./oneCursor.js";class z{context;cursors;lastAddedCursorIndex;constructor(t){this.context=t,this.cursors=[new w(t)],this.lastAddedCursorIndex=0}dispose(){for(const t of this.cursors)t.dispose(this.context)}startTrackingSelections(){for(const t of this.cursors)t.startTrackingSelection(this.context)}stopTrackingSelections(){for(const t of this.cursors)t.stopTrackingSelection(this.context)}updateContext(t){this.context=t}ensureValidState(){for(const t of this.cursors)t.ensureValidState(this.context)}readSelectionFromMarkers(){return this.cursors.map(t=>t.readSelectionFromMarkers(this.context))}getAll(){return this.cursors.map(t=>t.asCursorState())}getViewPositions(){return this.cursors.map(t=>t.viewState.position)}getTopMostViewPosition(){return P(this.cursors,C(t=>t.viewState.position,g.compare)).viewState.position}getBottomMostViewPosition(){return y(this.cursors,C(t=>t.viewState.position,g.compare)).viewState.position}getSelections(){return this.cursors.map(t=>t.modelState.selection)}getViewSelections(){return this.cursors.map(t=>t.viewState.selection)}setSelections(t){this.setStates(v.fromModelSelections(t))}getPrimaryCursor(){return this.cursors[0].asCursorState()}setStates(t){t!==null&&(this.cursors[0].setState(this.context,t[0].modelState,t[0].viewState),this._setSecondaryStates(t.slice(1)))}_setSecondaryStates(t){const o=this.cursors.length-1,e=t.length;if(o<e){const r=e-o;for(let i=0;i<r;i++)this._addSecondaryCursor()}else if(o>e){const r=o-e;for(let i=0;i<r;i++)this._removeSecondaryCursor(this.cursors.length-2)}for(let r=0;r<e;r++)this.cursors[r+1].setState(this.context,t[r].modelState,t[r].viewState)}killSecondaryCursors(){this._setSecondaryStates([])}_addSecondaryCursor(){this.cursors.push(new w(this.context)),this.lastAddedCursorIndex=this.cursors.length-1}getLastAddedCursorIndex(){return this.cursors.length===1||this.lastAddedCursorIndex===0?0:this.lastAddedCursorIndex}_removeSecondaryCursor(t){this.lastAddedCursorIndex>=t+1&&this.lastAddedCursorIndex--,this.cursors[t+1].dispose(this.context),this.cursors.splice(t+1,1)}normalize(){if(this.cursors.length===1)return;const t=this.cursors.slice(0),o=[];for(let e=0,r=t.length;e<r;e++)o.push({index:e,selection:t[e].modelState.selection});o.sort(C(e=>e.selection,A.compareRangesUsingStarts));for(let e=0;e<o.length-1;e++){const r=o[e],i=o[e+1],a=r.selection,d=i.selection;if(!this.context.cursorConfig.multiCursorMergeOverlapping)continue;let S;if(d.isEmpty()||a.isEmpty()?S=d.getStartPosition().isBeforeOrEqual(a.getEndPosition()):S=d.getStartPosition().isBefore(a.getEndPosition()),S){const h=r.index<i.index?e:e+1,p=r.index<i.index?e+1:e,l=o[p].index,x=o[h].index,n=o[p].selection,c=o[h].selection;if(!n.equalsSelection(c)){const s=n.plusRange(c),I=n.selectionStartLineNumber===n.startLineNumber&&n.selectionStartColumn===n.startColumn,L=c.selectionStartLineNumber===c.startLineNumber&&c.selectionStartColumn===c.startColumn;let m;l===this.lastAddedCursorIndex?(m=I,this.lastAddedCursorIndex=x):m=L;let u;m?u=new b(s.startLineNumber,s.startColumn,s.endLineNumber,s.endColumn):u=new b(s.endLineNumber,s.endColumn,s.startLineNumber,s.startColumn),o[h].selection=u;const f=v.fromModelSelection(u);t[x].setState(this.context,f.modelState,f.viewState)}for(const s of o)s.index>l&&s.index--;t.splice(l,1),o.splice(p,1),this._removeSecondaryCursor(l-1),e--}}}}export{z as CursorCollection};
