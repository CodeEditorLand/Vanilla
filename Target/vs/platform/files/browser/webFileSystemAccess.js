var i;(l=>{function t(e){return typeof e?.showDirectoryPicker=="function"}l.supported=t;function r(e){const n=e;return n?typeof n.kind=="string"&&typeof n.queryPermission=="function"&&typeof n.requestPermission=="function":!1}l.isFileSystemHandle=r;function o(e){return e.kind==="file"}l.isFileSystemFileHandle=o;function s(e){return e.kind==="directory"}l.isFileSystemDirectoryHandle=s})(i||={});export{i as WebFileSystemAccess};
