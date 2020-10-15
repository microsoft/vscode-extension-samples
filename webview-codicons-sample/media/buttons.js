// @ts-ignore

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

function play() {
	document.getElementById('play2').disabled = true;
	document.getElementById('stop2').disabled = false;
}

function stop() {
	document.getElementById('play2').disabled = false;
	document.getElementById('stop2').disabled = true;	
}

document.getElementById('play2').onclick = play;
document.getElementById('stop2').onclick = stop;