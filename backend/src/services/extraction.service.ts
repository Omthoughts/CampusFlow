import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';

export class ExtractionService {
  /**
   * Primary: Extract text directly from PDF.
   * Fallback: If text is too short (likely scanned image), render to images and OCR.
   */
  static async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType.includes('image')) {
      return this.runOCR(buffer);
    } else if (mimeType === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        let extractedText = data.text.trim();

        // If the extracted text is suspiciously short for a document, it might be a scanned PDF
        if (extractedText.length < 50) {
          console.log('PDF text extraction yielded little text. Falling back to OCR...');
          extractedText = await this.runOCRForPDF(buffer);
        }

        return extractedText;
      } catch (error) {
        console.error('pdf-parse failed, falling back to OCR', error);
        return await this.runOCRForPDF(buffer);
      }
    } else {
      return '';
    }
  }

  private static async runOCRForPDF(buffer: Buffer): Promise<string> {
    try {
      const options = {
        density: 300,
        saveFilename: 'temp',
        savePath: './uploads',
        format: 'png',
        width: 2480,
        height: 3508
      };
      
      // We assume it's a 1-page document for this implementation to avoid complex multi-page handling
      // Ideally we should loop through all pages. pdf2pic `fromBuffer` returns an object.
      const convert = fromBuffer(buffer, options);
      const output = await convert(1, { responseType: 'buffer' });
      
      if (!output || !output.buffer) {
         throw new Error("Conversion failed to return buffer");
      }

      return await this.runOCR(Buffer.from(output.buffer));
    } catch (err) {
      console.error('Error rendering PDF to image for OCR:', err);
      // Graceful fallback if graphicsmagick/ghostscript is missing
      return 'OCR extraction failed due to missing dependencies or errors. Please review the document manually.';
    }
  }

  private static async runOCR(buffer: Buffer): Promise<string> {
    try {
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret.data.text.trim();
    } catch (err) {
      console.error('OCR Error:', err);
      return '';
    }
  }
}
