const CloudflareBypass = require('./index')

// https://botbroker.io/
// https://www.paribu.com/
// https://www.nakedcph.com/
const cld = new CloudflareBypass('https://114514.wtf')
cld.request().then((result) => {
	console.log('DONE!', result)
}).catch((err) => {
	console.error(err)
})