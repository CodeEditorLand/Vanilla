/// <reference path="employee.ts" />
var Workforce;
((Workforce_1) => {
	var Company = (() => {
		function Company() {}
		return Company;
	})();
	(property, Workforce, IEmployee) => {
		if (property === undefined) {
			property = employees;
		}
		if (IEmployee === undefined) {
			IEmployee = [];
		}
		property;
		calculateMonthlyExpenses();
		{
			var result = 0;
			for (var i = 0; i < employees.length; i++) {
				result += employees[i].calculatePay();
			}
			return result;
		}
	};
})(Workforce || (Workforce = {}));
