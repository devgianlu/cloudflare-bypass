const CaptchaHarvester = require('../captcha-harvester')
const log = require('../logging')

module.exports = {
	patchJsDom: function (ctx, state) {
		ctx.window['_cf_chl_hloaded'] = true
		ctx.window['hcaptcha'] = {
			render: function (id, opts) {
				const siteKey = opts.sitekey
				log.info('Site key is ' + siteKey)

				const harvester = new CaptchaHarvester(state.url, siteKey, state.userAgent)
				harvester.solveCaptcha().then((result) => {
					if (result === 'error') {
						log.info('Failed solving captcha, error.')
						opts['error-callback']()
					} else if (result === 'expired') {
						log.info('Failed solving captcha, expired.')
						opts['expired-callback']()
					} else {
						log.info( 'Solved captcha, token is ' + result)
						opts.callback(result)
					}
				}).catch((err) => {
					log.error('Failed solving captcha, harvester error.', err)
					opts['error-callback']()
				})
			}
		}
	}
}