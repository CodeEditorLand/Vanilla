import"../../../../vs/base/common/uri.js";import"../../../../vs/base/parts/ipc/common/ipc.js";const s="request",p="remoteResourceHandler";class a{async routeCall(t,e,r){if(e!==s)throw new Error(`Call not found: ${e}`);const n=r[0];if(n?.authority){const o=t.connections.find(i=>i.ctx===n.authority);if(o)return o}throw new Error("Caller not found")}routeEvent(t,e){throw new Error(`Event not found: ${e}`)}}export{p as NODE_REMOTE_RESOURCE_CHANNEL_NAME,s as NODE_REMOTE_RESOURCE_IPC_METHOD_NAME,a as NodeRemoteResourceRouter};