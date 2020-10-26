const http = require('http')
const https = require('https')

/**
 * @typedef HttpOptions
 * @property url {string} An absolute or relative URL
 * @property method {string} The request method
 * @property headers {?map{string, string}} The request headers
 * @property data {?any} The request body
 */

/**
 * @typedef HttpResponse
 * @property url {string} The request URL
 * @property status {int} The response status code
 * @property headers {map{string, string}} The response headers
 * @property data {?string} The response data
 * @property res {IncomingMessage} The original response
 */

class Http {

	/**
	 * Creates a new instance of this http(s) client
	 * @param baseUrl {URL} The base URL
	 */
	constructor(baseUrl) {
		this._baseUrl = baseUrl
	}

	_buildUrl(url) {
		if (/^(?:[a-z]+:)?\/\//i.test(url)) {
			return url
		} else {
			const _url = new URL(this._baseUrl.toString())
			_url.pathname += url
			return _url.toString()
		}
	}

	/**
	 * Makes a request
	 * @param options {HttpOptions} The options for the request
	 * @returns {Promise<HttpResponse>} A promise resolving to the response
	 */
	async request(options) {
		const url = this._buildUrl(options.url)

		let client
		if (url.indexOf('https://') === 0) {
			client = https
		} else if (url.indexOf('http://') === 0) {
			client = http
		} else {
			throw new Error('Invalid URL scheme: ' + url)
		}

		return new Promise((resolve, reject) => {
			const req = client.request(url, {
				method: options.method,
				headers: options.headers
			}, (res) => {
				res.setEncoding('utf8')
				res.on('error', (err) => reject(err))

				let data = ''
				res.on('data', (chunk) => data += chunk)
				res.on('end', () => {
					resolve({
						url: url,
						status: res.statusCode,
						headers: res.headers,
						data: data,
						res: res
					})
				})
			})

			req.on('error', (err) => reject(err))

			if ('data' in options) {
				req.write(options.data)
			}

			req.end()
		})
	}
}

module.exports = Http