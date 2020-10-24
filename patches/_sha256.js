const crypto = require('crypto')

module.exports = {
	patchJsDom: function (ctx) {
		ctx.window['SHA256'] = function (input) {
			const hash = crypto.createHash('sha256')
			hash.update(input)
			return hash.digest('hex')
		}
	}
}