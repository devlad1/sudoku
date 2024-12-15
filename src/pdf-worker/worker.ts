import { PrintConfiguration } from "../sudoku-pdf-maker";
import { getSudoku } from "sudoku-gen";
import { createSudokuPNG } from "../sudoku-drawer";
import { generate } from "@pdfme/generator";
import { PDFDocument } from "pdf-lib";
import { image } from "@pdfme/schemas";

const inputs: Record<string, any>[] = [{}];
const plugins: Record<string, { ui?: any; pdf?: any; propPanel?: any; }> & Plugins = {
    image
};

onmessage = async (event: MessageEvent<string>) => {
    // console.log(event.data)

    const config: PrintConfiguration = JSON.parse(event.data)
    console.log(config)
    const pdfDataArray: Uint8Array[] = new Array(config.appSettings.numPages)

    for (let i = 0; i < config.appSettings.numPages; i++) {
        let puzzleSchemas = config.pdfMaker.template.schemas[0]
        for (let puzzle of puzzleSchemas) {
        //   const sudoku = getSudoku(config.appSettings.difficulty);
        //   puzzle.content = createSudokuPNG(sudoku);
        }
        
        postMessage(i / config.appSettings.numPages)
        // pdfDataArray[i] = generate({ template: config.pdfMaker.template, inputs: config.pdfMaker.inputs, plugins: config.pdfMaker.plugins })
      }
  
    //   const mergedPdf = await PDFDocument.create();
    //   for (const pdfData of pdfDataArray) {
    //     const currentPdf = await PDFDocument.load(await pdfData);
    //     const copiedPages = await mergedPdf.copyPages(currentPdf, currentPdf.getPageIndices());
    //     copiedPages.forEach((page) => {
    //       mergedPdf.addPage(page);
    //     });
    //   }

    //   postMessage(mergedPdf)
  };
  