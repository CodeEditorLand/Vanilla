import"../../../../vs/base/common/lifecycle.js";import{autorunOpts as i}from"../../../../vs/base/common/observable.js";import{observableFromEventOpts as a}from"../../../../vs/base/common/observableInternal/utils.js";import"../../../../vs/platform/configuration/common/configuration.js";import"../../../../vs/platform/contextkey/common/contextkey.js";function K(e,r,t){return a({debugName:()=>`Configuration Key "${e}"`},n=>t.onDidChangeConfiguration(o=>{o.affectsConfiguration(e)&&n(o)}),()=>t.getValue(e)??r)}function v(e,r,t){const n=e.bindTo(r);return i({debugName:()=>`Set Context Key "${e.key}"`},o=>{n.set(t(o))})}export{v as bindContextKey,K as observableConfigValue};