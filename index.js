const axios = require('axios')
const crypto = require('crypto')
const vm = require('vm')
const {JSDOM} = require('jsdom')
const lz = require('./lz')
const {addSuccessfulAttempt, addFailedAttempt} = require('./debugging')


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

	cookieHeader(logCookies = true) {
		if (Object.keys(this._cookies).length === 0)
			return ''

		let str = ''
		for (let key in this._cookies)
			str += key + '=' + this._cookies[key] + ';'

		str = str.substring(0, str.length - 1)
		if (logCookies) console.debug('Cookie header:', str)
		return str
	}
}


class CloudflareBypass {
	constructor(url) {
		this._userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36' // FIXME
		this._cookies = new ManagedCookies()
		this._axios = axios.create({
			baseURL: url,
			validateStatus: function () {
				return true
			}
		})

		const parsed = new URL(url)
		this._axios.interceptors.request.use((config) => {
			config.headers['User-Agent'] = this._userAgent
			config.headers['Origin'] = parsed.scheme + '://' + parsed.host
			config.headers['Referer'] = url
			config.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
			config.headers['Accept-Language'] = 'en-US,en;q=0.9'
			config.headers['Accept-Encoding'] = 'gzip, deflate' // TODO: br
			return config
		}, function (error) {
			return Promise.reject(error)
		})
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

		console.log(data)

		const bigArray = data.match(/a='(?<a>.*)'\.split/)[1].split(',')
		for (let i = 0; i < bigArray.length; i++) {
			if (!('lzAlphabet' in values) && bigArray[i].length === 65 && bigArray[i].indexOf('$') !== -1)
				values['lzAlphabet'] = bigArray[i]
		}

		if (!('lzAlphabet' in values))
			throw new Error('Couldn\'t find LZ alphabet.')

		values['challengePath'] = data.match(/\/[.|0-9]*:\d{10}:.{64}\//)[0]
		if (!('challengePath' in values))
			throw new Error('Couldn\'t find challenge path.')

		return values
	}

	async _sendCompressed(url, data, alphabet, raySuffix) {
		console.log('================ SENDING RESPONSE ================')

		const payload = lz.compress(JSON.stringify(data), alphabet).replace('+', '%2b')
		console.debug('Crafted payload:', payload)

		console.debug('Sending to', url)
		const chResp = await this._axios.request({
			method: 'POST',
			url: url,
			headers: {
				'Cookie': this._cookies.cookieHeader(),
				'Content-type': 'application/x-www-form-urlencoded',
				'CF-Challenge': this._opts['cHash']
			},
			data: 'v_' + this._opts['cRay'] + '=' + payload
		})

		console.log('Response code:', chResp.status)

		const seq = this._cookies.grabFrom('cf_chl_seq_' + this._opts['cHash'], chResp)
		console.debug('cf_chl_seq:', seq)

		if (chResp.status !== 200)
			throw new Error('Bad challenge response: ' + chResp.status)

		console.log('==================================================\n')
		return this._decodeResponse(chResp.data, raySuffix)
	}

	async _execScript(chScript) {
		console.log('================ EXECUTING SCRIPT ================')
		console.debug(chScript, '\n')

		let sendUrl = null
		const chContext = this._jsdom.getInternalVMContext()
		const ctxWindow = {
			_cf_chl_opt: this._opts,
			_cf_chl_ctx: this._ctx,
			SHA256: function (input) {
				const hash = crypto.createHash('sha256')
				hash.update(input)
				return hash.digest().toString()
			},
			sendRequest: function (url) {
				sendUrl = url
			}
		}
		Object.assign(chContext['window'], ctxWindow)

		this._cookies.putProgram('b' + this._ctx.chLog.c)

		const script = new vm.Script(chScript)
		script.runInNewContext(chContext)

		await new Promise((resolve) => setTimeout(resolve, 1000))

		this._cookies.putProgram('a' + this._ctx.chLog.c)

		console.debug('Context after:', JSON.stringify(this._ctx))
		console.log('Send URL:', sendUrl)
		console.log('==================================================\n')
		return sendUrl
	}

	_setupJsDom() {
		const ctx = this._jsdom.getInternalVMContext()
		const _getElementById = ctx.document.getElementById.bind(ctx.document)
		ctx.document.getElementById = function (id) {
			const elm = _getElementById(id)
			if (id !== 'challenge-form')
				return elm

			const _appendChild = elm.appendChild.bind(elm)
			elm.appendChild = function (child) {
				const result = _appendChild(child)
				if (child instanceof ctx['Image']) {
					setTimeout(() => child.dispatchEvent(new ctx['Event']('load')), 50)
				}

				return result
			}

			return elm
		}
	}

	async _solveIuam() {
		console.debug('Solving IUAM challenge.')

		const scriptData = (await this._axios.request({
			method: 'GET',
			url: '/cdn-cgi/challenge-platform/orchestrate/jsch/v1',
			headers: {
				'Cookie': this._cookies.cookieHeader(false)
			}
		})).data

		const extracted = this._extractFromScript(scriptData)
		console.debug('Extracted script values:', JSON.stringify(extracted))

		this._ctx = {
			chLog: {'c': 0},
			chReq: this._opts['cType'],
			cNounce: this._opts['cNounce'],
			chC: 0, chCAS: 0, oV: 1,
			cRq: this._opts['cRq']
		}
		this._ctx.chLog[this._ctx.chLog.c++] = {'start': new Date().getTime()}

		this._cookies.putProgram('e')

		let url = '/cdn-cgi/challenge-platform/generate/ov' + 1 + extracted['challengePath'] + this._opts['cRay'] + '/' + this._opts['cHash']
		while (true) {
			const chScript = await this._sendCompressed(url, this._ctx, extracted['lzAlphabet'], 0)
			if (chScript.indexOf('window.location.reload();') !== -1) {
				addFailedAttempt(this._ctx) // FIXME
				console.debug('Told to reload.')

				this._cookies.putProgram('F' + this._ctx.chLog.c)
				return this.request()
			} else if (chScript.indexOf('formEl.submit();') !== -1) {
				addSuccessfulAttempt(this._ctx) // FIXME
				console.log('FINAL_SCRIPT', chScript)
				break
			}

			url = await this._execScript(chScript)
			if (!url)
				throw new Error('Couldn\'t complete all challenges.')
		}

		console.log('DONEEEEEEEEEEEEEEEEEEEEEEEEEEE')
	}

	async request() {
		const resp = await this._axios.request({
			method: 'GET',
			url: '/',
			headers: {
				'Cookie': this._cookies.cookieHeader()
			}
		})

		const cfduid = this._cookies.grabFrom('__cfduid', resp) || this._cookies.get('__cfduid')
		console.debug('Cloudflare UID:', cfduid)

		this._opts = this._extractFromPage(resp.data)
		console.debug('Extracted options:', JSON.stringify(this._opts))

		await this._axios.request({
			method: 'GET', url: '/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=' + this._opts['cRay'],
			headers: {
				'User-Agent': this._userAgent,
				'Cookie': this._cookies.cookieHeader(false)
			}
		})

		await this._axios.request({
			method: 'GET', url: '/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=' + this._opts['cRay'],
			headers: {
				'Cookie': this._cookies.cookieHeader(false)
			}
		})

		this._jsdom = new JSDOM(resp.data, {
			runScripts: 'dangerously',
			pretendToBeVisual: true,
			url: resp.request.res.responseUrl
		})
		this._setupJsDom()

		if (resp.headers['server'].startsWith('cloudflare') && (resp.status === 429 || resp.status === 503)) {
			if (/cpo.src\s*=\s*"\/cdn-cgi\/challenge-platform\/orchestrate\/jsch\/v1"/gmi.test(resp.data)) {
				return this._solveIuam()
			} else if (/cpo.src\s*=\s*"\/cdn-cgi\/challenge-platform\/orchestrate\/captcha\/v1"/gmi.test(resp.data)) {
				throw new Error('Captcha challenge not supported!')
			} else {
				throw new Error('Unknown challenge.')
			}
		}

		return resp
	}
}

module.exports = CloudflareBypass