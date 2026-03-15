import { HCColors } from "../api-types";

/**
 * Checks whether two color sets are the same colors.
 * @param colors1 The first set of colors to compare
 * @param colors2 The second set of colors to compare
 * @returns boolean of whether the sets are the same colors.
 */
export const sameColors = (colors1:HCColors|string[],colors2:HCColors|string[]) => {
    return colors1.length == colors2.length && (colors1 as string[]).every(color=>(colors2 as string[]).includes(color));
}
/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param colors1 The first set of colors to compare (must not include 'C" unless that is its only member; must not be empty)
 * @param operator The operator 
 * @param colors2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const colorCompOp = (colors1:HCColors|string[],operator:"<" | "<=" | "=" | ">=" | ">",colors2:HCColors|string[]) => {
    if (colors2.includes('C')) {
        switch (operator) {
            case '<': {
                return false;
            }
            case '<=': {
                return colors1.includes('C');
            }
            case '=': {
                return colors1.includes('C');
            }
            case '>=': {
                return true;
            }
            case '>': {
                return !colors1.includes('C');
            }
        }
    } else if (colors1.includes('C')) {
        switch (operator) {
            case '<': {
                return true;
            }
            case '<=': {
                return true;
            }
            case '=': {
                return false;
            }
            case '>=': {
                return false;
            }
            case '>': {
                return false;
            }
        }
    } else {
        switch (operator) {
            case '<': {
                return colors1.length<colors2.length && (colors1 as string[]).every(color=>(colors2 as string[]).includes(color));
            }
            case '<=': {
                return (colors1 as string[]).every(color=>(colors2 as string[]).includes(color));
            }
            case '=': {
                return colors1.length == colors2.length && (colors1 as string[]).every(color=>(colors2 as string[]).includes(color));
            }
            case '>=': {
                return (colors2 as string[]).every(color=>(colors1 as string[]).includes(color));
            }
            case '>': {
                return colors1.length>colors2.length && (colors2 as string[]).every(color=>(colors1 as string[]).includes(color));
            }
        }
    }
}
