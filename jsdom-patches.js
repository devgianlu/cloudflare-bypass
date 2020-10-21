const imgProbe = require('probe-image-size')
const crypto = require('crypto')
const log = require('./logging')

function patchSha256(ctx) {
	ctx.window['SHA256'] = function (input) {
		const hash = crypto.createHash('sha256')
		hash.update(input)
		return hash.digest('hex')
	}
}

function patch89d70e43(ctx) {
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

function patch6feeed9d(ctx) {
	const LOOKUP = [{h: 24, i: 2}, {h: 13, i: 4}]

	function shouldHandle(child) {
		return child.style.fontSize === '10px' && child.style.border === '1px solid blue' && child.innerHTML.indexOf('width:2px') !== -1
	}

	const _getElementById = ctx.document.getElementById.bind(ctx.document)
	ctx.document.getElementById = function (id) {
		const elm = _getElementById(id)
		if (id !== 'challenge-form')
			return elm

		const _appendChild = elm.appendChild.bind(elm)
		elm.appendChild = function (child) {
			const result = _appendChild(child)
			if (child.tagName !== 'SPAN' || !shouldHandle(child))
				return result;

			(function () {
				let width = child.style.width
				let offsetHeight = child.offsetHeight

				Object.defineProperty(child.style, 'width', {
					get: function () {
						return width
					},
					set: function (value) {
						width = value

						for (let i = 0; i < LOOKUP.length; i++) {
							const entry = LOOKUP[i]
							if (entry.i === parseInt(value.substr(0, value.length - 2)))
								offsetHeight = entry.h
						}
					}
				})

				Object.defineProperty(child, 'offsetHeight', {
					get: function () {
						return offsetHeight
					}
				})
			})()

			return result
		}

		return elm
	}
}

module.exports = function (jsdom) {
	const ctx = jsdom.getInternalVMContext()
	patchSha256(ctx)
	patch89d70e43(ctx)
	patch6feeed9d(ctx)
}