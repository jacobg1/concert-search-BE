// function helper that splits objects into chunks
function chunkObject( myObject, chunk_size ) {

    let index = 0
    let objectLength = myObject.length
    let resultArray = []
   
    for (index = 0; index < objectLength; index += chunk_size) {

        myChunk = myObject.slice( index, index + chunk_size )

        myChunk = {...myChunk}
        
        resultArray.push( myChunk )
       
    }
    
    // add has more key value pair if it isn't the last chunk
    for(let x = 0; x < resultArray.length; x++) {

        if(x !== ( resultArray.length - 1 )) {
            resultArray[x].hasMore = true
        } else {
            resultArray[x].hasMore = false
        }
    }

    return resultArray
}

module.exports = chunkObject