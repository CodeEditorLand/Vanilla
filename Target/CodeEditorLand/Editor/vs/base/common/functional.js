function l(t,e){let r=!1,n;return()=>{if(r)return n;if(r=!0,e)try{n=t.apply(this,arguments)}finally{e()}else n=t.apply(this,arguments);return n}}export{l as createSingleCallFunction};
