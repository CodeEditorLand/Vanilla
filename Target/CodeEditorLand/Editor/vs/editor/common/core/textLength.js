import{Position as l}from"../../../../vs/editor/common/core/position.js";import{Range as i}from"../../../../vs/editor/common/core/range.js";class e{constructor(n,u){this.lineCount=n;this.columnCount=u}static zero=new e(0,0);static lengthDiffNonNegative(n,u){return u.isLessThan(n)?e.zero:n.lineCount===u.lineCount?new e(0,u.columnCount-n.columnCount):new e(u.lineCount-n.lineCount,u.columnCount)}static betweenPositions(n,u){return n.lineNumber===u.lineNumber?new e(0,u.column-n.column):new e(u.lineNumber-n.lineNumber,u.column-1)}static ofRange(n){return e.betweenPositions(n.getStartPosition(),n.getEndPosition())}static ofText(n){let u=0,t=0;for(const o of n)o===`
`?(u++,t=0):t++;return new e(u,t)}isZero(){return this.lineCount===0&&this.columnCount===0}isLessThan(n){return this.lineCount!==n.lineCount?this.lineCount<n.lineCount:this.columnCount<n.columnCount}isGreaterThan(n){return this.lineCount!==n.lineCount?this.lineCount>n.lineCount:this.columnCount>n.columnCount}isGreaterThanOrEqualTo(n){return this.lineCount!==n.lineCount?this.lineCount>n.lineCount:this.columnCount>=n.columnCount}equals(n){return this.lineCount===n.lineCount&&this.columnCount===n.columnCount}compare(n){return this.lineCount!==n.lineCount?this.lineCount-n.lineCount:this.columnCount-n.columnCount}add(n){return n.lineCount===0?new e(this.lineCount,this.columnCount+n.columnCount):new e(this.lineCount+n.lineCount,n.columnCount)}createRange(n){return this.lineCount===0?new i(n.lineNumber,n.column,n.lineNumber,n.column+this.columnCount):new i(n.lineNumber,n.column,n.lineNumber+this.lineCount,this.columnCount+1)}toRange(){return new i(1,1,this.lineCount+1,this.columnCount+1)}addToPosition(n){return this.lineCount===0?new l(n.lineNumber,n.column+this.columnCount):new l(n.lineNumber+this.lineCount,this.columnCount+1)}toString(){return`${this.lineCount},${this.columnCount}`}}export{e as TextLength};
