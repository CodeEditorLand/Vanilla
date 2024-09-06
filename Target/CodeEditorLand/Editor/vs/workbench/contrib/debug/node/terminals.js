import*as g from"child_process";import{getDriveLetter as a}from"../../../../../vs/base/common/extpath.js";import*as m from"../../../../../vs/base/common/platform.js";function $(s,l){return new Promise((f,n)=>{let o="";const c=g.spawn(s,l);c.pid&&c.stdout.on("data",i=>{o+=i.toString()}),c.on("error",i=>{n(i)}),c.on("close",i=>{f(o)})})}async function h(s){if(s)if(m.isWindows){const l=await import("@vscode/windows-process-tree");return new Promise(f=>{l.getProcessTree(s,n=>{f(!!n&&n.children.length>0)})})}else return $("/usr/bin/pgrep",["-lP",String(s)]).then(l=>{const f=l.trim();return!(f.length===0||f.indexOf(" tmux")>=0)},l=>!0);return Promise.resolve(!0)}var p=(n=>(n[n.cmd=0]="cmd",n[n.powershell=1]="powershell",n[n.bash=2]="bash",n))(p||{});function b(s,l,f,n,o){s=s.trim().toLowerCase();let c;s.indexOf("powershell")>=0||s.indexOf("pwsh")>=0?c=1:s.indexOf("cmd.exe")>=0?c=0:s.indexOf("bash")>=0?c=2:m.isWindows?c=0:c=2;let i,t=" ";switch(c){case 1:if(i=e=>(e=e.replace(/\'/g,"''"),e.length>0&&e.charAt(e.length-1)==="\\"?`'${e}\\'`:`'${e}'`),n){const e=a(n);e&&(t+=`${e}:; `),t+=`cd ${i(n)}; `}if(o)for(const e in o){const r=o[e];r===null?t+=`Remove-Item env:${e}; `:t+=`\${env:${e}}='${r}'; `}if(l.length>0){const e=l.shift(),r=f?e:i(e);t+=r[0]==="'"?`& ${r} `:`${r} `;for(const u of l)t+=u==="<"||u===">"||f?u:i(u),t+=" "}break;case 0:if(i=e=>(e=e.replace(/\"/g,'""'),e=e.replace(/([><!^&|])/g,"^$1"),' "'.split("").some(r=>e.includes(r))||e.length===0?`"${e}"`:e),n){const e=a(n);e&&(t+=`${e}: && `),t+=`cd ${i(n)} && `}if(o){t+='cmd /C "';for(const e in o){let r=o[e];r===null?t+=`set "${e}=" && `:(r=r.replace(/[&^|<>]/g,u=>`^${u}`),t+=`set "${e}=${r}" && `)}}for(const e of l)t+=e==="<"||e===">"||f?e:i(e),t+=" ";o&&(t+='"');break;case 2:{i=r=>(r=r.replace(/(["'\\\$!><#()\[\]*&^| ;{}?`])/g,"\\$1"),r.length===0?'""':r);const e=r=>/[^\w@%\/+=,.:^-]/.test(r)?`'${r.replace(/'/g,"'\\''")}'`:r;if(n&&(t+=`cd ${i(n)} ; `),o){t+="/usr/bin/env";for(const r in o){const u=o[r];u===null?t+=` -u ${e(r)}`:t+=` ${e(`${r}=${u}`)}`}t+=" "}for(const r of l)t+=r==="<"||r===">"||f?r:i(r),t+=" ";break}}return t}export{h as hasChildProcesses,b as prepareCommand};
