import{OS as e,OperatingSystem as t}from"../../../base/common/platform.js";import*as r from"../../../nls.js";import{Extensions as l,ConfigurationScope as n}from"../../configuration/common/configurationRegistry.js";import{Registry as s}from"../../registry/common/platform.js";var c=(o=>(o[o.Code=0]="Code",o[o.KeyCode=1]="KeyCode",o))(c||{});function u(a){const i=a.getValue("keyboard"),o=i?.dispatch==="keyCode"?1:0,d=!!i?.mapAltGrToCtrlAlt;return{dispatch:o,mapAltGrToCtrlAlt:d}}const p=s.as(l.Configuration),C={id:"keyboard",order:15,type:"object",title:r.localize("keyboardConfigurationTitle","Keyboard"),properties:{"keyboard.dispatch":{scope:n.APPLICATION,type:"string",enum:["code","keyCode"],default:"code",markdownDescription:r.localize("dispatch","Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),included:e===t.Macintosh||e===t.Linux},"keyboard.mapAltGrToCtrlAlt":{scope:n.APPLICATION,type:"boolean",default:!1,markdownDescription:r.localize("mapAltGrToCtrlAlt","Controls if the AltGraph+ modifier should be treated as Ctrl+Alt+."),included:e===t.Windows}}};p.registerConfiguration(C);export{c as DispatchConfig,u as readKeyboardConfig};
