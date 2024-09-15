import * as processes from "../../../../node/processes.js";
const sender = processes.createQueuedSender(process);
process.on("message", (msg) => {
  sender.send(msg);
  sender.send(msg);
  sender.send(msg);
  sender.send("done");
});
sender.send("ready");
//# sourceMappingURL=fork_large.js.map
