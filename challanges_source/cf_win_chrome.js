if (window.chrome) {
	if (window.chrome.csi) {
		window._cf_chl_ctx[window._cf_chl_ctx.chC].csi = window.chrome.csi();
	}
	if (window.chrome.loadTimes) {
		window._cf_chl_ctx[window._cf_chl_ctx.chC].lT = window.chrome.loadTimes();
	}
	if (window.chrome.app) {
		window._cf_chl_ctx[window._cf_chl_ctx.chC].app = window.chrome.app;
	}
	if (window.chrome.runtime) {
		window._cf_chl_ctx[window._cf_chl_ctx.chC].rT = window.chrome.runtime;
	}
}