const lz = require('lz-string')

module.exports = {
	compress: (data, alphabet) => {
		return lz._compress(data, 6, function (a) {
			return alphabet.charAt(a)
		})
	}
}