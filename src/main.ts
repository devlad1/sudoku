import { generate } from '@pdfme/generator';
import { image } from '@pdfme/schemas';
import './style.css'

import { Template, BLANK_PDF } from '@pdfme/common';

import { getSudoku } from 'sudoku-gen';
import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';

import puzzleSchemas from '../resources/puzzleSchemas.json'
import { createSudokuPNG } from './sudoku-drawer';
import { NumberOfSudokus } from './types';
import { PDFDocument } from 'pdf-lib';

const ERROR_ELEMENT = document.getElementById("errorMessage") as HTMLParagraphElement;
const PROGRESS_ELEMENT = document.getElementById("progress") as HTMLParagraphElement;

let difficulty: Difficulty = 'medium'

let numberOfSudokus: NumberOfSudokus = '6'
let template: Template = {
  basePdf: BLANK_PDF,
  schemas: puzzleSchemas.sixPuzzleSchema.schemas,
};

let numPages = 1;

const plugins = {
  image
}

document.addEventListener("DOMContentLoaded", () => {  
  const difficultyOptions: { value: Difficulty; text: string }[] = [
    { value: 'easy', text: 'Лёгкий' },
    { value: 'medium', text: 'Средний' },
    { value: 'hard', text: 'Сложный' },
    { value: 'expert', text: 'Эксперт' },
  ];
  const difficultyDropdown = document.getElementById('difficulty') as HTMLSelectElement;
  difficultyOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.text;
    difficultyDropdown.appendChild(opt);
  });
  difficultyDropdown.addEventListener('change', () => {
    difficulty = difficultyDropdown.value as Difficulty;
  });
  difficultyDropdown.value = difficulty
  
  const numberOptions: { value: NumberOfSudokus; text: NumberOfSudokus }[] = [
    { value: '4', text: '4' },
    { value: '6', text: '6' },
  ];
  const numberOfSudokusDropdown = document.getElementById('numberOfSudokus') as HTMLSelectElement;
  numberOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.text;
    numberOfSudokusDropdown.appendChild(opt);
  });
  numberOfSudokusDropdown.addEventListener('change', () => {
    numberOfSudokus = numberOfSudokusDropdown.value as NumberOfSudokus
    switch (numberOfSudokus) {
      case '4': template.schemas = puzzleSchemas.fourPuzzleSchema.schemas; break;
      case '6': template.schemas = puzzleSchemas.sixPuzzleSchema.schemas; break;
    }
  });
  numberOfSudokusDropdown.value = numberOfSudokus

  function handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    numPages = Number(target.value)
  }
  const numPagesInput = document.getElementById('numberOfPages') as HTMLInputElement;
  numPagesInput.value = numPages.toString()
  numPagesInput.addEventListener('input', handleInputChange);

  const button = document.getElementById("generate") as HTMLButtonElement;

  if (button) {
    button.addEventListener("click", generatePdf);
  } else {
    console.error("Button not found!");
  }
});

async function generatePdf(): Promise<void> {  
  if (isNaN(numPages)) {
    ERROR_ELEMENT.textContent = 'Количество запрошенных вами страниц не является числом.'
  } else if (numPages <= 0) {
    ERROR_ELEMENT.textContent = 'Количество страниц должно быть положительным.'
  } else if (numPages > 50) {
    ERROR_ELEMENT.textContent = 'Количество страниц должно быть менее 50.'
  } else {
    let pdfDataArray: Promise<Uint8Array>[] = new Array(numPages)
    let progress = 0;
    const progressBar = document.getElementById("progress-bar") as HTMLDivElement;

    for (let i = 0; i < numPages; i++) {
      let puzzleSchemas = template.schemas[0]
      for (let puzzle of puzzleSchemas) {
        const sudoku = getSudoku(difficulty);
        puzzle.content = createSudokuPNG(sudoku);
      }
  
      pdfDataArray[i] = generate({ template: template, inputs: [{}], plugins: plugins })
    }

    const mergedPdf = await PDFDocument.create();
    for (const pdfData of pdfDataArray) {
      const currentPdf = await PDFDocument.load(await pdfData);
      const copiedPages = await mergedPdf.copyPages(currentPdf, currentPdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    window.open(URL.createObjectURL(mergedPdfBlob));
  }
}
