const axios = require('axios')
const lz = require('./lz')


class ManagedCookies {
	constructor() {
		this._cookies = {}
	}

	put(name, value) {
		this._cookies[name] = value
	}

	grabFrom(name, resp) {
		const header = resp.headers['set-cookie']
		for (let i = 0; i < header.length; i++) {
			if (header[i].startsWith(name + '=')) {
				const value = header[i].substring(name.length + 1, header[i].indexOf(';'))
				this.put(name, value)
				return value
			}
		}

		return undefined
	}

	cookieHeader(additional = {}) {
		if (Object.keys(this._cookies).length === 0)
			return ''

		let str = ''
		for (let key in this._cookies)
			str += key + '=' + this._cookies[key] + ';'

		for (let key in additional)
			str += key + '=' + additional[key] + ';'

		str = str.substring(0, str.length - 1)
		return str
	}
}

class CloudflareBypass {
	constructor(url) {
		this._cookies = new ManagedCookies()
		this._axios = axios.create({
			baseURL: url,
			validateStatus: function () {
				return true
			}
		})
	}

	_decodeResponse(data, ray) {
		let v = 32
		const w = ray + '_' + 0
		for (let i = 0; i < w.length; i++) {
			v ^= w.charCodeAt(i)
		}

		let t = []
		let q = 1
		for (let u = 0; q; q = data.charCodeAt(u++), !isNaN(q) && t.push(String.fromCharCode((q - v) % 65535))) ;
		return t.join('')
	}

	_extractFromPage(data) {
		const values = {}

		const obj = data.match(/window\._cf_chl_opt=({.*?}.*?})/s)[1]
		values['opts'] = new Function('return ' + obj)()
		return values
	}

	_extractFromScript(data) {
		const values = {}

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

	async _solveIuam(resp) {
		console.debug('Solving IUAM challenge.')

		const scriptData = (await this._axios.request({
			method: 'GET',
			url: '/cdn-cgi/challenge-platform/orchestrate/jsch/v1',
			headers: {
				'Cookie': this._cookies.cookieHeader()
			}
		})).data

		let extracted
		try {
			extracted = {...this._extractFromScript(scriptData), ...this._extractFromPage(resp.data)}
			console.debug('Extracted notable values:', JSON.stringify(extracted))
		} catch (e) {
			console.log('Page:', resp.data)
			console.log('Script:', scriptData)
			throw e
		}

		const ctx = {
			chLog: {'c': 0},
			chReq: extracted.opts['cType'],
			cNounce: extracted.opts['cNounce'],
			chC: 0, chCAS: 0, oV: 1,
			cRq: extracted.opts['cRq']
		}
		ctx.chLog[ctx.chLog.c++] = {'start': new Date().getTime()}
		console.debug('Crafted context:', JSON.stringify(ctx))

		const url = '/cdn-cgi/challenge-platform/generate/ov' + 1 + extracted['challengePath'] + extracted.opts['cRay'] + '/' + extracted.opts['cHash']
		console.debug('Crafted URL:', url)

		const payload = lz.compress(JSON.stringify(ctx), extracted['lzAlphabet']).replace('+', '%2b')
		console.debug('Crafted payload:', payload)

		const chResp = await this._axios.request({
			method: 'POST',
			url: url,
			headers: {
				'Cookie': this._cookies.cookieHeader({'cf_chl_prog': 'e'}),
				'Content-type': 'application/x-www-form-urlencoded',
				'CF-Challenge': extracted.opts['cHash']
			},
			data: 'v_' + extracted.opts['cRay'] + '=' + payload
		})
		
		if (chResp.status !== 200)
			throw new Error('Bad challenge response: ' + chResp.status)

		console.log(this._decodeResponse(chResp.data, extracted.opts['cRay'])) // TODO
	}

	async request() {
		const resp = await this._axios.request({
			method: 'GET',
			url: '/'
		})

		const cfduid = this._cookies.grabFrom('__cfduid', resp)
		console.debug('Cloudflare UID:', cfduid)

		if (resp.headers['server'].startsWith('cloudflare') && (resp.status === 429 || resp.status === 503)) {
			if (/cpo.src\s*=\s*"\/cdn-cgi\/challenge-platform\/orchestrate\/jsch\/v1"/gmi.test(resp.data)) {
				return this._solveIuam(resp)
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