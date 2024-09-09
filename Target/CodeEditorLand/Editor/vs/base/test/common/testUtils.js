function e(t,i){return suite(t,function(){this.retries(3),this.timeout(1e3*20),i.call(this)})}export{e as flakySuite};
