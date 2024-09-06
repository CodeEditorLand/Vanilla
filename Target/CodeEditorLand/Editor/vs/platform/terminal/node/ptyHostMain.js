import{timeout as f}from"../../../base/common/async.js";import{DisposableStore as g}from"../../../base/common/lifecycle.js";import{DefaultURITransformer as _}from"../../../base/common/uriIpc.js";import{ProxyChannel as l}from"../../../base/parts/ipc/common/ipc.js";import{Server as y}from"../../../base/parts/ipc/node/ipc.cp.js";import{Server as T}from"../../../base/parts/ipc/node/ipc.mp.js";import{isUtilityProcess as d}from"../../../base/parts/sandbox/node/electronTypes.js";import{localize as O}from"../../../nls.js";import{OPTIONS as P,parseArgs as R}from"../../environment/node/argv.js";import{NativeEnvironmentService as I}from"../../environment/node/environmentService.js";import{getLogLevel as L}from"../../log/common/log.js";import{LoggerChannel as N}from"../../log/common/logIpc.js";import{LogService as h}from"../../log/common/logService.js";import{LoggerService as D}from"../../log/node/loggerService.js";import w from"../../product/common/product.js";import"../../product/common/productService.js";import{TerminalIpcChannels as t}from"../common/terminal.js";import{HeartbeatService as A}from"./heartbeatService.js";import{PtyService as u}from"./ptyService.js";H();async function H(){const o=parseInt(process.env.VSCODE_STARTUP_DELAY??"0"),s=parseInt(process.env.VSCODE_LATENCY??"0"),v={graceTime:parseInt(process.env.VSCODE_RECONNECT_GRACE_TIME||"0"),shortGraceTime:parseInt(process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME||"0"),scrollback:parseInt(process.env.VSCODE_RECONNECT_SCROLLBACK||"100")};delete process.env.VSCODE_RECONNECT_GRACE_TIME,delete process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME,delete process.env.VSCODE_RECONNECT_SCROLLBACK,delete process.env.VSCODE_LATENCY,delete process.env.VSCODE_STARTUP_DELAY,o&&await f(o);const n=d(process);let e;n?e=new T:e=new y(t.PtyHost);const i={_serviceBrand:void 0,...w},c=new I(R(process.argv,P),i),a=new D(L(c),c.logsHome);e.registerChannel(t.Logger,new N(a,()=>_));const E=a.createLogger("ptyhost",{name:O("ptyHost","Pty Host")}),r=new h(E);o&&r.warn(`Pty Host startup is delayed ${o}ms`),s&&r.warn(`Pty host is simulating ${s}ms latency`);const m=new g,p=new A;e.registerChannel(t.Heartbeat,l.fromService(p,m));const C=new u(r,i,v,s),S=l.fromService(C,m);e.registerChannel(t.PtyHost,S),n&&e.registerChannel(t.PtyHostWindow,S),process.once("exit",()=>{r.trace("Pty host exiting"),r.dispose(),p.dispose(),C.dispose()})}
