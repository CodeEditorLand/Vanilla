import"../../../../vs/editor/common/core/range.js";import"../../../../vs/editor/common/languages/languageConfiguration.js";const d=new RegExp("\\bMARK:\\s*(.*)$","d"),l=/^-+|-+$/g;function b(e,t){let r=[];if(t.findRegionSectionHeaders&&t.foldingRules?.markers){const n=g(e,t);r=r.concat(n)}if(t.findMarkSectionHeaders){const n=m(e);r=r.concat(n)}return r}function g(e,t){const r=[],n=e.getLineCount();for(let o=1;o<=n;o++){const s=e.getLineContent(o),i=s.match(t.foldingRules.markers.start);if(i){const a={startLineNumber:o,startColumn:i[0].length+1,endLineNumber:o,endColumn:s.length+1};if(a.endColumn>a.startColumn){const c={range:a,...u(s.substring(i[0].length)),shouldBeInComments:!1};(c.text||c.hasSeparatorLine)&&r.push(c)}}}return r}function m(e){const t=[],r=e.getLineCount();for(let n=1;n<=r;n++){const o=e.getLineContent(n);f(o,n,t)}return t}function f(e,t,r){d.lastIndex=0;const n=d.exec(e);if(n){const o=n.indices[1][0]+1,s=n.indices[1][1]+1,i={startLineNumber:t,startColumn:o,endLineNumber:t,endColumn:s};if(i.endColumn>i.startColumn){const a={range:i,...u(n[1]),shouldBeInComments:!0};(a.text||a.hasSeparatorLine)&&r.push(a)}}}function u(e){e=e.trim();const t=e.startsWith("-");return e=e.replace(l,""),{text:e,hasSeparatorLine:t}}export{b as findSectionHeaders};