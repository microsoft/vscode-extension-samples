// @ts-ignore

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

function play() {
	if (!document.getElementById('play1').classList.contains('disabled')) {
		document.getElementById('play1').classList.add('disabled');
		document.getElementById('stop1').classList.remove('disabled');
		document.getElementById('iconBarStatus').innerText = 'playing'
	}
}

function stop() {
	if (!document.getElementById('stop1').classList.contains('disabled')) {
		document.getElementById('play1').classList.remove('disabled');
		document.getElementById('stop1').classList.add('disabled');
		document.getElementById('iconBarStatus').innerText = 'stopped'
	}
}

document.getElementById('play1').onclick = play;
document.getElementById('stop1').onclick = stop;