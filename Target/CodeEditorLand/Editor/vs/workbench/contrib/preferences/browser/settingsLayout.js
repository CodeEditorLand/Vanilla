import{localize as e}from"../../../../nls.js";import"../common/preferences.js";const s=["files.autoSave","editor.fontSize","editor.fontFamily","editor.tabSize","editor.renderWhitespace","editor.cursorStyle","editor.multiCursorModifier","editor.insertSpaces","editor.wordWrap","files.exclude","files.associations","workbench.editor.enablePreview"];function a(i){return{id:"commonlyUsed",label:e("commonlyUsed","Commonly Used"),settings:i?.commonlyUsed??s}}const d={id:"root",label:"root",children:[{id:"editor",label:e("textEditor","Text Editor"),settings:["editor.*"],children:[{id:"editor/cursor",label:e("cursor","Cursor"),settings:["editor.cursor*"]},{id:"editor/find",label:e("find","Find"),settings:["editor.find.*"]},{id:"editor/font",label:e("font","Font"),settings:["editor.font*"]},{id:"editor/format",label:e("formatting","Formatting"),settings:["editor.format*"]},{id:"editor/diffEditor",label:e("diffEditor","Diff Editor"),settings:["diffEditor.*"]},{id:"editor/multiDiffEditor",label:e("multiDiffEditor","Multi-File Diff Editor"),settings:["multiDiffEditor.*"]},{id:"editor/minimap",label:e("minimap","Minimap"),settings:["editor.minimap.*"]},{id:"editor/suggestions",label:e("suggestions","Suggestions"),settings:["editor.*suggest*"]},{id:"editor/files",label:e("files","Files"),settings:["files.*"]}]},{id:"workbench",label:e("workbench","Workbench"),settings:["workbench.*"],children:[{id:"workbench/appearance",label:e("appearance","Appearance"),settings:["workbench.activityBar.*","workbench.*color*","workbench.fontAliasing","workbench.iconTheme","workbench.sidebar.location","workbench.*.visible","workbench.tips.enabled","workbench.tree.*","workbench.view.*"]},{id:"workbench/breadcrumbs",label:e("breadcrumbs","Breadcrumbs"),settings:["breadcrumbs.*"]},{id:"workbench/editor",label:e("editorManagement","Editor Management"),settings:["workbench.editor.*"]},{id:"workbench/settings",label:e("settings","Settings Editor"),settings:["workbench.settings.*"]},{id:"workbench/zenmode",label:e("zenMode","Zen Mode"),settings:["zenmode.*"]},{id:"workbench/screencastmode",label:e("screencastMode","Screencast Mode"),settings:["screencastMode.*"]}]},{id:"window",label:e("window","Window"),settings:["window.*"],children:[{id:"window/newWindow",label:e("newWindow","New Window"),settings:["window.*newwindow*"]}]},{id:"features",label:e("features","Features"),children:[{id:"features/accessibilitySignals",label:e("accessibility.signals","Accessibility Signals"),settings:["accessibility.signal*"]},{id:"features/accessibility",label:e("accessibility","Accessibility"),settings:["accessibility.*"]},{id:"features/explorer",label:e("fileExplorer","Explorer"),settings:["explorer.*","outline.*"]},{id:"features/search",label:e("search","Search"),settings:["search.*"]},{id:"features/debug",label:e("debug","Debug"),settings:["debug.*","launch"]},{id:"features/testing",label:e("testing","Testing"),settings:["testing.*"]},{id:"features/scm",label:e("scm","Source Control"),settings:["scm.*"]},{id:"features/extensions",label:e("extensions","Extensions"),settings:["extensions.*"]},{id:"features/terminal",label:e("terminal","Terminal"),settings:["terminal.*"]},{id:"features/task",label:e("task","Task"),settings:["task.*"]},{id:"features/problems",label:e("problems","Problems"),settings:["problems.*"]},{id:"features/output",label:e("output","Output"),settings:["output.*"]},{id:"features/comments",label:e("comments","Comments"),settings:["comments.*"]},{id:"features/remote",label:e("remote","Remote"),settings:["remote.*"]},{id:"features/timeline",label:e("timeline","Timeline"),settings:["timeline.*"]},{id:"features/notebook",label:e("notebook","Notebook"),settings:["notebook.*","interactiveWindow.*"]},{id:"features/mergeEditor",label:e("mergeEditor","Merge Editor"),settings:["mergeEditor.*"]},{id:"features/chat",label:e("chat","Chat"),settings:["chat.*","inlineChat.*"]},{id:"features/issueReporter",label:e("issueReporter","Issue Reporter"),settings:["issueReporter.*"]}]},{id:"application",label:e("application","Application"),children:[{id:"application/http",label:e("proxy","Proxy"),settings:["http.*"]},{id:"application/keyboard",label:e("keyboard","Keyboard"),settings:["keyboard.*"]},{id:"application/update",label:e("update","Update"),settings:["update.*"]},{id:"application/telemetry",label:e("telemetry","Telemetry"),settings:["telemetry.*"]},{id:"application/settingsSync",label:e("settingsSync","Settings Sync"),settings:["settingsSync.*"]},{id:"application/experimental",label:e("experimental","Experimental"),settings:["application.experimental.*"]},{id:"application/other",label:e("other","Other"),settings:["application.*"]}]},{id:"security",label:e("security","Security"),settings:["security.*"],children:[{id:"security/workspace",label:e("workspace","Workspace"),settings:["security.workspace.*"]}]}]},r=new Set;["css","html","scss","less","json","js","ts","ie","id","php","scm"].forEach(i=>r.add(i));const t=new Map;t.set("power shell","PowerShell"),t.set("powershell","PowerShell"),t.set("javascript","JavaScript"),t.set("typescript","TypeScript");export{a as getCommonlyUsedData,r as knownAcronyms,t as knownTermMappings,d as tocData};
