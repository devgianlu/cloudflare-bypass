function ca(node, node2) {
	for (; node; node = node.parentNode) {
		if (node.contains(node2)) return node;
	}
}

try {
	var selector = document.querySelectorAll.bind(document);
	var append = Node.prototype.appendChild;
	var createElm = document.createElement.bind(document);
	var nullEl = append.bind(document.body)(eval("0, createElm")("null"));
	var style = append.bind(document.getElementsByTagName("head")[0])(createElm("style"));

	append.bind(nullEl)(createElm("div")).id = "kySZgB";
	selector("#kySZgB")[0].innerHTML= " ";
	append.bind(selector("#kySZgB")[0])(createElm("div")).id = "VufQWE";
	selector("#VufQWE")[0].innerHTML = " ";
	append.bind(selector("#VufQWE")[0])(createElm("span")).id = "WgxFYe";

	selector("#WgxFYe")[0].innerHTML = " ";
	selector("#WgxFYe")[0].insertAdjacentHTML("beforeend", "<div id=\"dHPsmS\" class=\"NLWdA vwwSW\"> </div>");
	selector(".NLWdA")[0].innerHTML = " ";
	selector("#kySZgB")[0].firstChild.appendData("&lt;&gt;");
	selector("#VufQWE")[0].className += " MBCZB";
	selector("#kySZgB")[0].className += " AzyRP";
	selector("#kySZgB")[0].className += " FSMZy";
	selector("#WgxFYe")[0].className += " wXMSZ";
	style.sheet.insertRule(".MBCZB .MBCZB{font-family:'Dwumc'}", 0);
	style.sheet.insertRule(".vwwSW .NLWdA{font-family:'sVYys'}", 0);
	selector("#WgxFYe")[0].title = "TFHyE";
	selector("#WgxFYe")[0].className += " jEKbM";
	style.sheet.insertRule(".MBCZB{font-family:'scJrC'}", 0);
	selector("#kySZgB")[0].className += " qeojQ";
	style.sheet.insertRule(".jEKbM{font-family:'CjfOu'}", 0);
	style.sheet.insertRule(".MBCZB .wXMSZ{font-family:'Xaqaq'}", 0);
	selector("#VufQWE")[0].title = "pSHHS";
	selector("#kySZgB")[0].className += " nsXJL";
	selector("#VufQWE")[0].firstChild.appendData("&lt;&gt;");
	selector("#WgxFYe")[0].firstChild.appendData("&lt;&gt;");
	selector("#VufQWE")[0].className += " Xfomm";
	selector(".NLWdA")[0].firstChild.appendData("&lt;&gt;");
	style.sheet.insertRule(".NLWdA{font-family:'atzsE'}", 0);
	selector("#kySZgB")[0].title = "root";
	selector("#kySZgB")[0].className += " GhcvT";
	selector(".NLWdA")[0].title = "UaHhl";
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a = "";
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += ca(selector("#kySZgB")[0], selector("#kySZgB")[0]).title;
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += ca(selector("#dHPsmS")[0], selector("#VufQWE")[0]).title;
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += ca(selector(".vwwSW")[0], selector("#WgxFYe")[0]).title;
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += ca(selector("#dHPsmS")[0], selector("#VufQWE")[0]).title;
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += ca(selector("#WgxFYe")[0], selector("#kySZgB")[0]).title;
	document.head.removeChild(style);
	style = null;
	document.body.removeChild(nullEl);
	nullEl = null;
} catch (e) {
	window._cf_chl_ctx[window._cf_chl_ctx.chC].a += e.toString();
}