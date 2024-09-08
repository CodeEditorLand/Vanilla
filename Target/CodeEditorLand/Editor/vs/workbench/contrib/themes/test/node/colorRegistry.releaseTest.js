import*as w from"fs";import{Registry as C}from"../../../../../platform/registry/common/platform.js";import{Extensions as y,asCssVariableName as O}from"../../../../../platform/theme/common/colorRegistry.js";import{asTextOrError as k}from"../../../../../platform/request/common/request.js";import*as x from"../../../../../base/node/pfs.js";import*as D from"../../../../../base/common/path.js";import d from"assert";import{CancellationToken as $}from"../../../../../base/common/cancellation.js";import{RequestService as j}from"../../../../../platform/request/node/requestService.js";import{TestConfigurationService as F}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../../workbench.desktop.main.js";import{NullLogger as R,NullLogService as P}from"../../../../../platform/log/common/log.js";import{mock as E}from"../../../../../base/test/common/mock.js";import"../../../../../platform/environment/common/environment.js";import{FileAccess as I}from"../../../../../base/common/network.js";const J=[],S="vscode-known-variables.json";suite("Color Registry",function(){test(`update colors in ${S}`,async function(){const n=I.asFileUri(`vs/../../build/lib/stylelint/${S}`).fsPath,s=(await w.promises.readFile(n)).toString(),r=JSON.parse(s),c=r.colors;d.ok(c&&c.length>0,"${knwonVariablesFileName} contains no color descriptions");const l=new Set(c),i=[],e=[],f=C.as(y.ColorContribution);for(const p of f.getColors()){const a=O(p.id);l.has(a)?l.delete(a):p.deprecationMessage||e.push(a),i.push(a)}const t=[...l.keys()];let m="";e.length>0&&(m+=`
Adding the following colors:

${JSON.stringify(e,void 0,"	")}
`),t.length>0&&(m+=`
Removing the following colors:

${t.join(`
`)}
`),m.length>0&&(i.sort(),r.colors=i,await x.Promises.writeFile(n,JSON.stringify(r,void 0,"	")),d.fail(`
Updating ${D.normalize(n)}.
Please verify and commit.

${m}
`))}),test("all colors listed in theme-color.md",async function(){const n=new class extends E(){args={_:[]}},r=await new j(new R,new F,n,new P).request({url:"https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/references/theme-color.md"},$.None),c=await k(r),l=/-\s*\`([\w\.]+)\`: (.*)/g;let i;const e=Object.create(null);let f=0;for(;i=l.exec(c);)e[i[1]]={description:i[2],offset:i.index,length:i.length},f++;d.ok(f>0,"theme-color.md contains to color descriptions");const t=Object.create(null),m=Object.create(null),p=C.as(y.ColorContribution);for(const o of p.getColors())if(!e[o.id])o.deprecationMessage||(t[o.id]=N(o));else{const b=e[o.id].description,v=N(o);b!==v&&(m[o.id]={docDescription:b,specDescription:v}),delete e[o.id]}const a=await A();for(const o in a)e[o]?delete e[o]:t[o]=a[o];for(const o of J)t[o]&&delete t[o],e[o]&&d.fail(`Color ${o} found in doc but marked experimental. Please remove from experimental list.`);const u=Object.keys(e),h=Object.keys(t).map(o=>`\`${o}\`: ${t[o]}`);let g="";h.length>0&&(g+=`

Add the following colors:

${h.join(`
`)}
`),u.length>0&&(g+=`
Remove the following colors:

${u.join(`
`)}
`),g.length>0&&d.fail(`

Open https://github.dev/microsoft/vscode-docs/blob/vnext/api/references/theme-color.md#50${g}`)})});function N(n){let s=n.description;return n.deprecationMessage&&(s=s+" "+n.deprecationMessage),s}async function A(){const n=I.asFileUri("vs/../../extensions").fsPath,s=await x.Promises.readDirsInDir(n),r=Object.create(null);for(const c of s)try{const i=JSON.parse((await w.promises.readFile(D.join(n,c,"package.json"))).toString()).contributes;if(i){const e=i.colors;if(e)for(const f of e){const t=f.id;t&&(r[t]=t.description)}}}catch{}return r}export{J as experimental};
