const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const src = fs.readFileSync('src/cryptoric_guard.js', 'utf8');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

const obfuscationResult = JavaScriptObfuscator.obfuscate(src, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1
});

fs.writeFileSync('dist/cryptoric-guard.js', obfuscationResult.getObfuscatedCode());
console.log("Successfully built and obfuscated cryptoric-guard!");
