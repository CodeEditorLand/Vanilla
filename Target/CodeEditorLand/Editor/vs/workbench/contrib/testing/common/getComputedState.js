import{Iterable as g}from"../../../../../vs/base/common/iterator.js";import{makeEmptyCounts as c,maxPriority as A,statePriority as S}from"../../../../../vs/workbench/contrib/testing/common/testingStates.js";import{TestResultState as T}from"../../../../../vs/workbench/contrib/testing/common/testTypes.js";const w=t=>"getOwnDuration"in t,l=(t,e,s=!1)=>{let n=t.getCurrentComputedState(e);if(n===void 0||s){n=t.getOwnState(e)??T.Unset;let r=0;const i=c();for(const u of t.getChildren(e)){const a=l(t,u);r++,i[a]++,n=a===T.Skipped&&n===T.Unset?T.Skipped:A(n,a)}r>I&&b.set(e,i),t.setComputedState(e,n)}return n},D=(t,e,s=!1)=>{let n=t.getCurrentComputedDuration(e);if(n===void 0||s){const r=t.getOwnDuration(e);if(r!==void 0)n=r;else{n=void 0;for(const i of t.getChildren(e)){const u=D(t,i);u!==void 0&&(n=(n||0)+u)}}t.setComputedDuration(e,n)}return n},I=64,b=new WeakMap,x=(t,e,s,n=!0)=>{const r=t.getCurrentComputedState(e),i=S[r],u=s??l(t,e,!0),a=S[u],f=new Set;if(a!==i){t.setComputedState(e,u),f.add(e);let d=r,p=u;for(const o of t.getParents(e)){const m=b.get(o);m&&(m[d]--,m[p]++);const C=t.getCurrentComputedState(o);if(a>i){if(C!==void 0&&S[C]>=a||m&&m[p]>1)break;t.setComputedState(o,u),f.add(o)}else{if(C===void 0||S[C]>i||m&&m[d]>0)break;p=l(t,o,!0),t.setComputedState(o,p),f.add(o)}d=C}}if(w(t)&&n)for(const d of g.concat(g.single(e),t.getParents(e))){const p=t.getCurrentComputedDuration(d),o=D(t,d,!0);if(p===o)break;t.setComputedDuration(d,o),f.add(d)}return f};export{x as refreshComputedState};