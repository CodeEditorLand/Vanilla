import{extname as I,posix as P}from"../../../../../vs/base/common/path.js";import*as g from"../../../../../vs/base/common/resources.js";import{ThemeIcon as y}from"../../../../../vs/base/common/themables.js";import*as t from"../../../../../vs/nls.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{Registry as E}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as w}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{ExtensionsRegistry as C}from"../../../../../vs/workbench/services/extensions/common/extensionsRegistry.js";const c=E.as(w.IconContribution),z=c.getIconReferenceSchema(),b=`^${y.iconNameSegment}(-${y.iconNameSegment})+$`,$=C.registerExtensionPoint({extensionPoint:"icons",jsonSchema:{description:t.localize("contributes.icons","Contributes extension defined themable icons"),type:"object",propertyNames:{pattern:b,description:t.localize("contributes.icon.id","The identifier of the themable icon"),patternErrorMessage:t.localize("contributes.icon.id.format","Identifiers can only contain letters, digits and minuses and need to consist of at least two segments in the form `component-iconname`.")},additionalProperties:{type:"object",properties:{description:{type:"string",description:t.localize("contributes.icon.description","The description of the themable icon")},default:{anyOf:[z,{type:"object",properties:{fontPath:{description:t.localize("contributes.icon.default.fontPath","The path of the icon font that defines the icon."),type:"string"},fontCharacter:{description:t.localize("contributes.icon.default.fontCharacter","The character for the icon in the icon font."),type:"string"}},required:["fontPath","fontCharacter"],defaultSnippets:[{body:{fontPath:"${1:myiconfont.woff}",fontCharacter:"${2:\\\\E001}"}}]}],description:t.localize("contributes.icon.default","The default of the icon. Either a reference to an extisting ThemeIcon or an icon in an icon font.")}},required:["description","default"],defaultSnippets:[{body:{description:"${1:my icon}",default:{fontPath:"${2:myiconfont.woff}",fontCharacter:"${3:\\\\E001}"}}}]},defaultSnippets:[{body:{"${1:my-icon-id}":{description:"${2:my icon}",default:{fontPath:"${3:myiconfont.woff}",fontCharacter:"${4:\\\\E001}"}}}}]}});class M{constructor(){$.setHandler((l,p)=>{for(const e of p.added){const i=e.value,o=e.collector;if(!i||typeof i!="object"){o.error(t.localize("invalid.icons.configuration","'configuration.icons' must be an object with the icon names as properties."));return}for(const s in i){if(!s.match(b)){o.error(t.localize("invalid.icons.id.format","'configuration.icons' keys represent the icon id and can only contain letter, digits and minuses. They need to consist of at least two segments in the form `component-iconname`."));return}const r=i[s];if(typeof r.description!="string"||r.description.length===0){o.error(t.localize("invalid.icons.description","'configuration.icons.description' must be defined and can not be empty"));return}const n=r.default;if(typeof n=="string")c.registerIcon(s,{id:n},r.description);else if(typeof n=="object"&&typeof n.fontPath=="string"&&typeof n.fontCharacter=="string"){const h=I(n.fontPath).substring(1),u=v[h];if(!u){o.warn(t.localize("invalid.icons.default.fontPath.extension","Expected `contributes.icons.default.fontPath` to have file extension 'woff', woff2' or 'ttf', is '{0}'.",h));return}const a=e.description.extensionLocation,f=g.joinPath(a,n.fontPath);if(!g.isEqualOrParent(f,a)){o.warn(t.localize("invalid.icons.default.fontPath.path","Expected `contributes.icons.default.fontPath` ({0}) to be included inside extension's folder ({0}).",f.path,a.path));return}const m=j(e.description,n.fontPath),x=c.registerIconFont(m,{src:[{location:f,format:u}]});c.registerIcon(s,{fontCharacter:n.fontCharacter,font:{id:m,definition:x}},r.description)}else o.error(t.localize("invalid.icons.default","'configuration.icons.default' must be either a reference to the id of an other theme icon (string) or a icon definition (object) with properties `fontPath` and `fontCharacter`."))}}for(const e of p.removed){const i=e.value;for(const o in i)c.deregisterIcon(o)}})}}const v={ttf:"truetype",woff:"woff",woff2:"woff2"};function j(d,l){return P.join(d.identifier.value,l)}export{M as IconExtensionPoint};
