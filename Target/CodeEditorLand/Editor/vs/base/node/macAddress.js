import{networkInterfaces as f}from"os";const o=new Set(["00:00:00:00:00:00","ff:ff:ff:ff:ff:ff","ac:de:48:00:11:22"]);function a(e){const t=e.replace(/\-/g,":").toLowerCase();return!o.has(t)}function s(){const e=f();for(const t in e){const n=e[t];if(n){for(const{mac:r}of n)if(a(r))return r}}throw new Error("Unable to retrieve mac address (unexpected format)")}export{s as getMac};