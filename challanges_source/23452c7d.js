var isNative = function (h) {
	return h instanceof Function && Function.prototype.toString.call(h).indexOf("[native code]") > 0
}

var isArray = function (h) {
	if (window.Array && window.Array.isArray)
		return Array.isArray(h);

	return Object.prototype.toString.call(h) === "[object Array]"
}

var getType = function (h, i) {
	try {
		h[i].catch(function () {
		})
		return "p"
	} catch (j) {
	}

	try {
		if (h[i] == null)
			return h[i] === undefined ? "u" : "x"
	} catch (l) {
		return "i"
	}

	if (isArray(h[i]))
		return "a";

	switch (typeof h[i]) {
		case "function":
			return isNative(h[i]) ? "N" : "f";
		case "object":
			return "o";
		case "string":
			return "s";
		case "undefined":
			return "u";
		case "symbol":
			return "z";
		case "number":
			return "n";
		case "bigint":
			return "I";
		case "boolean":
			return "b";
		default:
			return "?"
	}
}

var f = function (obj, prefix, list) {
	var append = function (v, type) {
		if (!Object.prototype.hasOwnProperty.call(list, type))
			list[type] = []

		list[type].push(v)
	}

	if (obj === null || obj === undefined)
		return list;

	var n = [];
	for (var p in obj) {
		n.push(p)
	}

	if (Object.getOwnPropertyNames) {
		n = n.concat(Object.getOwnPropertyNames(obj))
	}

	if (Object.keys && Object.getPrototypeOf) {
		var q = Object.getPrototypeOf(obj)
		if (q != null) n = n.concat(Object.keys(q))
	}

	n = function (v) {
		v.sort()
		for (var w = 0; w < v.length; v[w] === v[w + 1] ? v.splice(w + 1, 1) : w += 1) ;
		return v
	}(n)

	for (var r = 0; r < n.length; r++) {
		var key = n[r];
		try {
			var type = getType(obj, key)
			if (type === "i" || type === "x" || type === "c" || type === "p") {
				append(prefix + key, type);
				continue
			}

			if (type === "s" && !isNaN(obj[key])) {
				continue;
			} else if (prefix + key == "d.cookie") {
				append(prefix + key, type)
			} else if (prefix + key == "d.vatvygetElementsByName") { // It's correct (quite strange)
				append(prefix + key, obj[key].toString())
			} else if (type === "n" || type === "s" || type === "a" || type === "b") {
				append(prefix + key, obj[key])
			} else {
				append(prefix + key, type)
			}
		} catch (err) {
			if (err.name === "NS_ERROR_NOT_IMPLEMENTED")
				append(prefix + key, "f")

			throw err
		}
	}

	return list
}

var list = {}
list = f(window, "", list)
list = f(window.navigator, "n.", list)
list = f(window.document, "d.", list)
window._cf_chl_ctx[window._cf_chl_ctx.chC]["a"] = list