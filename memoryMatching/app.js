/*
Anthony Roberts
*/

// load http module
var http = require('http');
var fs = require('fs');
var url = require('url');
const ROOT = "./public_html";


// create http server
var server = http.createServer(handleRequest);
server.listen(2406);

console.log('Server listening on port 2406');

var users=[];

function handleRequest(req, res) {
	console.log(req.url);
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	var data = "";
		
		
     if(urlObj.pathname==="/memory/intro"){
		console.log("memory intro: "+urlObj.query.username);
		console.log("User's game size: "+urlObj.query.size);
		var gameBoard;
		var existingUser = users.find(function(user){return urlObj.query.username===user.name;});
		if(typeof(existingUser) !== "undefined"){
			// for an existing user, use difficulty (size) from URL
			gameBoard = makeBoard(urlObj.query.size);
			existingUser.board = gameBoard;
		}
		else{
			gameBoard = makeBoard(4);  // new user starts at 4
			users.push({name: urlObj.query.username, board: gameBoard, size: 4}); //size is 4 on init of new user
//			users.push({name: urlObj.query.username, board: gameBoard});
		}
		res.writeHead(200,{'content-type':'text/event-stream'});
	 }
	 else if(urlObj.pathname==="/memory/card"){
		
		var reqUser = users.find(function(user){return urlObj.query.username===user.name;}); //find the user requesting the card
		var r = urlObj.query.row;
		var c = urlObj.query.col;
		
		res.end(reqUser.board[r][c].toString());
	 }
	 else if(fs.existsSync(filename)){		
		var stats = fs.statSync(filename);
		if(stats.isDirectory()){
			filename += "/index.html";
		}
		console.log("Getting file: "+filename);
		data = fs.readFileSync(filename);
		code = 200;
		
	}
	 
	else{
		console.log("File not found");
		code = 404;
		data = getFileContents(ROOT+"/404.html");
	} 
	
	res.end(data);
};

function getFileContents(filename){
	var contents="";
	
	var stats = fs.statSync(filename);
	if(stats.isDirectory()){
		contents = fs.readdirSync(filename).join("\n");
	}else{
	
		contents = fs.readFileSync(filename);
	}	
	
	return contents;
}

function makeBoard(size){
	//assume size%2==0
	
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	
	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			var r = (Math.floor(Math.random()*items.length));
			board[i][j]= items.splice(r,1)[0];  //remove item r from the array
			
		}
	}
	return board;
}



