class a{constructor(n,e){this.key=n;this.migrate=e}static items=[];apply(n){const e=a._read(n,this.key),i=s=>a._read(n,s),o=(s,f)=>a._write(n,s,f);this.migrate(e,i,o)}static _read(n,e){if(typeof n>"u")return;const i=e.indexOf(".");if(i>=0){const o=e.substring(0,i);return this._read(n[o],e.substring(i+1))}return n[e]}static _write(n,e,i){const o=e.indexOf(".");if(o>=0){const s=e.substring(0,o);n[s]=n[s]||{},this._write(n[s],e.substring(o+1),i);return}n[e]=i}}function d(t,n){a.items.push(new a(t,n))}function r(t,n){d(t,(e,i,o)=>{if(typeof e<"u"){for(const[s,f]of n)if(e===s){o(t,f);return}}})}function g(t){a.items.forEach(n=>n.apply(t))}r("wordWrap",[[!0,"on"],[!1,"off"]]),r("lineNumbers",[[!0,"on"],[!1,"off"]]),r("cursorBlinking",[["visible","solid"]]),r("renderWhitespace",[[!0,"boundary"],[!1,"none"]]),r("renderLineHighlight",[[!0,"line"],[!1,"none"]]),r("acceptSuggestionOnEnter",[[!0,"on"],[!1,"off"]]),r("tabCompletion",[[!1,"off"],[!0,"onlySnippets"]]),r("hover",[[!0,{enabled:!0}],[!1,{enabled:!1}]]),r("parameterHints",[[!0,{enabled:!0}],[!1,{enabled:!1}]]),r("autoIndent",[[!1,"advanced"],[!0,"full"]]),r("matchBrackets",[[!0,"always"],[!1,"never"]]),r("renderFinalNewline",[[!0,"on"],[!1,"off"]]),r("cursorSmoothCaretAnimation",[[!0,"on"],[!1,"off"]]),r("occurrencesHighlight",[[!0,"singleFile"],[!1,"off"]]),r("wordBasedSuggestions",[[!0,"matchingDocuments"],[!1,"off"]]),d("autoClosingBrackets",(t,n,e)=>{t===!1&&(e("autoClosingBrackets","never"),typeof n("autoClosingQuotes")>"u"&&e("autoClosingQuotes","never"),typeof n("autoSurround")>"u"&&e("autoSurround","never"))}),d("renderIndentGuides",(t,n,e)=>{typeof t<"u"&&(e("renderIndentGuides",void 0),typeof n("guides.indentation")>"u"&&e("guides.indentation",!!t))}),d("highlightActiveIndentGuide",(t,n,e)=>{typeof t<"u"&&(e("highlightActiveIndentGuide",void 0),typeof n("guides.highlightActiveIndentation")>"u"&&e("guides.highlightActiveIndentation",!!t))});const u={method:"showMethods",function:"showFunctions",constructor:"showConstructors",deprecated:"showDeprecated",field:"showFields",variable:"showVariables",class:"showClasses",struct:"showStructs",interface:"showInterfaces",module:"showModules",property:"showProperties",event:"showEvents",operator:"showOperators",unit:"showUnits",value:"showValues",constant:"showConstants",enum:"showEnums",enumMember:"showEnumMembers",keyword:"showKeywords",text:"showWords",color:"showColors",file:"showFiles",reference:"showReferences",folder:"showFolders",typeParameter:"showTypeParameters",snippet:"showSnippets"};d("suggest.filteredTypes",(t,n,e)=>{if(t&&typeof t=="object"){for(const i of Object.entries(u))t[i[0]]===!1&&typeof n(`suggest.${i[1]}`)>"u"&&e(`suggest.${i[1]}`,!1);e("suggest.filteredTypes",void 0)}}),d("quickSuggestions",(t,n,e)=>{if(typeof t=="boolean"){const i=t?"on":"off";e("quickSuggestions",{comments:i,strings:i,other:i})}}),d("experimental.stickyScroll.enabled",(t,n,e)=>{typeof t=="boolean"&&(e("experimental.stickyScroll.enabled",void 0),typeof n("stickyScroll.enabled")>"u"&&e("stickyScroll.enabled",t))}),d("experimental.stickyScroll.maxLineCount",(t,n,e)=>{typeof t=="number"&&(e("experimental.stickyScroll.maxLineCount",void 0),typeof n("stickyScroll.maxLineCount")>"u"&&e("stickyScroll.maxLineCount",t))}),d("codeActionsOnSave",(t,n,e)=>{if(t&&typeof t=="object"){let i=!1;const o={};for(const s of Object.entries(t))typeof s[1]=="boolean"?(i=!0,o[s[0]]=s[1]?"explicit":"never"):o[s[0]]=s[1];i&&e("codeActionsOnSave",o)}}),d("codeActionWidget.includeNearbyQuickfixes",(t,n,e)=>{typeof t=="boolean"&&(e("codeActionWidget.includeNearbyQuickfixes",void 0),typeof n("codeActionWidget.includeNearbyQuickFixes")>"u"&&e("codeActionWidget.includeNearbyQuickFixes",t))}),d("lightbulb.enabled",(t,n,e)=>{typeof t=="boolean"&&e("lightbulb.enabled",t?void 0:"off")});export{a as EditorSettingMigration,g as migrateOptions};
