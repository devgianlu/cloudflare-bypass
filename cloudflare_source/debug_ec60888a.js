/* eslint-disable */

// Extracted options: {"cvId":"1","cType":"non-interactive","cNounce":"11407","cRay":"5d7c5ddd19e90476","cHash":"6e882fe3311e159","cRq":{"ru":"aHR0cHM6Ly8xMTQ1MTQud3RmLw==","rm":"R0VU","d":"h0TqMZfciaRg+gBYkOXGjjl1caHPDFVSVUscjCMBNF/Cpfwnb8O3E+WKx3gQClnq0Axn0aRizabvHVmoxCsUqpjTCC3NDrQu6xPnOzbWpvsV/avmsUJp6TdoTR0wmxlr+SLK4QICdI+4r1CgBeJ9vUhLnVn9VZ5drKxTrj1WwIuGnnKoszXMlpoYYqLQy9Hkl+/3EyEjC/gWR1AlYgmkfNXOu2W/hgEBIxTP4aMK3CkPDopDENW/xDZTFxOAd91/OzQHq5qGQCl03FnxwJuGBNeY8OPfMhBe8RI6EME9pqKFXpNsybVWHIiic0ijlVcH5wb1HrvKNPTv1GQreANDV7TMoFP4vU4lm/nrscs+SaG//NFCALF+e0SjgBN6aRuVleYuE785g+nbeOOAWcZcq8t4ymnHbBSmeH7dulqCFdmbzydCxUUWoqbPMyjSpWDf+525nXd6o8RwHysezegkGUxSO+tHoFRjvW7R53mwXv4d+X3PKEW1WBtsS5lvbn/DAKCjG1ygSwNY1GaCiBehXgeKzWvh4xia4aJZ/vi8JmY=","t":"MTYwMDk0OTA1Mi45NzUwMDA=","m":"98pNs26v7tvaBxAHzxUpFmV4ugw85bnZjcBxz9dQgt8=","i1":"l4f2VqwbSg+cX357JmSQog==","i2":"DNlAR80JLZ4KwxpWgBsQLw==","uh":"df//tiBY4MyZ7z26Gb36sgkYwIQ8wsPR/LjoY7AEuNI=","hh":"lrqgPqVfZiTZG5nl+8OtrM/cpdJra+0vA8734AOLFhk="}}

if (window.performance.mark)
	window.performance.mark("cp-n-" + parseInt(window._cf_chl_opt.cNounce, 10))

var entries = []
if (window.performance) {
	if (window.performance.getEntries || window.performance.webkitGetEntries) {
		entries = window.performance.getEntries ? window.performance.getEntries() : window.performance.webkitGetEntries()
	}
}

window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"] = new Array()

for (var m = 0; m < entries.length; m++) {
	var entry = entries[m]
	if (entry.entryType === "resource") {
		var t = {}
		t["t"] = "r"
		t["i"] = entry.initiatorType
		t["n"] = entry.name
		t["nh"] = entry.nextHopProtocol
		t["ts"] = entry.transferSize
		t["bs"] = entry.encodedBodySize
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = t
	} else if (entry.entryType === "navigation") {
		var v = {}
		v["t"] = "n"
		v["i"] = entry.type
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = v
	} else if (entry.entryType === "paint") {
		var x = {}
		x["t"] = "p"
		x["i"] = entry.name
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = x
	} else if (entry.entryType === "frame") {
		var y = {}
		y["t"] = "f"
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = y
	} else if (entry.entryType === "first-input" || entry.entryType === "firstInput") {
		var z = {}
		z["t"] = "f"
		z["s"] = entry.entryType
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = z
	} else if (entry.entryType === "mark") {
		var A = {}
		A["t"] = "m"
		A["n"] = entry.name
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = A
	} else if (entry.entryType === "scrollUpdateLatency") {
		var B = {}
		B["t"] = "1"
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = B
	} else {
		var C = {}
		C["t"] = entry.entryType
		window._cf_chl_ctx[window._cf_chl_ctx.chC]["p"][m] = C
	}
}