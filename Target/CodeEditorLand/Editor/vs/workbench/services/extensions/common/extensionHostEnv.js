import"../../../../../vs/base/common/platform.js";var c=(t=>(t[t.IPC=1]="IPC",t[t.Socket=2]="Socket",t[t.MessagePort=3]="MessagePort",t))(c||{});class n{constructor(e){this.pipeName=e}static ENV_KEY="VSCODE_EXTHOST_IPC_HOOK";type=1;serialize(e){e[n.ENV_KEY]=this.pipeName}}class i{static ENV_KEY="VSCODE_EXTHOST_WILL_SEND_SOCKET";type=2;serialize(e){e[i.ENV_KEY]="1"}}class r{static ENV_KEY="VSCODE_WILL_SEND_MESSAGE_PORT";type=3;serialize(e){e[r.ENV_KEY]="1"}}function s(o){delete o[n.ENV_KEY],delete o[i.ENV_KEY],delete o[r.ENV_KEY]}function p(o,e){s(e),o.serialize(e)}function u(o){if(o[n.ENV_KEY])return E(o,new n(o[n.ENV_KEY]));if(o[i.ENV_KEY])return E(o,new i);if(o[r.ENV_KEY])return E(o,new r);throw new Error("No connection information defined in environment!")}function E(o,e){return s(o),e}export{c as ExtHostConnectionType,n as IPCExtHostConnection,r as MessagePortExtHostConnection,i as SocketExtHostConnection,u as readExtHostConnection,p as writeExtHostConnection};
