if (window.performance.mark)
	window.performance.mark("cp-n-" + parseInt(window._cf_chl_opt.cNounce, 10))

var l = []
if (window.performance && (window.performance.getEntries || window.performance.webkitGetEntries)) {
	if (window.performance.getEntries) l = window.performance.getEntries()
	else l = window.performance.webkitGetEntries()
}

window._cf_chl_ctx[window._cf_chl_ctx.chC].p = new Array()

for (var m = 0; m < l.length; m++) {
	var n = l[m]
	if (n.entryType === "resource") {
		var t = {}
		t["t"] = "r"
		t["i"] = n.initiatorType
		t["n"] = n.name
		t["nh"] = n.nextHopProtocol
		t["ts"] = n.transferSize
		t["bs"] = n.encodedBodySize
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = t
	} else if (n.entryType === "navigation") {
		var v = {}
		v["t"] = "n"
		v["i"] = n.type
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = v
	} else if (n.entryType === "paint") {
		var x = {}
		x["t"] = "p"
		x["i"] = n.name
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = x
	} else if (n.entryType === "frame") {
		var y = {}
		y["t"] = "f"
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = y
	} else if (n.entryType === "first-input" || n.entryType === "firstInput") {
		var z = {}
		z["t"] = "f"
		z["s"] = n.entryType
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = z
	} else if (n.entryType === "mark") {
		var A;
		A = {}
		A["t"] = "m"
		A["n"] = n.name
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = A
	} else if (n.entryType === "scrollUpdateLatency") {
		var B;
		B = {}
		B["t"] = "l"
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = B
	} else {
		var C;
		C = {}
		C["t"] = n.entryType
		window._cf_chl_ctx[window._cf_chl_ctx.chC].p[m] = C
	}
}
