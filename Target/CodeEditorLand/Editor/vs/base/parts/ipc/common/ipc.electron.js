class a{constructor(e,s){this.sender=e;this.onMessage=s}send(e){try{this.sender.send("vscode:message",e.buffer)}catch{}}disconnect(){this.sender.send("vscode:disconnect",null)}}export{a as Protocol};
