import{IExtensionHostDebugService as e}from"../../../../../vs/platform/debug/common/extensionHostDebug.js";import{ExtensionHostDebugBroadcastChannel as n,ExtensionHostDebugChannelClient as o}from"../../../../../vs/platform/debug/common/extensionHostDebugIpc.js";import{registerMainProcessRemoteService as t}from"../../../../../vs/platform/ipc/electron-sandbox/services.js";t(e,n.ChannelName,{channelClientCtor:o});
