import{sequence as r}from"../../../../base/common/async.js";import{Schemas as o}from"../../../../base/common/network.js";function a(t,s,m){if(t.length)r(t.map(e=>async()=>{(e.scheme===o.file||e.scheme===o.vscodeUserData)&&s.showItemInFolder(e.with({scheme:o.file}).fsPath)}));else if(m.getWorkspace().folders.length){const e=m.getWorkspace().folders[0].uri;e.scheme===o.file&&s.showItemInFolder(e.fsPath)}}export{a as revealResourcesInOS};
