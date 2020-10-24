function patch_c48c9b6c(script) {
	script = script.replace(/\(\+\(_0x.\.innerHTML == _0x.\.innerHTML && _0x.\.innerText != _0x.\.innerText\)\)/, '1')
	script = script.replace(/\(\+\(!!_0x.\.maxLength && \(_0x.\.maxLength === _0x.\.maxLength\)\)\)/, '1')
	script = script.replace(/\(\+\(\(!!_0x.\.getElementById\(_\[.+?]\)\) && \(_0x.\.getElementById\(_\[.+?]\)\.value === _\[.+?]\)\)\)/, '1')
	return script
}

module.exports = function (script) {
	script = patch_c48c9b6c(script)
	return script
}