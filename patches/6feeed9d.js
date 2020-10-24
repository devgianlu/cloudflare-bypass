const log = require('../logging')

module.exports = {
	patchContext: function (ctx, entry) {
		const LOOKUP = {
			'15;6;13': [{h: 35, i: 6}, {h: 19, i: 21}],
			'7;3;10': [{h: 22, i: 3}, {h: 11, i: 10}],
			'11;15;13': [{h: 35, i: 11}, {h: 19, i: 26}],
			'6;12;12': [{h: 31, i: 6}, {h: 16, i: 18}],
			'10;16;11': [[{h: 30, i: 10}, {h: 18, i: 26}]]
		}

		const ii = entry['ii']
		const i1 = Math.min(ii[0], ii[1])
		const i2 = ii[0] + ii[1]

		const ii_key = entry['ii'].join(';')
		if (ii_key in LOOKUP) {
			entry['fg'] = LOOKUP[ii_key]
		} else {
			log.error('(6feeed9d) Couldn\'t lookup entry for ' + ii_key)
		}
	}
}