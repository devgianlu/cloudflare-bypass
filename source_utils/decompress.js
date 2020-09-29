const input = '' // 'generate' response data
const cRay = '' // cRay

function decodeResponse(cRay, data, raySuffix) {
	let v = 32
	const w = cRay + '_' + raySuffix
	for (let i = 0; i < w.length; i++) {
		v ^= w.charCodeAt(i)
	}

	let t = []
	let q = 1
	for (let u = 0; q; q = data.charCodeAt(u++), !isNaN(q) && t.push(String.fromCharCode((q - v) % 65535))) ;
	return t.join('')
}

console.log(decodeResponse(cRay, input, 0))