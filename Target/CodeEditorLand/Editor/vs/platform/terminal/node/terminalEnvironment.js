import*as w from"os";import{FileAccess as T}from"../../../../vs/base/common/network.js";import{getCaseInsensitive as y}from"../../../../vs/base/common/objects.js";import*as o from"../../../../vs/base/common/path.js";import{isMacintosh as O,isWindows as S}from"../../../../vs/base/common/platform.js";import*as P from"../../../../vs/base/common/process.js";import{format as b}from"../../../../vs/base/common/strings.js";import{isString as _}from"../../../../vs/base/common/types.js";import*as j from"../../../../vs/base/node/pfs.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/product/common/productService.js";import{EnvironmentVariableMutatorType as V}from"../../../../vs/platform/terminal/common/environmentVariable.js";import{MergedEnvironmentVariableCollection as z}from"../../../../vs/platform/terminal/common/environmentVariableCollection.js";import{deserializeEnvironmentVariableCollections as k}from"../../../../vs/platform/terminal/common/environmentVariableShared.js";import"../../../../vs/platform/terminal/common/terminal.js";function Z(){const n=/(\d+)\.(\d+)\.(\d+)/g.exec(w.release());let i=0;return n&&n.length===4&&(i=parseInt(n[3])),i}async function te(n,i,u,f=P.env,a=j.Promises.exists){if(o.isAbsolute(n))return await a(n)?n:void 0;if(i===void 0&&(i=P.cwd()),o.dirname(n)!=="."){const s=o.join(i,n);return await a(s)?s:void 0}const r=y(f,"PATH");if(u===void 0&&_(r)&&(u=r.split(o.delimiter)),u===void 0||u.length===0){const s=o.join(i,n);return await a(s)?s:void 0}for(const s of u){let e;if(o.isAbsolute(s)?e=o.join(s,n):e=o.join(i,s,n),await a(e))return e;if(S){let t=e+".com";if(await a(t)||(t=e+".exe",await a(t)))return t}}const h=o.join(i,n);return await a(h)?h:void 0}function ie(n,i,u,f,a){const d=S&&(!i.windowsEnableConpty||Z()<18309);if(!i.shellIntegration.enabled||!n.executable||n.isFeatureTerminal&&!n.forceShellIntegration||n.ignoreShellIntegration||d)return;const r=n.args,h=P.platform==="win32"?o.basename(n.executable).toLowerCase():o.basename(n.executable),s=o.dirname(T.asFileUri("").fsPath);let e;const t={VSCODE_INJECTION:"1"};if(i.shellIntegration.nonce&&(t.VSCODE_NONCE=i.shellIntegration.nonce),S){if(h==="pwsh.exe"||h==="powershell.exe")return!r||C(r)?e=l.get("windows-pwsh"):L(r)&&(e=l.get("windows-pwsh-login")),e?(e=[...e],e[e.length-1]=b(e[e.length-1],s,""),t.VSCODE_STABLE=a.quality==="stable"?"1":"0",i.shellIntegration.suggestEnabled&&(t.VSCODE_SUGGEST="1"),{newArgs:e,envMixin:t}):void 0;if(h==="bash.exe")return!r||r.length===0?e=l.get("bash"):x(r)&&(t.VSCODE_SHELL_LOGIN="1",I(i,t),e=l.get("bash")),e?(e=[...e],e[e.length-1]=b(e[e.length-1],s),t.VSCODE_STABLE=a.quality==="stable"?"1":"0",{newArgs:e,envMixin:t}):void 0;f.warn(`Shell integration cannot be enabled for executable "${n.executable}" and args`,n.args);return}switch(h){case"bash":return!r||r.length===0?e=l.get("bash"):x(r)&&(t.VSCODE_SHELL_LOGIN="1",I(i,t),e=l.get("bash")),e?(e=[...e],e[e.length-1]=b(e[e.length-1],s),t.VSCODE_STABLE=a.quality==="stable"?"1":"0",{newArgs:e,envMixin:t}):void 0;case"fish":{const g=u?.XDG_DATA_DIRS??"/usr/local/share:/usr/share",c=o.join(s,"out/vs/workbench/contrib/terminal/browser/media/fish_xdg_data");return t.XDG_DATA_DIRS=`${g}:${c}`,I(i,t),{newArgs:void 0,envMixin:t}}case"pwsh":return!r||C(r)?e=l.get("pwsh"):L(r)&&(e=l.get("pwsh-login")),e?(i.shellIntegration.suggestEnabled&&(t.VSCODE_SUGGEST="1"),e=[...e],e[e.length-1]=b(e[e.length-1],s,""),t.VSCODE_STABLE=a.quality==="stable"?"1":"0",{newArgs:e,envMixin:t}):void 0;case"zsh":{if(!r||r.length===0?e=l.get("zsh"):x(r)?(e=l.get("zsh-login"),I(i,t)):(r===l.get("zsh")||r===l.get("zsh-login"))&&(e=r),!e)return;e=[...e],e[e.length-1]=b(e[e.length-1],s);let g;try{g=w.userInfo().username}catch{g="unknown"}const c=o.join(w.tmpdir(),`${g}-${a.applicationName}-zsh`);t.ZDOTDIR=c;const D=u?.ZDOTDIR??w.homedir()??"~";t.USER_ZDOTDIR=D;const m=[];return m.push({source:o.join(s,"out/vs/workbench/contrib/terminal/browser/media/shellIntegration-rc.zsh"),dest:o.join(c,".zshrc")}),m.push({source:o.join(s,"out/vs/workbench/contrib/terminal/browser/media/shellIntegration-profile.zsh"),dest:o.join(c,".zprofile")}),m.push({source:o.join(s,"out/vs/workbench/contrib/terminal/browser/media/shellIntegration-env.zsh"),dest:o.join(c,".zshenv")}),m.push({source:o.join(s,"out/vs/workbench/contrib/terminal/browser/media/shellIntegration-login.zsh"),dest:o.join(c,".zlogin")}),{newArgs:e,envMixin:t,filesToCopy:m}}}f.warn(`Shell integration cannot be enabled for executable "${n.executable}" and args`,n.args)}function I(n,i){if(O&&n.environmentVariableCollections){const u=k(n.environmentVariableCollections),a=new z(u).getVariableMap({workspaceFolder:n.workspaceFolder}).get("PATH"),d=[];if(a)for(const r of a)r.type===V.Prepend&&d.push(r.value);d.length>0&&(i.VSCODE_PATH_PREFIX=d.join(""))}}var B=(h=>(h.WindowsPwsh="windows-pwsh",h.WindowsPwshLogin="windows-pwsh-login",h.Pwsh="pwsh",h.PwshLogin="pwsh-login",h.Zsh="zsh",h.ZshLogin="zsh-login",h.Bash="bash",h))(B||{});const l=new Map;l.set("windows-pwsh",["-noexit","-command",'try { . "{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1" } catch {}{1}']),l.set("windows-pwsh-login",["-l","-noexit","-command",'try { . "{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1" } catch {}{1}']),l.set("pwsh",["-noexit","-command",'. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"{1}']),l.set("pwsh-login",["-l","-noexit","-command",'. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"']),l.set("zsh",["-i"]),l.set("zsh-login",["-il"]),l.set("bash",["--init-file","{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh"]);const p=["-login","-l"],v=["--login","-l"],M=["-i","--interactive"],E=["-nol","-nologo"];function L(n){return typeof n=="string"?p.includes(n.toLowerCase()):n.length===1&&p.includes(n[0].toLowerCase())||n.length===2&&(p.includes(n[0].toLowerCase())||p.includes(n[1].toLowerCase()))&&(E.includes(n[0].toLowerCase())||E.includes(n[1].toLowerCase()))}function C(n){return typeof n=="string"?E.includes(n.toLowerCase()):n.length===0||n?.length===1&&E.includes(n[0].toLowerCase())}function x(n){return typeof n!="string"&&(n=n.filter(i=>!M.includes(i.toLowerCase()))),n==="string"&&v.includes(n.toLowerCase())||typeof n!="string"&&n.length===1&&v.includes(n[0].toLowerCase())}export{te as findExecutable,ie as getShellIntegrationInjection,Z as getWindowsBuildNumber};