import{autorunOpts as i,observableFromEventOpts as a}from"../../../base/common/observable.js";function u(e,n,t){return a({debugName:()=>`Configuration Key "${e}"`},r=>t.onDidChangeConfiguration(o=>{o.affectsConfiguration(e)&&r(o)}),()=>t.getValue(e)??n)}function f(e,n,t){const r=e.bindTo(n);return i({debugName:()=>`Set Context Key "${e.key}"`},o=>{r.set(t(o))})}export{f as bindContextKey,u as observableConfigValue};
