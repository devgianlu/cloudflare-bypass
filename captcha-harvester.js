const puppeteer = require('puppeteer')
const express = require('express')
const fs = require('fs')
const log = require('./logging')

class CaptchaHarvester {

	constructor(website, sitekey, userAgent, port = 7777) {
		this._website = website
		this._sitekey = sitekey
		this._port = port
		this._userAgent = userAgent
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

		let htmlBody = fs.readFileSync('./harvester-body.html').toString()
		htmlBody = htmlBody.replace('{{SITEKEY}}', this._sitekey)
		htmlBody = htmlBody.replace('{{PORT}}', this._port.toString())

		const browser = await puppeteer.launch({headless: false})
		const context = browser.defaultBrowserContext()
		const page = (await context.pages())[0] || await context.newPage()
		await page.setUserAgent(this._userAgent)

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