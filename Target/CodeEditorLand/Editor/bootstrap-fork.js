import*as h from"./vs/base/common/performance.js";import*as p from"./bootstrap-node.js";import*as S from"./bootstrap-amd.js";h.mark("code/fork/start"),A(),p.removeGlobalNodeJsModuleLookupPaths(),p.enableASARSupport(),process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH&&p.devInjectNodeModuleLookupPath(process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH),process.send&&process.env.VSCODE_PIPE_LOGGING==="true"&&P(),process.env.VSCODE_HANDLES_UNCAUGHT_ERRORS||R(),process.env.VSCODE_PARENT_PID&&m(),S.load(process.env.VSCODE_AMD_ENTRYPOINT);function P(){function E(e){const s=[],c=[];if(e.length)for(let n=0;n<e.length;n++){let r=e[n];if(typeof r>"u")r="undefined";else if(r instanceof Error){const o=r;o.stack?r=o.stack:r=o.toString()}c.push(r)}try{const n=JSON.stringify(c,function(r,o){if(d(o)||Array.isArray(o)){if(s.indexOf(o)!==-1)return"[Circular]";s.push(o)}return o});return n.length>1e5?"Output omitted for a large object that exceeds the limits":n}catch(n){return`Output omitted for an object that cannot be inspected ('${n.toString()}')`}}function _(e){try{process.send&&process.send(e)}catch{}}function d(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)&&!(e instanceof RegExp)&&!(e instanceof Date)}function O(e,s){_({type:"__$console",severity:e,arguments:s})}function i(e,s){Object.defineProperty(console,e,{set:()=>{},get:()=>function(){O(s,E(arguments))}})}function u(e,s){const c=process[e],n=c.write;let r="";Object.defineProperty(c,"write",{set:()=>{},get:()=>(o,l,g)=>{r+=o.toString(l);const f=r.length>1048576?r.length:r.lastIndexOf(`
`);f!==-1&&(console[s](r.slice(0,f)),r=r.slice(f+1)),n.call(c,o,l,g)}})}process.env.VSCODE_VERBOSE_LOGGING==="true"?(i("info","log"),i("log","log"),i("warn","warn"),i("error","error")):(console.log=function(){},console.warn=function(){},console.info=function(){},i("error","error")),u("stderr","error"),u("stdout","log")}function R(){process.on("uncaughtException",function(t){console.error("Uncaught Exception: ",t)}),process.on("unhandledRejection",function(t){console.error("Unhandled Promise Rejection: ",t)})}function m(){const t=Number(process.env.VSCODE_PARENT_PID);typeof t=="number"&&!isNaN(t)&&setInterval(function(){try{process.kill(t,0)}catch{process.exit()}},5e3)}function A(){const t=process.env.VSCODE_CRASH_REPORTER_PROCESS_TYPE;if(t)try{process.crashReporter&&typeof process.crashReporter.addExtraParameter=="function"&&process.crashReporter.addExtraParameter("processType",t)}catch(a){console.error(a)}}
