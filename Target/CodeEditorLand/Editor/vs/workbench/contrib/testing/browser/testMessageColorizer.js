import{renderStringAsPlaintext as m}from"../../../../../vs/base/browser/markdownRenderer.js";import"../../../../../vs/base/common/htmlContent.js";import{toDisposable as p}from"../../../../../vs/base/common/lifecycle.js";import{forAnsiStringParts as x,GraphemeIterator as P,removeAnsiEscapeCodes as u}from"../../../../../vs/base/common/strings.js";import"vs/css!./media/testMessageColorizer";import"../../../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js";import{Position as d}from"../../../../../vs/editor/common/core/position.js";import{Range as h}from"../../../../../vs/editor/common/core/range.js";const C=/^\x1b\[([0-9]+)m$/;var I=(r=>(r.Prefix="tstm-ansidec-",r.ForegroundPrefix="tstm-ansidec-fg",r.BackgroundPrefix="tstm-ansidec-bg",r.Bold="tstm-ansidec-1",r.Faint="tstm-ansidec-2",r.Italic="tstm-ansidec-3",r.Underline="tstm-ansidec-4",r))(I||{});const N=i=>typeof i=="string"?u(i):m(i),T=(i,l)=>{const a=[];return l.changeDecorations(g=>{let o=new d(1,1),e=[];for(const n of x(i))if(n.isCode){const r=C.exec(n.str)?.[1];if(!r)continue;const s=Number(r);s===0?e.length=0:s===22?e=e.filter(t=>t!=="tstm-ansidec-1"&&t!=="tstm-ansidec-3"):s===23?e=e.filter(t=>t!=="tstm-ansidec-3"):s===24?e=e.filter(t=>t!=="tstm-ansidec-4"):s>=30&&s<=39||s>=90&&s<=99?(e=e.filter(t=>!t.startsWith("tstm-ansidec-fg")),e.push("tstm-ansidec-fg"+r)):s>=40&&s<=49||s>=100&&s<=109?(e=e.filter(t=>!t.startsWith("tstm-ansidec-bg")),e.push("tstm-ansidec-bg"+r)):e.push("tstm-ansidec-"+r)}else{let r=o.lineNumber,s=o.column;const t=new P(n.str);for(let c=0;!t.eol();c+=t.nextGraphemeLength())n.str[c]===`
`?(r++,s=1):s++;const f=new d(r,s);e.length&&a.push(g.addDecoration(h.fromPositions(o,f),{inlineClassName:e.join(" "),description:"test-message-colorized"})),o=f}}),p(()=>l.removeDecorations(a))};export{T as colorizeTestMessageInEditor,N as renderTestMessageAsText};
