const fs = require("fs");
const path = require("path");
const readline = require("readline");

// __dirname is correctly set to the script's directory in CommonJS

// Define paths
const distDir = path.resolve(__dirname, "../dist");
const maintenanceDir = path.resolve(__dirname, "../maintenance");
const indexFilePath = path.join(distDir, "index.html");

// Remove all files in dist directory
fs.rmSync(distDir, { recursive: true, force: true });

// Copy all contents from maintenance to dist
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(maintenanceDir, distDir, { recursive: true });

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Prompting for message..."); // Added line

// Prompt user for message
rl.question("Enter your message (press enter to use default): ", (input) => {
  const message =
    input.trim() ||
    `Z dôvody softvérovej aktualizácie kritickej infraštruktúry je
                stránka momentálne nedostupná. Pracujeme na implementácii vylepšení
                a zlepšení bezpečnosti, aby sme vám mohli poskytovať ešte lepšie
                služby. Toto môže zahŕňať nasadenie nových funkcií, optimalizáciu
                výkonu a posilnenie ochranných mechanizmov. Prosím, skúste to znova
                o chvíľu. Veľmi si vážime vašu trpezlivosť a ospravedlňujeme sa za
                prípadné nepríjemnosti.
                <br />
                <br />
                Ďakujem za pochopenie
                <br />
                Branislav Juhás | vedúci vývoja kritickej infraštruktúry`;

  // Read index.html
  let indexContent = fs.readFileSync(indexFilePath, "utf-8");

  // Replace {{ MESSAGE }} with the user's message
  indexContent = indexContent.replace("{{ MESSAGE }}", message);

  // Write the updated content back to index.html
  fs.writeFileSync(indexFilePath, indexContent, "utf-8");

  console.log("Message updated in index.html"); // Added line

  rl.close();
});
