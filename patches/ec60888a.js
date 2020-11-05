module.exports = {
	patchJsDom: function (ctx, state) {
		ctx.window.performance.getEntries = function () {
			function makeResEntry(log, initiator) {
				return {
					entryType: 'resource',
					initiatorType: initiator,
					name: log.url,
					nextHopProtocol: log.httpVersion === '2' ? 'h2' : 'http/' + log.httpVersion,
					transferSize: log.totalLength,
					encodedBodySize: log.contentLength
				}
			}

			const list = []
			list.push({entryType: 'navigation', type: 'navigate'})

			let log = state.reqLog.find('/jschal/nojs/transparent.gif')
			list.push(makeResEntry(log, 'css'))

			list.push({entryType: 'paint', name: 'first-paint'})
			list.push({entryType: 'paint', name: 'first-contentful-paint'})

			log = state.reqLog.find('/orchestrate/jsch/v1')
			list.push(makeResEntry(log, 'script'))

			log = state.reqLog.find('/jschal/js/nocookie/transparent.gif')
			list.push(makeResEntry(log, 'img'))

			const logs = state.reqLog.find('/generate/ov1', false)
			for (let i = 0; i < logs.length; i++) {
				list.push(makeResEntry(logs[i], 'xmlhttprequest'))
			}

			list.push({entryType: 'mark', name: 'cp-n-' + parseInt(ctx['_cf_chl_ctx'].cNounce, 10)})

			return list
		}
	}
}