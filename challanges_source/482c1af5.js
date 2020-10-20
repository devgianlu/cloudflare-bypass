(function (chl_done) {
	var hashToApproximate = "afbad207d3e7d12d32ac325fd6e307bd9a42f26dd22c14c4085c277d9e3d910a";
	var expectedSuffixLength = 3;
	var iv = "YwFcKUeaHrOeArHJalxBthSVrQmbNjowpvrjpQyrxXjnHYXhviqGOMUcvKUOlbEInkBWRlXIghAPierABgbEPgNxRcEUrBnWGhFbdGVkNqroULhvmcqoYvqOFDSxTfdK";
	var prefixFound = false;
	var i = 0;
	var expectedSuffix = hashToApproximate.substr(hashToApproximate.length - expectedSuffixLength, hashToApproximate.length);
	window._cf_chl_ctx[window._cf_chl_ctx.chC]["eSL"] = expectedSuffixLength;
	window._cf_chl_ctx[window._cf_chl_ctx.chC]["htA"] = hashToApproximate;
	window._cf_chl_ctx[window._cf_chl_ctx.chC]["iv"] = iv;

	function v(i) {
		for (var j = i; j < i + 50; j++) {
			var currentHash = SHA256("" + j + iv);
			var suffix = currentHash.substr(currentHash.length - expectedSuffixLength, currentHash.length);
			if (suffix == expectedSuffix) {
				window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "" + j;
				chl_done();
				return;
			}
		}

		setTimeout(function () {
			v(j);
		}, 1);
	}

	v(0);
})(function () {

});