import*as n from"../../../../node/processes.js";const e=n.createQueuedSender(process);process.on("message",s=>{e.send(s),e.send(s),e.send(s),e.send("done")}),e.send("ready");
