import{assertNever as u}from"../../../../base/common/assert.js";import{clamp as f}from"../../../../base/common/numbers.js";import{localize as a}from"../../../../nls.js";import{chartsGreen as d,chartsRed as C,chartsYellow as h}from"../../../../platform/theme/common/colorRegistry.js";import{asCssVariableName as l}from"../../../../platform/theme/common/colorUtils.js";import{TestingDisplayedCoveragePercent as m}from"../common/configuration.js";import{getTotalCoveragePercent as T}from"../common/testCoverage.js";const c=e=>f(e.total===0?1:e.covered/e.total,0,1),p=[{color:`var(${l(C)})`,key:"red"},{color:`var(${l(h)})`,key:"yellow"},{color:`var(${l(d)})`,key:"green"}],P=(e,o)=>{let t=p[0].color,n=e;for(const{key:i,color:r}of p){const s=o[i]/100;s&&e>=s&&e-s<n&&(t=r,n=e-s)}return t},v=1e-7,y=(e,o=2)=>{const t=(e*100).toFixed(o);return e<1-v&&t==="100"?`${100-10**-o}%`:`${t}%`},j=(e,o)=>{switch(o){case m.Statement:return c(e.statement);case m.Minimum:{let t=c(e.statement);return e.branch&&(t=Math.min(t,c(e.branch))),e.declaration&&(t=Math.min(t,c(e.declaration))),t}case m.TotalCoverage:return T(e.statement,e.branch,e.declaration);default:u(o)}};function R(e,o,t){const n=[];for(const i of o.idsFromRoot()){const r=e.getTestById(i.toString());if(!r)break;n.push(r.label)}return n.slice(t).join(" \u203A ")}var x;(r=>(r.showingFilterFor=s=>a("testing.coverageForTest",'Showing "{0}"',s),r.clickToChangeFiltering=a("changePerTestFilter","Click to view coverage for a single test"),r.percentCoverage=(s,g)=>a("testing.percentCoverage","{0} Coverage",y(s,g)),r.allTests=a("testing.allTests","All tests"),r.pickShowCoverage=a("testing.pickTest","Pick a test to show coverage for")))(x||={});export{j as calculateDisplayedStat,y as displayPercent,P as getCoverageColor,R as getLabelForItem,x as labels,c as percent};
