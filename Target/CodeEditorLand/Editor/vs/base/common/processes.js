import{isLinux as c}from"../../../vs/base/common/platform.js";var a=(t=>(t[t.stdout=0]="stdout",t[t.stderr=1]="stderr",t))(a||{}),m=(r=>(r[r.Success=0]="Success",r[r.Unknown=1]="Unknown",r[r.AccessDenied=2]="AccessDenied",r[r.ProcessNotFound=3]="ProcessNotFound",r))(m||{});function u(n,...i){const t=i.reduce((e,o)=>(e[o]=!0,e),{}),s=[/^ELECTRON_.+$/,/^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,/^SNAP(|_.*)$/,/^GDK_PIXBUF_.+$/];Object.keys(n).filter(e=>!t[e]).forEach(e=>{for(let o=0;o<s.length;o++)if(e.search(s[o])!==-1){delete n[e];break}})}function f(n){n&&(delete n.DEBUG,c&&delete n.LD_PRELOAD)}export{a as Source,m as TerminateResponseCode,f as removeDangerousEnvVariables,u as sanitizeProcessEnvironment};