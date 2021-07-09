const webfont = require('webfont');
const fs = require('fs');
const path = require('path');

const svgs = [
  "explorer-view.svg",
  "search-view.svg",
  "debug-view.svg",
  "git-view.svg",
  "extensions-view.svg",
  "smiley.svg",
  "folding-expanded.svg",
  "folding-collapsed.svg",
  "expando-expanded.svg",
  "expando-collapsed.svg",
].map(name => path.join(__dirname, '..', 'icons', name));

async function generateFont() {

  try {
    const result = await webfont.webfont({
      files: svgs,
      formats: ['woff'],
      startUnicode: 0xE000,
      verbose: true,
      normalize: true,
      sort: false
    });
    const dest = path.join(__dirname, '..', 'theme', 'vscode-10.woff')
    fs.writeFileSync(dest, result.woff, 'binary');
    console.log(`Font created at ${dest}`);
  } catch (e) {
    console.error('Font creation failed.', error);
  }
}

generateFont();


