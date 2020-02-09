var express = require('express')
var bodyParser = require('body-parser')
const { exec } = require("child_process");
const splitFile = require('split-file');
const Tracker = require('../download_server/tracker')
const jwt = require('jsonwebtoken')


var app = express()
port = 8080
function splitChunks(file, group_token) {

    splitFile.splitFileBySize(__dirname + '/' + group_token + '/chunk', 1000000)
        .then((names) => {
            table[group_token] = new Tracker(names.length)
        })
        .catch((err) => {
            console.log('Error: ', err);
        });
}


app.use(bodyParser.json())  //Parsing 
app.use(bodyParser.urlencoded()); // URL parsing

// Table to maintain chunks for all groups
let table = {}

/* /download api

request:POST
body{
    "url":"https:www.google.com",
    "userToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiJrcmlzaCIsImlhdCI6MTU4MTE4NDQ0NX0._CpVAkcxtS1DKsBDDfoZmtxiua60uylf6RJVfM6l-fc"
}
url of file to download and 
userToken of the host user
*/

app.post('/download', (req, res) => {
    var file_url = req.body.url

    // unique token for file, this token can be shared wth other peers to join the group
    let group_token = jwt.sign({
        file_url: file_url,
        host: jwt.decode(req.body.userToken, 'frontendsucks').userid
    }, 'frontendsucks')

    var file = file_url.split("/")
    file = file[(file.length) - 1]
    exec('mkdir ' + group_token + ' && curl -o ' + group_token + '/chunk ' + file_url, (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send({ status: "error" })
            return;
        }

        splitChunks(file, group_token)      
        res.send({ status: "success", group_token: group_token })
    });



})

app.post('/ack-chunk', (req, res) => {
    table[req.body.group_token].table[req.body.chunk_id].setStatus()
    console.log(table[req.body.group_token].table)
})

app.get('/download-file/:group_token/:filename', (req, res) => {
    try {

            res.set({
                'Content-Disposition': 'attachment; filename=' + 'chunk' + current_chunk,
                'chunk-id': current_chunk
                // 'Content-Type': res.headers['Content-Type']
            });

            res.sendFile(__dirname + '/' + req.query.group_token + '/chunk.sf-part' + current_chunk)
            return;
        }
    
    catch (err) {
        res.send({ status: "error" })
    }  
})

// end point which sends the user next chunk
app.get('/get-next-chunk', (req, res) => {
    console.log(table)
    console.log(req.query.group_token)
    try {

        let current_chunk = table[req.query.group_token].chunk_counter
        console.log("curr:"+current_chunk)
        console.log("size:"+table[req.query.group_token].chunk_size);
        
        if (current_chunk <= table[req.query.group_token].chunk_size) {
            table[req.query.group_token].assignNextChunk(req.query.userid)
    
            res.send({status:"success",next:"chunk.sf-part"+current_chunk})

            return;
        }
        else{
            res.send({status:"success",message:"transmission completed"})
        }
    }
    catch (err) {
        res.send({ status: "error" })
    }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

