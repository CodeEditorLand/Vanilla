var M;
((M) => {
	var C = (() => {
		function C() {}
		return C;
	})();
	(x, property, number) => {
		if (property === undefined) {
			property = w;
		}
		var local = 1;
		// unresolved symbol because x is local
		//self.x++;
		self.w--; // ok because w is a property
		property;
		f = (y) => y + x + local + w + self.w;
		function sum(z) {
			return z + f(z) + w + self.w;
		}
	};
})(M || (M = {}));
var c = new M.C(12, 5);
