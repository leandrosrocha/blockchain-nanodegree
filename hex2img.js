// Require file system access
fs = require("fs");

// Read file buffer
encodedImgReadBuffer = fs.readFileSync("encodedHexImage.txt", "utf8");

// Decode hex
var imgHexDecode = new Buffer(encodedImgReadBuffer, "hex");

// Save decoded file file system
fs.writeFileSync("decodedHexImage.jpg", imgHexDecode);
