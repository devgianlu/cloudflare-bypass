const fs = require('fs')

/**
 * @type {boolean}
 */
const ENABLED = true

/**
 * @typedef Data
 * @property failed {object[]}
 * @property success {object[]}
 * @property challenges {object}
 * @property challenges.all {string[]}
 * @property challenges.ok {string[]}
 * @property challenges.failed {string[]}
 */
/**
 * @type {?Data}
 */
const DATA = ENABLED ? (function () {
	try {
		return JSON.parse(fs.readFileSync('./debug.json').toString())
	} catch (e) {
		return {'challenges': {'all': [], 'ok': [], 'failed': []}, 'success': [], 'failed': []}
	}
})() : null

function addFailedAttempt(ctx) {
	if (!ENABLED) return

	DATA.failed.push(ctx)
	_update(ctx, false)
	_save()
}

function addSuccessfulAttempt(ctx) {
	if (!ENABLED) return

	DATA.success.push(ctx)
	_update(ctx, true)
	_save()
}

function _update(ctx, success) {
	for (let j = 0; j <= ctx.chC; j++) {
		if (!(j.toString() in ctx)) continue

		let i = ctx[j.toString()].i
		if (DATA.challenges.all.indexOf(i) === -1) {
			DATA.challenges.all.push(i)
			DATA.challenges.all.sort()
		}

		if (success) {
			if (DATA.challenges.ok.indexOf(i) === -1) {
				DATA.challenges.ok.push(i)
				DATA.challenges.ok.sort()
			}

			let index = DATA.challenges.failed.indexOf(i)
			if (index !== -1) DATA.challenges.failed.splice(index, 1)
		} else {
			if (DATA.challenges.ok.indexOf(i) === -1 && DATA.challenges.failed.indexOf(i) === -1) {
				DATA.challenges.failed.push(i)
				DATA.challenges.failed.sort()
			}
		}
	}
}

function _save() {
	fs.writeFileSync('./debug.json', JSON.stringify(DATA))
}

module.exports = {
	addFailedAttempt: addFailedAttempt,
	addSuccessfulAttempt: addSuccessfulAttempt,
	listChallengesIn: function listChallengesIn(ctx) {
		const list = []
		for (let j = 0; j <= ctx.chC; j++) if (j.toString() in ctx) list.push(ctx[j.toString()].i)
		return list
	}
}