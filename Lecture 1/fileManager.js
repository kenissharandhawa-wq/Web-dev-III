const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "test.txt");

console.log("Creating File...");
fs.writeFileSync(filePath, "Hello Node.js\n");
console.log("File Created");

console.log("Reading File:");
console.log(fs.readFileSync(filePath, "utf-8"));

fs.appendFileSync(filePath, "Learning FS Module\n");
console.log("File Updated:");
console.log(fs.readFileSync(filePath, "utf-8"));

fs.unlinkSync(filePath);
console.log("File Deleted");
