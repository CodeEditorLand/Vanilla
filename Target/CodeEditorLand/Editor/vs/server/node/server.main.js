import*as a from"fs";import*as p from"os";import{performance as c}from"perf_hooks";import{FileAccess as m}from"../../base/common/network.js";import{dirname as l,join as r}from"../../base/common/path.js";import*as O from"../../base/common/performance.js";import{parseArgs as f}from"../../platform/environment/node/argv.js";import E from"../../platform/product/common/product.js";import{run as u}from"./remoteExtensionHostAgentCli.js";import{createServer as S}from"./remoteExtensionHostAgentServer.js";import{serverOptions as d}from"./serverEnvironmentService.js";O.mark("code/server/codeLoaded"),global.vscodeServerCodeLoadedTime=c.now();const g={onMultipleValues:(e,i)=>{},onEmptyValue:e=>{},onUnknownOption:e=>{},onDeprecatedOption:(e,i)=>{}},o=f(process.argv.slice(2),d,g),n=o["server-data-dir"]||process.env.VSCODE_AGENT_FOLDER||r(p.homedir(),E.serverDataFolderName||".vscode-remote"),t=r(n,"data"),s=r(t,"User"),A=r(s,"globalStorage"),_=r(s,"History"),v=r(t,"Machine");o["user-data-dir"]=t;const T=l(m.asFileUri("").fsPath),I=r(T,"extensions");o["builtin-extensions-dir"]=I,o["extensions-dir"]=o["extensions-dir"]||r(n,"extensions"),[n,o["extensions-dir"],t,s,v,A,_].forEach(e=>{try{a.existsSync(e)||a.mkdirSync(e,{mode:448})}catch{}});function N(){u(o,n,d)}function C(e){return S(e,o,n)}export{C as createServer,N as spawnCli};
