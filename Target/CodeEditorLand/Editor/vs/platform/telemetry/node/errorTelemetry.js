import{isCancellationError as s,isSigPipeError as c,onUnexpectedError as i,setUnexpectedErrorHandler as d}from"../../../../vs/base/common/errors.js";import a from"../../../../vs/platform/telemetry/common/errorTelemetry.js";class l extends a{installErrorListeners(){d(e=>console.error(e));const o=[];process.on("unhandledRejection",(e,r)=>{o.push(r),setTimeout(()=>{const t=o.indexOf(r);t>=0&&r.catch(n=>{o.splice(t,1),s(n)||(console.warn(`rejected promise not handled within 1 second: ${n}`),n.stack&&console.warn(`stack trace: ${n.stack}`),e&&i(e))})},1e3)}),process.on("rejectionHandled",e=>{const r=o.indexOf(e);r>=0&&o.splice(r,1)}),process.on("uncaughtException",e=>{c(e)||i(e)})}}export{l as default};