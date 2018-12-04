// function helper that splits objects into chunks
function chunkObject( myObject, chunk_size ) {

    let index = 0
    let objectLength = myObject.length
    let resultArray = []

    for (index = 0; index < objectLength; index += chunk_size) {

        myChunk = myObject.slice( index, index + chunk_size )

        resultArray.push( myChunk )
    }

    return resultArray
}

module.exports = chunkObject