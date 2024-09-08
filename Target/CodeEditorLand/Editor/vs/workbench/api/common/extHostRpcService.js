import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const IExtHostRpcService = createDecorator("IExtHostRpcService");
class ExtHostRpcService {
  _serviceBrand;
  getProxy;
  set;
  dispose;
  assertRegistered;
  drain;
  constructor(rpcProtocol) {
    this.getProxy = rpcProtocol.getProxy.bind(rpcProtocol);
    this.set = rpcProtocol.set.bind(rpcProtocol);
    this.dispose = rpcProtocol.dispose.bind(rpcProtocol);
    this.assertRegistered = rpcProtocol.assertRegistered.bind(rpcProtocol);
    this.drain = rpcProtocol.drain.bind(rpcProtocol);
  }
}
export {
  ExtHostRpcService,
  IExtHostRpcService
};
