var c;
try {
	throw Error("Ninjas > pirates")
} catch (d) {
	c = d.stack || d.message
}

c = [navigator.userAgent,
	navigator.platform,
	c.replace(/([\s{};()]|[-+]{2}|default)+/g, "").substring(0, 60),
	document.querySelectorAll("script").length,
	window.setInterval(function () {
	}, 100)]

window._cf_chl_ctx[window._cf_chl_ctx.chC].a = c[2]
