import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IRemoteSocketFactoryService = createDecorator("remoteSocketFactoryService");
class RemoteSocketFactoryService {
  factories = {};
  register(type, factory) {
    this.factories[type] ??= [];
    this.factories[type].push(factory);
    return toDisposable(() => {
      const idx = this.factories[type]?.indexOf(factory);
      if (typeof idx === "number" && idx >= 0) {
        this.factories[type]?.splice(idx, 1);
      }
    });
  }
  getSocketFactory(messagePassing) {
    const factories = this.factories[messagePassing.type] || [];
    return factories.find((factory) => factory.supports(messagePassing));
  }
  connect(connectTo, path, query, debugLabel) {
    const socketFactory = this.getSocketFactory(connectTo);
    if (!socketFactory) {
      throw new Error(`No socket factory found for ${connectTo}`);
    }
    return socketFactory.connect(connectTo, path, query, debugLabel);
  }
}
export {
  IRemoteSocketFactoryService,
  RemoteSocketFactoryService
};
