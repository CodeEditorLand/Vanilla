import a from"assert";import{Client as s}from"../../browser/ipc.mp.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../../../../test/common/utils.js";suite("IPC, MessagePorts",()=>{test("message port close event",async()=>{const{port1:e,port2:t}=new MessageChannel,o=new s(e,"client1"),n=new s(t,"client2"),i=new Promise(r=>e.addEventListener("close",()=>r(!0)));n.dispose(),a.ok(await i),o.dispose()}),l()});