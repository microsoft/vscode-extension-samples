// This script will be run within the webview itself
// It cannot access VS Code apis directly.

const counter = document.getElementById('lines-of-code-counter');

let currentCount = 0;

setInterval(() => {
    counter.textContent = currentCount++;

    // Alert the extension when the cat introduces a bug
    if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
        // Send a message back to the extension
        window.parent.postMessage({
            command: 'alert', text: '🐛  on line ' + currentCount },
            '*')
    }
}, 100);

// Handle messages sent from the extension to the webview inside the webview
window.addEventListener('message', event => {
    const message = event.data; // The json data the extension sent
    switch (message.command)
    {
        case 'refactor':
            currentCount = Math.ceil(currentCount * 0.5);
            counter.textContent = currentCount;
            break;
    }
});