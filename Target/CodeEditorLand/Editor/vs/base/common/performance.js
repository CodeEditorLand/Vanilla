const n={exports:{}};(function(){function a(e){const r=[];typeof e=="number"&&r.push("code/timeOrigin",e);function o(i){r.push(i,Date.now())}function m(){const i=[];for(let f=0;f<r.length;f+=2)i.push({name:r[f],startTime:r[f+1]});return i}return{mark:o,getMarks:m}}function s(){if(typeof performance=="object"&&typeof performance.mark=="function"&&!performance.nodeTiming)return typeof performance.timeOrigin!="number"&&!performance.timing?a():{mark(e){performance.mark(e)},getMarks(){let e=performance.timeOrigin;typeof e!="number"&&(e=performance.timing.navigationStart||performance.timing.redirectStart||performance.timing.fetchStart);const r=[{name:"code/timeOrigin",startTime:Math.round(e)}];for(const o of performance.getEntriesByType("mark"))r.push({name:o.name,startTime:Math.round(e+o.startTime)});return r}};if(typeof process=="object"){const e=performance?.timeOrigin;return a(e)}else return console.trace("perf-util loaded in UNKNOWN environment"),a()}function c(e){return e.MonacoPerformanceMarks||(e.MonacoPerformanceMarks=s()),e.MonacoPerformanceMarks}var t;typeof global=="object"?t=global:typeof self=="object"?t=self:t={},typeof n=="object"&&typeof n.exports=="object"?n.exports=c(t):(console.trace("perf-util defined in UNKNOWN context (neither requirejs or commonjs)"),t.perf=c(t))})();const u=n.exports.mark,l=n.exports.getMarks;export{l as getMarks,u as mark};
