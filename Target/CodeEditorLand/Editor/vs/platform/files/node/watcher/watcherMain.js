import{DisposableStore as e}from"../../../../../vs/base/common/lifecycle.js";import{ProxyChannel as s}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{Server as o}from"../../../../../vs/base/parts/ipc/node/ipc.cp.js";import{Server as i}from"../../../../../vs/base/parts/ipc/node/ipc.mp.js";import{isUtilityProcess as t}from"../../../../../vs/base/parts/sandbox/node/electronTypes.js";import{UniversalWatcher as m}from"../../../../../vs/platform/files/node/watcher/watcher.js";let r;t(process)?r=new i:r=new o("watcher");const c=new m;r.registerChannel("watcher",s.fromService(c,new e));