const CloudflareBypass = require('./index')

const cld = new CloudflareBypass('https://114514.wtf')
cld.request().then((result) => {
	console.log('YAY!!', result)
}).catch((err) => {
	console.error('NOOO', err)
})