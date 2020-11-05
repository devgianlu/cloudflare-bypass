module.exports = {
	patchJsDom: function (ctx) {
		const ts = new Date().getTime()

		function getRndInteger(min, max) {
			return Math.floor(Math.random() * (max - min)) + min
		}

		ctx['chrome'] = {
			csi: () => {
				const startE = ts - getRndInteger(60 * 1000, 120 * 1000)
				const onloadT = startE + getRndInteger(500, 2000)
				const pageT = getRndInteger(10 * 10000000, 60 * 10000000) / 1000
				return {'startE': startE, 'onloadT': onloadT, 'pageT': pageT, 'tran': getRndInteger(10, 20)}
			},
			loadTimes: () => {
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
			},
			app: {
				'isInstalled': false,
				'InstallState': {'DISABLED': 'disabled', 'INSTALLED': 'installed', 'NOT_INSTALLED': 'not_installed'},
				'RunningState': {'CANNOT_RUN': 'cannot_run', 'READY_TO_RUN': 'ready_to_run', 'RUNNING': 'running'}
			},
			runtime: {
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
	}
}