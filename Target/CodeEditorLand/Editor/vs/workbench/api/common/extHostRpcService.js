import{createDecorator as i}from"../../../platform/instantiation/common/instantiation.js";import"../../services/extensions/common/proxyIdentifier.js";const a=i("IExtHostRpcService");class x{_serviceBrand;getProxy;set;dispose;assertRegistered;drain;constructor(e){this.getProxy=e.getProxy.bind(e),this.set=e.set.bind(e),this.dispose=e.dispose.bind(e),this.assertRegistered=e.assertRegistered.bind(e),this.drain=e.drain.bind(e)}}export{x as ExtHostRpcService,a as IExtHostRpcService};
