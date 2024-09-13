import{InstantiationType as t,registerSingleton as o}from"../../../platform/instantiation/common/extensions.js";import{IExtHostOutputService as r,ExtHostOutputService as e}from"./extHostOutput.js";import{IExtHostWorkspace as i,ExtHostWorkspace as s}from"./extHostWorkspace.js";import{IExtHostDecorations as E,ExtHostDecorations as m}from"./extHostDecorations.js";import{IExtHostConfiguration as a,ExtHostConfiguration as x}from"./extHostConfiguration.js";import{IExtHostCommands as H,ExtHostCommands as n}from"./extHostCommands.js";import{IExtHostDocumentsAndEditors as g,ExtHostDocumentsAndEditors as p}from"./extHostDocumentsAndEditors.js";import{IExtHostTerminalService as c,WorkerExtHostTerminalService as f}from"./extHostTerminalService.js";import{IExtHostTask as I,WorkerExtHostTask as S}from"./extHostTask.js";import{IExtHostDebugService as l,WorkerExtHostDebugService as d}from"./extHostDebugService.js";import{IExtHostSearch as v,ExtHostSearch as u}from"./extHostSearch.js";import{IExtHostStorage as T,ExtHostStorage as D}from"./extHostStorage.js";import{IExtHostTunnelService as y,ExtHostTunnelService as k}from"./extHostTunnelService.js";import{IExtHostApiDeprecationService as W,ExtHostApiDeprecationService as b}from"./extHostApiDeprecationService.js";import{IExtHostWindow as h,ExtHostWindow as A}from"./extHostWindow.js";import{IExtHostConsumerFileSystem as C,ExtHostConsumerFileSystem as L}from"./extHostFileSystemConsumer.js";import{IExtHostFileSystemInfo as F,ExtHostFileSystemInfo as M}from"./extHostFileSystemInfo.js";import{IExtHostSecretState as w,ExtHostSecretState as z}from"./extHostSecretState.js";import{ExtHostTelemetry as O,IExtHostTelemetry as P}from"./extHostTelemetry.js";import{ExtHostEditorTabs as R,IExtHostEditorTabs as V}from"./extHostEditorTabs.js";import{ExtHostLoggerService as j}from"./extHostLoggerService.js";import{ILoggerService as q}from"../../../platform/log/common/log.js";import{ExtHostVariableResolverProviderService as B,IExtHostVariableResolverProvider as G}from"./extHostVariableResolverService.js";import{ExtHostLocalizationService as J,IExtHostLocalizationService as K}from"./extHostLocalizationService.js";import{ExtHostManagedSockets as N,IExtHostManagedSockets as Q}from"./extHostManagedSockets.js";import{ExtHostAuthentication as U,IExtHostAuthentication as X}from"./extHostAuthentication.js";import{ExtHostLanguageModels as Y,IExtHostLanguageModels as Z}from"./extHostLanguageModels.js";import{IExtHostTerminalShellIntegration as _,ExtHostTerminalShellIntegration as $}from"./extHostTerminalShellIntegration.js";import{ExtHostTesting as tt,IExtHostTesting as ot}from"./extHostTesting.js";o(K,J,t.Delayed),o(q,j,t.Delayed),o(W,b,t.Delayed),o(H,n,t.Eager),o(X,U,t.Eager),o(Z,Y,t.Eager),o(a,x,t.Eager),o(C,L,t.Eager),o(ot,tt,t.Eager),o(l,d,t.Eager),o(E,m,t.Eager),o(g,p,t.Eager),o(Q,N,t.Eager),o(F,M,t.Eager),o(r,e,t.Delayed),o(v,u,t.Eager),o(T,D,t.Eager),o(I,S,t.Eager),o(c,f,t.Eager),o(_,$,t.Eager),o(y,k,t.Eager),o(h,A,t.Eager),o(i,s,t.Eager),o(w,z,t.Eager),o(P,O,t.Eager),o(V,R,t.Eager),o(G,B,t.Eager);
