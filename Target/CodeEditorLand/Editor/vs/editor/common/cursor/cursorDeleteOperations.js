import*as E from"../../../../vs/base/common/strings.js";import{ReplaceCommand as d}from"../../../../vs/editor/common/commands/replaceCommand.js";import"../../../../vs/editor/common/config/editorOptions.js";import{CursorColumns as I}from"../../../../vs/editor/common/core/cursorColumns.js";import{Position as y}from"../../../../vs/editor/common/core/position.js";import{Range as b}from"../../../../vs/editor/common/core/range.js";import"../../../../vs/editor/common/core/selection.js";import{MoveOperations as R}from"../../../../vs/editor/common/cursor/cursorMoveOperations.js";import{EditOperationResult as M,EditOperationType as N,isQuote as w}from"../../../../vs/editor/common/cursorCommon.js";import"../../../../vs/editor/common/editorCommon.js";import"../../../../vs/editor/common/languages/languageConfiguration.js";class S{static deleteRight(r,t,n,e){const m=[];let o=r!==N.DeletingRight;for(let i=0,s=e.length;i<s;i++){const l=e[i];let u=l;if(u.isEmpty()){const a=l.getPosition(),f=R.right(t,n,a);u=new b(f.lineNumber,f.column,a.lineNumber,a.column)}if(u.isEmpty()){m[i]=null;continue}u.startLineNumber!==u.endLineNumber&&(o=!0),m[i]=new d(u,"")}return[o,m]}static isAutoClosingPairDelete(r,t,n,e,m,o,i){if(t==="never"&&n==="never"||r==="never")return!1;for(let s=0,l=o.length;s<l;s++){const u=o[s],a=u.getPosition();if(!u.isEmpty())return!1;const f=m.getLineContent(a.lineNumber);if(a.column<2||a.column>=f.length+1)return!1;const c=f.charAt(a.column-2),C=e.get(c);if(!C)return!1;if(w(c)){if(n==="never")return!1}else if(t==="never")return!1;const A=f.charAt(a.column-1);let h=!1;for(const g of C)g.open===c&&g.close===A&&(h=!0);if(!h)return!1;if(r==="auto"){let g=!1;for(let p=0,L=i.length;p<L;p++){const P=i[p];if(a.lineNumber===P.startLineNumber&&a.column===P.startColumn){g=!0;break}}if(!g)return!1}}return!0}static _runAutoClosingPairDelete(r,t,n){const e=[];for(let m=0,o=n.length;m<o;m++){const i=n[m].getPosition(),s=new b(i.lineNumber,i.column-1,i.lineNumber,i.column+1);e[m]=new d(s,"")}return[!0,e]}static deleteLeft(r,t,n,e,m){if(this.isAutoClosingPairDelete(t.autoClosingDelete,t.autoClosingBrackets,t.autoClosingQuotes,t.autoClosingPairs.autoClosingPairsOpenByEnd,n,e,m))return this._runAutoClosingPairDelete(t,n,e);const o=[];let i=r!==N.DeletingLeft;for(let s=0,l=e.length;s<l;s++){const u=S.getDeleteRange(e[s],n,t);if(u.isEmpty()){o[s]=null;continue}u.startLineNumber!==u.endLineNumber&&(i=!0),o[s]=new d(u,"")}return[i,o]}static getDeleteRange(r,t,n){if(!r.isEmpty())return r;const e=r.getPosition();if(n.useTabStops&&e.column>1){const m=t.getLineContent(e.lineNumber),o=E.firstNonWhitespaceIndex(m),i=o===-1?m.length+1:o+1;if(e.column<=i){const s=n.visibleColumnFromColumn(t,e),l=I.prevIndentTabStop(s,n.indentSize),u=n.columnFromVisibleColumn(t,e.lineNumber,l);return new b(e.lineNumber,u,e.lineNumber,e.column)}}return b.fromPositions(S.getPositionAfterDeleteLeft(e,t),e)}static getPositionAfterDeleteLeft(r,t){if(r.column>1){const n=E.getLeftDeleteOffset(r.column-1,t.getLineContent(r.lineNumber));return r.with(void 0,n+1)}else if(r.lineNumber>1){const n=r.lineNumber-1;return new y(n,t.getLineMaxColumn(n))}else return r}static cut(r,t,n){const e=[];let m=null;n.sort((o,i)=>y.compare(o.getStartPosition(),i.getEndPosition()));for(let o=0,i=n.length;o<i;o++){const s=n[o];if(s.isEmpty())if(r.emptySelectionClipboard){const l=s.getPosition();let u,a,f,c;l.lineNumber<t.getLineCount()?(u=l.lineNumber,a=1,f=l.lineNumber+1,c=1):l.lineNumber>1&&m?.endLineNumber!==l.lineNumber?(u=l.lineNumber-1,a=t.getLineMaxColumn(l.lineNumber-1),f=l.lineNumber,c=t.getLineMaxColumn(l.lineNumber)):(u=l.lineNumber,a=1,f=l.lineNumber,c=t.getLineMaxColumn(l.lineNumber));const C=new b(u,a,f,c);m=C,C.isEmpty()?e[o]=null:e[o]=new d(C,"")}else e[o]=null;else e[o]=new d(s,"")}return new M(N.Other,e,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!0})}}export{S as DeleteOperations};
