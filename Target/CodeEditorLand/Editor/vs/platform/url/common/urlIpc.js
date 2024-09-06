import"../../../../vs/base/common/cancellation.js";import"../../../../vs/base/common/event.js";import{URI as s}from"../../../../vs/base/common/uri.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/url/common/url.js";class E{constructor(n){this.handler=n}listen(n,e){throw new Error(`Event not found: ${e}`)}call(n,e,t){switch(e){case"handleURL":return this.handler.handleURL(s.revive(t[0]),t[1])}throw new Error(`Call not found: ${e}`)}}class ${constructor(n){this.channel=n}handleURL(n,e){return this.channel.call("handleURL",[n.toJSON(),e])}}class O{constructor(n,e){this.next=n;this.logService=e}async routeCall(n,e,t,c){if(e!=="handleURL")throw new Error(`Call not found: ${e}`);if(Array.isArray(t)&&t.length>0){const r=s.revive(t[0]);if(this.logService.trace("URLHandlerRouter#routeCall() with URI argument",r.toString(!0)),r.query){const i=/\bwindowId=(\d+)/.exec(r.query);if(i){const l=i[1];this.logService.trace(`URLHandlerRouter#routeCall(): found windowId query parameter with value "${l}"`,r.toString(!0));const d=new RegExp(`window:${l}`),a=n.connections.find(u=>(this.logService.trace("URLHandlerRouter#routeCall(): testing connection",u.ctx),d.test(u.ctx)));if(a)return this.logService.trace("URLHandlerRouter#routeCall(): found a connection to route",r.toString(!0)),a;this.logService.trace("URLHandlerRouter#routeCall(): did not find a connection to route",r.toString(!0))}else this.logService.trace("URLHandlerRouter#routeCall(): did not find windowId query parameter",r.toString(!0))}}else this.logService.trace("URLHandlerRouter#routeCall() without URI argument");return this.next.routeCall(n,e,t,c)}routeEvent(n,e){throw new Error(`Event not found: ${e}`)}}export{E as URLHandlerChannel,$ as URLHandlerChannelClient,O as URLHandlerRouter};