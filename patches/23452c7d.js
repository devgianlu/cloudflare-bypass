const fs = require('fs')

module.exports = {
	patchContext: function (ctx, entry) {  // TODO: Rewrite as JsDom patch
		entry['a'] = JSON.parse(fs.readFileSync('./23452c7d_solution.json').toString())
	}
}