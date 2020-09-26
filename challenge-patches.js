const fs = require('fs')

const PATCHES = {}
PATCHES['23452c7d'] = function (ctx, entry) {
	entry['a'] = JSON.parse(fs.readFileSync('./23452c7d_solution.json').toString())
}

PATCHES['ec60888a'] = function (ctx, entry, state) {
	function makeResEntry(log, initiator) {
		return {t: 'r', i: initiator, n: log.url, nh: log.httpVersion === '2' ? 'h2' : 'http/' + log.httpVersion, ts: log.totalLength, bs: log.contentLength}
	}

	const list = []
	list.push({t: 'n', i: 'navigate'})

	let log = state.reqLog.find('/jschal/nojs/transparent.gif')
	list.push(makeResEntry(log, 'css'))

	list.push({t: 'p', i: 'first-paint'})
	list.push({t: 'p', i: 'first-contentful-paint'})

	log = state.reqLog.find('/orchestrate/jsch/v1')
	list.push(makeResEntry(log, 'script'))

	log = state.reqLog.find('/jschal/js/nocookie/transparent.gif')
	list.push(makeResEntry(log, 'img'))

	const logs = state.reqLog.find('/generate/ov1', false)
	for (let i = 0; i < logs.length; i++) {
		list.push(makeResEntry(logs[i], 'xmlhttprequest'))
	}

	list.push({t: 'mark', 'n': 'cp-n-' + parseInt(ctx.cNounce, 10)})

	console.debug('ec60888a:', list)
	entry['p'] = list
}

module.exports = function (ctx, state = null) {
	for (let key in ctx) {
		if (!Object.hasOwnProperty.call(ctx, key))
			continue

		if (ctx[key].i in PATCHES) {
			PATCHES[ctx[key].i](ctx, ctx[key], state)
		}
	}
}