import { Difficulty } from "sudoku-gen/dist/types/difficulty.type";
import { Font, PageMode } from "./types";
import { FontSize } from "./font-sizes";

export class Settings {
    difficulty: Difficulty = 'medium';
    pageMode: PageMode = '6';
    numPages: number = 1;
    font: Font = 'courier new';
    fontSize: FontSize = 40;
}
