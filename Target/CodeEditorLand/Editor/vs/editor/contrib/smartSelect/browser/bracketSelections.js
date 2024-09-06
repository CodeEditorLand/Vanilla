import{LinkedList as L}from"../../../../../vs/base/common/linkedList.js";import{Position as p}from"../../../../../vs/editor/common/core/position.js";import{Range as u}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";class f{async provideSelectionRanges(n,e){const r=[];for(const i of e){const o=[];r.push(o);const t=new Map;await new Promise(s=>f._bracketsRightYield(s,0,n,i,t)),await new Promise(s=>f._bracketsLeftYield(s,0,n,i,t,o))}return r}static _maxDuration=30;static _maxRounds=2;static _bracketsRightYield(n,e,r,i,o){const t=new Map,s=Date.now();for(;;){if(e>=f._maxRounds){n();break}if(!i){n();break}const m=r.bracketPairs.findNextBracket(i);if(!m){n();break}if(Date.now()-s>f._maxDuration){setTimeout(()=>f._bracketsRightYield(n,e+1,r,i,o));break}if(m.bracketInfo.isOpeningBracket){const c=m.bracketInfo.bracketText,a=t.has(c)?t.get(c):0;t.set(c,a+1)}else{const c=m.bracketInfo.getOpeningBrackets()[0].bracketText;let a=t.has(c)?t.get(c):0;if(a-=1,t.set(c,Math.max(0,a)),a<0){let g=o.get(c);g||(g=new L,o.set(c,g)),g.push(m.range)}}i=m.range.getEndPosition()}}static _bracketsLeftYield(n,e,r,i,o,t){const s=new Map,m=Date.now();for(;;){if(e>=f._maxRounds&&o.size===0){n();break}if(!i){n();break}const d=r.bracketPairs.findPrevBracket(i);if(!d){n();break}if(Date.now()-m>f._maxDuration){setTimeout(()=>f._bracketsLeftYield(n,e+1,r,i,o,t));break}if(d.bracketInfo.isOpeningBracket){const a=d.bracketInfo.bracketText;let g=s.has(a)?s.get(a):0;if(g-=1,s.set(a,Math.max(0,g)),g<0){const l=o.get(a);if(l){const k=l.shift();l.size===0&&o.delete(a);const h=u.fromPositions(d.range.getEndPosition(),k.getStartPosition()),b=u.fromPositions(d.range.getStartPosition(),k.getEndPosition());t.push({range:h}),t.push({range:b}),f._addBracketLeading(r,b,t)}}}else{const a=d.bracketInfo.getOpeningBrackets()[0].bracketText,g=s.has(a)?s.get(a):0;s.set(a,g+1)}i=d.range.getStartPosition()}}static _addBracketLeading(n,e,r){if(e.startLineNumber===e.endLineNumber)return;const i=e.startLineNumber,o=n.getLineFirstNonWhitespaceColumn(i);o!==0&&o!==e.startColumn&&(r.push({range:u.fromPositions(new p(i,o),e.getEndPosition())}),r.push({range:u.fromPositions(new p(i,1),e.getEndPosition())}));const t=i-1;if(t>0){const s=n.getLineFirstNonWhitespaceColumn(t);s===e.startColumn&&s!==n.getLineLastNonWhitespaceColumn(t)&&(r.push({range:u.fromPositions(new p(t,s),e.getEndPosition())}),r.push({range:u.fromPositions(new p(t,1),e.getEndPosition())}))}}}export{f as BracketSelectionRangeProvider};
