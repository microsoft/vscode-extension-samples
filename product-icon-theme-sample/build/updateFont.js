const webfontsGenerator = require('webfonts-generator');
const fs = require('fs');

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
];

webfontsGenerator({
  files: svgs.map(i => `./icons/${i}`),
  dest: './out/',
  types: ['woff'],
  fontName: 'vscode-10',
  css: false,
  html: false,
  startCodepoint: 0xE000

}, function(error) {
  if (error) {
    console.log('Font creation failed.', error);
    return;
  }
  fs.copyFileSync('./out/vscode-10.woff', './theme/vscode-10.woff');
  console.log('Font created at ./theme/vscode-10.woff');
})