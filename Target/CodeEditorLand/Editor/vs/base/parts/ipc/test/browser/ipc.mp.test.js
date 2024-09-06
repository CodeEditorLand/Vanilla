import o from"assert";import"../../../../common/cancellation.js";import"../../../../common/event.js";import{Client as i}from"../../browser/ipc.mp.js";import{ensureNoDisposablesAreLeakedInTestSuite as w}from"../../../../test/common/utils.js";suite("IPC, MessagePorts",()=>{test("message passing",async()=>{const{port1:l,port2:a}=new MessageChannel,n=new i(l,"client1"),t=new i(a,"client2");n.registerChannel("client1",{call(s,e,r,u){switch(e){case"testMethodClient1":return Promise.resolve("success1");default:return Promise.reject(new Error("not implemented"))}},listen(s,e,r){switch(e){default:throw new Error("not implemented")}}}),t.registerChannel("client2",{call(s,e,r,u){switch(e){case"testMethodClient2":return Promise.resolve("success2");default:return Promise.reject(new Error("not implemented"))}},listen(s,e,r){switch(e){default:throw new Error("not implemented")}}});const c=t.getChannel("client1");o.strictEqual(await c.call("testMethodClient1"),"success1");const m=n.getChannel("client2");o.strictEqual(await m.call("testMethodClient2"),"success2"),n.dispose(),t.dispose()}),w()});
