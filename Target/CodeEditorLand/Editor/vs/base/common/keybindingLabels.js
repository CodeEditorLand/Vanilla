import{OperatingSystem as y}from"./platform.js";import*as e from"../../nls.js";class n{modifierLabels;constructor(r,t,o=t){this.modifierLabels=[null],this.modifierLabels[y.Macintosh]=r,this.modifierLabels[y.Windows]=t,this.modifierLabels[y.Linux]=o}toLabel(r,t,o){if(t.length===0)return null;const s=[];for(let l=0,f=t.length;l<f;l++){const a=t[l],h=o(a);if(h===null)return null;s[l]=m(a,h,this.modifierLabels[r])}return s.join(" ")}}const k=new n({ctrlKey:"\u2303",shiftKey:"\u21E7",altKey:"\u2325",metaKey:"\u2318",separator:""},{ctrlKey:e.localize({key:"ctrlKey",comment:["This is the short form for the Control key on the keyboard"]},"Ctrl"),shiftKey:e.localize({key:"shiftKey",comment:["This is the short form for the Shift key on the keyboard"]},"Shift"),altKey:e.localize({key:"altKey",comment:["This is the short form for the Alt key on the keyboard"]},"Alt"),metaKey:e.localize({key:"windowsKey",comment:["This is the short form for the Windows key on the keyboard"]},"Windows"),separator:"+"},{ctrlKey:e.localize({key:"ctrlKey",comment:["This is the short form for the Control key on the keyboard"]},"Ctrl"),shiftKey:e.localize({key:"shiftKey",comment:["This is the short form for the Shift key on the keyboard"]},"Shift"),altKey:e.localize({key:"altKey",comment:["This is the short form for the Alt key on the keyboard"]},"Alt"),metaKey:e.localize({key:"superKey",comment:["This is the short form for the Super key on the keyboard"]},"Super"),separator:"+"}),p=new n({ctrlKey:e.localize({key:"ctrlKey.long",comment:["This is the long form for the Control key on the keyboard"]},"Control"),shiftKey:e.localize({key:"shiftKey.long",comment:["This is the long form for the Shift key on the keyboard"]},"Shift"),altKey:e.localize({key:"optKey.long",comment:["This is the long form for the Alt/Option key on the keyboard"]},"Option"),metaKey:e.localize({key:"cmdKey.long",comment:["This is the long form for the Command key on the keyboard"]},"Command"),separator:"+"},{ctrlKey:e.localize({key:"ctrlKey.long",comment:["This is the long form for the Control key on the keyboard"]},"Control"),shiftKey:e.localize({key:"shiftKey.long",comment:["This is the long form for the Shift key on the keyboard"]},"Shift"),altKey:e.localize({key:"altKey.long",comment:["This is the long form for the Alt key on the keyboard"]},"Alt"),metaKey:e.localize({key:"windowsKey.long",comment:["This is the long form for the Windows key on the keyboard"]},"Windows"),separator:"+"},{ctrlKey:e.localize({key:"ctrlKey.long",comment:["This is the long form for the Control key on the keyboard"]},"Control"),shiftKey:e.localize({key:"shiftKey.long",comment:["This is the long form for the Shift key on the keyboard"]},"Shift"),altKey:e.localize({key:"altKey.long",comment:["This is the long form for the Alt key on the keyboard"]},"Alt"),metaKey:e.localize({key:"superKey.long",comment:["This is the long form for the Super key on the keyboard"]},"Super"),separator:"+"}),g=new n({ctrlKey:"Ctrl",shiftKey:"Shift",altKey:"Alt",metaKey:"Cmd",separator:"+"},{ctrlKey:"Ctrl",shiftKey:"Shift",altKey:"Alt",metaKey:"Super",separator:"+"}),b=new n({ctrlKey:"ctrl",shiftKey:"shift",altKey:"alt",metaKey:"cmd",separator:"+"},{ctrlKey:"ctrl",shiftKey:"shift",altKey:"alt",metaKey:"win",separator:"+"},{ctrlKey:"ctrl",shiftKey:"shift",altKey:"alt",metaKey:"meta",separator:"+"});function m(i,r,t){if(r===null)return"";const o=[];return i.ctrlKey&&o.push(t.ctrlKey),i.shiftKey&&o.push(t.shiftKey),i.altKey&&o.push(t.altKey),i.metaKey&&o.push(t.metaKey),r!==""&&o.push(r),o.join(t.separator)}export{p as AriaLabelProvider,g as ElectronAcceleratorLabelProvider,n as ModifierLabelProvider,k as UILabelProvider,b as UserSettingsLabelProvider};
