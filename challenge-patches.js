const fs = require('fs')
const log = require('./logging')

const PATCHES = {}
PATCHES['23452c7d'] = function (ctx, entry) {
	entry['a'] = JSON.parse(fs.readFileSync('./23452c7d_solution.json').toString())
}

PATCHES['ec60888a'] = function (ctx, entry, state) {
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

PATCHES['cf_win_chrome'] = function (ctx, entry) {
	const ts = new Date().getTime()

	function getRndInteger(min, max) {
		return Math.floor(Math.random() * (max - min)) + min
	}

	entry['csi'] = (() => {
		const startE = ts - getRndInteger(60 * 1000, 120 * 1000)
		const onloadT = startE + getRndInteger(500, 2000)
		const pageT = getRndInteger(10 * 10000000, 60 * 10000000) / 1000
		return {'startE': startE, 'onloadT': onloadT, 'pageT': pageT, 'tran': getRndInteger(10, 20)}
	})()

	entry['lT'] = (() => {
		const tsMicro = ts * 1000 + getRndInteger(0, 1000)
		return {
			'requestTime': tsMicro / 1000,
			'startLoadTime': tsMicro / 1000,
			'commitLoadTime': (tsMicro + getRndInteger(100, 500)) / 1000,
			'finishDocumentLoadTime': (tsMicro + getRndInteger(500, 600)) / 1000,
			'firstPaintTime': (tsMicro + getRndInteger(500, 700)) / 1000,
			'finishLoadTime': (tsMicro + getRndInteger(600, 700)) / 1000,
			'firstPaintAfterLoadTime': 0,
			'navigationType': 'Other',
			'wasFetchedViaSpdy': false,
			'wasNpnNegotiated': false,
			'npnNegotiatedProtocol': '',
			'wasAlternateProtocolAvailable': false,
			'connectionInfo': 'unknown'
		}
	})()

	entry['app'] = {
		'isInstalled': false,
		'InstallState': {'DISABLED': 'disabled', 'INSTALLED': 'installed', 'NOT_INSTALLED': 'not_installed'},
		'RunningState': {'CANNOT_RUN': 'cannot_run', 'READY_TO_RUN': 'ready_to_run', 'RUNNING': 'running'}
	}

	entry['rT'] = {
		'OnInstalledReason': {
			'CHROME_UPDATE': 'chrome_update',
			'INSTALL': 'install',
			'SHARED_MODULE_UPDATE': 'shared_module_update',
			'UPDATE': 'update'
		},
		'OnRestartRequiredReason': {'APP_UPDATE': 'app_update', 'OS_UPDATE': 'os_update', 'PERIODIC': 'periodic'},
		'PlatformArch': {
			'ARM': 'arm',
			'ARM64': 'arm64',
			'MIPS': 'mips',
			'MIPS64': 'mips64',
			'X86_32': 'x86-32',
			'X86_64': 'x86-64'
		},
		'PlatformNaclArch': {'ARM': 'arm', 'MIPS': 'mips', 'MIPS64': 'mips64', 'X86_32': 'x86-32', 'X86_64': 'x86-64'},
		'PlatformOs': {
			'ANDROID': 'android',
			'CROS': 'cros',
			'LINUX': 'linux',
			'MAC': 'mac',
			'OPENBSD': 'openbsd',
			'WIN': 'win'
		},
		'RequestUpdateCheckStatus': {
			'NO_UPDATE': 'no_update',
			'THROTTLED': 'throttled',
			'UPDATE_AVAILABLE': 'update_available'
		}
	}
}

PATCHES['6feeed9d'] = function (ctx, entry) {
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

module.exports = function (ctx, state = null) {
	for (let key in ctx) {
		if (!Object.hasOwnProperty.call(ctx, key))
			continue

		if (ctx[key].i in PATCHES) {
			PATCHES[ctx[key].i](ctx, ctx[key], state)
		}
	}
}