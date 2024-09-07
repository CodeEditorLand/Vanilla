import{compareBy as d,numberComparator as h,tieBreakComparators as T}from"../../common/arrays.js";import{Emitter as m,Event as p}from"../../common/event.js";import{Disposable as f}from"../../common/lifecycle.js";import{setTimeout0 as b,setTimeout0IsFaster as S}from"../../common/platform.js";const g=T(d(s=>s.time,h),d(s=>s.id,h));class y{taskCounter=0;_now=0;queue=new I([],g);taskScheduledEmitter=new m;onTaskScheduled=this.taskScheduledEmitter.event;schedule(e){if(e.time<this._now)throw new Error(`Scheduled time (${e.time}) must be equal to or greater than the current time (${this._now}).`);const t={...e,id:this.taskCounter++};return this.queue.add(t),this.taskScheduledEmitter.fire({task:e}),{dispose:()=>this.queue.remove(t)}}get now(){return this._now}get hasScheduledTasks(){return this.queue.length>0}getScheduledTasks(){return this.queue.toSortedArray()}runNext(){const e=this.queue.removeMin();return e&&(this._now=e.time,e.run()),e}installGlobally(){return E(this)}}class k extends f{constructor(t,r){super();this.scheduler=t;this.maxTaskCount=r&&r.maxTaskCount?r.maxTaskCount:100,this.useSetImmediate=r&&r.useSetImmediate?r.useSetImmediate:!1,this._register(t.onTaskScheduled(()=>{this.isProcessing||(this.isProcessing=!0,this.schedule())}))}isProcessing=!1;_history=new Array;get history(){return this._history}maxTaskCount;useSetImmediate;queueEmptyEmitter=new m;onTaskQueueEmpty=this.queueEmptyEmitter.event;lastError;schedule(){Promise.resolve().then(()=>{this.useSetImmediate?o.setImmediate(()=>this.process()):S?b(()=>this.process()):o.setTimeout(()=>this.process())})}process(){const t=this.scheduler.runNext();if(t&&(this._history.push(t),this.history.length>=this.maxTaskCount&&this.scheduler.hasScheduledTasks)){const r=this._history.slice(Math.max(0,this.history.length-10)).map(a=>`${a.source.toString()}: ${a.source.stackTrace}`),i=new Error(`Queue did not get empty after processing ${this.history.length} items. These are the last ${r.length} scheduled tasks:
${r.join(`


`)}`);throw this.lastError=i,i}this.scheduler.hasScheduledTasks?this.schedule():(this.isProcessing=!1,this.queueEmptyEmitter.fire())}waitForEmptyQueue(){if(this.lastError){const t=this.lastError;throw this.lastError=void 0,t}return this.isProcessing?p.toPromise(this.onTaskQueueEmpty).then(()=>{if(this.lastError)throw this.lastError}):Promise.resolve()}}async function _(s,e){if(!(s.useFakeTimers===void 0?!0:s.useFakeTimers))return e();const r=new y,i=new k(r,{useSetImmediate:s.useSetImmediate,maxTaskCount:s.maxTaskCount}),a=r.installGlobally();let n;try{n=await e()}finally{a.dispose();try{await i.waitForEmptyQueue()}finally{i.dispose()}}return n}const o={setTimeout:globalThis.setTimeout.bind(globalThis),clearTimeout:globalThis.clearTimeout.bind(globalThis),setInterval:globalThis.setInterval.bind(globalThis),clearInterval:globalThis.clearInterval.bind(globalThis),setImmediate:globalThis.setImmediate?.bind(globalThis),clearImmediate:globalThis.clearImmediate?.bind(globalThis),requestAnimationFrame:globalThis.requestAnimationFrame?.bind(globalThis),cancelAnimationFrame:globalThis.cancelAnimationFrame?.bind(globalThis),Date:globalThis.Date};function v(s,e,t=0){if(typeof e=="string")throw new Error("String handler args should not be used and are not supported");return s.schedule({time:s.now+t,run:()=>{e()},source:{toString(){return"setTimeout"},stackTrace:new Error().stack}})}function w(s,e,t){if(typeof e=="string")throw new Error("String handler args should not be used and are not supported");const r=e;let i=0;const a=new Error().stack;let n=!1,l;function u(){i++;const c=i;l=s.schedule({time:s.now+t,run(){n||(u(),r())},source:{toString(){return`setInterval (iteration ${c})`},stackTrace:a}})}return u(),{dispose:()=>{n||(n=!0,l.dispose())}}}function E(s){return globalThis.setTimeout=(e,t)=>v(s,e,t),globalThis.clearTimeout=e=>{typeof e=="object"&&e&&"dispose"in e?e.dispose():o.clearTimeout(e)},globalThis.setInterval=(e,t)=>w(s,e,t),globalThis.clearInterval=e=>{typeof e=="object"&&e&&"dispose"in e?e.dispose():o.clearInterval(e)},globalThis.Date=x(s),{dispose:()=>{Object.assign(globalThis,o)}}}function x(s){const e=o.Date;function t(...r){return this instanceof t?r.length===0?new e(s.now):new e(...r):new e(s.now).toString()}for(const r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);return t.now=function(){return s.now},t.toString=function(){return e.toString()},t.prototype=e.prototype,t.parse=e.parse,t.UTC=e.UTC,t.prototype.toUTCString=e.prototype.toUTCString,t}class I{constructor(e,t){this.compare=t;this.items=e}isSorted=!1;items;get length(){return this.items.length}add(e){this.items.push(e),this.isSorted=!1}remove(e){this.items.splice(this.items.indexOf(e),1),this.isSorted=!1}removeMin(){return this.ensureSorted(),this.items.shift()}getMin(){return this.ensureSorted(),this.items[0]}toSortedArray(){return this.ensureSorted(),[...this.items]}ensureSorted(){this.isSorted||(this.items.sort(this.compare),this.isSorted=!0)}}export{k as AsyncSchedulerProcessor,y as TimeTravelScheduler,o as originalGlobalValues,_ as runWithFakedTimers};