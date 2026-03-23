const pdfLib = require('pdf-parse');
const pdf = pdfLib.default || pdfLib;
console.log('Type:', typeof pdf);
console.log('Value:', pdf);
