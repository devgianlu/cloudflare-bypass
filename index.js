const vm = require('vm')
const {JSDOM} = require('jsdom')
const lz = require('./lz')
const Http = require('./http')
const log = require('./logging')
const {patchJsDom, patchScript, patchContext} = require('./patches')
const {addSuccessfulAttempt, addFailedAttempt, listChallengesIn} = require('./debugging')


class ManagedCookies {
	constructor() {
		this._cookies = {}
	}

	get(name) {
		return name in this._cookies ? this._cookies[name] : undefined
	}

	put(name, value) {
		this._cookies[name] = value
	}

	removeAll(remover) {
		for (let key in this._cookies) {
			if (remover(key)) delete this._cookies[key]
		}
	}

	putProgram(value) {
		this.put('cf_chl_prog', value)
	}

	grabFrom(name, resp) {
		const header = resp.headers['set-cookie']
		if (!header) return undefined

		for (let i = 0; i < header.length; i++) {
			if (header[i].startsWith(name + '=')) {
				const value = header[i].substring(name.length + 1, header[i].indexOf(';'))
				this.put(name, value)
				return value
			}
		}

		return undefined
	}

	cookieHeader(logPrefix = undefined) {
		if (Object.keys(this._cookies).length === 0)
			return ''

		let str = ''
		for (let key in this._cookies)
			str += key + '=' + this._cookies[key] + ';'

		str = str.substring(0, str.length - 1)
		if (logPrefix) log.debug(logPrefix + 'Cookie header: ' + str)
		return str
	}
}

class RequestsLog {
	constructor() {
		this._list = []
	}

	put(resp) {
		function headersLength() {
			const headers = resp.res.rawHeaders
			let length = 0
			for (let i = 0; i < headers.length; i += 2) {
				length += headers[i].length + 2 + headers[i + 1].length + 2
			}
			return length
		}

		let bodyLength = parseInt(resp.headers['content-length'])
		if (!bodyLength) bodyLength = resp.data.length // Must be the encoded length

		let totalLength = 0
		totalLength += resp.res.httpVersion.length + resp.res.statusMessage.length + 7 // HTTP/1.1 200 OK\n\r
		totalLength += headersLength()
		totalLength += 2 // \n\r
		totalLength += bodyLength

		this._list.push({
			url: resp.url,
			contentLength: bodyLength,
			httpVersion: resp.res.httpVersion,
			totalLength: totalLength
		})
	}

	find(urlMatch, first = true) {
		const list = []

		for (let i = 0; i < this._list.length; i++) {
			if (this._list[i].url.indexOf(urlMatch) !== -1)
				if (first) return this._list[i]
				else list.push(this._list[i])
		}

		if (first) return undefined
		else return list
	}

	clear() {
		this._list = []
	}
}

/**
 * @typedef BypassResult
 * @property cloudflare {boolean} Whether the website is actually protected by Cloudflare
 * @property cfClearance {?string} The Cloudflare clearance cookie
 * @property cfdUid {?string} The Cloudflare UID
 */

class CloudflareBypass {
	/**
	 * Create a new instance for the given website
	 * @param url {string} The string URL
	 */
	constructor(url) {
		this._url = new URL(url)
		this._userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36' // FIXME: Rotate agents
		this._cookies = new ManagedCookies()
		this._httpClient = new Http(this._url)
		this._reqLog = new RequestsLog()
	}

	async _http(options) {
		if (!('headers' in options)) options['headers'] = {}
		options.headers['User-Agent'] = this._userAgent
		options.headers['Origin'] = this._url.protocol + '//' + this._url.host
		options.headers['Referer'] = this._url.toString()
		options.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
		options.headers['Accept-Language'] = 'en-US,en;q=0.9'

		const resp = await this._httpClient.request(options)
		this._reqLog.put(resp)
		return resp
	}

	_decodeResponse(data, raySuffix) {
		let v = 32
		const w = this._opts['cRay'] + '_' + raySuffix
		for (let i = 0; i < w.length; i++) {
			v ^= w.charCodeAt(i)
		}

		let t = []
		let q = 1
		for (let u = 0; q; q = data.charCodeAt(u++), !isNaN(q) && t.push(String.fromCharCode((q - v) % 65535))) ;
		return t.join('')
	}

	_extractFromPage(data) {
		const obj = data.match(/window\._cf_chl_opt=({.*?}.*?})/s)[1]
		return new Function('return ' + obj)()
	}

	_extractFromScript(data) {
		const values = {}

		let match = data.match(/a='(?<a>.*)'\.split\('(.)'\)/)
		if (!match) throw new Error('Couldn\'t find \'a\' array in script.')

		const bigArray = match[1].split(match[2])
		for (let i = 0; i < bigArray.length; i++) {
			if (!('lzAlphabet' in values) && bigArray[i].length === 65 && bigArray[i].indexOf('$') !== -1)
				values['lzAlphabet'] = bigArray[i]
		}

		if (!('lzAlphabet' in values))
			throw new Error('Couldn\'t find LZ alphabet.')

		match = data.match(/\/[.|0-9]*:\d{10}:.{64}\//)
		if (!match)
			throw new Error('Couldn\'t find challenge path.')

		values['challengePath'] = match[0]
		if (!('challengePath' in values))
			throw new Error('Couldn\'t find challenge path.')

		return values
	}

	async _sendCompressed(url, data, alphabet, raySuffix) {
		const logPrefix = '(' + url.substring(url.indexOf('ov1/') + 3) + ') '

		log.http(logPrefix + 'Sending response...')

		const payload = lz.compress(JSON.stringify(data), alphabet).replace('+', '%2b')
		log.verbose(logPrefix + 'Crafted payload: ' + payload)

		const chResp = await this._http({
			method: 'POST',
			url: url,
			headers: {
				'Cookie': this._cookies.cookieHeader(logPrefix),
				'Content-type': 'application/x-www-form-urlencoded',
				'CF-Challenge': this._opts['cHash']
			},
			data: 'v_' + this._opts['cRay'] + '=' + payload
		})
		log.http(logPrefix + 'Sent response, status: ' + chResp.status)

		this._cookies.grabFrom('cf_chl_seq_' + this._opts['cHash'], chResp)
		if (chResp.status !== 200)
			throw new Error('Bad challenge response: ' + chResp.status)

		return this._decodeResponse(chResp.data, raySuffix)
	}

	_execScript(scriptStr, window = {}) {
		const chContext = this._jsdom.getInternalVMContext()
		chContext.window['_cf_chl_opt'] = this._opts
		chContext.window['_cf_chl_ctx'] = this._ctx
		Object.assign(chContext.window, window)

		const script = new vm.Script(scriptStr)
		return script.runInNewContext(chContext)
	}

	async _execChallenge(chScript, maxWait = 1000) {
		let sendUrl = null
		const window = {
			sendRequest: function (url) {
				sendUrl = url
			}
		}

		this._cookies.putProgram('b' + this._ctx.chLog.c)

		this._execScript(chScript, window)

		while (!sendUrl && maxWait > 0) {
			await new Promise((resolve) => setTimeout(resolve, 50))
			maxWait -= 50
		}

		this._cookies.putProgram('a' + this._ctx.chLog.c)

		patchContext(this._ctx, {reqLog: this._reqLog})
		log.verbose('(' + this._opts['cHash'] + ') Context after script exec: ' + JSON.stringify(this._ctx))
		return sendUrl
	}

	async _initScript(chPlatUrl, type) {
		const scriptResp = await this._http({
			method: 'GET',
			url: chPlatUrl + '/orchestrate/' + type + '/v1',
			headers: {
				'Cookie': this._cookies.cookieHeader(false)
			}
		})

		if (scriptResp.status !== 200)
			throw new Error('Bad (' + type + ') orchestrate script status: ' + scriptResp.status)

		log.silly('Requested (' + type + ') orchestrate script.', scriptResp.data)

		const extracted = this._extractFromScript(scriptResp.data)
		log.verbose('Extracted script values: ' + JSON.stringify(extracted))

		this._ctx = {
			chLog: {'c': 0},
			chReq: this._opts['cType'],
			cNounce: this._opts['cNounce'],
			chC: 0, chCAS: 0, oV: 1,
			cRq: this._opts['cRq']
		}
		this._ctx.chLog[this._ctx.chLog.c++] = {'start': new Date().getTime()}

		return extracted
	}

	/**
	 * Internal handling of challenge solving.
	 * @param chPlatUrl The base challenge platform URL
	 * @param type The challenge type
	 * @returns {Promise<BypassResult>} A promise resolving to the bypass result
	 * @private
	 */
	async _solve(chPlatUrl, type) {
		const logPrefix = '(' + this._opts['cHash'] + ') '
		log.info(logPrefix + 'Solving ' + type + ' challenge...')

		const extracted = await this._initScript(chPlatUrl, type)

		this._cookies.putProgram('e')

		let lastChScript = null
		let url = chPlatUrl + '/generate/ov1' + extracted['challengePath'] + this._opts['cRay'] + '/' + this._opts['cHash']
		while (url) {
			let chScript = await this._sendCompressed(url, this._ctx, extracted['lzAlphabet'], 0)
			if (chScript.indexOf('window.location.reload();') !== -1) {
				log.error(lastChScript)
				log.info(logPrefix + 'Failed solving challenges (' + listChallengesIn(this._ctx).join(', ') + '). Reloading.')
				addFailedAttempt(this._ctx)

				this._cookies.putProgram('F' + this._ctx.chLog.c)
				return this.request()
			} else if (chScript.indexOf('formEl.submit();') !== -1) {
				log.info(logPrefix + 'Solved challenges (' + listChallengesIn(this._ctx).join(', ') + ').')
				addSuccessfulAttempt(this._ctx)

				log.silly(logPrefix + 'Executing final script...')
				this._execScript(chScript.replace('formEl.submit();', ''), {_cf_chl_done_ran: true})

				const form = this._execScript('new FormData(document.getElementById("challenge-form")).entries();')
				const result = {}
				for (let pair of form) result[pair[0]] = pair[1]
				log.verbose(logPrefix + 'Challenge form data: ' + JSON.stringify(result), result)

				await new Promise((resolve) => setTimeout(resolve, 3000 /* Should be 4000, but we waited 1000 already */))

				const formUrl = this._jsdom.window.document.getElementById('challenge-form').action
				log.http(logPrefix + 'Sending form to ' + formUrl)
				const resp = await this._http({
					method: 'POST',
					url: formUrl,
					headers: {
						'Content-type': 'application/x-www-form-urlencoded',
						'Cookie': this._cookies.cookieHeader(false)
					},
					data: (function (obj) {
						let urlEncodedDataPairs = []
						for (let name in obj) urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(obj[name]))
						return urlEncodedDataPairs.join('&').replace(/%20/g, '+')
					}(result))
				})

				log.http(logPrefix + 'Sent form, status: ' + resp.status)

				if (resp.status === 403) {
					// FIXME: Request log issues (maybe)
					return await this._request(resp)
				}

				if (resp.status === 301) {
					const cfClearance = this._cookies.grabFrom('cf_clearance', resp)
					log.info(logPrefix + 'CF clearance: ' + cfClearance)
					return {cloudflare: true, cfClearance: cfClearance, cfdUid: this._cookies.get('__cfduid')}
				} else {
					throw new Error('Unknown challenge response code: ' + resp.status)
				}
			}

			log.silly(logPrefix + 'Executing challenge script...')

			chScript = patchScript(chScript)
			url = await this._execChallenge(lastChScript = chScript, type === 'captcha' ? 120000 : 1000)
			if (!url) {
				log.error(chScript)
				log.info(logPrefix + 'Couldn\'t complete all challenges (' + listChallengesIn(this._ctx).join(', ') + '). Reloading.')
				addFailedAttempt(this._ctx)

				this._cookies.putProgram('F' + this._ctx.chLog.c)
				return this.request()
			}
		}
	}

	/**
	 * Internal handling of the "index" page response
	 * @param resp
	 * @returns {Promise<{cfClearance: any, cfdUid: any}>}
	 * @private
	 */
	async _request(resp) {
		this._cookies.removeAll((name) => {
			return name.startsWith('cf_chl_seq_')
		})

		const cfduid = this._cookies.grabFrom('__cfduid', resp) || this._cookies.get('__cfduid')
		log.verbose('Cloudflare UID: ' + cfduid)

		this._opts = this._extractFromPage(resp.data)
		log.verbose('Extracted options: ' + JSON.stringify(this._opts), this._opts)

		log.silly('Requesting js/nocookie/transparent.gif...')
		await this._http({
			method: 'GET', url: '/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=' + this._opts['cRay'],
			headers: {
				'User-Agent': this._userAgent,
				'Cookie': this._cookies.cookieHeader(false)
			}
		})

		log.silly('Requesting nojs/transparent.gif...')
		await this._http({
			method: 'GET', url: '/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=' + this._opts['cRay'],
			headers: {
				'Cookie': this._cookies.cookieHeader(false)
			}
		})

		this._jsdom = new JSDOM(resp.data, {
			runScripts: 'dangerously',
			pretendToBeVisual: true,
			url: resp.url
		})
		patchJsDom(this._jsdom, {url: this._url, userAgent: this._userAgent, reqLog: this._reqLog})

		try {
			if (resp.headers['server'].startsWith('cloudflare')) {
				let match = resp.data.match(/cpo.src\s*=\s*"\/cdn-cgi\/challenge-platform(\/h\/.)?\/orchestrate\/jsch\/v1"/mi)
				if (match && (resp.status === 429 || resp.status === 503)) {
					if (match[1]) {
						log.info('Using platform: ' + match[1])
						return await this._solve('/cdn-cgi/challenge-platform' + match[1], 'jsch')
					} else {
						log.info('Using default platform')
						return await this._solve('/cdn-cgi/challenge-platform', 'jsch')
					}
				} else {
					match = resp.data.match(/cpo.src\s*=\s*"\/cdn-cgi\/challenge-platform(\/h\/.)?\/orchestrate\/captcha\/v1"/mi)
					if (match && resp.status === 403) {
						if (match[1]) {
							log.info('Using platform: ' + match[1])
							return await this._solve('/cdn-cgi/challenge-platform' + match[1], 'captcha')
						} else {
							log.info('Using default platform')
							return await this._solve('/cdn-cgi/challenge-platform', 'captcha')
						}
					} else {
						console.error(resp.data)
						throw new Error('Unknown challenge.')
					}
				}
			} else {
				return {cloudflare: false}
			}
		} finally {
			this._jsdom.window.close()
		}
	}

	/**
	 * Makes a request for the specified website
	 * @returns {Promise<BypassResult>} A promise resolving to the bypass result
	 */
	async request() {
		this._reqLog.clear()

		log.info('Requesting index page...')
		const resp = await this._http({
			method: 'GET',
			url: '/',
			headers: {
				'Cookie': this._cookies.cookieHeader()
			}
		})

		return this._request(resp)
	}
}

module.exports = CloudflareBypass