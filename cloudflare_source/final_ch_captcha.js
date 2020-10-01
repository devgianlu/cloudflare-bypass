/* eslint-disable */

(function (chl_done) {
	window._cf_chl_hload = function () {
		var d = document.createElement("div")
		d.id = "cf-hcaptcha-container"
		document.getElementById("challenge-form").appendChild(d)

		var e = {}
		e["callback"] = function (token) {
			var j = document.getElementById("cf-please-wait")
			if (j) j.style.display = "block"

			var k = document.getElementById("cf-hcaptcha-container")
			k.parentNode.removeChild(k)

			window._cf_chl_ctx[window._cf_chl_ctx.chC].a = token
			setTimeout(chl_done, 0)
		}
		e["sitekey"] = "f9630567-8bfa-4fc9-8ee5-9c91c6276dff"


		e["expired-callback"] = function () {
			var i = document.getElementById("cf-please-wait")
			if (i) i.style.display = "block"

			var j = document.getElementById("cf-hcaptcha-container")
			j.parentNode.removeChild(j)

			window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "expired"
			setTimeout(chl_done, 0)
		}

		e["error-callback"] = function () {
			var i = document.getElementById("cf-please-wait")
			if (i) i.style.display = "block"

			var j = document.getElementById("cf-hcaptcha-container")
			j.parentNode.removeChild(j)

			window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "error"
			setTimeout(chl_done, 0)
		}

		var g = window.hcaptcha.render(d.id, e)
		var h = document.getElementById("cf-please-wait")
		if (h) h.style.display = "none"
	}

	if (window._cf_chl_hloaded)
		window._cf_chl_hload()
})(function () {

});

