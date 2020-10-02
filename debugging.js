const fs = require('fs')

/**
 * @type {boolean}
 */
const ENABLED = true

/**
 * @typedef Data
 * @property failed {object[]}
 * @property success {object[]}
 * @property deltas {object}
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
		return {challenges: {all: [], ok: [], failed: []}, deltas: {}, success: [], failed: []}
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
	const list = listChallengesIn(ctx)

	for (let j = 0; j < list.length; j++) {
		const id = list[j]

		if (!(id in DATA.deltas)) DATA.deltas[id] = 0
		DATA.deltas[id] += success ? 1 : -1

		if (DATA.challenges.all.indexOf(id) === -1) {
			DATA.challenges.all.push(id)
			DATA.challenges.all.sort()
		}

		if (success) {
			if (DATA.challenges.ok.indexOf(id) === -1) {
				DATA.challenges.ok.push(id)
				DATA.challenges.ok.sort()
			}

			let index = DATA.challenges.failed.indexOf(id)
			if (index !== -1) DATA.challenges.failed.splice(index, 1)
		} else {
			if (DATA.challenges.ok.indexOf(id) === -1 && DATA.challenges.failed.indexOf(id) === -1) {
				DATA.challenges.failed.push(id)
				DATA.challenges.failed.sort()
			}
		}
	}
}

function _save() {
	fs.writeFileSync('./debug.json', JSON.stringify(DATA))
}

function listChallengesIn(ctx) {
	const list = []
	for (let j = 0; j < ctx.chLog.c; j++) {
		const id = ctx.chLog[j.toString()].i
		if (typeof id === 'string' && j.toString() in ctx.chLog && list.indexOf(id) === -1)
			list.push(id)
	}
	return list
}

module.exports = {
	addFailedAttempt: addFailedAttempt,
	addSuccessfulAttempt: addSuccessfulAttempt,
	listChallengesIn: listChallengesIn
}