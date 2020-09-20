const fs = require('fs')

const a = [] /* Copy big array here */
const b = function(c) {
	return a[c - 0]
}

const file = fs.readFileSync('./cloudflare_source/.js').toString() // Insert source file
const done = file.replace(/b\('0x(.*?)'\)/g, function (str, p1) {
	return '"' + b('0x' + p1) + '"'
})

fs.writeFileSync('./cloudflare_source/.js', done) // Insert output file