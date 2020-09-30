const imgProbe = require('probe-image-size')
const crypto = require('crypto')

function patchSha256(ctx) {
	ctx.window['SHA256'] = function (input) {
		const hash = crypto.createHash('sha256')
		hash.update(input)
		return hash.digest('hex')
	}
}

function patchImageChallenge(ctx) { // 89d70e43
	const _getElementById = ctx.document.getElementById.bind(ctx.document)
	ctx.document.getElementById = function (id) {
		const elm = _getElementById(id)
		if (id !== 'challenge-form')
			return elm

		const _appendChild = elm.appendChild.bind(elm)
		elm.appendChild = function (child) {
			const result = _appendChild(child)
			if (child instanceof ctx['Image']) {
				setTimeout(() => {
					if (!child.src.startsWith('data:image/png;base64,'))
						throw new Error('Unsupported image type: ' + child.src)

					const result = imgProbe.sync(Buffer.from(child.src.substring(22), 'base64'))
					if (!result)
						throw new Error('Failed probing image: ' + child.src)

					child.height = result.height
					child.width = result.width
					child.naturalHeight = result.height
					child.naturalWidth = result.width

					child.dispatchEvent(new ctx['Event']('load'))
				}, 50)
			}

			return result
		}

		return elm
	}
}

module.exports = function (jsdom) {
	const ctx = jsdom.getInternalVMContext()
	patchSha256(ctx)
	patchImageChallenge(ctx)
}