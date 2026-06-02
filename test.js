const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

setTimeout(() => {
  try {
    const window = dom.window;
    console.log("App booted?");
    if (window.app && window.app.decisoesController) {
      console.log("decisoesController exists!");
      
      // Simulate click
      window.app.switchTab('central');
      window.app.switchCentralSection('decisoes');
      
      const grid = window.document.getElementById('protocolos-environments-grid');
      console.log("Grid HTML length:", grid.innerHTML.length);
      console.log("Cards count:", grid.querySelectorAll('.premium-protocol-card').length);
      
      // Print the titles of the cards
      const titles = Array.from(grid.querySelectorAll('h3')).map(h3 => h3.textContent.trim());
      console.log("Rendered environments:", titles);
    } else {
      console.log("App didn't boot. Error in JS?");
    }
  } catch (e) {
    console.error(e);
  }
}, 2000);
