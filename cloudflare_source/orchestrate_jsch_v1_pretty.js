/* eslint-disable */

var that = this || self;
var e = [];
var getCookie = function (name) {
	var q = name + '=';
	var r = document.cookie.split(';');

	for (var s = 0; s < r.length; s++) {
		var t;
		for (t = r[s]; t.charAt(0) == ' '; t = t.substring(1)) ;

		if (t.indexOf(q) == 0)
			return t.substring(q.length, t.length)
	}

	return ''
};

var addCookie = function (name, value, expireHours) {
	var s = new Date();
	s.setTime(s.getTime() + expireHours * 60 * 60 * 1000)
	document.cookie = name + '=' + value + ';' + "expires=" + s.toUTCString() + ";path=/"
};

var removeCookie = function (name) {
	document.cookie = name + "=; Max-Age=-99999999;";
};

var scheduleReload = function () {
	var p = parseInt(getCookie("cf_chl_rc_ni"));
	if (isNaN(p))
		p = 0;

	var q = 1000 * Math.min(2 << p, 128);
	addCookie("cf_chl_rc_ni", p + 1, 1);

	setTimeout(function () {
		document.location.reload()
	}, q)
};

this["onerror"] = function (n, o, p, q, r) {
	if (n.toLowerCase().indexOf("script error") > -1) {
		alert("Script Error: See Browser Console for Detail");
	} else {
		var w = ["Message: " + n, "URL: " + o, "Line: " + p, "Column: " + q, "Error object: " + JSON.stringify(r)].join(" - ")
		console.log("[[[ERROR]]]:", w);
		scheduleReload();
	}

	return false
};

var sendRequest = function (url, retryCount) {
	retryCount = retryCount || 0;
	if (retryCount >= 5) {
		scheduleReload()
		return undefined;
	}

	var retrying = false;
	var retry = function () {
		if (retrying) return;

		retrying = true;
		setTimeout(function () {
			sendRequest(url, retryCount + 1)
		}, 50)
	};

	var req = createRequest();
	if (!req) return;

	req.open("POST", url, true);
	if ("timeout" in req) {
		req.timeout = 2500;
		req.ontimeout = function () {
			retry();
		};
	}

	req.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
	req.setRequestHeader("CF-Challenge", that["_cf_chl_opt"]["cHash"]);

	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
			retry();
			return undefined;
		}

		addCookie("cf_chl_prog", 'b' + that["_cf_chl_ctx"]["chLog"]['c'], 1)

		new Function(m(req.responseText))()

		addCookie("cf_chl_prog", 'a' + that["_cf_chl_ctx"]["chLog"]['c'], 1)
	};

	var v = k["compressToEncodedURIComponent"](JSON.stringify(that["_cf_chl_ctx"])).replace('+', '%2b'); // TODO: Use lz-string with custom alphabet
	req.send('v_' + that["_cf_chl_opt"]["cRay"] + '=' + v);
};

var createRequest = function () {
	if (XMLHttpRequest)
		return new XMLHttpRequest()

	if (ActiveXObject) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch (r) {
		}
	}

	alert("This browser is not supported.");
	scheduleReload();
};

var lzBase64Alphabet = "yvejD7CpqOLnKRAUgWNQr2wYdIaGHZM9P5ST8shlVb6oBmfEXuiFz0J1ck3tx4"
var lzUriAlphabet = "tEM+ujl9UDp$8OwqWAKRZPSzLabg5sHIcNfQiTV-B1nXdyrCohFYxkG23J4em6v07"


var addReadyListener = function l(n) {
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", n)
	} else {
		document.attachEvent("onreadystatechange", n)
	}
};

addReadyListener(function (ev) {
	if (ev.type === "readystatechange" && document.readyState && document.readyState !== "complete")
		return;

	that["_cf_chl_enter"]()
});

this["_cf_chl_enter"] = function () {
	var z = that["_cf_chl_opt"];
	var y = "cf_chl_" + z["cvId"];
	addCookie(y, z["cHash"], 1);

	var s = document.cookie.indexOf(y) === -1 || !that.navigator.cookieEnabled;
	if (s) {
		var r = document.getElementById("no-cookie-warning")
		if (r) r.style.display = "block"
		return void 0
	}

	removeCookie("cf_chl_" + z["cvId"]);
	addCookie("cf_chl_prog", 's', 1);

	var x;
	for (x = 0; x < e.length; e[x](), x++) ;

	addCookie("cf_chl_prog", 'e', 1);

	var v = {};
	v['c'] = 0

	var w = {}
	w["chLog"] = v
	w["chReq"] = z["cType"]
	w["cNounce"] = z["cNounce"]
	w["chC"] = 0
	w["chCAS"] = 0
	w['oV'] = 1
	w["cRq"] = z["cRq"]
	that["_cf_chl_ctx"] = w;

	that["_cf_chl_ctx"]["chLog"][that["_cf_chl_ctx"]['chLog']['c']++] = {
		'start': new Date().getTime()
	};

	setTimeout(function () {
		sendRequest("/cdn-cgi/challenge-platform/generate/ov" + 1 + "/0.6167940643061035:1600608587:7ba9d7deedd7d1cc95a452642c383762fb0e5461d197f6544f815893ef8ff305/" + z["cRay"] + '/' + z["cHash"])
	}, 10);
};

this['_cf_chl_done_ran'] = false;
this["_cf_chl_done"] = function () {
	addCookie("cf_chl_prog", 'b', 1);
	that["_cf_chl_done_ran"] = true
};

var m = function (n) {
	var v = 32
	var w = that["_cf_chl_opt"]["cRay"] + '_' + 0
	w.replace(/./g, function (x, z) {
		v ^= w.charCodeAt(z)
	})

	var t = []
	var u = 0
	var q = 1
	for (; q; q = n.charCodeAt(u++), !isNaN(q) && t.push(String.fromCharCode((q - v) % 65535))) ;
	return t.join('')
};

e.push(function () {
	setTimeout(function () {
		that['_cf_chl_done']()
	}, 4000)
})