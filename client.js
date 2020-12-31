//websockets2midi
const WebSocket = require('ws');
const readline = require('readline');
const midi = require('midi');
const midiOutput = new midi.Output();
const midiInput = new midi.Input();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

console.clear();
let weAreConnected=false;
let ws = null;

console.log("midi output (receive) ports available: ");
for (let i = 0; i < midiOutput.getPortCount(); i++) {
	console.log("["+ i + "] " + midiOutput.getPortName(i));
}

rl.question('What port would you like to use? ', (answer) => {
	midiOutput.openPort(parseInt(answer));
	weAreConnected = true;

	setInterval(() => {
		if (ws === null) {
			console.log("------------------------------------------------------------");
			console.log("1 seconds has expired. trying to connect to server... ");
			connectToServer();
		}
	});
});

process.on("SIGINT", () => {
	console.log("received SIGINT (control-c)");
	niceShutdown();

});

function niceShutdown() {
	console.log("shutting down nicely...");
	try {
		client.close();
	} catch (err) {
		//console.log("couldn't close osc connection (perhaps not setup yet)");
	}

	try {
		ws.terminate();
	} catch (err) {
		//console.log("couldn't close ws connection (perhaps not setup yet)");
	}
	if(weAreConnected){
		midiOutput.closePort();
	}

	console.log("goodbye!");
	process.exit();
}

function connectToServer() {
	ws = new WebSocket('ws://199.19.73.131:3942');

	ws.on('error', (error) => {
		console.log("ERROR: couldn't connect to remote server.");
		weAreConnected = false;
		ws = null;
	});

	ws.on('close', (code, reason) => {
		console.log("CLOSE: connection closed");
		weAreConnected = false;
		ws = null;
	});

	ws.on('open', () => {
		weAreConnected = true;
		console.log("Success! we are connected to server!");
	});

	ws.on('message', function incoming(data) { //process incoming 
		console.log("received: " + data);
		const messageArray = JSON.parse(data); //convert JSON to javascript array

		midiOutput.sendMessage(messageArray); //or should this be messageArray?
	});
}

