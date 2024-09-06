import{extname as m}from"../../../vs/base/common/path.js";const d=Object.freeze({text:"text/plain",binary:"application/octet-stream",unknown:"application/unknown",markdown:"text/markdown",latex:"text/latex",uriList:"text/uri-list"}),a={".css":"text/css",".csv":"text/csv",".htm":"text/html",".html":"text/html",".ics":"text/calendar",".js":"text/javascript",".mjs":"text/javascript",".txt":"text/plain",".xml":"text/xml"},o={".aac":"audio/x-aac",".avi":"video/x-msvideo",".bmp":"image/bmp",".flv":"video/x-flv",".gif":"image/gif",".ico":"image/x-icon",".jpe":"image/jpg",".jpeg":"image/jpg",".jpg":"image/jpg",".m1v":"video/mpeg",".m2a":"audio/mpeg",".m2v":"video/mpeg",".m3a":"audio/mpeg",".mid":"audio/midi",".midi":"audio/midi",".mk3d":"video/x-matroska",".mks":"video/x-matroska",".mkv":"video/x-matroska",".mov":"video/quicktime",".movie":"video/x-sgi-movie",".mp2":"audio/mpeg",".mp2a":"audio/mpeg",".mp3":"audio/mpeg",".mp4":"video/mp4",".mp4a":"audio/mp4",".mp4v":"video/mp4",".mpe":"video/mpeg",".mpeg":"video/mpeg",".mpg":"video/mpeg",".mpg4":"video/mp4",".mpga":"audio/mpeg",".oga":"audio/ogg",".ogg":"audio/ogg",".opus":"audio/opus",".ogv":"video/ogg",".png":"image/png",".psd":"image/vnd.adobe.photoshop",".qt":"video/quicktime",".spx":"audio/ogg",".svg":"image/svg+xml",".tga":"image/x-tga",".tif":"image/tiff",".tiff":"image/tiff",".wav":"audio/x-wav",".webm":"video/webm",".webp":"image/webp",".wma":"audio/x-ms-wma",".wmv":"video/x-ms-wmv",".woff":"application/font-woff"};function s(e){const i=m(e),t=a[i.toLowerCase()];return t!==void 0?t:n(e)}function n(e){const i=m(e);return o[i.toLowerCase()]}function r(e){for(const i in o)if(o[i]===e)return i}const p=/^(.+)\/(.+?)(;.+)?$/;function x(e,i){const t=p.exec(e);return t?`${t[1].toLowerCase()}/${t[2].toLowerCase()}${t[3]??""}`:i?void 0:e}export{d as Mimes,r as getExtensionForMimeType,n as getMediaMime,s as getMediaOrTextMime,x as normalizeMimeType};