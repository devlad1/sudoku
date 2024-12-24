import { Sudoku } from "sudoku-gen/dist/types/sudoku.type";

const PUZZLE_CONST = 3

const SMALL_GAP = 3
const SQUARE_SIZE = 56
const LARGE_GAP = 11
const TOTAL_SIZE = (PUZZLE_CONST * SQUARE_SIZE + (PUZZLE_CONST - 1) * SMALL_GAP) * PUZZLE_CONST + (PUZZLE_CONST - 1) * LARGE_GAP + SMALL_GAP * 2
const FONT_SIZE = 56

const EMPTY_COLOR = "#FFFFFF"
const USED_COLOR = "#DEDEDE"
const BORDER_COLOR = "#808080"
const FONT_COLOR = "#000000"

const FONT = 'courier new'

export function createSudokuPNG(sudoku: Sudoku): string {
    const canvas = document.createElement('canvas');
    drawSudokuToCanvas(canvas, sudoku)
    return canvas.toDataURL('image/png');
}

export function drawSudokuToCanvas(canvas: HTMLCanvasElement, sudoku: Sudoku) {
    const context = canvas.getContext('2d');
  
    if (!context) {
      console.error('Unable to get 2D context');
      return;
    }

    canvas.width = TOTAL_SIZE;
    canvas.height = TOTAL_SIZE;

    context.font = `${FONT_SIZE}px ${FONT}`
    context.textAlign = 'center';
    context.textBaseline = 'middle';
  
    context.fillStyle = EMPTY_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    context.fillStyle = BORDER_COLOR;
    for (let n = 0, y = SMALL_GAP, index = 0; n < PUZZLE_CONST; n++) {
        for (let i = 0; i < PUZZLE_CONST; i++) {
            let x = SMALL_GAP;
            for (let j = 0; j < PUZZLE_CONST; j++) {
                for (let k = 0; k < PUZZLE_CONST; k++) {
                    const val = sudoku.puzzle[index]
                    if (val != '-') {
                        context.fillStyle = USED_COLOR
                        context.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE)

                        const digitX = x + SQUARE_SIZE / 2
                        const digitY = y + SQUARE_SIZE / 2
                        context.fillStyle = FONT_COLOR
                        context.fillText(val, digitX, digitY)

                        context.fillStyle = EMPTY_COLOR
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
