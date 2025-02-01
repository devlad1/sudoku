import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';

import { FontSize, fontSizes } from './font-sizes'
import { Font, PageMode } from './types';
import { Settings } from './settings';
import { SudokuPDFMaker } from './sudoku-pdf-maker';
import { Subject } from 'rxjs';

const ERROR_ELEMENT = document.getElementById("errorMessage") as HTMLParagraphElement;
const PROGRESS_ELEMENT = document.getElementById("progress-bar") as HTMLDivElement;

const CONFIG_KEY = "config"

const storedConfig = window.localStorage.getItem(CONFIG_KEY);
console.log(storedConfig)
let config: Settings;
if (storedConfig !== null) {
  config = JSON.parse(storedConfig);
  console.log(config)
} else {
  config = new Settings();
}

const sudokuMaker = new SudokuPDFMaker(config.pageMode);

function saveConfig() {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function registerDropdown<T>(options: {value: T, text: string}[], elementId: string, defaultVal: T, configSetter: (val: T) => void) : HTMLSelectElement{
  const dropdown = document.getElementById(elementId) as HTMLSelectElement;
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value + '';
    opt.textContent = option.text;
    dropdown.appendChild(opt);
  });

  configSetter(defaultVal)
  dropdown.addEventListener('change', () => {
    configSetter(dropdown.value as T)
    saveConfig()
  })
  
  dropdown.value = defaultVal as string;

  return dropdown;
}

document.addEventListener("DOMContentLoaded", () => {  
  const difficultyOptions: { value: Difficulty; text: string }[] = [
    { value: 'easy', text: 'Лёгкий' },
    { value: 'medium', text: 'Средний' },
    { value: 'hard', text: 'Сложный' },
    { value: 'expert', text: 'Эксперт' },
  ];
  registerDropdown(difficultyOptions, 'difficulty', config.difficulty, (difficulty) => {config.difficulty = difficulty});

  const numberOptions: { value: PageMode; text: PageMode }[] = [
    { value: '4', text: '4' },
    { value: '6', text: '6' },
  ];
  registerDropdown(numberOptions, 'numberOfSudokus', config.pageMode, (num) => {config.pageMode = num}) 

  const fontOptions: { value: Font; text: Font }[] = [
    { value: 'arial', text: 'arial' },
    { value: 'courier new', text: 'courier new' }
  ]
  registerDropdown(fontOptions, 'fonts', config.font, (font) => {
    config.font = font
    sudokuMaker.drawSamplesToCanvas(config, document.getElementById('samples') as HTMLCanvasElement)
  }) 

  const fontSizeOptions: { value: FontSize; text: string }[] = fontSizes.map((n: FontSize) => {
    return { value: n, text: n + '' }
  })
  registerDropdown(fontSizeOptions, 'fontSizes', config.fontSize, (fontSize) => {
    config.fontSize = fontSize
    sudokuMaker.drawSamplesToCanvas(config, document.getElementById('samples') as HTMLCanvasElement)
  })

  function handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    config.numPages = Number(target.value)
    saveConfig()
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

    const pdfBytes = await sudokuMaker.make(config, progressSubject)
    const mergedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    window.open(URL.createObjectURL(mergedPdfBlob));
  }
}
