import{LcsDiff as D}from"../../../../../base/common/diff/diff.js";import{commonPrefixLength as N,getLeadingWhitespace as L}from"../../../../../base/common/strings.js";import"../../../../common/core/position.js";import{Range as P}from"../../../../common/core/range.js";import{TextLength as y}from"../../../../common/core/textLength.js";import{SingleTextEdit as I}from"../../../../common/core/textEdit.js";import{EndOfLinePreference as A}from"../../../../common/model.js";import{GhostText as M,GhostTextPart as S}from"./ghostText.js";function v(t,n,o){const f=o?t.range.intersectRanges(o):t.range;if(!f)return t;const u=n.getValueInRange(f,A.LF),e=N(u,t.text),c=y.ofText(u.substring(0,e)).addToPosition(t.range.getStartPosition()),h=t.text.substring(e),C=P.fromPositions(c,t.range.getEndPosition());return new I(C,h)}function X(t,n){return t.text.startsWith(n.text)&&G(t.range,n.range)}function Y(t,n,o,f,u=0){let e=v(t,n);if(e.range.endLineNumber!==e.range.startLineNumber)return;const c=n.getLineContent(e.range.startLineNumber),h=L(c).length;if(e.range.startColumn-1<=h){const r=L(e.text).length,a=c.substring(e.range.startColumn-1,h),[x,m]=[e.range.getStartPosition(),e.range.getEndPosition()],p=x.column+a.length<=m.column?x.delta(0,a.length):m,T=P.fromPositions(p,m),R=e.text.startsWith(a)?e.text.substring(a.length):e.text.substring(r);e=new I(T,R)}const i=n.getValueInRange(e.range),s=q(i,e.text);if(!s)return;const l=e.range.startLineNumber,d=new Array;if(o==="prefix"){const r=s.filter(a=>a.originalLength===0);if(r.length>1||r.length===1&&r[0].originalStart!==i.length)return}const g=e.text.length-u;for(const r of s){const a=e.range.startColumn+r.originalStart+r.originalLength;if(o==="subwordSmart"&&f&&f.lineNumber===e.range.startLineNumber&&a<f.column||r.originalLength>0)return;if(r.modifiedLength===0)continue;const x=r.modifiedStart+r.modifiedLength,m=Math.max(r.modifiedStart,Math.min(x,g)),p=e.text.substring(r.modifiedStart,m),T=e.text.substring(m,Math.max(r.modifiedStart,x));p.length>0&&d.push(new S(a,p,!1)),T.length>0&&d.push(new S(a,T,!0))}return new M(l,d)}function G(t,n){return n.getStartPosition().equals(t.getStartPosition())&&n.getEndPosition().isBeforeOrEqual(t.getEndPosition())}let b;function q(t,n){if(b?.originalValue===t&&b?.newValue===n)return b?.changes;{let o=w(t,n,!0);if(o){const f=E(o);if(f>0){const u=w(t,n,!1);u&&E(u)<f&&(o=u)}}return b={originalValue:t,newValue:n,changes:o},o}}function E(t){let n=0;for(const o of t)n+=o.originalLength;return n}function w(t,n,o){if(t.length>5e3||n.length>5e3)return;function f(i){let s=0;for(let l=0,d=i.length;l<d;l++){const g=i.charCodeAt(l);g>s&&(s=g)}return s}const u=Math.max(f(t),f(n));function e(i){if(i<0)throw new Error("unexpected");return u+i+1}function c(i){let s=0,l=0;const d=new Int32Array(i.length);for(let g=0,r=i.length;g<r;g++)if(o&&i[g]==="("){const a=l*100+s;d[g]=e(2*a),s++}else if(o&&i[g]===")"){s=Math.max(s-1,0);const a=l*100+s;d[g]=e(2*a+1),s===0&&l++}else d[g]=i.charCodeAt(g);return d}const h=c(t),C=c(n);return new D({getElements:()=>h},{getElements:()=>C}).ComputeDiff(!1).changes}export{Y as computeGhostText,X as singleTextEditAugments,v as singleTextRemoveCommonPrefix};
