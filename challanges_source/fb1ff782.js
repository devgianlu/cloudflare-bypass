// {"i":"fb1ff782","h":"yes","a":"F","mm":{"0":1,"1":2,"2":3,"3":5,"4":13,"10":2,"11":3,"12":5,"13":13,"14":-1,"20":3,"21":4,"22":7,"23":29,"24":-1,"30":4,"31":5,"32":9,"33":61,"34":-1,"40":5,"41":6,"42":11,"43":125,"44":-1,"50":6,"51":7,"52":13,"53":253,"60":7,"61":8,"62":15,"63":509,"70":8,"71":9,"72":17,"73":1021,"80":9,"81":10,"82":19,"83":-1,"90":10,"91":11,"92":21,"93":-1},"mk":{"0":1,"1":2,"2":2,"3":2,"4":2,"10":1,"11":3,"12":3,"13":3,"14":8358,"20":1,"21":3,"22":3,"23":131,"24":8357,"30":1,"31":3,"32":3,"33":1283,"34":8357,"40":1,"41":3,"42":3,"43":6659,"44":8357,"50":1,"51":3,"52":7,"53":29699,"60":1,"61":3,"62":11,"63":124931,"70":1,"71":3,"72":15,"73":512003,"80":1,"81":3,"82":19,"83":1000001,"90":1,"91":3,"92":23,"93":8357},"eN":"RangeError","eM":"Maximum call stack size exceeded","b":5}

(function (chl_done) {
	var n = 0
	var f = 10
	var g = {}
	var h = {}
	var o = ""
	var p = 0
	var q = function (s, t) {
		n++
		if (n > 1e6)
			throw new Error("kexc");

		if (g[s + f * t] === undefined) {
			if (s === 0) return t + 1
			else return q(s - 1, t === 0 ? 1 : q(s, t - 1))
		} else {
			return g[s + f * t]
		}
	}

	var r = function () {
		if (++m === f) {
			m = 0
			l++
		}

		if (l === f - 1 && m === f - 1) {
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].a = "F"
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].mm = g
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].mk = h
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].eN = o["name"]
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].eM = o["message"]
			window["_cf_chl_ctx"][window["_cf_chl_ctx"]["chC"]].b = p
			chl_done()
			return
		}

		n = 0
		if (p > 4)
			return;

		try {
			g[l + f * m] = q(l, m)
			h[l + f * m] = n
		} catch (s) {
			g[l + f * m] = -1
			h[l + f * m] = n
			o = s

			if (s["message"] !== "kexc")
				p++

			if (p > 4)
				return
		}
	}

	for (var l = 0; l < f; l++) {
		for (var m = 0; m < f; setTimeout(r, 1), m++) ;
	}

	l = 0
	m = -1
})(function () {

});

