import{stub as r}from"sinon";function p(){return function(){}}const s=()=>n=>new Proxy({...n},{get(e,t){return e.hasOwnProperty(t)||(e[t]=r()),e[t]},set(e,t,o){return e[t]=o,!0}});export{p as mock,s as mockObject};