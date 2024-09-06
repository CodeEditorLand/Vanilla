import*as r from"../../../../../vs/nls.js";import{foreground as e}from"../../../../../vs/platform/theme/common/colors/baseColors.js";import{editorErrorForeground as t,editorInfoForeground as a,editorWarningForeground as s}from"../../../../../vs/platform/theme/common/colors/editorColors.js";import{minimapFindMatch as c}from"../../../../../vs/platform/theme/common/colors/minimapColors.js";import{registerColor as o,transparent as i}from"../../../../../vs/platform/theme/common/colorUtils.js";const d=o("charts.foreground",e,r.localize("chartsForeground","The foreground color used in charts.")),p=o("charts.lines",i(e,.5),r.localize("chartsLines","The color used for horizontal lines in charts.")),g=o("charts.red",t,r.localize("chartsRed","The red color used in chart visualizations.")),z=o("charts.blue",a,r.localize("chartsBlue","The blue color used in chart visualizations.")),m=o("charts.yellow",s,r.localize("chartsYellow","The yellow color used in chart visualizations.")),f=o("charts.orange",c,r.localize("chartsOrange","The orange color used in chart visualizations.")),x=o("charts.green",{dark:"#89D185",light:"#388A34",hcDark:"#89D185",hcLight:"#374e06"},r.localize("chartsGreen","The green color used in chart visualizations.")),D=o("charts.purple",{dark:"#B180D7",light:"#652D90",hcDark:"#B180D7",hcLight:"#652D90"},r.localize("chartsPurple","The purple color used in chart visualizations."));export{z as chartsBlue,d as chartsForeground,x as chartsGreen,p as chartsLines,f as chartsOrange,D as chartsPurple,g as chartsRed,m as chartsYellow};
