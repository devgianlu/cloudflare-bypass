const fs = require('fs')

const PATCHES = {}
PATCHES['23452c7d'] = function (ctx, entry) {
	entry['a'] = JSON.parse(fs.readFileSync('./23452c7d_solution.json').toString())
}


module.exports = function (ctx) {
	for (let key in ctx) {
		if (!Object.hasOwnProperty.call(ctx, key))
			continue

		if (ctx[key].i in PATCHES) {
			PATCHES[ctx[key].i](ctx, ctx[key])
		}
	}
}