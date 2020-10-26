const PATCHES = ['_sha256', 'c48c9b6c', '89d70e43', '23452c7d', 'ec60888a', 'cf_win_chrome', '6feeed9d', '78cc909d']

/**
 * @typedef Patch
 * @property {?function(object, object)} patchJsDom
 * @property {?function(string)} patchScript
 * @property {?function(object, object, object)} patchContext
 */

/**
 * @type {{string, Patch}}
 */
const LOADED_PATCHES = {}
for (let i = 0; i < PATCHES.length; i++) {
	const name = PATCHES[i]
	LOADED_PATCHES[name] = require('./patches/' + name)
}

module.exports = {
	patchJsDom: function (jsdom, state = null) {
		const ctx = jsdom.getInternalVMContext()

		for (let name in LOADED_PATCHES) {
			if ('patchJsDom' in LOADED_PATCHES[name])
				LOADED_PATCHES[name].patchJsDom(ctx, state)
		}
	},
	patchScript: function (script) {
		for (let name in LOADED_PATCHES) {
			if ('patchScript' in LOADED_PATCHES[name])
				script = LOADED_PATCHES[name].patchScript(script)
		}

		return script
	},
	patchContext: function (ctx, state = null) {
		for (let key in ctx) {
			if (!Object.hasOwnProperty.call(ctx, key))
				continue

			const name = ctx[key].i
			if (name in LOADED_PATCHES && 'patchContext' in LOADED_PATCHES[name])
				LOADED_PATCHES[name].patchContext(ctx, ctx[key], state)
		}
	}
}