const PDFDocument = require('pdfkit');
const pdfLib = require('pdf-parse');
const PDFParse = pdfLib.PDFParse;

const generatePdf = () => {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.text('Hello World Invoice');
        doc.end();
    });
};

(async () => {
    try {
        const buffer = await generatePdf();
        const uint8 = new Uint8Array(buffer);
        
        console.log('Attempting with Uint8Array...');
        const p = new PDFParse(uint8);
        console.log('Constructor success.');
        
        const text = await p.getText();
        console.log('Text content:', text);
    } catch (e) {
        console.error('Error:', e);
    }
})();
