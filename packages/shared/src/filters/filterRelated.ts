// import { HCCard, HCRelatedCard } from "../types";
// import { funcOp } from "./filterUtils";
// import { cardStringFilter, opType } from "./types";

// // const includeComponent = (part: HCRelatedCard) =>
// //   ['token_maker', 'draft_partner'].includes(part.component);

// export const filterRelatedSet: cardStringFilter = Object.assign(
//   (value1: HCCard.Any, operator: opType, value2: string) => {
//     // const isSetInResults = (set: string) => textSearchIncludes(set, value2);
//     // const shouldIncludeMeld = (part: HCRelatedCard, set: string) => {
//     //   return part.component == 'meld_part' && part.set != set;
//     // };
//     const tokenInSet = (token: HCCard.Any): boolean | undefined => {
//       if (value1.all_parts?.some(part=>)) {
//         // if (
//         //   value1.all_parts
//             // .filter(part => isSetInResults(part.set))
//             // .some(part => includeComponent(part) || shouldIncludeMeld(part, value1.set))
//         // ) {
//           return true;
//         // }
//       }
//       return !value2.length && value1.kind != 'card';
//     };
//     return funcOp(operator, tokenInSet, value1);
//   },
//   {
//     invertOption: 'flip' as invertOptionType,
//     toSummary: (operator: opType, value: string) =>
//       `the token set is ${opToNot(operator)} "${value}"`,
//   }
// );
