import{illegalArgument as r}from"../../../base/common/errors.js";import{AriaLabelProvider as i,ElectronAcceleratorLabelProvider as s,UILabelProvider as o,UserSettingsLabelProvider as l}from"../../../base/common/keybindingLabels.js";import{ResolvedChord as n,ResolvedKeybinding as a}from"../../../base/common/keybindings.js";class b extends a{_os;_chords;constructor(e,t){if(super(),t.length===0)throw r("chords");this._os=e,this._chords=t}getLabel(){return o.toLabel(this._os,this._chords,e=>this._getLabel(e))}getAriaLabel(){return i.toLabel(this._os,this._chords,e=>this._getAriaLabel(e))}getElectronAccelerator(){return this._chords.length>1||this._chords[0].isDuplicateModifierCase()?null:s.toLabel(this._os,this._chords,e=>this._getElectronAccelerator(e))}getUserSettingsLabel(){return l.toLabel(this._os,this._chords,e=>this._getUserSettingsLabel(e))}isWYSIWYG(){return this._chords.every(e=>this._isWYSIWYG(e))}hasMultipleChords(){return this._chords.length>1}getChords(){return this._chords.map(e=>this._getChord(e))}_getChord(e){return new n(e.ctrlKey,e.shiftKey,e.altKey,e.metaKey,this._getLabel(e),this._getAriaLabel(e))}getDispatchChords(){return this._chords.map(e=>this._getChordDispatch(e))}getSingleModifierDispatchChords(){return this._chords.map(e=>this._getSingleModifierChordDispatch(e))}}export{b as BaseResolvedKeybinding};
