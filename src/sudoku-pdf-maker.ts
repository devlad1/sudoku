import { Template } from "@pdfme/common";
import { PageMode } from "./types";

import puzzleSchemas from '../resources/puzzleSchemas.json'
import { Settings } from "./settings";
import { PDFDocument } from "pdf-lib";
import { getSudoku } from "sudoku-gen";
import { createSudokuPNG } from "./sudoku-drawer";
import { Subject } from "rxjs";

import MyWorker from './pdf-worker/worker?worker'

export interface PrintConfiguration {
  appSettings: Settings;
  pdfMaker: SudokuPDFMaker;
}

export class SudokuPDFMaker {
  pageMode!: PageMode

  static worker = new MyWorker()

  constructor(pageMode: PageMode) {
      this.pageMode = pageMode
  }

  async make(config: Settings, progressSubject$: Subject<number>): Promise<Uint8Array> {
      const pdfDataArray: Uint8Array[] = new Array(config.numPages)
      for (let i = 0; i < config.numPages; i++) {
        let template: Template
        switch (config.pageMode) {
          case "4": template = puzzleSchemas.fourPuzzleSchema; break;
          case "6": template = puzzleSchemas.sixPuzzleSchema; break;
        }

        template.schemas.forEach((schema) => {
          for (let puzzle of schema) {
              const sudoku = getSudoku(config.difficulty);
              puzzle.content = createSudokuPNG(sudoku);
          }
        })

        const waitPromise = new Promise(resolve => {
          SudokuPDFMaker.worker.onmessage = (binaryPdf: MessageEvent<Uint8Array>) => {
            pdfDataArray[i] = binaryPdf.data
            console.log(`got response ${JSON.stringify(binaryPdf.data)}`)
            resolve("")
          }
        })

        SudokuPDFMaker.worker.postMessage(template)

        await waitPromise
        progressSubject$.next((i + 1) / config.numPages)
      }
  
      const mergedPdf = await PDFDocument.create();
      for (const pdfData of pdfDataArray) {
        const currentPdf = await PDFDocument.load(pdfData);
        const copiedPages = await mergedPdf.copyPages(currentPdf, currentPdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      return mergedPdf.save()
  }
}
