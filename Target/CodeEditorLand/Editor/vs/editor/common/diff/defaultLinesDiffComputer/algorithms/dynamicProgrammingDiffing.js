import{OffsetRange as S}from"../../../core/offsetRange.js";import{Array2D as u}from"../utils.js";import{DiffAlgorithmResult as D,InfiniteTimeout as c,SequenceDiff as L}from"./diffAlgorithm.js";class y{compute(n,i,d=c.instance,p){if(n.length===0||i.length===0)return D.trivial(n,i);const m=new u(n.length,i.length),r=new u(n.length,i.length),o=new u(n.length,i.length);for(let t=0;t<n.length;t++)for(let e=0;e<i.length;e++){if(!d.isValid())return D.trivialTimedOut(n,i);const A=t===0?0:m.get(t-1,e),I=e===0?0:m.get(t,e-1);let l;n.getElement(t)===i.getElement(e)?(t===0||e===0?l=0:l=m.get(t-1,e-1),t>0&&e>0&&r.get(t-1,e-1)===3&&(l+=o.get(t-1,e-1)),l+=p?p(t,e):1):l=-1;const s=Math.max(A,I,l);if(s===l){const v=t>0&&e>0?o.get(t-1,e-1):0;o.set(t,e,v+1),r.set(t,e,3)}else s===A?(o.set(t,e,0),r.set(t,e,1)):s===I&&(o.set(t,e,0),r.set(t,e,2));m.set(t,e,s)}const h=[];let a=n.length,b=i.length;function w(t,e){(t+1!==a||e+1!==b)&&h.push(new L(new S(t+1,a),new S(e+1,b))),a=t,b=e}let g=n.length-1,f=i.length-1;for(;g>=0&&f>=0;)r.get(g,f)===3?(w(g,f),g--,f--):r.get(g,f)===1?g--:f--;return w(-1,-1),h.reverse(),new D(h,!1)}}export{y as DynamicProgrammingDiffing};
