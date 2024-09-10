import{ResourceTextEdit as N}from"../../../../../editor/browser/services/bulkEditService.js";import{Position as S}from"../../../../../editor/common/core/position.js";import{Range as k}from"../../../../../editor/common/core/range.js";import{EndOfLinePreference as K}from"../../../../../editor/common/model.js";import{PLAINTEXT_LANGUAGE_ID as E}from"../../../../../editor/common/languages/modesRegistry.js";import{ResourceNotebookCellEdit as b}from"../../../bulkEdit/browser/bulkCellEdits.js";import{CellEditState as h,CellFocusMode as w,expandCellRangesWithHiddenCells as A}from"../notebookBrowser.js";import{cloneNotebookCellTextModel as v}from"../../common/model/notebookCellTextModel.js";import{CellEditType as p,CellKind as R,SelectionStateType as f}from"../../common/notebookCommon.js";import{cellRangeContains as y,cellRangesToIndexes as M}from"../../common/notebookRange.js";import{localize as F}from"../../../../../nls.js";async function me(l,o,t,i){const{notebookEditor:e}=o;if(e.hasModel()&&!e.isReadOnly){if(o.ui&&o.cell){const{cell:s}=o;if(s.cellKind===l)return;const c=s.getText(),n=e.getCellIndex(s);t===void 0&&(t=(e.activeKernel?.supportedLanguages??[])[0]??E),e.textModel.applyEdits([{editType:p.Replace,index:n,count:1,cells:[{cellKind:l,source:c,language:t,mime:i??s.mime,outputs:s.model.outputs,metadata:s.metadata}]}],!0,{kind:f.Index,focus:e.getFocus(),selections:e.getSelections()},()=>({kind:f.Index,focus:e.getFocus(),selections:e.getSelections()}),void 0,!0);const u=e.cellAt(n);await e.focusNotebookCell(u,s.getEditState()===h.Editing?"editor":"container")}else if(o.selectedCells){const s=o.selectedCells,c=[];s.forEach(n=>{if(n.cellKind===l)return;const u=n.getText(),d=e.getCellIndex(n);t===void 0&&(t=(e.activeKernel?.supportedLanguages??[])[0]??E),c.push({editType:p.Replace,index:d,count:1,cells:[{cellKind:l,source:u,language:t,mime:i??n.mime,outputs:n.model.outputs,metadata:n.metadata}]})}),e.textModel.applyEdits(c,!0,{kind:f.Index,focus:e.getFocus(),selections:e.getSelections()},()=>({kind:f.Index,focus:e.getFocus(),selections:e.getSelections()}),void 0,!0)}}}function xe(l,o){const t=l.textModel,i=l.getSelections(),e=l.getCellIndex(o),s=i.find(n=>n.start<=e&&e<n.end),c=!l.isReadOnly||t.viewType==="interactive";if(s){const n=i.reverse().map(d=>({editType:p.Replace,index:d.start,count:d.end-d.start,cells:[]})),u=s.end>=l.getLength()?void 0:l.cellAt(s.end);t.applyEdits(n,!0,{kind:f.Index,focus:l.getFocus(),selections:l.getSelections()},()=>{if(u){const d=t.cells.findIndex(r=>r.handle===u.handle);return{kind:f.Index,focus:{start:d,end:d+1},selections:[{start:d,end:d+1}]}}else if(t.length){const d=t.length-1;return{kind:f.Index,focus:{start:d,end:d+1},selections:[{start:d,end:d+1}]}}else return{kind:f.Index,focus:{start:0,end:0},selections:[{start:0,end:0}]}},void 0,c)}else{const n=l.getFocus(),u=[{editType:p.Replace,index:e,count:1,cells:[]}],d=[];for(let r=0;r<i.length;r++){const a=i[r];a.end<=e?d.push(a):a.start>e?d.push({start:a.start-1,end:a.end-1}):d.push({start:e,end:e+1})}if(l.cellAt(n.start)===o){const r=n.end===t.length?{start:n.start-1,end:n.end-1}:n;t.applyEdits(u,!0,{kind:f.Index,focus:l.getFocus(),selections:l.getSelections()},()=>({kind:f.Index,focus:r,selections:d}),void 0,c)}else{const r=n.start>e?{start:n.start-1,end:n.end-1}:n;t.applyEdits(u,!0,{kind:f.Index,focus:l.getFocus(),selections:l.getSelections()},()=>({kind:f.Index,focus:r,selections:d}),void 0,c)}}}async function be(l,o){if(!l.notebookEditor.hasModel())return;const t=l.notebookEditor,i=t.textModel;if(t.isReadOnly)return;let e;if(l.cell){const s=t.getCellIndex(l.cell);e={start:s,end:s+1}}else{const s=t.getSelections();e=A(t,s)[0]}if(!(!e||e.start===e.end))if(o==="up"){if(e.start===0)return;const s=e.start-1,c={start:e.start-1,end:e.end-1},n=l.notebookEditor.getFocus(),u=y(e,n)?{start:n.start-1,end:n.end-1}:{start:e.start-1,end:e.start};i.applyEdits([{editType:p.Move,index:s,length:1,newIdx:e.end-1}],!0,{kind:f.Index,focus:t.getFocus(),selections:t.getSelections()},()=>({kind:f.Index,focus:u,selections:[c]}),void 0,!0);const d=t.getSelections()[0]??t.getFocus();t.revealCellRangeInView(d)}else{if(e.end>=i.length)return;const s=e.end,c={start:e.start+1,end:e.end+1},n=t.getFocus(),u=y(e,n)?{start:n.start+1,end:n.end+1}:{start:e.start+1,end:e.start+2};i.applyEdits([{editType:p.Move,index:s,length:1,newIdx:e.start}],!0,{kind:f.Index,focus:t.getFocus(),selections:t.getSelections()},()=>({kind:f.Index,focus:u,selections:[c]}),void 0,!0);const d=t.getSelections()[0]??t.getFocus();t.revealCellRangeInView(d)}}async function we(l,o){const t=l.notebookEditor;if(!t.hasModel())return;const i=t.textModel;if(t.isReadOnly)return;let e;if(l.ui){const s=l.cell,c=t.getCellIndex(s);e={start:c,end:c+1}}else{const s=t.getSelections();e=A(t,s)[0]}if(!(!e||e.start===e.end))if(o==="up"){const s=t.getFocus(),c=t.getSelections();i.applyEdits([{editType:p.Replace,index:e.end,count:0,cells:M([e]).map(n=>v(t.cellAt(n).model))}],!0,{kind:f.Index,focus:s,selections:c},()=>({kind:f.Index,focus:s,selections:c}),void 0,!0)}else{const s=t.getFocus(),c=t.getSelections(),u=M([e]).map(g=>v(t.cellAt(g).model)).length,d=l.ui?s:{start:s.start+u,end:s.end+u},r=l.ui?c:[{start:e.start+u,end:e.end+u}];i.applyEdits([{editType:p.Replace,index:e.end,count:0,cells:M([e]).map(g=>v(t.cellAt(g).model))}],!0,{kind:f.Index,focus:s,selections:c},()=>({kind:f.Index,focus:d,selections:r}),void 0,!0);const a=t.getSelections()[0]??t.getFocus();t.revealCellRangeInView(a)}}async function Re(l,o,t){const i=t.notebookEditor;if(i.isReadOnly)return;const e=[],s=[];for(const a of i.getSelections())s.push(...i.getCellsInRange(a));if(s.length<=1)return;const c=s[0].cellKind;if(!s.every(a=>a.cellKind===c)){const a=F("notebookActions.joinSelectedCells","Cannot join cells of different kinds");return o.warn(a)}const u=s[0],d=s.map(a=>a.getText()).join(u.textBuffer.getEOL()),r=i.getSelections()[0];e.push(new b(i.textModel.uri,{editType:p.Replace,index:r.start,count:r.end-r.start,cells:[{cellKind:u.cellKind,source:d,language:u.language,mime:u.mime,outputs:u.model.outputs,metadata:u.metadata}]}));for(const a of i.getSelections().slice(1))e.push(new b(i.textModel.uri,{editType:p.Replace,index:a.start,count:a.end-a.start,cells:[]}));e.length&&await l.apply(e,{quotableLabel:F("notebookActions.joinSelectedCells.label","Join Notebook Cells")})}async function T(l,o,t,i){if(l.isReadOnly)return null;const e=l.textModel,s=l.getCellsInRange(o);if(!s.length||o.start===0&&t==="above"||o.end===e.length&&t==="below")return null;for(let c=0;c<s.length;c++){const n=s[c];if(i&&n.cellKind!==i)return null}if(t==="above"){const c=l.cellAt(o.start-1);if(i&&c.cellKind!==i)return null;const n=s.map(r=>(r.textBuffer.getEOL()??"")+r.getText()).join(""),u=c.textBuffer.getLineCount(),d=c.textBuffer.getLineLength(u);return{edits:[new N(c.uri,{range:new k(u,d+1,u,d+1),text:n}),new b(e.uri,{editType:p.Replace,index:o.start,count:o.end-o.start,cells:[]})],cell:c,endFocus:{start:o.start-1,end:o.start},endSelections:[{start:o.start-1,end:o.start}]}}else{const c=l.cellAt(o.end);if(i&&c.cellKind!==i)return null;const n=s[0],d=[...s.slice(1),c].map(g=>(g.textBuffer.getEOL()??"")+g.getText()).join(""),r=n.textBuffer.getLineCount(),a=n.textBuffer.getLineLength(r);return{edits:[new N(n.uri,{range:new k(r,a+1,r,a+1),text:d}),new b(e.uri,{editType:p.Replace,index:o.start+1,count:o.end-o.start,cells:[]})],cell:n,endFocus:{start:o.start,end:o.start+1},endSelections:[{start:o.start,end:o.start+1}]}}}async function Se(l,o,t){const i=o.notebookEditor,e=i.textModel,s=i.getViewModel();let c=null;if(o.ui){const n=o.cell.focusMode,u=i.getCellIndex(o.cell);if(c=await T(i,{start:u,end:u+1},t),!c)return;await l.apply(c?.edits,{quotableLabel:"Join Notebook Cells"}),s.updateSelectionsState({kind:f.Index,focus:c.endFocus,selections:c.endSelections}),c.cell.updateEditState(h.Editing,"joinCellsWithSurrounds"),i.revealCellRangeInView(i.getFocus()),n===w.Editor&&(c.cell.focusMode=w.Editor)}else{const n=i.getSelections();if(!n.length)return;const u=i.getFocus(),d=i.cellAt(u.start)?.focusMode,r=[];let a=null;const g=[];for(let C=n.length-1;C>=0;C--){const I=n[C],L=y(I,u);if(I.end>=e.length&&t==="below"||I.start===0&&t==="above"){L&&(a=i.cellAt(u.start)),g.push(...i.getCellsInRange(I));continue}const x=await T(i,I,t);if(!x)return;r.push(...x.edits),g.push(x.cell),L&&(a=x.cell)}if(!r.length||!a||!g.length)return;await l.apply(r,{quotableLabel:"Join Notebook Cells"}),g.forEach(C=>{C.updateEditState(h.Editing,"joinCellsWithSurrounds")}),s.updateSelectionsState({kind:f.Handle,primary:a.handle,selections:g.map(C=>C.handle)}),i.revealCellRangeInView(i.getFocus());const m=i.cellAt(i.getFocus().start);d===w.Editor&&m&&(m.focusMode=w.Editor)}}function V(l,o){const t=[],i=o.getLineCount(),e=n=>o.getLineLength(n);l=l.sort((n,u)=>{const d=n.lineNumber-u.lineNumber,r=n.column-u.column;return d!==0?d:r});for(let n of l)e(n.lineNumber)+1===n.column&&n.column!==1&&n.lineNumber<i&&(n=new S(n.lineNumber+1,1)),B(t,n);if(t.length===0)return null;const s=new S(1,1),c=new S(i,e(i)+1);return[s,...t,c]}function B(l,o){const t=l.length>0?l[l.length-1]:void 0;(!t||t.lineNumber!==o.lineNumber||t.column!==o.column)&&l.push(o)}function ke(l,o){const t=V(o,l.textBuffer);if(!t)return null;const i=[];for(let e=1;e<t.length;e++){const s=t[e-1],c=t[e];i.push(l.textBuffer.getValueInRange(new k(s.lineNumber,s.column,c.lineNumber,c.column),K.TextDefined))}return i}function Ee(l,o,t,i,e="above",s="",c=!1){const n=o.getViewModel(),u=o.activeKernel;if(n.options.isReadOnly)return null;const d=o.cellAt(t),r=c?n.getNextVisibleCellIndex(t):t+1;let a;if(i===R.Code){const m=u?.supportedLanguages??l.getRegisteredLanguageIds(),C=m[0]||E;if(d?.cellKind===R.Code)a=d.language;else if(d?.cellKind===R.Markup){const I=n.nearestCodeCellIndex(t);I>-1?a=n.cellAt(I).language:a=C}else d===void 0&&e==="above"?a=n.viewCells.find(I=>I.cellKind===R.Code)?.language||C:a=C;m.includes(a)||(a=C)}else a="markdown";return O(n,d?e==="above"?t:r:t,s,a,i,void 0,[],!0,!0)}function O(l,o,t,i,e,s,c,n,u){const d={kind:f.Index,focus:{start:o,end:o+1},selections:[{start:o,end:o+1}]};return l.notebookDocument.applyEdits([{editType:p.Replace,index:o,count:0,cells:[{cellKind:e,language:i,mime:void 0,outputs:c,metadata:s,source:t}]}],n,{kind:f.Index,focus:l.getFocus(),selections:l.getSelections()},()=>d,void 0,u&&!l.options.isReadOnly),l.cellAt(o)}export{me as changeCellToKind,ke as computeCellLinesContents,we as copyCellRange,Ee as insertCell,O as insertCellAtIndex,Se as joinCellsWithSurrounds,T as joinNotebookCells,Re as joinSelectedCells,be as moveCellRange,xe as runDeleteAction};
