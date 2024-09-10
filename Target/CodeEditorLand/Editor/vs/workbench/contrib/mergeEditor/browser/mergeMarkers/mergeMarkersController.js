import{h as s}from"../../../../../base/browser/dom.js";import{Disposable as L,DisposableStore as v}from"../../../../../base/common/lifecycle.js";import{autorun as R}from"../../../../../base/common/observable.js";import{LineRange as k}from"../model/lineRange.js";import*as h from"../../../../../nls.js";const b={start:"<<<<<<<",end:">>>>>>>"};class V extends L{constructor(t,n){super();this.editor=t;this.mergeEditorViewModel=n;this._register(t.onDidChangeModelContent(o=>{this.updateDecorations()})),this._register(t.onDidChangeModel(o=>{this.updateDecorations()})),this.updateDecorations()}viewZoneIds=[];disposableStore=new v;updateDecorations(){const t=this.editor.getModel(),n=t?C(t,{blockToRemoveStartLinePrefix:b.start,blockToRemoveEndLinePrefix:b.end}):{blocks:[]};this.editor.setHiddenAreas(n.blocks.map(o=>o.lineRange.deltaEnd(-1).toRange()),this),this.editor.changeViewZones(o=>{this.disposableStore.clear();for(const e of this.viewZoneIds)o.removeZone(e);this.viewZoneIds.length=0;for(const e of n.blocks){const r=t.getLineContent(e.lineRange.startLineNumber).substring(0,20),a=t.getLineContent(e.lineRange.endLineNumberExclusive-1).substring(0,20),u=e.lineRange.lineCount-2,d=s("div",[s("div.conflict-zone-root",[s("pre",[r]),s("span.dots",["..."]),s("pre",[a]),s("span.text",[u===1?h.localize("conflictingLine","1 Conflicting Line"):h.localize("conflictingLines","{0} Conflicting Lines",u)])])]).root;this.viewZoneIds.push(o.addZone({afterLineNumber:e.lineRange.endLineNumberExclusive-1,domNode:d,heightInLines:1.5}));const p=()=>{const i=this.editor.getLayoutInfo();d.style.width=`${i.contentWidth-i.verticalScrollbarWidth}px`};this.disposableStore.add(this.editor.onDidLayoutChange(()=>{p()})),p(),this.disposableStore.add(R(i=>{const g=this.mergeEditorViewModel.read(i);if(!g)return;const m=g.activeModifiedBaseRange.read(i),f=[];f.push("conflict-zone"),m&&g.model.getLineRangeInResult(m.baseRange,i).intersects(e.lineRange)&&f.push("focused"),d.className=f.join(" ")}))}})}}function C(c,l){const t=[],n=[];let o=!1,e=-1,r=0;for(const a of c.getLinesContent())r++,o?a.startsWith(l.blockToRemoveEndLinePrefix)&&(o=!1,t.push(new I(new k(e,r-e+1))),n.push("")):a.startsWith(l.blockToRemoveStartLinePrefix)?(o=!0,e=r):n.push(a);return{blocks:t,transformedContent:n.join(`
`)}}class I{constructor(l){this.lineRange=l}}export{V as MergeMarkersController,b as conflictMarkers};
