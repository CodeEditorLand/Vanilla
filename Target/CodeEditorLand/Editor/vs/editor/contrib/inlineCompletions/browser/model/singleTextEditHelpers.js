import{commonPrefixLength as m}from"../../../../../base/common/strings.js";import{Range as x}from"../../../../common/core/range.js";import{TextLength as f}from"../../../../common/core/textLength.js";import{SingleTextEdit as l}from"../../../../common/core/textEdit.js";import{EndOfLinePreference as c}from"../../../../common/model.js";function d(t,e,n){const o=n?t.range.intersectRanges(n):t.range;if(!o)return t;const r=e.getValueInRange(o,c.LF),i=m(r,t.text),g=f.ofText(r.substring(0,i)).addToPosition(t.range.getStartPosition()),s=t.text.substring(i),a=x.fromPositions(g,t.range.getEndPosition());return new l(a,s)}function L(t,e){return t.text.startsWith(e.text)&&u(t.range,e.range)}function u(t,e){return e.getStartPosition().equals(t.getStartPosition())&&e.getEndPosition().isBeforeOrEqual(t.getEndPosition())}export{L as singleTextEditAugments,d as singleTextRemoveCommonPrefix};
