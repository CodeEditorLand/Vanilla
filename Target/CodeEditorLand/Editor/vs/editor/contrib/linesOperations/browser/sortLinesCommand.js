import{EditOperation as c}from"../../../../../vs/editor/common/core/editOperation.js";import{Range as d}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/editorCommon.js";import"../../../../../vs/editor/common/model.js";class l{static _COLLATOR=null;static getCollator(){return l._COLLATOR||(l._COLLATOR=new Intl.Collator),l._COLLATOR}selection;descending;selectionId;constructor(t,n){this.selection=t,this.descending=n,this.selectionId=null}getEditOperations(t,n){const e=p(t,this.selection,this.descending);e&&n.addEditOperation(e.range,e.text),this.selectionId=n.trackSelection(this.selection)}computeCursorState(t,n){return n.getTrackedSelection(this.selectionId)}static canRun(t,n,e){if(t===null)return!1;const r=s(t,n,e);if(!r)return!1;for(let o=0,i=r.before.length;o<i;o++)if(r.before[o]!==r.after[o])return!0;return!1}}function s(a,t,n){const e=t.startLineNumber;let r=t.endLineNumber;if(t.endColumn===1&&r--,e>=r)return null;const o=[];for(let u=e;u<=r;u++)o.push(a.getLineContent(u));let i=o.slice(0);return i.sort(l.getCollator().compare),n===!0&&(i=i.reverse()),{startLineNumber:e,endLineNumber:r,before:o,after:i}}function p(a,t,n){const e=s(a,t,n);return e?c.replace(new d(e.startLineNumber,1,e.endLineNumber,a.getLineMaxColumn(e.endLineNumber)),e.after.join(`
`)):null}export{l as SortLinesCommand};
