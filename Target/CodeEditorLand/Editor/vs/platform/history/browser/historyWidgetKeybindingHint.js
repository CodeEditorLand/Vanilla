import"../../../../vs/platform/keybinding/common/keybinding.js";function n(o){return o.lookupKeybinding("history.showPrevious")?.getElectronAccelerator()==="Up"&&o.lookupKeybinding("history.showNext")?.getElectronAccelerator()==="Down"}export{n as showHistoryKeybindingHint};