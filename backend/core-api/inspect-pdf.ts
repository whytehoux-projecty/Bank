const pdfLib = require('pdf-parse');
console.log('Keys:', Object.keys(pdfLib));
if (pdfLib.PDFParse) {
  console.log('PDFParse found.');
  console.log('Prototype keys:', Object.getOwnPropertyNames(pdfLib.PDFParse.prototype));
}
