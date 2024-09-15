var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../common/async.js";
import { Emitter, Event } from "../../../../common/event.js";
import { IChannel, IServerChannel } from "../../common/ipc.js";
class TestService {
  static {
    __name(this, "TestService");
  }
  _onMarco = new Emitter();
  onMarco = this._onMarco.event;
  marco() {
    this._onMarco.fire({ answer: "polo" });
    return Promise.resolve("polo");
  }
  pong(ping) {
    return Promise.resolve({ incoming: ping, outgoing: "pong" });
  }
  cancelMe() {
    return Promise.resolve(timeout(100)).then(() => true);
  }
}
class TestChannel {
  constructor(testService) {
    this.testService = testService;
  }
  static {
    __name(this, "TestChannel");
  }
  listen(_, event) {
    switch (event) {
      case "marco":
        return this.testService.onMarco;
    }
    throw new Error("Event not found");
  }
  call(_, command, ...args) {
    switch (command) {
      case "pong":
        return this.testService.pong(args[0]);
      case "cancelMe":
        return this.testService.cancelMe();
      case "marco":
        return this.testService.marco();
      default:
        return Promise.reject(new Error(`command not found: ${command}`));
    }
  }
}
class TestServiceClient {
  constructor(channel) {
    this.channel = channel;
  }
  static {
    __name(this, "TestServiceClient");
  }
  get onMarco() {
    return this.channel.listen("marco");
  }
  marco() {
    return this.channel.call("marco");
  }
  pong(ping) {
    return this.channel.call("pong", ping);
  }
  cancelMe() {
    return this.channel.call("cancelMe");
  }
}
export {
  TestChannel,
  TestService,
  TestServiceClient
};
//# sourceMappingURL=testService.js.map
