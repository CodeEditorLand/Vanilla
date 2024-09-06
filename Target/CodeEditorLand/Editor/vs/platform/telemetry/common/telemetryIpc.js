import"../../../../vs/base/common/event.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import"../../../../vs/platform/telemetry/common/telemetryUtils.js";class h{constructor(e){this.appenders=e}listen(e,n){throw new Error(`Event not found: ${n}`)}call(e,n,{eventName:r,data:l}){return this.appenders.forEach(o=>o.log(r,l)),Promise.resolve(null)}}class u{constructor(e){this.channel=e}log(e,n){return this.channel.call("log",{eventName:e,data:n}).then(void 0,r=>`Failed to log telemetry: ${console.warn(r)}`),Promise.resolve(null)}flush(){return Promise.resolve()}}export{h as TelemetryAppenderChannel,u as TelemetryAppenderClient};