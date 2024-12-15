import './style.css'

import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';

import { NumberOfSudokus } from './types';
import { Settings } from './settings';
import { SudokuPDFMaker } from './sudoku-pdf-maker';
import { Subject } from 'rxjs';

const ERROR_ELEMENT = document.getElementById("errorMessage") as HTMLParagraphElement;
const PROGRESS_ELEMENT = document.getElementById("progress-bar") as HTMLDivElement;

const config = new Settings();
const sudokuMaker = new SudokuPDFMaker(config.numberOfSudokus);

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
    config.difficulty = difficultyDropdown.value as Difficulty;
  });
  difficultyDropdown.value = config.difficulty
  
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
    config.numberOfSudokus = numberOfSudokusDropdown.value as NumberOfSudokus
    sudokuMaker.numberOfSudokus = config.numberOfSudokus
  });
  numberOfSudokusDropdown.value = config.numberOfSudokus

  function handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    config.numPages = Number(target.value)
  }
  const numPagesInput = document.getElementById('numberOfPages') as HTMLInputElement;
  numPagesInput.value = config.numPages.toString()
  numPagesInput.addEventListener('input', handleInputChange);

  const button = document.getElementById("generate") as HTMLButtonElement;

  if (button) {
    button.addEventListener("click", generatePdf);
  } else {
    console.error("Button not found!");
  }
});

async function generatePdf(): Promise<void> {  
  if (isNaN(config.numPages)) {
    ERROR_ELEMENT.textContent = 'Количество запрошенных вами страниц не является числом.'
  } else if (config.numPages <= 0) {
    ERROR_ELEMENT.textContent = 'Количество страниц должно быть положительным.'
  } else if (config.numPages > 50) {
    ERROR_ELEMENT.textContent = 'Количество страниц должно быть менее 50.'
  } else {

    const progressSubject = new Subject<number>()
    progressSubject.subscribe((progress: number) => {
      console.log(progress)
      PROGRESS_ELEMENT.style.width = `${100 * progress}%`
    })
    const mergedPdf = await sudokuMaker.make(config, progressSubject)

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    window.open(URL.createObjectURL(mergedPdfBlob));
  }
}
