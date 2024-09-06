import"../../../../vs/base/common/observableInternal/autorun.js";import"../../../../vs/base/common/observableInternal/base.js";import"../../../../vs/base/common/observableInternal/derived.js";import"../../../../vs/base/common/observableInternal/utils.js";let b;function V(t){b=t}function S(){return b}class D{indentation=0;textToConsoleArgs(e){return c([l(m("|  ",this.indentation)),e])}formatInfo(e){return e.hadValue?e.didChange?[l(" "),s(u(e.oldValue,70),{color:"red",strikeThrough:!0}),l(" "),s(u(e.newValue,60),{color:"green"})]:[l(" (unchanged)")]:[l(" "),s(u(e.newValue,60),{color:"green"}),l(" (initial)")]}handleObservableChanged(e,n){console.log(...this.textToConsoleArgs([d("observable value changed"),s(e.debugName,{color:"BlueViolet"}),...this.formatInfo(n)]))}changedObservablesSets=new WeakMap;formatChanges(e){if(e.size!==0)return s(" (changed deps: "+[...e].map(n=>n.debugName).join(", ")+")",{color:"gray"})}handleDerivedCreated(e){const n=e.handleChange;this.changedObservablesSets.set(e,new Set),e.handleChange=(r,o)=>(this.changedObservablesSets.get(e).add(r),n.apply(e,[r,o]))}handleDerivedRecomputed(e,n){const r=this.changedObservablesSets.get(e);console.log(...this.textToConsoleArgs([d("derived recomputed"),s(e.debugName,{color:"BlueViolet"}),...this.formatInfo(n),this.formatChanges(r),{data:[{fn:e._debugNameData.referenceFn??e._computeFn}]}])),r.clear()}handleFromEventObservableTriggered(e,n){console.log(...this.textToConsoleArgs([d("observable from event triggered"),s(e.debugName,{color:"BlueViolet"}),...this.formatInfo(n),{data:[{fn:e._getValue}]}]))}handleAutorunCreated(e){const n=e.handleChange;this.changedObservablesSets.set(e,new Set),e.handleChange=(r,o)=>(this.changedObservablesSets.get(e).add(r),n.apply(e,[r,o]))}handleAutorunTriggered(e){const n=this.changedObservablesSets.get(e);console.log(...this.textToConsoleArgs([d("autorun"),s(e.debugName,{color:"BlueViolet"}),this.formatChanges(n),{data:[{fn:e._debugNameData.referenceFn??e._runFn}]}])),n.clear(),this.indentation++}handleAutorunFinished(e){this.indentation--}handleBeginTransaction(e){let n=e.getDebugName();n===void 0&&(n=""),console.log(...this.textToConsoleArgs([d("transaction"),s(n,{color:"BlueViolet"}),{data:[{fn:e._fn}]}])),this.indentation++}handleEndTransaction(){this.indentation--}}function c(t){const e=new Array,n=[];let r="";function o(a){if("length"in a)for(const g of a)g&&o(g);else"text"in a?(r+=`%c${a.text}`,e.push(a.style),a.data&&n.push(...a.data)):"data"in a&&n.push(...a.data)}o(t);const i=[r,...e];return i.push(...n),i}function l(t){return s(t,{color:"black"})}function d(t){return s(v(`${t}: `,10),{color:"black",bold:!0})}function s(t,e={color:"black"}){function n(o){return Object.entries(o).reduce((i,[a,g])=>`${i}${a}:${g};`,"")}const r={color:e.color};return e.strikeThrough&&(r["text-decoration"]="line-through"),e.bold&&(r["font-weight"]="bold"),{text:t,style:n(r)}}function u(t,e){switch(typeof t){case"number":return""+t;case"string":return t.length+2<=e?`"${t}"`:`"${t.substr(0,e-7)}"+...`;case"boolean":return t?"true":"false";case"undefined":return"undefined";case"object":return t===null?"null":Array.isArray(t)?h(t,e):f(t,e);case"symbol":return t.toString();case"function":return`[[Function${t.name?" "+t.name:""}]]`;default:return""+t}}function h(t,e){let n="[ ",r=!0;for(const o of t){if(r||(n+=", "),n.length-5>e){n+="...";break}r=!1,n+=`${u(o,e-n.length)}`}return n+=" ]",n}function f(t,e){let n="{ ",r=!0;for(const[o,i]of Object.entries(t)){if(r||(n+=", "),n.length-5>e){n+="...";break}r=!1,n+=`${o}: ${u(i,e-n.length)}`}return n+=" }",n}function m(t,e){let n="";for(let r=1;r<=e;r++)n+=t;return n}function v(t,e){for(;t.length<e;)t+=" ";return t}export{D as ConsoleObservableLogger,S as getLogger,V as setLogger};
