import*as F from"child_process";import*as W from"fs";import{dirname as R,resolve as E}from"path";import{Codicon as h}from"../../../base/common/codicons.js";import{basename as x,delimiter as O,normalize as M}from"../../../base/common/path.js";import{isLinux as b,isWindows as v}from"../../../base/common/platform.js";import{isString as L}from"../../../base/common/types.js";import*as C from"../../../base/node/pfs.js";import{enumeratePowerShellInstallations as k}from"../../../base/node/powershell.js";import{ProfileSource as w,TerminalSettingId as P}from"../common/terminal.js";import{findExecutable as U,getWindowsBuildNumber as V}from"./terminalEnvironment.js";var B=(e=>(e.UnixShellsPath="/etc/shells",e))(B||{});let I,S=!0;function ie(t,e,i,n,l=process.env,c,o,a,u){return c=c||{existsFile:C.SymlinkSupport.existsFile,readFile:W.promises.readFile},v?q(i,c,l,o,n.getValue(P.UseWslProfiles)!==!1,t&&typeof t=="object"?{...t}:n.getValue(P.ProfilesWindows),typeof e=="string"?e:n.getValue(P.DefaultProfileWindows),u,a):K(c,o,i,t&&typeof t=="object"?{...t}:n.getValue(b?P.ProfilesLinux:P.ProfilesMacOs),typeof e=="string"?e:n.getValue(b?P.DefaultProfileLinux:P.DefaultProfileMacOs),u,a,l)}async function q(t,e,i,n,l,c,o,a,u){const d=process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432"),f=`${process.env.windir}\\${d?"Sysnative":"System32"}`;let p=!1;V()>=16299&&(p=!0),await G(a);const r=new Map;if(t){r.set("PowerShell",{source:w.Pwsh,icon:h.terminalPowershell,isAutoDetected:!0}),r.set("Windows PowerShell",{path:`${f}\\WindowsPowerShell\\v1.0\\powershell.exe`,icon:h.terminalPowershell,isAutoDetected:!0}),r.set("Git Bash",{source:w.GitBash,isAutoDetected:!0}),r.set("Command Prompt",{path:`${f}\\cmd.exe`,icon:h.terminalCmd,isAutoDetected:!0}),r.set("Cygwin",{path:[{path:`${process.env.HOMEDRIVE}\\cygwin64\\bin\\bash.exe`,isUnsafe:!0},{path:`${process.env.HOMEDRIVE}\\cygwin\\bin\\bash.exe`,isUnsafe:!0}],args:["--login"],isAutoDetected:!0}),r.set("bash (MSYS2)",{path:[{path:`${process.env.HOMEDRIVE}\\msys64\\usr\\bin\\bash.exe`,isUnsafe:!0}],args:["--login","-i"],env:{CHERE_INVOKING:"1"},icon:h.terminalBash,isAutoDetected:!0});const m=`${process.env.CMDER_ROOT||`${process.env.HOMEDRIVE}\\cmder`}\\vendor\\bin\\vscode_init.cmd`;r.set("Cmder",{path:`${f}\\cmd.exe`,args:["/K",m],requiresPath:process.env.CMDER_ROOT?m:{path:m,isUnsafe:!0},isAutoDetected:!0})}$(c,r);const s=await D(r.entries(),o,e,i,n,u);if(t&&l)try{const m=await N(`${f}\\${p?"wsl":"bash"}.exe`,o);for(const g of m)(!c||!(g.profileName in c))&&s.push(g)}catch{S&&(n?.trace("WSL is not installed, so could not detect WSL profiles"),S=!1)}return s}async function D(t,e,i,n=process.env,l,c){const o=[];for(const[a,u]of t)o.push(j(a,u,e,i,n,l,c));return(await Promise.all(o)).filter(a=>!!a)}async function j(t,e,i,n,l=process.env,c,o){if(e===null)return;let a,u,d;if("source"in e&&!("path"in e)){const s=I?.get(e.source);if(!s)return;a=s.paths,u=e.args||s.args,e.icon?d=A(e.icon):s.icon&&(d=s.icon)}else a=Array.isArray(e.path)?e.path:[e.path],u=v||Array.isArray(e.args)?e.args:void 0,d=A(e.icon);let f;if(o){const s=a.map(g=>typeof g=="string"?g:g.path),m=await o(s);f=new Array(a.length);for(let g=0;g<a.length;g++)typeof a[g]=="string"?f[g]=m[g]:f[g]={path:m[g],isUnsafe:!0}}else f=a.slice();let p;if(e.requiresPath){let s;if(L(e.requiresPath)?s=e.requiresPath:(s=e.requiresPath.path,e.requiresPath.isUnsafe&&(p=s)),!await n.existsFile(s))return}const r=await y(t,i,f,n,l,u,e.env,e.overrideName,e.isAutoDetected,p);if(!r){c?.debug("Terminal profile not validated",t,a);return}return r.isAutoDetected=e.isAutoDetected,r.icon=d,r.color=e.color,r}function A(t){return typeof t=="string"?{id:t}:t}async function G(t){if(I&&!t)return;const[e,i]=await Promise.all([H(),t||_()]);I=new Map,I.set(w.GitBash,{profileName:"Git Bash",paths:e,args:["--login","-i"]}),I.set(w.Pwsh,{profileName:"PowerShell",paths:i,icon:h.terminalPowershell})}async function H(){const t=new Set,e=await U("git.exe");if(e){const l=R(e);t.add(E(l,"../.."))}function i(l,c){c&&l.add(c)}i(t,process.env.ProgramW6432),i(t,process.env.ProgramFiles),i(t,process.env["ProgramFiles(X86)"]),i(t,`${process.env.LocalAppData}\\Program`);const n=[];for(const l of t)n.push(`${l}\\Git\\bin\\bash.exe`,`${l}\\Git\\usr\\bin\\bash.exe`,`${l}\\usr\\bin\\bash.exe`);return n.push(`${process.env.UserProfile}\\scoop\\apps\\git\\current\\bin\\bash.exe`),n.push(`${process.env.UserProfile}\\scoop\\apps\\git-with-openssh\\current\\bin\\bash.exe`),n}async function _(){const t=[];for await(const e of k())t.push(e.exePath);return t}async function N(t,e){const i=[],n=await new Promise((o,a)=>{F.exec("wsl.exe -l -q",{encoding:"utf16le",timeout:1e3},(u,d)=>{if(u)return a("Problem occurred when getting wsl distros");o(d)})});if(!n)return[];const l=new RegExp(/[\r?\n]/),c=n.split(l).filter(o=>o.trim().length>0&&o!=="");for(const o of c){if(o===""||o.startsWith("docker-desktop"))continue;const a=`${o} (WSL)`,u={profileName:a,path:t,args:["-d",`${o}`],isDefault:a===e,icon:z(o),isAutoDetected:!1};i.push(u)}return i}function z(t){return t.includes("Ubuntu")?h.terminalUbuntu:t.includes("Debian")?h.terminalDebian:h.terminalLinux}async function K(t,e,i,n,l,c,o,a){const u=new Map;if(i&&await t.existsFile("/etc/shells")){const d=(await t.readFile("/etc/shells")).toString(),f=(c||d.split(`
`)).map(r=>{const s=r.indexOf("#");return s===-1?r:r.substring(0,s)}).filter(r=>r.trim().length>0),p=new Map;for(const r of f){let s=x(r),m=p.get(s)||0;m++,m>1&&(s=`${s} (${m})`),p.set(s,m),u.set(s,{path:r,isAutoDetected:!0})}}return $(n,u),await D(u.entries(),l,t,a,e,o)}function $(t,e){if(t)for(const[i,n]of Object.entries(t))n===null||typeof n!="object"||!("path"in n)&&!("source"in n)?e.delete(i):(n.icon=n.icon||e.get(i)?.icon,e.set(i,n))}async function y(t,e,i,n,l,c,o,a,u,d){if(i.length===0)return Promise.resolve(void 0);const f=i.shift();if(f==="")return y(t,e,i,n,l,c,o,a,u);const p=typeof f!="string"&&f.isUnsafe,r=typeof f=="string"?f:f.path,s={profileName:t,path:r,args:c,env:o,overrideName:a,isAutoDetected:u,isDefault:t===e,isUnsafePath:p,requiresUnsafePath:d};if(x(r)===r){const g=l.PATH?l.PATH.split(O):void 0,T=await U(r,void 0,g,void 0,n.existsFile);return T?(s.path=T,s.isFromPath=!0,s):y(t,e,i,n,l,c)}return await n.existsFile(M(r))?s:y(t,e,i,n,l,c,o,a,u)}export{ie as detectAvailableProfiles};
