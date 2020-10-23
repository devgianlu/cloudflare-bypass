var c = 0
var d = ["var p = NaN; switch(p) {"];
try {
	for (c = 0; c < 65e3; d.push("case " + c + ": "), c++) ;
	eval(d.join("") + "}")
} catch (e) {
}

window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "1";
window._cf_chl_ctx[window._cf_chl_ctx.chC].s = "s1";

try {
	for (c = 65e3; c < 66e3; d.push("case " + c + ": "), c++) ;
	eval(d.join("") + "}")
} catch (f) {
	window._cf_chl_ctx[window._cf_chl_ctx.chC].s = SHA256(f.name)
}