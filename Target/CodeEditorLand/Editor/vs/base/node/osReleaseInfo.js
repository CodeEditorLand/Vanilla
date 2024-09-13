import{constants as l,promises as I}from"fs";import{createInterface as f}from"readline";import*as a from"../common/platform.js";async function m(o){if(a.isMacintosh||a.isWindows)return;let r;for(const s of["/etc/os-release","/usr/lib/os-release","/etc/lsb-release"])try{r=await I.open(s,l.R_OK);break}catch{}if(!r){o("Unable to retrieve release information from known identifier paths.");return}try{const s=new Set(["ID","DISTRIB_ID","ID_LIKE","VERSION_ID","DISTRIB_RELEASE"]),i={id:"unknown"};for await(const n of f({input:r.createReadStream(),crlfDelay:Number.POSITIVE_INFINITY})){if(!n.includes("="))continue;const e=n.split("=")[0].toUpperCase().trim();if(s.has(e)){const t=n.split("=")[1].replace(/"/g,"").toLowerCase().trim();e==="ID"||e==="DISTRIB_ID"?i.id=t:e==="ID_LIKE"?i.id_like=t:(e==="VERSION_ID"||e==="DISTRIB_RELEASE")&&(i.version_id=t)}}return i}catch(s){o(s)}}export{m as getOSReleaseInfo};
