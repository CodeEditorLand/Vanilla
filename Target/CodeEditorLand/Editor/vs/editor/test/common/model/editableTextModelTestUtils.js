import f from"assert";import"../../../common/core/editOperation.js";import{Position as M}from"../../../common/core/position.js";import{EndOfLinePreference as m,EndOfLineSequence as v}from"../../../common/model.js";import{MirrorTextModel as E}from"../../../common/model/mirrorTextModel.js";import"../../../common/model/textModel.js";import"../../../common/textModelEvents.js";import{createTextModel as O}from"../testTextModel.js";function w(i,s,t,e=!1){const n=i.join(`
`),l=t.join(`
`);S(n,(r,o)=>{const d=r.applyEdits(s,!0);f.deepStrictEqual(r.getValue(m.LF),l),o();const a=r.applyEdits(d,!0);if(f.deepStrictEqual(r.getValue(m.LF),n),!e){const c=p=>({range:p.range,text:p.text,forceMoveMarkers:p.forceMoveMarkers||!1});f.deepStrictEqual(a.map(c),s.map(c))}o()})}var x=(t=>(t[t.OffsetToPosition=0]="OffsetToPosition",t[t.PositionToOffset=1]="PositionToOffset",t))(x||{});function u(i,s,t){const e=i.getValue();let n=1,l=1,r=!1;for(let o=0;o<=e.length;o++){const d=new M(n,l+(r?-1:0));if(s===0){const a=i.getPositionAt(o);f.strictEqual(a.toString(),d.toString(),t+" - getPositionAt mismatch for offset "+o)}else{const a=o+(r?-1:0),c=i.getOffsetAt(d);f.strictEqual(c,a,t+" - getOffsetAt mismatch for position "+d.toString())}e.charAt(o)===`
`?(n++,l=1):l++,r=e.charAt(o)==="\r"}}function g(i,s){u(i,1,s),u(i,0,s)}function S(i,s,t=null){const e=O(i);e.setEOL(v.LF),g(e,"model"),t&&(t(e),g(e,"model"));const n=new E(null,e.getLinesContent(),e.getEOL(),e.getVersionId());let l=e.getVersionId();const r=e.onDidChangeContent(d=>{const a=d.versionId;a<l&&console.warn("Model version id did not advance between edits (2)"),l=a,n.onEvents(d)});s(e,()=>{g(e,"model"),f.strictEqual(n.getText(),e.getValue(),"mirror model 2 text OK"),f.strictEqual(n.version,e.getVersionId(),"mirror model 2 version OK")}),r.dispose(),e.dispose(),n.dispose()}export{S as assertSyncedModels,w as testApplyEditsWithSyncedModels};
