const CloudflareBypass = require('./index')

const cld = new CloudflareBypass('https://114514.wtf') // https://www.paribu.com/
cld.request().then((result) => {
	console.log('DONE!', result)
}).catch((err) => {
	console.error(err)
})