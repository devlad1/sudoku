import { Difficulty } from "sudoku-gen/dist/types/difficulty.type";
import { PageMode } from "./types";

export class Settings {
    difficulty: Difficulty = 'medium';
    pageMode: PageMode = '6';
    numPages: number = 1;
}
