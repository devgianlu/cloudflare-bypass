const axios = require('axios')



axios({
	method: 'GET',
	url: 'https://114514.wtf'
}).then((resp) => {
	console.log(resp)
}).catch((err) => {
	console.error(err)
})

module.exports = {}