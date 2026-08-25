const isEven = require("./modules/isEven");
const logger = require("./modules/logger");

const testNumbers = [4, 7, 12, 19, 26];

logger("Testing custom module isEven:");
testNumbers.forEach((num)=> {
    console.log(`Is ${num} even? -> ${isEven(num)}`);
});