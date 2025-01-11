import { Font } from "@pdfme/common";
import { Sudoku } from "sudoku-gen/dist/types/sudoku.type";
import { FontSize } from "./font-sizes";

const PUZZLE_CONST = 3

const SMALL_GAP = 3
const SQUARE_SIZE = 56
const LARGE_GAP = 11
const TOTAL_SIZE = (PUZZLE_CONST * SQUARE_SIZE + (PUZZLE_CONST - 1) * SMALL_GAP) * PUZZLE_CONST + (PUZZLE_CONST - 1) * LARGE_GAP + SMALL_GAP * 2

const EMPTY_COLOR = "#FFFFFF"
const USED_COLOR = "#DEDEDE"
const BORDER_COLOR = "#808080"
const FONT_COLOR = "#000000"

export function createSudokuPNG(sudoku: Sudoku, font: Font, fontSize: FontSize): string {
    const canvas = document.createElement('canvas');
    drawSudokuToCanvas(canvas, sudoku, font, fontSize)
    return canvas.toDataURL('image/png');
}

export function drawSamples(canvas: HTMLCanvasElement, font: Font, fontSize: FontSize) {
   const context = canvas.getContext('2d');
   canvas.width = TOTAL_SIZE;
   canvas.height = SQUARE_SIZE;

   if (!context) {
     console.error('Unable to get 2D context');
     throw 'bad canvas';
   }

   initCanvas(context, fontSize, font)

   let x = 0;
   for (let i = 0; i < PUZZLE_CONST; i++) {
     for (let j = 0; j < PUZZLE_CONST; j++) {
       drawDigitSquare(1 + i * PUZZLE_CONST + j + '', context, x, 0)
       x += (SQUARE_SIZE + SMALL_GAP)
    }
  }
}

function drawSudokuToCanvas(canvas: HTMLCanvasElement, sudoku: Sudoku, font: Font, fontSize: FontSize) {
    const context = canvas.getContext('2d');
    canvas.width = TOTAL_SIZE;
    canvas.height = TOTAL_SIZE;

    if (!context) {
      console.error('Unable to get 2D context');
      throw 'bad canvas';
    }

    initCanvas(context, fontSize, font)

    for (let n = 0, y = SMALL_GAP, index = 0; n < PUZZLE_CONST; n++) {
        for (let i = 0; i < PUZZLE_CONST; i++) {
            let x = SMALL_GAP;
            for (let j = 0; j < PUZZLE_CONST; j++) {
                for (let k = 0; k < PUZZLE_CONST; k++) {
                    const val = sudoku.puzzle[index]

                    if (val != '-') {
                      drawDigitSquare(val, context, x, y)
                    }

                    context.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE)
                    x += (SQUARE_SIZE + SMALL_GAP)

                    index++
                }
                x += (LARGE_GAP - SMALL_GAP)
                }
            y += (SQUARE_SIZE + SMALL_GAP)
        }
        y += (LARGE_GAP - SMALL_GAP)
    } 
}

function initCanvas(context: CanvasRenderingContext2D, fontSize: FontSize, font: Font) {
    context.font = `${fontSize}px ${font}`
    context.textAlign = 'center';
    context.textBaseline = 'middle';
}

function drawDigitSquare(digit: string, context: CanvasRenderingContext2D, x: number, y: number) {
  context.fillStyle = USED_COLOR
  context.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE)

  const digitX = x + SQUARE_SIZE / 2
  const digitY = y + SQUARE_SIZE / 2
  context.fillStyle = FONT_COLOR
  context.fillText(digit, digitX, digitY)

  context.fillStyle = EMPTY_COLOR
}

