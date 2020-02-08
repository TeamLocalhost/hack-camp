var express = require('express')
var bodyParser = require('body-parser')
const { spawn } = require("child_process");
const splitFile = require('split-file');
const Tracker = require('../download_server/tracker')
const jwt = require('jsonwebtoken')

var app = express()
port = 8080

function splitChunks(file) {
    // const com= spawn("tar",["cvzf",file,file])
    // com.on("close",code=>{
    //     if(!code){
    //         console.log(`Compressed ${file}  succesfully`);
    //     }
    // })
    splitFile.splitFileBySize(__dirname + '/downloads/' + file + '/' + file, 1000000)
        .then((names) => {
            console.log(names);
            const del = spawn("rm", [__dirname + '/downloads/' + file + '/' + file]);
            del.on("close", code => {
                if (!code) {
                    console.log(`Deleted ${file}  succesfully`);
                }
            })
        })
        .catch((err) => {
            console.log('Error: ', err);
        });
}


app.use(bodyParser.json())  //Parsing 
app.use(bodyParser.urlencoded()); // URL parsing

// Table to maintain chunks for all groups
let table = {}

//{
// 	"link":"https://www.tutorialspoint.com/expressjs/expressjs_restful_apis.htm"
// }

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
    // const down = spawn("wget", [file_url, "-P", "downloads/" + file + "/bin"]);
    res.send({ status: "success", group_token: group_token })
    table[group_token] = new Tracker()


    // down.on("close", code => {
    //     console.log(`child process exited with code ${code}`);
    //     if (!code) 
    //     {
    //         // res.send({ status: "success",group_token:group_token })
    //         splitChunks(file)
    //     }
    //     else {
    //         res.send({ status: "error" })
    //     }
    // })

})

app.post('/ack-chunk',(req,res)=>{
    table[req.body.group_token].table[req.body.chunk_id].setStatus()
    console.log(table[req.body.group_token].table)
})

// end point which sends the user next chunk
app.get('/get-next-chunk', (req, res) => {
    console.log(table)
    console.log(req.query.group_token)
    try {

        let current_chunk = table[req.query.group_token].chunk_counter
        console.log(current_chunk)
        table[req.query.group_token].assignNextChunk(req.query.userid)
        res.set({
            'Content-Disposition': 'attachment; filename=' + 'chunk' + current_chunk,
            'chunk-id':current_chunk
            // 'Content-Type': res.headers['Content-Type']
        });

        // To add when to stop, for now send node error and nothing happens
        res.sendFile(__dirname + '/downloads/chunk' + current_chunk)


    }
    catch (err) {
        res.send({ status: "error" })
    }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

