// import { Atom, SetStateAction } from "jotai"
// import { operator } from "./operator";

// export class searchTerm<Value> {
//   /**
//    * The atom for the value
//    */
//   valueAtom: Atom<Value>;
//   /**
//    * Setter for the value atom
//    */
//   setValueAtom: (value: SetStateAction<Value>) => void;
//   /**
//    * The atom for the operator
//    */
//   opAtom: Atom<operator>;
//   /**
//    * Setter for the operator atom
//    */
//   setOpAtom: (value: SetStateAction<operator>) => void;
//   /**
//    * The atom's name in a query string
//    */
//   queryName: string;
//   /**
//    * Alternate names for the atom
//    */
//   altNames:string[];
//   /**
//    * Default value for the atom
//    */
//   defaultValue:Value;
//   /**
//    * list of valid operators for the atom
//    */
//   validOperators:operator[];
//   /**
//    * default operator (what ':' resolves to and what the initial value is)
//    */
//   defaultOperator:Exclude<operator,':'>;
//   /**
//    * function to compare
//    */

//   constructor(queryName:string, altNames:string[]=[], ) {
//     this.queryName = queryName;
//     this.altNames = altNames;
//     this.defaultValue =

//   }

// }

// // export type searchTerm<Value> = {
//   // /**
//   //  * The atom that is used
//   //  */
//   // atom: Atom<{value:Value,operator:operator}>;
//   // /**
//   //  * Setter for the atom
//   //  */
//   // setAtom: (value: SetStateAction<{value:Value,operator:operator}>) => void;
//   // /**
//   //  * The atom's name in a query string
//   //  */
//   // queryName: string;
//   // /**
//   //  * Alternate names for the atom
//   //  */
//   // altNames:string[];
//   // /**
//   //  * list of valid operators for the atom
//   //  */
//   // validOperators:operator[];
//   // /**
//   //  * default operator (what ':' resolves to)
//   //  */
//   // defaultOperator:Exclude<operator,':'>;
//   // /**
//   //  * function to compare
//   //  */

// // }
