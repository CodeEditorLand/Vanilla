import*as p from"net";import{NodeSocket as k}from"../../../base/parts/ipc/node/ipc.net.js";import{makeRawSocketHeaders as S}from"../common/managedSocket.js";const u=new class{supports(e){return!0}connect({host:e,port:c},m,s,t){return new Promise((i,r)=>{const o=p.createConnection({host:e,port:c},()=>{o.removeListener("error",r),o.write(S(m,s,t));const n=a=>{a.toString().indexOf(`\r
\r
`)>=0&&(o.off("data",n),i(new k(o,t)))};o.on("data",n)});o.setNoDelay(!0),o.once("error",r)})}};export{u as nodeSocketFactory};
