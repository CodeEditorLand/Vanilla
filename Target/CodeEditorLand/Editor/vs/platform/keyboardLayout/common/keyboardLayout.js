import{ScanCode as i,ScanCodeUtils as y}from"../../../base/common/keyCodes.js";import{createDecorator as d}from"../../instantiation/common/instantiation.js";const f=d("keyboardLayoutService");function s(e,o){return!e||!o?!1:!!(e.name&&o.name&&e.name===o.name||e.id&&o.id&&e.id===o.id||e.model&&o.model&&e.model===o.model&&e.layout===o.layout)}function K(e){if(!e)return{label:"",description:""};if(e.name)return{label:e.text,description:""};if(e.id){const n=e;return n.localizedName?{label:n.localizedName,description:""}:/^com\.apple\.keylayout\./.test(n.id)?{label:n.id.replace(/^com\.apple\.keylayout\./,"").replace(/-/," "),description:""}:/^.*inputmethod\./.test(n.id)?{label:n.id.replace(/^.*inputmethod\./,"").replace(/[-.]/," "),description:`Input Method (${n.lang})`}:{label:n.lang,description:""}}return{label:e.layout,description:""}}function c(e){return e.name?e.name:e.id?e.id:e.layout}function u(e,o){return!e&&!o?!0:!e||!o?!1:e.vkey===o.vkey&&e.value===o.value&&e.withShift===o.withShift&&e.withAltGr===o.withAltGr&&e.withShiftAltGr===o.withShiftAltGr}function L(e,o){if(!e&&!o)return!0;if(!e||!o)return!1;for(let n=0;n<i.MAX_VALUE;n++){const t=y.toString(n),r=e[t],a=o[t];if(!u(r,a))return!1}return!0}function p(e,o){return!e&&!o?!0:!e||!o?!1:e.value===o.value&&e.withShift===o.withShift&&e.withAltGr===o.withAltGr&&e.withShiftAltGr===o.withShiftAltGr}function g(e,o){if(!e&&!o)return!0;if(!e||!o)return!1;for(let n=0;n<i.MAX_VALUE;n++){const t=y.toString(n),r=e[t],a=o[t];if(!p(r,a))return!1}return!0}export{f as IKeyboardLayoutService,s as areKeyboardLayoutsEqual,c as getKeyboardLayoutId,g as macLinuxKeyboardMappingEquals,K as parseKeyboardLayoutDescription,L as windowsKeyboardMappingEquals};
