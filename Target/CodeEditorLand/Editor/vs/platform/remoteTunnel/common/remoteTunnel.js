import{localize as i}from"../../../nls.js";import{createDecorator as r}from"../../instantiation/common/instantiation.js";const T=r("IRemoteTunnelService"),m={active:!1};var c;(n=>(n.disconnected=e=>({type:"disconnected",onTokenFailed:e}),n.connected=(e,t)=>({type:"connected",info:e,serviceInstallFailed:t}),n.connecting=e=>({type:"connecting",progress:e}),n.uninitialized={type:"uninitialized"}))(c||={});const o="remote.tunnels.access",y=o+".hostNameOverride",I=o+".preventSleep",v="remoteTunnelService",g=i("remoteTunnelLog","Remote Tunnel Service");export{y as CONFIGURATION_KEY_HOST_NAME,o as CONFIGURATION_KEY_PREFIX,I as CONFIGURATION_KEY_PREVENT_SLEEP,m as INACTIVE_TUNNEL_MODE,T as IRemoteTunnelService,g as LOGGER_NAME,v as LOG_ID,c as TunnelStates};
