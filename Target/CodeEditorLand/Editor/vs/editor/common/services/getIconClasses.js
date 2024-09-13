import{Schemas as d}from"../../../base/common/network.js";import{DataUri as g}from"../../../base/common/resources.js";import{ThemeIcon as u}from"../../../base/common/themables.js";import{URI as p}from"../../../base/common/uri.js";import{FileKind as f}from"../../../platform/files/common/files.js";import{PLAINTEXT_LANGUAGE_ID as I}from"../languages/modesRegistry.js";const h=/(?:\/|^)(?:([^/]+)\/)?([^/]+)$/;function F(o,l,e,i,r){if(u.isThemeIcon(r))return[`codicon-${r.id}`,"predefined-file-icon"];if(p.isUri(r))return[];const t=i===f.ROOT_FOLDER?["rootfolder-icon"]:i===f.FOLDER?["folder-icon"]:["file-icon"];if(e){let n;if(e.scheme===d.data)n=g.parseMetaData(e).get(g.META_DATA_LABEL);else{const a=e.path.match(h);a?(n=s(a[2].toLowerCase()),a[1]&&t.push(`${s(a[1].toLowerCase())}-name-dir-icon`)):n=s(e.authority.toLowerCase())}if(i===f.ROOT_FOLDER)t.push(`${n}-root-name-folder-icon`);else if(i===f.FOLDER)t.push(`${n}-name-folder-icon`);else{if(n){if(t.push(`${n}-name-file-icon`),t.push("name-file-icon"),n.length<=255){const m=n.split(".");for(let c=1;c<m.length;c++)t.push(`${m.slice(c).join(".")}-ext-file-icon`)}t.push("ext-file-icon")}const a=L(o,l,e);a&&t.push(`${s(a)}-lang-file-icon`)}}return t}function O(o){return["file-icon",`${s(o)}-lang-file-icon`]}function L(o,l,e){if(!e)return null;let i=null;if(e.scheme===d.data){const t=g.parseMetaData(e).get(g.META_DATA_MIME);t&&(i=l.getLanguageIdByMimeType(t))}else{const r=o.getModel(e);r&&(i=r.getLanguageId())}return i&&i!==I?i:l.guessLanguageIdByFilepathOrFirstLine(e)}function s(o){return o.replace(/[\s]/g,"/")}export{F as getIconClasses,O as getIconClassesForLanguageId};
