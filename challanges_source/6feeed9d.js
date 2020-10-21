// https://jsfiddle.net/ad3qrxtj/

var container = document.createElement("span");
container.style.display = "block";
container.style.fontSize = "10px";
container.style.width = "0px";
container.style.border = "1px solid blue";
container.innerHTML = "<img style=\"width:2px\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=\">&shy;<img style=\"width:2px\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=\">";
document.getElementById("challenge-form").appendChild(container);
var inner = container;
var initial = inner.offsetHeight;
var fingerprint = new Array();
var i = 0;
for (i = 0; i < 100; i++) {
	inner.style.width = "" + i + "px";
	if (initial != inner.offsetHeight) {
		fingerprint.push({i: i, h: inner.offsetHeight});
		initial = inner.offsetHeight;
	}
}
document.getElementById("challenge-form").removeChild(container);
window._cf_chl_ctx[window._cf_chl_ctx.chC].fp = fingerprint;

