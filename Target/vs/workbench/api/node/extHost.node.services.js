import{InstantiationType as o,registerSingleton as r}from"../../../platform/instantiation/common/extensions.js";import{ExtHostTerminalService as e}from"./extHostTerminalService.js";import{ExtHostTask as t}from"./extHostTask.js";import{ExtHostDebugService as i}from"./extHostDebugService.js";import{NativeExtHostSearch as m}from"./extHostSearch.js";import{ExtHostExtensionService as s}from"./extHostExtensionService.js";import{NodeExtHostTunnelService as a}from"./extHostTunnelService.js";import{IExtHostDebugService as E}from"../common/extHostDebugService.js";import{IExtHostExtensionService as p}from"../common/extHostExtensionService.js";import{IExtHostSearch as f}from"../common/extHostSearch.js";import{IExtHostTask as n}from"../common/extHostTask.js";import{IExtHostTerminalService as S}from"../common/extHostTerminalService.js";import{IExtHostTunnelService as g}from"../common/extHostTunnelService.js";import{IExtensionStoragePaths as v}from"../common/extHostStoragePaths.js";import{ExtensionStoragePaths as x}from"./extHostStoragePaths.js";import{ExtHostLoggerService as c}from"./extHostLoggerService.js";import{ILogService as H,ILoggerService as l}from"../../../platform/log/common/log.js";import{NodeExtHostVariableResolverProviderService as I}from"./extHostVariableResolverService.js";import{IExtHostVariableResolverProvider as T}from"../common/extHostVariableResolverService.js";import{ExtHostLogService as d}from"../common/extHostLogService.js";import{SyncDescriptor as u}from"../../../platform/instantiation/common/descriptors.js";import{ISignService as D}from"../../../platform/sign/common/sign.js";import{SignService as b}from"../../../platform/sign/node/signService.js";r(p,s,o.Eager),r(l,c,o.Delayed),r(H,new u(d,[!1],!0)),r(D,b,o.Delayed),r(v,x,o.Eager),r(E,i,o.Eager),r(f,m,o.Eager),r(n,t,o.Eager),r(S,e,o.Eager),r(g,a,o.Eager),r(T,I,o.Eager);
