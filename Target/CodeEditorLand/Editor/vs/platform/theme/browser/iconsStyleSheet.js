import{asCSSPropertyValue as u,asCSSUrl as p}from"../../../../vs/base/browser/dom.js";import{Emitter as g}from"../../../../vs/base/common/event.js";import{DisposableStore as $}from"../../../../vs/base/common/lifecycle.js";import{ThemeIcon as y}from"../../../../vs/base/common/themables.js";import{getIconRegistry as l}from"../../../../vs/platform/theme/common/iconRegistry.js";import"../../../../vs/platform/theme/common/themeService.js";function V(c){const i=new $,r=i.add(new g),t=l();return i.add(t.onDidChange(()=>r.fire())),c&&i.add(c.onDidProductIconThemeChange(()=>r.fire())),{dispose:()=>i.dispose(),onDidChange:r.event,getCSS(){const d=c?c.getProductIconTheme():new C,m={},s=[],h=[];for(const n of t.getIcons()){const o=d.getIcon(n);if(!o)continue;const e=o.font,f=`--vscode-icon-${n.id}-font-family`,a=`--vscode-icon-${n.id}-content`;e?(m[e.id]=e.definition,h.push(`${f}: ${u(e.id)};`,`${a}: '${o.fontCharacter}';`),s.push(`.codicon-${n.id}:before { content: '${o.fontCharacter}'; font-family: ${u(e.id)}; }`)):(h.push(`${a}: '${o.fontCharacter}'; ${f}: 'codicon';`),s.push(`.codicon-${n.id}:before { content: '${o.fontCharacter}'; }`))}for(const n in m){const o=m[n],e=o.weight?`font-weight: ${o.weight};`:"",f=o.style?`font-style: ${o.style};`:"",a=o.src.map(I=>`${p(I.location)} format('${I.format}')`).join(", ");s.push(`@font-face { src: ${a}; font-family: ${u(n)};${e}${f} font-display: block; }`)}return s.push(`:root { ${h.join(" ")} }`),s.join(`
`)}}}class C{getIcon(i){const r=l();let t=i.defaults;for(;y.isThemeIcon(t);){const d=r.getIcon(t.id);if(!d)return;t=d.defaults}return t}}export{C as UnthemedProductIconTheme,V as getIconsStyleSheet};
