import{CharCode as d}from"../../../../base/common/charCode.js";import{EditOperation as c}from"../../../common/core/editOperation.js";import{Position as L}from"../../../common/core/position.js";import{Range as m}from"../../../common/core/range.js";import{Selection as O}from"../../../common/core/selection.js";class b{constructor(e,n,t){this.languageConfigurationService=t;this._selection=e,this._insertSpace=n,this._usedEndToken=null}_selection;_insertSpace;_usedEndToken;static _haystackHasNeedleAtOffset(e,n,t){if(t<0)return!1;const i=n.length,o=e.length;if(t+i>o)return!1;for(let r=0;r<i;r++){const a=e.charCodeAt(t+r),u=n.charCodeAt(r);if(a!==u&&!(a>=d.A&&a<=d.Z&&a+32===u)&&!(u>=d.A&&u<=d.Z&&u+32===a))return!1}return!0}_createOperationsForBlockComment(e,n,t,i,o,r){const a=e.startLineNumber,u=e.startColumn,h=e.endLineNumber,E=e.endColumn,g=o.getLineContent(a),f=o.getLineContent(h);let l=g.lastIndexOf(n,u-1+n.length),s=f.indexOf(t,E-1-t.length);if(l!==-1&&s!==-1)if(a===h)g.substring(l+n.length,s).indexOf(t)>=0&&(l=-1,s=-1);else{const p=g.substring(l+n.length),I=f.substring(0,s);(p.indexOf(t)>=0||I.indexOf(t)>=0)&&(l=-1,s=-1)}let C;l!==-1&&s!==-1?(i&&l+n.length<g.length&&g.charCodeAt(l+n.length)===d.Space&&(n=n+" "),i&&s>0&&f.charCodeAt(s-1)===d.Space&&(t=" "+t,s-=1),C=b._createRemoveBlockCommentOperations(new m(a,l+n.length+1,h,s+1),n,t)):(C=b._createAddBlockCommentOperations(e,n,t,this._insertSpace),this._usedEndToken=C.length===1?t:null);for(const p of C)r.addTrackedEditOperation(p.range,p.text)}static _createRemoveBlockCommentOperations(e,n,t){const i=[];return m.isEmpty(e)?i.push(c.delete(new m(e.startLineNumber,e.startColumn-n.length,e.endLineNumber,e.endColumn+t.length))):(i.push(c.delete(new m(e.startLineNumber,e.startColumn-n.length,e.startLineNumber,e.startColumn))),i.push(c.delete(new m(e.endLineNumber,e.endColumn,e.endLineNumber,e.endColumn+t.length)))),i}static _createAddBlockCommentOperations(e,n,t,i){const o=[];return m.isEmpty(e)?o.push(c.replace(new m(e.startLineNumber,e.startColumn,e.endLineNumber,e.endColumn),n+"  "+t)):(o.push(c.insert(new L(e.startLineNumber,e.startColumn),n+(i?" ":""))),o.push(c.insert(new L(e.endLineNumber,e.endColumn),(i?" ":"")+t))),o}getEditOperations(e,n){const t=this._selection.startLineNumber,i=this._selection.startColumn;e.tokenization.tokenizeIfCheap(t);const o=e.getLanguageIdAtPosition(t,i),r=this.languageConfigurationService.getLanguageConfiguration(o).comments;!r||!r.blockCommentStartToken||!r.blockCommentEndToken||this._createOperationsForBlockComment(this._selection,r.blockCommentStartToken,r.blockCommentEndToken,this._insertSpace,e,n)}computeCursorState(e,n){const t=n.getInverseEditOperations();if(t.length===2){const i=t[0],o=t[1];return new O(i.range.endLineNumber,i.range.endColumn,o.range.startLineNumber,o.range.startColumn)}else{const i=t[0].range,o=this._usedEndToken?-this._usedEndToken.length-1:0;return new O(i.endLineNumber,i.endColumn+o,i.endLineNumber,i.endColumn+o)}}}export{b as BlockCommentCommand};
