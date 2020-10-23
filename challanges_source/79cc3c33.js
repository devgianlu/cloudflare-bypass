(function (chl_done) {
	function storageAvailable(type) {
		try {
			var storage = window[type];
			var x = "__storage_test__";
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		} catch (e) {
			return false;
		}
	}

	function getStr(size) {
		return new Array(size).join("A");
	}

	function getStorageSize(storage) {
		var sizeest = 0, item;
		for (var i = 0; i < storage.length; i++) {
			item = storage.getItem(localStorage.key(i));
			if (item) sizeest += item.length;
		}

		return {sizeest: sizeest, num_keys: storage.length};
	}

	var s = 0;

	function probeSize(storage) {
		var preSize = getStorageSize(storage);
		var iSize = preSize.sizeest;
		var i;
		var j;
		var exxed = "";
		var step = 1024;
		for (i = 0; i < 1024; i++) {
			var key = "cf_chl_probe_" + i;
			try {
				if (iSize > 15 * 1024 * 1024)
					break;

				storage.setItem(key, getStr(step));
				iSize += step;
				step = Math.min(2 * step, 1024 * 1024 * 10);
			} catch (ex) {
				exxed = SHA256(ex.name);
				break;
			}
		}

		for (j = 0; j < 1024; j++) {
			var key = "cf_chl_probe_" + (i + j);
			try {
				storage.setItem(key, getStr(2048));
				iSize += 2048;
			} catch (ex) {
				exxed = SHA256(ex.name);
				break;
			}
		}

		i = i + j;
		for (; i > 0; i--) {
			var key = "cf_chl_probe_" + i;
			try {
				storage.removeItem(key);
			} catch (ex) {
			}
		}

		var postSize = getStorageSize(storage);
		var pSize = postSize.sizeest;
		return {s: pSize, ps: iSize, ex: exxed};
	}

	setTimeout(function () {
		if (storageAvailable("localStorage"))
			window._cf_chl_ctx[window._cf_chl_ctx.chC].ls = probeSize(localStorage);

		s++;
		done();
	}, 0);

	setTimeout(function () {
		if (storageAvailable("sessionStorage"))
			window._cf_chl_ctx[window._cf_chl_ctx.chC].ss = probeSize(sessionStorage);

		s++;
		done();
	}, 0);

	function done() {
		if (s === 2) {
			window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "s";
			setTimeout(chl_done, 0);
		}
	}
})(function () {

});
