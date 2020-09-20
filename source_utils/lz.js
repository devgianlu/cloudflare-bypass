const lz = require('lz-string')

let alphabet = '' // LZ encode URI alphabet (65 chars string)
let input = '' // Request payload value of /generate/ov1/
input = input.replace(/ /g, '+')

const baseReverseDic = {}

function getBaseValue(alphabet, character) {
	if (!baseReverseDic[alphabet]) {
		baseReverseDic[alphabet] = {}
		for (let i = 0; i < alphabet.length; i++) {
			baseReverseDic[alphabet][alphabet.charAt(i)] = i
		}
	}
	return baseReverseDic[alphabet][character]
}

const output = lz._decompress(input.length, 32, function (index) {
	return getBaseValue(alphabet, input.charAt(index))
})
console.log(output)