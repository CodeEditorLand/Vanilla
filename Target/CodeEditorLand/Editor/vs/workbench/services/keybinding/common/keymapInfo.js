import{isWindows as r,isLinux as h}from"../../../../base/common/platform.js";import{getKeyboardLayoutId as s}from"../../../../platform/keyboardLayout/common/keyboardLayout.js";function c(u){const e=u,t={};for(const i in e){const a=e[i];if(a.length){const o=a[0],l=a[1],p=a[2],d=a[3],n=Number(a[4]),f=a.length===6?a[5]:void 0;t[i]={value:o,vkey:f,withShift:l,withAltGr:p,withShiftAltGr:d,valueIsDeadKey:(n&1)>0,withShiftIsDeadKey:(n&2)>0,withAltGrIsDeadKey:(n&4)>0,withShiftAltGrIsDeadKey:(n&8)>0}}else t[i]={value:"",valueIsDeadKey:!1,withShift:"",withShiftIsDeadKey:!1,withAltGr:"",withAltGrIsDeadKey:!1,withShiftAltGr:"",withShiftAltGrIsDeadKey:!1}}return t}class y{constructor(e,t,i,a){this.layout=e;this.secondaryLayouts=t;this.mapping=c(i),this.isUserKeyboardLayout=!!a,this.layout.isUserKeyboardLayout=!!a}mapping;isUserKeyboardLayout;static createKeyboardLayoutFromDebugInfo(e,t,i){const a=new y(e,[],{},!0);return a.mapping=t,a}update(e){this.layout=e.layout,this.secondaryLayouts=e.secondaryLayouts,this.mapping=e.mapping,this.isUserKeyboardLayout=e.isUserKeyboardLayout,this.layout.isUserKeyboardLayout=e.isUserKeyboardLayout}getScore(e){let t=0;for(const i in e){if(r&&(i==="Backslash"||i==="KeyQ")||h&&(i==="Backspace"||i==="Escape"))continue;const a=this.mapping[i];a===void 0&&(t-=1);const o=e[i];a&&o&&a.value!==o.value&&(t-=1)}return t}equal(e){return this.isUserKeyboardLayout!==e.isUserKeyboardLayout||s(this.layout)!==s(e.layout)?!1:this.fuzzyEqual(e.mapping)}fuzzyEqual(e){for(const t in e){if(r&&(t==="Backslash"||t==="KeyQ"))continue;if(this.mapping[t]===void 0)return!1;const i=this.mapping[t],a=e[t];if(i.value!==a.value)return!1}return!0}}export{y as KeymapInfo};
