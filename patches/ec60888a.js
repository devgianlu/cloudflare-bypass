module.exports = {
	patchContext: function (ctx, entry, state) {
		function makeResEntry(log, initiator) {
			return {
				t: 'r',
				i: initiator,
				n: log.url,
				nh: log.httpVersion === '2' ? 'h2' : 'http/' + log.httpVersion,
				ts: log.totalLength,
				bs: log.contentLength
			}
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

		list.push({t: 'm', n: 'cp-n-' + parseInt(ctx.cNounce, 10)})

		entry['p'] = list
	}
}