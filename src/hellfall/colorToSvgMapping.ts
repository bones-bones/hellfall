import Yellow from "../assets/Yellow.png";
import {
  mono,
  symbols,
  nums,
  weirdNums,
  variables,
  halves,
  monoPhyrexian,
  hybridPhyrexian,
  hybrid,
} from "../assets/index";

export const colorToSvgMapping = (value: string) => {
  const monoNames = ["W", "U", "B", "R", "G", "P", "C"];
  const wubrg = ["W", "U", "B", "R", "G"];
  const orderedHybrid = [
    "W/U",
    "U/B",
    "B/R",
    "R/G",
    "G/W",
    "W/B",
    "B/G",
    "G/U",
    "U/R",
    "R/W",
  ];
  const symbolNames = ["T", "Q", "A", "E", "Paw", "TK", "CHAOS", "S"];
  const numNames = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
  ];
  const weirdNumNames = ["Hundred", "Million", "Half", "Infinity"];
  const weirdNumSymbols = ["100", "1000000", "1/2", "∞"];
  const variableNames = ["X", "Y", "Z"];
  switch (true) {
    case symbolNames.includes(value):
      return symbols[value as keyof typeof symbols];
    case /^\d+$/.test(value) && 0 <= parseInt(value) && parseInt(value) <= 20:
      return nums[numNames[parseInt(value)] as keyof typeof nums];
    case weirdNumSymbols.includes(value):
      return weirdNums[
        weirdNumNames[weirdNumSymbols.indexOf(value)] as keyof typeof weirdNums
      ];
    case variableNames.includes(value):
      return variables[value as keyof typeof variables];
    case monoNames.includes(value):
      return mono[value as keyof typeof mono];
    case value.length == 2 && value[0] == "H" && monoNames.includes(value[1]):
      return halves[value as keyof typeof halves];
    case value.length == 3 &&
      value.slice(0, 2) == "H/" &&
      monoNames.includes(value[2]):
      return monoPhyrexian[("Ph" + value[2]) as keyof typeof monoPhyrexian];
    case value.length == 5 &&
      value.slice(0, 2) == "H/" &&
      orderedHybrid.includes(value.slice(2)):
      return hybridPhyrexian[
        ("Ph" + value[2] + value[4]) as keyof typeof hybridPhyrexian
      ];
    case value.length == 3 &&
      monoNames.includes(value[0]) &&
      value[1] == "/" &&
      monoNames.includes(value[2]):
      return hybrid[(value[0] + value[2]) as keyof typeof hybrid];
    case value == "Yellow":
      return Yellow;
  }
};
