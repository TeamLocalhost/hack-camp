var express = require('express')
var bodyParser = require('body-parser')
const { spawn } = require("child_process");
const splitFile = require('split-file');
const Tracker = require('../download_server/tracker')

var app = express()
port=8080

function splitChunks(file){
    // const com= spawn("tar",["cvzf",file,file])
    // com.on("close",code=>{
    //     if(!code){
    //         console.log(`Compressed ${file}  succesfully`);
    //     }
    // })
    splitFile.splitFileBySize(__dirname + '/downloads/'+file+'/'+file, 1000000)
    .then((names) => {
      console.log(names);
      const del = spawn("rm",[__dirname + '/downloads/'+file+'/'+file]);
      del.on("close",code=>{
        if(!code){
            console.log(`Deleted ${file}  succesfully`);
        }
      })
    })
    .catch((err) => {
      console.log('Error: ', err);
    }); 
}


app.use(bodyParser.json())  //Parsing 

//{
// 	"link":"https://www.tutorialspoint.com/expressjs/expressjs_restful_apis.htm"
// }

app.post('/download', (req, res)=> {
    var d=req.body.link
    var file=d.split("/")
    file=file[(file.length)-1]
    const down = spawn("wget",[d,"-P", "downloads/"+file+"/bin"]);
    down.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if(!code){
            res.send({status:"success"})   
            splitChunks(file)
        }
        else{
            res.send({status:"error"})
        }
    })

})

// Pass unique gid
let table = new Tracker('g123',4)
let chunk_counter = 0

// end point which sends the user next chunk
app.get('/get-next-chunk',(req, res) => {
    table.assignNextChunk()
    res.set({
        'Content-Disposition': 'attachment; filename=' + 'chunk'+chunk_counter,
        'Content-Type': response.headers['content-type']
    });
    
    // Dummy path change it later
    res.sendFile('backend\download_server\downloads\chunk'+chunk_counter)
    chunk_counter++
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

