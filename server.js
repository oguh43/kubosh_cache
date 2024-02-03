const express = require('express');
const fs = require("fs")
const { exec, spawnSync } = require("child_process");


const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const PORT = 4004;
app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html")
})
app.get("/file.php",(res,req)=>{
    console.log("HERE")
})

app.post('/upload', function(req, res) {
    if (req.body.password !== "abcdef"){
        res.status(403).send("Chybné heslo!")
        return
    }
    

  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + '/uploads/' + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send('File uploaded to ' + uploadPath);
    newName =  __dirname+"/uploads/"+Math.floor(new Date().getTime() / 1000).toString()+"."+uploadPath.split(".")[uploadPath.split(".").length-1]
    fs.renameSync(uploadPath, newName)
    fType = uploadPath.split(".")[uploadPath.split(".").length-1]
    if (["pdf","txt","png","jpg","jpeg"].includes(fType)){
        printFile(newName)
    }else{
        toPdf(newName)
    }
});
});

app.listen(PORT, function() {
  console.log('Express server listening on port ', PORT); // eslint-disable-line
});

function toPdf(path){//$ libreoffice --headless --convert-to pdf ~/Documents/MyDocument.odf
    
    newPath = `${path.split(".").slice(0,-1).join("")}.pdf`
    console.log(newPath)
    
    spawnSync("libreoffice",["--headless","--convert-to","pdf",path, "--outdir","/home/hugo/Desktop/print_server/uploads/"])
    
    printFile(newPath)
}

function printFile(path){
    exec(`lp ${path}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}