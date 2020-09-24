const fs = require('fs')
const DATA = {deltas: {}, successful: [], failed: []}
const TIMESTAMP = new Date().getTime()

function addFailedAttempt(ctx) {
	DATA.failed.push(ctx)
	_updateDeltas(ctx, false)
	_save()
}

function addSuccessfulAttempt(ctx) {
	DATA.successful.push(ctx)
	_updateDeltas(ctx, true)
	_save()
}

function _updateDeltas(ctx, success) {
	for (let j = 0; j <= ctx.chC; j++) {
		if (!(j.toString() in ctx)) continue

		let i = ctx[j.toString()].i
		if (success) {
			delete DATA.deltas[i]
		} else {
			if (!(i in DATA.deltas)) DATA.deltas[i] = 0
			DATA.deltas[i] += 1
		}
	}
}

function _save() {
	fs.writeFileSync('./debug-' + TIMESTAMP + '.json', JSON.stringify(DATA))
}

module.exports = {
	addFailedAttempt: addFailedAttempt,
	addSuccessfulAttempt: addSuccessfulAttempt
}