import{Menu as c,MenuItem as i}from"electron";import{CONTEXT_MENU_CHANNEL as d,CONTEXT_MENU_CLOSE_CHANNEL as o}from"../../../../../vs/base/parts/contextmenu/common/contextmenu.js";import{validatedIpcMain as s}from"../../../../../vs/base/parts/ipc/electron-main/ipcMain.js";function x(){s.on(d,(r,a,u,t,e)=>{const n=l(r,t,u);n.popup({x:e?e.x:void 0,y:e?e.y:void 0,positioningItem:e?e.positioningItem:void 0,callback:()=>{n&&r.sender.send(o,a)}})})}function l(r,a,u){const t=new c;return u.forEach(e=>{let n;e.type==="separator"?n=new i({type:e.type}):Array.isArray(e.submenu)?n=new i({submenu:l(r,a,e.submenu),label:e.label}):n=new i({label:e.label,type:e.type,accelerator:e.accelerator,checked:e.checked,enabled:e.enabled,visible:e.visible,click:(I,b,p)=>r.sender.send(a,e.id,p)}),t.append(n)}),t}export{x as registerContextMenuListener};