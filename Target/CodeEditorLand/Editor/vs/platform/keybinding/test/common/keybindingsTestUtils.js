import{decodeKeybinding as t}from"../../../../base/common/keybindings.js";import"../../../../base/common/platform.js";import{USLayoutResolvedKeybinding as d}from"../../common/usLayoutResolvedKeybinding.js";function y(e,n){if(e===0)return;const i=t(e,n);if(!i)return;const r=d.resolveKeybinding(i,n);if(r.length>0)return r[0]}export{y as createUSLayoutResolvedKeybinding};
