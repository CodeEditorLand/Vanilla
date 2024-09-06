import*as e from"../../../../../vs/nls.js";import{activeContrastBorder as n,contrastBorder as r}from"../../../../../vs/platform/theme/common/colors/baseColors.js";import{selectBackground as t,selectForeground as c}from"../../../../../vs/platform/theme/common/colors/inputColors.js";import{listActiveSelectionBackground as u,listActiveSelectionForeground as l}from"../../../../../vs/platform/theme/common/colors/listColors.js";import{registerColor as o}from"../../../../../vs/platform/theme/common/colorUtils.js";const s=o("menu.border",{dark:null,light:null,hcDark:r,hcLight:r},e.localize("menuBorder","Border color of menus.")),g=o("menu.foreground",c,e.localize("menuForeground","Foreground color of menu items.")),B=o("menu.background",t,e.localize("menuBackground","Background color of menu items.")),k=o("menu.selectionForeground",l,e.localize("menuSelectionForeground","Foreground color of the selected menu item in menus.")),p=o("menu.selectionBackground",u,e.localize("menuSelectionBackground","Background color of the selected menu item in menus.")),h=o("menu.selectionBorder",{dark:null,light:null,hcDark:n,hcLight:n},e.localize("menuSelectionBorder","Border color of the selected menu item in menus.")),f=o("menu.separatorBackground",{dark:"#606060",light:"#D4D4D4",hcDark:r,hcLight:r},e.localize("menuSeparatorBackground","Color of a separator menu item in menus."));export{B as menuBackground,s as menuBorder,g as menuForeground,p as menuSelectionBackground,h as menuSelectionBorder,k as menuSelectionForeground,f as menuSeparatorBackground};
