var t=class{_prefix;_lastId;constructor(r){this._prefix=r,this._lastId=0}nextId(){return this._prefix+ ++this._lastId}},s=new t("id#");export{t as IdGenerator,s as defaultGenerator};
