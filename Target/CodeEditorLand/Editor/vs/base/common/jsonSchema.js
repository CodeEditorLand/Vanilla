function d(i){let l=!1;const p=new Map,u=new Map;if(h(i,n=>{if(i===n)return!0;const o=JSON.stringify(n);if(o.length<30)return!0;const c=p.get(o);if(!c){const a={schemas:[n]};return p.set(o,a),u.set(n,a),!0}return c.schemas.push(n),u.set(n,c),l=!0,!1}),p.clear(),!l)return JSON.stringify(i);let m="$defs";for(;i.hasOwnProperty(m);)m+="_";const s=[];function e(n){return JSON.stringify(n,(o,c)=>{if(c!==n){const a=u.get(c);if(a&&a.schemas.length>1)return a.id||(a.id=`_${s.length}`,s.push(a.schemas[0])),{$ref:`#/${m}/${a.id}`}}return c})}const r=e(i),t=[];for(let n=0;n<s.length;n++)t.push(`"_${n}":${e(s[n])}`);return t.length?`${r.substring(0,r.length-1)},"${m}":{${t.join(",")}}}`:r}function S(i){return typeof i=="object"&&i!==null}function h(i,l){if(!i||typeof i!="object")return;const p=(...r)=>{for(const t of r)S(t)&&s.push(t)},u=(...r)=>{for(const t of r)if(S(t))for(const n in t){const o=t[n];S(o)&&s.push(o)}},f=(...r)=>{for(const t of r)if(Array.isArray(t))for(const n of t)S(n)&&s.push(n)},m=r=>{if(Array.isArray(r))for(const t of r)S(t)&&s.push(t);else S(r)&&s.push(r)},s=[i];let e=s.pop();for(;e;)l(e)&&(p(e.additionalItems,e.additionalProperties,e.not,e.contains,e.propertyNames,e.if,e.then,e.else,e.unevaluatedItems,e.unevaluatedProperties),u(e.definitions,e.$defs,e.properties,e.patternProperties,e.dependencies,e.dependentSchemas),f(e.anyOf,e.allOf,e.oneOf,e.prefixItems),m(e.items)),e=s.pop()}export{d as getCompressedContent};