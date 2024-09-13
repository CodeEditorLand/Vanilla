import{coalesce as k}from"../../../../base/common/arrays.js";import{CancellationToken as P}from"../../../../base/common/cancellation.js";import{Schemas as l}from"../../../../base/common/network.js";import{deepClone as p}from"../../../../base/common/objects.js";import{isAbsolute as y}from"../../../../base/common/path.js";import{equalsIgnoreCase as g}from"../../../../base/common/strings.js";import{URI as c}from"../../../../base/common/uri.js";import{Range as E}from"../../../../editor/common/core/range.js";const v=/{([^}]+)}/g;function q(t,e,n){return t.replace(v,(o,r)=>e&&r.length>0&&r[0]!=="_"?o:n&&n.hasOwnProperty(r)?n[r]:o)}function F(t){const e={};for(const n of Object.keys(t))n.startsWith("!")||(e[n]=t[n]);return e}function x(t){return t.configuration.request==="attach"&&!f(t)&&(!t.parentSession||x(t.parentSession))}function f(t){let e=t.configuration.type;if(e)return e==="vslsShare"&&(e=t.configuration.adapterProxy.configuration.type),g(e,"extensionhost")||g(e,"pwa-extensionhost")?t:t.parentSession?f(t.parentSession):void 0}function N(t){return t.type&&(t.label||t.program||t.runtime)}function D(t,e,n){let o,r=0;const s=/([^()[\]{}<>\s+\-/%~#^;=|,`!]|->)+/g;let i=null;for(;i=s.exec(t);){const a=i.index+1,u=a+i[0].length;if(a<=e&&u>=n){o=i[0],r=a;break}}if(o){const a=/(\w|\p{L})+/gu;let u=null;for(;(u=a.exec(o))&&!(u.index+1+r+u[0].length>=n););u&&(o=o.substring(0,a.lastIndex))}return o?{start:r,end:r+o.length-1}:{start:0,end:0}}async function O(t,e,n,o){if(t.evaluatableExpressionProvider.has(e)){const r=t.evaluatableExpressionProvider.ordered(e),s=k(await Promise.all(r.map(async i=>{try{return await i.provideEvaluatableExpression(e,n,o??P.None)}catch{return}})));if(s.length>0){let i=s[0].expression;const a=s[0].range;return i||(i=e.getLineContent(n.lineNumber).substring(a.startColumn-1,a.endColumn-1)),{range:a,matchingExpression:i}}}else{const r=e.getLineContent(n.lineNumber),{start:s,end:i}=D(r,n.column,n.column),a=r.substring(s-1,i);return{matchingExpression:a,range:new E(n.lineNumber,s,n.lineNumber,s+a.length)}}return null}const C=/^[a-zA-Z][a-zA-Z0-9+\-.]+:/;function I(t){return!!(t&&t.match(C))}function b(t){if(typeof t.path=="string"&&!(typeof t.sourceReference=="number"&&t.sourceReference>0)){if(I(t.path))return c.parse(t.path);if(y(t.path))return c.file(t.path)}return t.path}function d(t){if(typeof t.path=="object"){const e=c.revive(t.path);if(e)return e.scheme===l.file?e.fsPath:e.toString()}return t.path}function V(t,e){const n=e?b:d,o=p(t);return m(o,(r,s)=>{r&&s&&(s.path=n(s))}),o}function U(t,e){const n=e?b:d,o=p(t);return m(o,(r,s)=>{!r&&s&&(s.path=n(s))}),o}function m(t,e){switch(t.type){case"event":{const n=t;switch(n.event){case"output":e(!1,n.body.source);break;case"loadedSource":e(!1,n.body.source);break;case"breakpoint":e(!1,n.body.breakpoint.source);break;default:break}break}case"request":{const n=t;switch(n.command){case"setBreakpoints":e(!0,n.arguments.source);break;case"breakpointLocations":e(!0,n.arguments.source);break;case"source":e(!0,n.arguments.source);break;case"gotoTargets":e(!0,n.arguments.source);break;case"launchVSCode":n.arguments.args.forEach(o=>e(!1,o));break;default:break}break}case"response":{const n=t;if(n.success&&n.body)switch(n.command){case"stackTrace":n.body.stackFrames.forEach(o=>e(!1,o.source));break;case"loadedSources":n.body.sources.forEach(o=>e(!1,o));break;case"scopes":n.body.scopes.forEach(o=>e(!1,o.source));break;case"setFunctionBreakpoints":n.body.breakpoints.forEach(o=>e(!1,o.source));break;case"setBreakpoints":n.body.breakpoints.forEach(o=>e(!1,o.source));break;case"disassemble":n.body?.instructions.forEach(r=>e(!1,r.location));break;case"locations":e(!1,n.body?.source);break;default:break}break}}}function _(t){return t.filter(e=>!e.presentation?.hidden).sort((e,n)=>e.presentation?n.presentation?e.presentation.group?n.presentation.group?e.presentation.group!==n.presentation.group?e.presentation.group.localeCompare(n.presentation.group):h(e.presentation.order,n.presentation.order):-1:n.presentation.group?1:h(e.presentation.order,n.presentation.order):-1:n.presentation?1:0)}function h(t,e){return typeof t!="number"?typeof e!="number"?0:1:typeof e!="number"?-1:t-e}async function z(t,e){const n=t.getValue("debug.saveBeforeStart",{overrideIdentifier:e.activeTextEditorLanguageId});if(n!=="none"&&(await e.saveAll(),n==="allEditorsInActiveGroup")){const o=e.activeEditorPane;o&&o.input.resource?.scheme===l.untitled&&await e.save({editor:o.input,groupId:o.group.id})}await t.reloadConfiguration()}const G=(t,e)=>!t||!e?t===e:t.name===e.name&&t.path===e.path&&t.sourceReference===e.sourceReference;export{V as convertToDAPaths,U as convertToVSCPaths,F as filterExceptionsFromTelemetry,q as formatPII,O as getEvaluatableExpressionAtPosition,D as getExactExpressionStartAndEnd,f as getExtensionHostDebugSession,_ as getVisibleAndSorted,N as isDebuggerMainContribution,x as isSessionAttach,I as isUri,z as saveAllBeforeDebugStart,G as sourcesEqual};
