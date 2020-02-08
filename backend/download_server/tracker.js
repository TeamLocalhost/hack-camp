// This files tracks the chunks and schedules them to the user on request
class Chunk {
    /*  chunk
        @param user_id: who is assigned that chunk
        @param status: checks if the chunk was recieved and ack
    */
    constructor(user_id) {
        this.user_id = user_id
        this.status = 0
    }

    setStatus() {
        this.status = 1
    }
}

class Tracker {
    /*  Tracker class to maintain record of the chucks
    @param gid: group id , the group of user in that network
    @param chunk_size: the total size
    */
    constructor(chunk_size) {
        this.chunk_size = chunk_size
        this.table = new Array()
        this.chunk_counter = 0
    }

    getCurrentChunk(){
        return this.chunk_counter
    }
    assignNextChunk(user_id) {
        this.table.push(new Chunk(user_id))
        this.chunk_counter++
    }

    getTable() {
        console.log(this.table)
    }
}

module.exports = Tracker