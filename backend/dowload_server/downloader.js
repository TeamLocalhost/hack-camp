var express = require('express')
var bodyParser = require('body-parser')
const { spawn } = require("child_process");
const splitFile = require('split-file');

var app = express()
port=8080

//Spliting files into chunks
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
    const down = spawn("wget",[d,"-P", "downloads/"+file]);
    down.on("close", code => {
        if(!code){
            res.send("Success")          
            console.log("Downloaded Succesfully")
            splitChunks(file)
        }
        else{
            res.send("Unable to download the file!!!")
        }
    })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

