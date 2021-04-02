// Require file system access
fs = require("fs");

// Read file buffer
imgReadBuffer = fs.readFileSync("test-pattern.jpg");

//Encode image buffer to hex
imgHexEncode = new Buffer(imgReadBuffer).toString("hex");

fs.writeFileSync("encodedHexImage.txt", imgHexEncode);

// Output encoded data de console
console.log(imgHexEncode);
