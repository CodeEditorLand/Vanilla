import{Keybinding as i,KeyCodeChord as l}from"../../../../../vs/base/common/keybindings.js";import"../../../../../vs/base/common/platform.js";import"../../../../../vs/platform/keybinding/common/keybinding.js";import{USLayoutResolvedKeybinding as n}from"../../../../../vs/platform/keybinding/common/usLayoutResolvedKeybinding.js";import"../../../../../vs/platform/keyboardLayout/common/keyboardMapper.js";class h{constructor(e,r){this._mapAltGrToCtrlAlt=e;this._OS=r}dumpDebugInfo(){return"FallbackKeyboardMapper dispatching on keyCode"}resolveKeyboardEvent(e){const r=e.ctrlKey||this._mapAltGrToCtrlAlt&&e.altGraphKey,t=e.altKey||this._mapAltGrToCtrlAlt&&e.altGraphKey,o=new l(r,e.shiftKey,t,e.metaKey,e.keyCode);return this.resolveKeybinding(new i([o]))[0]}resolveKeybinding(e){return n.resolveKeybinding(e,this._OS)}}export{h as FallbackKeyboardMapper};