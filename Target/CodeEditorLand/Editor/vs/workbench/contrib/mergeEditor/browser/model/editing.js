import{equals as a}from"../../../../../base/common/arrays.js";import{Range as i}from"../../../../../editor/common/core/range.js";class g{constructor(e,n){this.range=e;this.newLines=n}equals(e){return this.range.equals(e.range)&&a(this.newLines,e.newLines)}toEdits(e){return new s([this]).toEdits(e)}}class l{constructor(e,n){this.range=e;this.newText=n}equals(e){return i.equalsRange(this.range,e.range)&&this.newText===e.newText}}class s{constructor(e){this.edits=e}toEdits(e){return this.edits.map(n=>n.range.endLineNumberExclusive<=e?{range:new i(n.range.startLineNumber,1,n.range.endLineNumberExclusive,1),text:n.newLines.map(r=>r+`
`).join("")}:n.range.startLineNumber===1?{range:new i(1,1,e,Number.MAX_SAFE_INTEGER),text:n.newLines.join(`
`)}:{range:new i(n.range.startLineNumber-1,Number.MAX_SAFE_INTEGER,e,Number.MAX_SAFE_INTEGER),text:n.newLines.map(r=>`
`+r).join("")})}}export{s as LineEdits,g as LineRangeEdit,l as RangeEdit};
