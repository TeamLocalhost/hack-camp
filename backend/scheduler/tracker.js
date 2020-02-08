// This files tracks the chunks and schedules them to the user on request

class chunk {
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
    constructor(group_id, chunk_size) {
        this.gid = group_id
        this.chunk_size = chunk_size
        this.table = new Array()
    }

    assignNextChunk(user_id) {
        this.table.push(new chunk(user_id))
    }

    getTable() {
        console.log(this.table)
    }
}
