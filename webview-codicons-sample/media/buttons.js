// @ts-ignore

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

function play() {
	document.getElementById('play').disabled = true;
	document.getElementById('stop').disabled = false;
}

function stop() {
	document.getElementById('play').disabled = false;
	document.getElementById('stop').disabled = true;	
}

document.getElementById('play').onclick = play;
document.getElementById('stop').onclick = stop;