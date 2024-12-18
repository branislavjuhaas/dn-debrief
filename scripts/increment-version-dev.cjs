const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

function incrementVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const versionParts = packageJson.version.split('.');
  versionParts[2] = parseInt(versionParts[2]) + 1;
  packageJson.version = versionParts.join('.') + ' - DEV';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

incrementVersion();
