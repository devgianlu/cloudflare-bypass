(function (chl_done) {
	window._cf_chl_ctx[window._cf_chl_ctx.chC].hL = 42135 + (history && typeof (history.length) != "undefined") ? history.length : -1;
	window._cf_chl_ctx[window._cf_chl_ctx.chC].r = 0;

	function getStr(size) {
		return new Array(size).join("A");
	}

	if (window._cf_chl_ctx[window._cf_chl_ctx.chC].hL - 42135 !== -1) {
		window._cf_chl_ctx[window._cf_chl_ctx.chC].sR = (history && typeof (history.scrollRestoration) != "undefined") ? history.scrollRestoration : "";
		window._cf_chl_ctx[window._cf_chl_ctx.chC].iT = document.title;

		try {
			var lObj = getStr(1024 * 1024 * 2);
			history.replaceState({chlID: 0xDEAD, p: lObj}, "T:EEEE");
			window._cf_chl_ctx[window._cf_chl_ctx.chC].nEE = "np";
		} catch (e) {
			window._cf_chl_ctx[window._cf_chl_ctx.chC].nEE = e.name || e.message;
		}

		try {
			history.replaceState({chlID: 0xC0FFEE}, "T:YYYY", "https://" + Math.random().toString(36).substring(7) + ".cloudflarecaptcha.com/");
			window._cf_chl_ctx[window._cf_chl_ctx.chC].oEE = "np";
		} catch (e) {
			window._cf_chl_ctx[window._cf_chl_ctx.chC].oEE = e.name || e.message;
		}
	}

	window._cf_chl_ctx[window._cf_chl_ctx.chC].a = 42135;
	setTimeout(function () {
		chl_done();
	}, 100);
})(function () {

});
