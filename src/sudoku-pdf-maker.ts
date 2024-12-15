import { BLANK_PDF, Plugins, Template } from "@pdfme/common";
import { image } from "@pdfme/schemas";
import { NumberOfSudokus } from "./types";

import puzzleSchemas from '../resources/puzzleSchemas.json'
import { Settings } from "./settings";
import { PDFDocument } from "pdf-lib";
import { getSudoku } from "sudoku-gen";
import { createSudokuPNG } from "./sudoku-drawer";
import { generate } from "@pdfme/generator";
import { Subject } from "rxjs";

export interface PrintConfiguration {
  appSettings: Settings;
  pdfMaker: SudokuPDFMaker;
}

export class SudokuPDFMaker {
    template!: Template
    inputs: Record<string, any>[] = [{}];
    plugins: Record<string, { ui?: any; pdf?: any; propPanel?: any; }> & Plugins = {
        image
    };

    // static worker = new Worker(new URL("./pdf-worker/worker.ts", import.meta.url));

    constructor(numberOfSudokus: NumberOfSudokus) {
        this.numberOfSudokus = numberOfSudokus
    }

    set numberOfSudokus(numberOfSudokus: NumberOfSudokus) {
        let schemas
        switch (numberOfSudokus) {
            case '4': schemas = puzzleSchemas.fourPuzzleSchema.schemas; break;
            case '6': schemas = puzzleSchemas.sixPuzzleSchema.schemas; break;
        }

        this.template = {
            basePdf: BLANK_PDF,
            schemas: schemas
        }
    }

    async make(config: Settings, progressSubject$: Subject<number>): Promise<PDFDocument> {
        const pdfDataArray: Promise<Uint8Array>[] = new Array(config.numPages)
        for (let i = 0; i < config.numPages; i++) {
          let puzzleSchemas = this.template.schemas[0]
          for (let puzzle of puzzleSchemas) {
            const sudoku = getSudoku(config.difficulty);
            puzzle.content = createSudokuPNG(sudoku);
          }
          
          progressSubject$.next(i / config.numPages)
          pdfDataArray[i] = generate({ template: this.template, inputs: this.inputs, plugins: this.plugins })
        }
    
        const mergedPdf = await PDFDocument.create();
        for (const pdfData of pdfDataArray) {
          const currentPdf = await PDFDocument.load(await pdfData);
          const copiedPages = await mergedPdf.copyPages(currentPdf, currentPdf.getPageIndices());
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });
        }

        return mergedPdf
    }
}
