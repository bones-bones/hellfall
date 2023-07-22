import { useState } from "react";
import { HellsCard } from "../HellsCard";

export const CurveTopper = () => {
  const [count, setCount] = useState(0);

  const cardArray = [];

  for (let i = 0; i < count; i++) {
    cardArray[i] = "mana:X";
  }
  //&
  return (
    <>
      <h3>{`Ballsjr's Ultimate Curvetopper`}</h3>
      <button
        onClick={() => {
          const value = prompt("what is x?") || "0";
          setCount(parseInt(value));
        }}
      >
        Set X
      </button>
      <br />
      {cardArray.map((e, index) => (
        <HellsCard queryString={e} key={index} />
      ))}
    </>
  );
};

export const DruidicVow = () => {
  const [cost, setCost] = useState<string>();

  return (
    <>
      {" "}
      <button
        onClick={() => {
          const value =
            prompt("use b for black, w for white, etc") || undefined;
          setCost(value);
        }}
      >
        Set Mana value
      </button>
      <br />
      {cost && <HellsCard key={cost} queryString={`mana=${cost}`}></HellsCard>}
    </>
  );
};
