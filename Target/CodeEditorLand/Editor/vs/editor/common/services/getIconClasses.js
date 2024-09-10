import{Schemas as d}from"../../../base/common/network.js";import{DataUri as f}from"../../../base/common/resources.js";import{URI as u}from"../../../base/common/uri.js";import{PLAINTEXT_LANGUAGE_ID as p}from"../languages/modesRegistry.js";import"../languages/language.js";import"./model.js";import{FileKind as c}from"../../../platform/files/common/files.js";import{ThemeIcon as I}from"../../../base/common/themables.js";const h=/(?:\/|^)(?:([^\/]+)\/)?([^\/]+)$/;function U(o,l,e,i,r){if(I.isThemeIcon(r))return[`codicon-${r.id}`,"predefined-file-icon"];if(u.isUri(r))return[];const t=i===c.ROOT_FOLDER?["rootfolder-icon"]:i===c.FOLDER?["folder-icon"]:["file-icon"];if(e){let n;if(e.scheme===d.data)n=f.parseMetaData(e).get(f.META_DATA_LABEL);else{const a=e.path.match(h);a?(n=s(a[2].toLowerCase()),a[1]&&t.push(`${s(a[1].toLowerCase())}-name-dir-icon`)):n=s(e.authority.toLowerCase())}if(i===c.ROOT_FOLDER)t.push(`${n}-root-name-folder-icon`);else if(i===c.FOLDER)t.push(`${n}-name-folder-icon`);else{if(n){if(t.push(`${n}-name-file-icon`),t.push("name-file-icon"),n.length<=255){const m=n.split(".");for(let g=1;g<m.length;g++)t.push(`${m.slice(g).join(".")}-ext-file-icon`)}t.push("ext-file-icon")}const a=L(o,l,e);a&&t.push(`${s(a)}-lang-file-icon`)}}return t}function v(o){return["file-icon",`${s(o)}-lang-file-icon`]}function L(o,l,e){if(!e)return null;let i=null;if(e.scheme===d.data){const t=f.parseMetaData(e).get(f.META_DATA_MIME);t&&(i=l.getLanguageIdByMimeType(t))}else{const r=o.getModel(e);r&&(i=r.getLanguageId())}return i&&i!==p?i:l.guessLanguageIdByFilepathOrFirstLine(e)}function s(o){return o.replace(/[\s]/g,"/")}export{U as getIconClasses,v as getIconClassesForLanguageId};
