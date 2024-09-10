import{editorOverviewRulerBorder as s}from"../../../../editor/common/core/editorColorRegistry.js";import*as r from"../../../../nls.js";import{registerColor as e,editorFindMatch as n,editorFindMatchHighlight as l,overviewRulerFindMatchForeground as c,editorSelectionBackground as g,transparent as t,editorHoverHighlight as f}from"../../../../platform/theme/common/colorRegistry.js";import{EDITOR_DRAG_AND_DROP_BACKGROUND as u,PANEL_BORDER as m,TAB_ACTIVE_BORDER as R}from"../../../common/theme.js";const O=[],A=e("terminal.background",null,r.localize("terminal.background","The background color of the terminal, this allows coloring the terminal differently to the panel.")),B=e("terminal.foreground",{light:"#333333",dark:"#CCCCCC",hcDark:"#FFFFFF",hcLight:"#292929"},r.localize("terminal.foreground","The foreground color of the terminal.")),E=e("terminalCursor.foreground",null,r.localize("terminalCursor.foreground","The foreground color of the terminal cursor.")),T=e("terminalCursor.background",null,r.localize("terminalCursor.background","The background color of the terminal cursor. Allows customizing the color of a character overlapped by a block cursor.")),o=e("terminal.selectionBackground",g,r.localize("terminal.selectionBackground","The selection background color of the terminal.")),N=e("terminal.inactiveSelectionBackground",{light:t(o,.5),dark:t(o,.5),hcDark:t(o,.7),hcLight:t(o,.5)},r.localize("terminal.inactiveSelectionBackground","The selection background color of the terminal when it does not have focus.")),I=e("terminal.selectionForeground",{light:null,dark:null,hcDark:"#000000",hcLight:"#ffffff"},r.localize("terminal.selectionForeground","The selection foreground color of the terminal. When this is null the selection foreground will be retained and have the minimum contrast ratio feature applied.")),b=e("terminalCommandDecoration.defaultBackground",{light:"#00000040",dark:"#ffffff40",hcDark:"#ffffff80",hcLight:"#00000040"},r.localize("terminalCommandDecoration.defaultBackground","The default terminal command decoration background color.")),M=e("terminalCommandDecoration.successBackground",{dark:"#1B81A8",light:"#2090D3",hcDark:"#1B81A8",hcLight:"#007100"},r.localize("terminalCommandDecoration.successBackground","The terminal command decoration background color for successful commands.")),p=e("terminalCommandDecoration.errorBackground",{dark:"#F14C4C",light:"#E51400",hcDark:"#F14C4C",hcLight:"#B5200D"},r.localize("terminalCommandDecoration.errorBackground","The terminal command decoration background color for error commands.")),x=e("terminalOverviewRuler.cursorForeground","#A0A0A0CC",r.localize("terminalOverviewRuler.cursorForeground","The overview ruler cursor color.")),F=e("terminal.border",m,r.localize("terminal.border","The color of the border that separates split panes within the terminal. This defaults to panel.border.")),v=e("terminalOverviewRuler.border",s,r.localize("terminalOverviewRuler.border","The overview ruler left-side border color.")),G=e("terminal.findMatchBackground",{dark:n,light:n,hcDark:null,hcLight:"#0F4A85"},r.localize("terminal.findMatchBackground","Color of the current search match in the terminal. The color must not be opaque so as not to hide underlying terminal content."),!0),H=e("terminal.hoverHighlightBackground",t(f,.5),r.localize("terminal.findMatchHighlightBorder","Border color of the other search matches in the terminal.")),U=e("terminal.findMatchBorder",{dark:null,light:null,hcDark:"#f38518",hcLight:"#0F4A85"},r.localize("terminal.findMatchBorder","Border color of the current search match in the terminal.")),z=e("terminal.findMatchHighlightBackground",{dark:l,light:l,hcDark:null,hcLight:null},r.localize("terminal.findMatchHighlightBackground","Color of the other search matches in the terminal. The color must not be opaque so as not to hide underlying terminal content."),!0),w=e("terminal.findMatchHighlightBorder",{dark:null,light:null,hcDark:"#f38518",hcLight:"#0F4A85"},r.localize("terminal.findMatchHighlightBorder","Border color of the other search matches in the terminal.")),S=e("terminalOverviewRuler.findMatchForeground",{dark:c,light:c,hcDark:"#f38518",hcLight:"#0F4A85"},r.localize("terminalOverviewRuler.findMatchHighlightForeground","Overview ruler marker color for find matches in the terminal.")),K=e("terminal.dropBackground",u,r.localize("terminal.dragAndDropBackground","Background color when dragging on top of terminals. The color should have transparency so that the terminal contents can still shine through."),!0),V=e("terminal.tab.activeBorder",R,r.localize("terminal.tab.activeBorder","Border on the side of the terminal tab in the panel. This defaults to tab.activeBorder.")),y=e("terminal.initialHintForeground",{dark:"#ffffff56",light:"#0007",hcDark:null,hcLight:null},r.localize("terminalInitialHintForeground","Foreground color of the terminal initial hint.")),h={"terminal.ansiBlack":{index:0,defaults:{light:"#000000",dark:"#000000",hcDark:"#000000",hcLight:"#292929"}},"terminal.ansiRed":{index:1,defaults:{light:"#cd3131",dark:"#cd3131",hcDark:"#cd0000",hcLight:"#cd3131"}},"terminal.ansiGreen":{index:2,defaults:{light:"#107C10",dark:"#0DBC79",hcDark:"#00cd00",hcLight:"#136C13"}},"terminal.ansiYellow":{index:3,defaults:{light:"#949800",dark:"#e5e510",hcDark:"#cdcd00",hcLight:"#949800"}},"terminal.ansiBlue":{index:4,defaults:{light:"#0451a5",dark:"#2472c8",hcDark:"#0000ee",hcLight:"#0451a5"}},"terminal.ansiMagenta":{index:5,defaults:{light:"#bc05bc",dark:"#bc3fbc",hcDark:"#cd00cd",hcLight:"#bc05bc"}},"terminal.ansiCyan":{index:6,defaults:{light:"#0598bc",dark:"#11a8cd",hcDark:"#00cdcd",hcLight:"#0598bc"}},"terminal.ansiWhite":{index:7,defaults:{light:"#555555",dark:"#e5e5e5",hcDark:"#e5e5e5",hcLight:"#555555"}},"terminal.ansiBrightBlack":{index:8,defaults:{light:"#666666",dark:"#666666",hcDark:"#7f7f7f",hcLight:"#666666"}},"terminal.ansiBrightRed":{index:9,defaults:{light:"#cd3131",dark:"#f14c4c",hcDark:"#ff0000",hcLight:"#cd3131"}},"terminal.ansiBrightGreen":{index:10,defaults:{light:"#14CE14",dark:"#23d18b",hcDark:"#00ff00",hcLight:"#00bc00"}},"terminal.ansiBrightYellow":{index:11,defaults:{light:"#b5ba00",dark:"#f5f543",hcDark:"#ffff00",hcLight:"#b5ba00"}},"terminal.ansiBrightBlue":{index:12,defaults:{light:"#0451a5",dark:"#3b8eea",hcDark:"#5c5cff",hcLight:"#0451a5"}},"terminal.ansiBrightMagenta":{index:13,defaults:{light:"#bc05bc",dark:"#d670d6",hcDark:"#ff00ff",hcLight:"#bc05bc"}},"terminal.ansiBrightCyan":{index:14,defaults:{light:"#0598bc",dark:"#29b8db",hcDark:"#00ffff",hcLight:"#0598bc"}},"terminal.ansiBrightWhite":{index:15,defaults:{light:"#a5a5a5",dark:"#e5e5e5",hcDark:"#ffffff",hcLight:"#a5a5a5"}}};function W(){for(const a in h){const i=h[a],d=a.substring(13);O[i.index]=e(a,i.defaults,r.localize("terminal.ansiColor","'{0}' ANSI color in the terminal.",d))}}export{A as TERMINAL_BACKGROUND_COLOR,F as TERMINAL_BORDER_COLOR,b as TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR,p as TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR,M as TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR,T as TERMINAL_CURSOR_BACKGROUND_COLOR,E as TERMINAL_CURSOR_FOREGROUND_COLOR,K as TERMINAL_DRAG_AND_DROP_BACKGROUND,G as TERMINAL_FIND_MATCH_BACKGROUND_COLOR,U as TERMINAL_FIND_MATCH_BORDER_COLOR,z as TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR,w as TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR,B as TERMINAL_FOREGROUND_COLOR,H as TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR,N as TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR,y as TERMINAL_INITIAL_HINT_FOREGROUND,v as TERMINAL_OVERVIEW_RULER_BORDER_COLOR,x as TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR,S as TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR,o as TERMINAL_SELECTION_BACKGROUND_COLOR,I as TERMINAL_SELECTION_FOREGROUND_COLOR,V as TERMINAL_TAB_ACTIVE_BORDER,O as ansiColorIdentifiers,h as ansiColorMap,W as registerColors};
