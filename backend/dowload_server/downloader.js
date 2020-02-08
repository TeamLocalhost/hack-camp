var express = require('express')
var bodyParser = require('body-parser')
const { spawn } = require("child_process");
const splitFile = require('split-file');

var app = express()
port=8080

function splitChunks(file){
    splitFile.splitFileBySize(__dirname + '/downloads/'+file+'/bin/'+file, 1000000)
    .then((names) => {
      console.log(names);
    })
    .catch((err) => {
      console.log('Error: ', err);
    }); 
}


app.use(bodyParser.json())
app.post('/', (req, res)=> {
    var d=req.body.link
    var file=d.split("/")
    file=file[(file.length)-1]
    const down = spawn("wget",[d,"-P", "downloads/"+file+"/bin"]);
    down.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if(!code){
            res.send("Success")          
            splitChunks(file)
        }
        else{
            res.send("Unable to download the file!!!")
        }
    })

})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))

