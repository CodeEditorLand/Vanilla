import{env as n}from"./process.js";var D=(e=>(e.UNKNOWN="UNKNOWN",e.CINNAMON="CINNAMON",e.DEEPIN="DEEPIN",e.GNOME="GNOME",e.KDE3="KDE3",e.KDE4="KDE4",e.KDE5="KDE5",e.KDE6="KDE6",e.PANTHEON="PANTHEON",e.UNITY="UNITY",e.XFCE="XFCE",e.UKUI="UKUI",e.LXQT="LXQT",e))(D||{});const i="XDG_CURRENT_DESKTOP",E="KDE_SESSION_VERSION";function c(){const s=n[i];if(s){const N=s.split(":").map(t=>t.trim()).filter(t=>t.length>0);for(const t of N)switch(t){case"Unity":{const r=n.DESKTOP_SESSION;return r&&r.includes("gnome-fallback")?"GNOME":"UNITY"}case"Deepin":return"DEEPIN";case"GNOME":return"GNOME";case"X-Cinnamon":return"CINNAMON";case"KDE":{const r=n[E];return r==="5"?"KDE5":r==="6"?"KDE6":"KDE4"}case"Pantheon":return"PANTHEON";case"XFCE":return"XFCE";case"UKUI":return"UKUI";case"LXQt":return"LXQT"}}const o=n.DESKTOP_SESSION;if(o)switch(o){case"deepin":return"DEEPIN";case"gnome":case"mate":return"GNOME";case"kde4":case"kde-plasma":return"KDE4";case"kde":return E in n?"KDE4":"KDE3";case"xfce":case"xubuntu":return"XFCE";case"ukui":return"UKUI"}return"GNOME_DESKTOP_SESSION_ID"in n?"GNOME":"KDE_FULL_SESSION"in n?E in n?"KDE4":"KDE3":"UNKNOWN"}export{c as getDesktopEnvironment};
