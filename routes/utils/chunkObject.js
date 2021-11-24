// function helper that splits objects into chunks
function chunkObject(myArrayOfObject, chunk_size) {
	let index = 0
	const objectLength = myArrayOfObject.length
	let resultArray = []

	for (index = 0; index < objectLength; index += chunk_size) {
		let myChunk = myArrayOfObject.slice(index, index + chunk_size)
		resultArray.push(myChunk)
	}

	return resultArray
}

module.exports = chunkObject