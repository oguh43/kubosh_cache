var HTMLParser = require('node-html-parser');
const express = require("express");
const fs = require("fs")
const request = require("sync-request")
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server)
const PORT = 8005;
server.listen(PORT, () => {
	console.log(`Listening on port:${PORT}`)
})
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})
app.get("/file.php",(res,req)=>{
    console.log("HERE")
})

const basePaths = {
    "fit": "fit/"
}

var status = "free"
var connected = 0
io.on("connection", (socket) => {
	connected++;
	socket.emit("serverStatus", status)
	socket.on("disconnect", () => {
		connected--;
	})
    socket.on("takeSnapshot", takeSnapshot)
	/*socket.on("getPicture", (data)=>{
		hits++;
		if (data.base !== "test") {
			socket.emit("picture", {"img":[imageCache[data.base][data.kapitola][data.part][data.cvicenie]]})
		} else {
			if (secrets.usernames.includes(data.part) && secrets.passwords.includes(data.cvicenie)){
				socket.emit("picture", {"img":testCache[data.kapitola]})
			}else{
				socket.emit("picture", {"img":[errImg]})
			}
		}
	})*/
})
function handleEnd(msg){
    io.emit("serverResponse",msg)
    status = "free"
    io.emit("serverStatus", status)
}
function takeSnapshot(data){
    status = "busy"
    io.emit("serverStatus", status)
    if (data == "fit"){
        let res = request("GET", `https://www.fit.vut.cz/study/programs/?year=${getYear()}`)
        if (res.statusCode != 200){
            handleEnd("Remote (vut) server error")
            return
        }
        var root = HTMLParser.parse(res.getBody())
        
        let BITlink = root.getElementById("bc").getElementsByTagName("li")[0].getElementsByTagName("a")[0].getAttribute("href")
        if (!BITlink.includes("www.fit.vut.cz/study")){
            handleEnd("Unknown url course found")
            return
        }
        console.log(BITlink)
        handleEnd("Done")
    }
    status = "free"
    io.emit("serverStatus", status)
}
function getYear(){
    return (new Date()).getMonth() + 1 >= 8 ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1; // Academic year (from august display next ac. year)
}
/*
app.post("/upload", function(req, res) {
    if (req.body.password !== "abcdef"){
        res.status(403).send("Chybné heslo!")
        return
    }
    

  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No files were uploaded.");
    return;
  }

  console.log("req.files >>>", req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + "/uploads/" + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send("File uploaded to " + uploadPath);
    newName =  __dirname+"/uploads/"+Math.floor(new Date().getTime() / 1000).toString()+"."+uploadPath.split(".")[uploadPath.split(".").length-1]
    fs.renameSync(uploadPath, newName)
    fType = uploadPath.split(".")[uploadPath.split(".").length-1]
    if (["pdf","txt","png","jpg","jpeg"].includes(fType)){
        printFile(newName)
    }else{
        toPdf(newName)
    }
});
});*/
/*
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
*/