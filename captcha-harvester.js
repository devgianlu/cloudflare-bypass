const puppeteer = require('puppeteer')
const express = require('express')
const log = require('./logging')

class CaptchaHarvester {

	constructor(website, sitekey, port = 7777) {
		this._website = website
		this._sitekey = sitekey
		this._port = port
		this._app = express()
		this._app.use(express.urlencoded({extended: true}))
		this._server = this._app.listen(port)
	}

	async solveCaptcha() {
		if (!this._server)
			throw new Error('Cannot reuse instance of CaptchaHarvester.')

		let result = null
		this._app.post('/submit', (req, res) => {
			result = req.body.result
			res.header('Access-Control-Allow-Origin', '*')
			res.sendStatus(200)
		})

		const htmlBody = '<style>iframe {height: 500px !important; width: 500px !important;}</style>' +
			'<div class="h-captcha" data-sitekey="' + this._sitekey + '" data-callback="okCallback" data-expired-callback="expiredCallback" data-error-callback="errorCallback"></div>' +
			'<script src="https://hcaptcha.com/1/api.js" async defer></script>' +
			'<script>function send(body) {let req = new XMLHttpRequest();' +
			'req.open("POST", "http://localhost:' + this._port + '/submit", true);' +
			'req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");' +
			'req.send(body);} ' +
			'function okCallback(token) {send("result=" + token);}' +
			'function expiredCallback() {send("result=expired");}' +
			'function errorCallback() {send("result=error");}' +
			'</script>'

		const browser = await puppeteer.launch({headless: false})
		const page = await browser.newPage()

		await page.setRequestInterception(true)
		page.on('request', req => {
			if (!req.isNavigationRequest()) {
				req.continue()
				return
			}

			req.respond({status: 200, contentType: 'text/html', body: htmlBody})
		})

		await page.goto(this._website)

		log.info('Check your browser to solve the captcha.')
		while (!result) {
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		await browser.close()
		this._server.close()
		this._server = null

		return result
	}
}

module.exports = CaptchaHarvester