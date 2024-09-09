import*as r from"../../../../node/processes.js";const e=r.createQueuedSender(process);process.on("message",s=>{e.send(s)}),e.send("ready");
