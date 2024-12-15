import { Difficulty } from "sudoku-gen/dist/types/difficulty.type";
import { NumberOfSudokus } from "./types";

export class Settings {
    difficulty: Difficulty = 'medium';
    numberOfSudokus: NumberOfSudokus = '6';
    numPages: number = 1;
}
