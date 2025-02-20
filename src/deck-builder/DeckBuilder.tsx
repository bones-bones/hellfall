import { useEffect, useRef, useState } from "react";
import { downloadElementAsImage } from "./download-image";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { toDeck } from "./toDeck";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { TextInput } from "@workday/canvas-kit-react";
import { ImportInstructions } from "./ImportInstructions";
import { PlaytestArea } from "./playtest/PlaytestArea";
const basics: Record<string, string> = {
  //"https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/p/4/v/fp4vq/Final-Kraject.png",
  forest:
    "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/n/fwxn0/forest.jpeg",
  swamp:
    "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmZ/swamp.jpeg",
  island:
    "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/n/fwxn1/island.jpeg",
  plains:
    "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmY/plains.jpeg",
  mountain:
    "https://ist7-1.filesor.com/pimpandhost.com/2/6/5/8/265896/f/w/x/m/fwxmX/mountain.jpeg",
};
export const DeckBuilder = () => {
  const ref = useRef(null);

  const searchparms = new URLSearchParams(document.location.search);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaValue, setTextAreaValue] = useState<string>(
    (searchparms.get("list") || "").replaceAll("∆", "\n")
  );
  const [cards, setCards] = useState<HCEntry[]>([]);
  const [toRender, setToRender] = useState<string[] | undefined>();
  const [deckName, setNameOfDeck] = useState(
    searchparms.get("name") || "your deck name goes here"
  );
  const [renderCards, setRenderCards] = useState<HCEntry[]>([]);
  const [playtesting, setPlaytesthing] = useState(false);

  useEffect(() => {
    import("../data/Hellscube-Database.json").then(({ data }: any) => {
      setCards(data);
    });
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      setToRender(textAreaRef.current.value.split("\n"));

      const searchToSet = new URLSearchParams();
      searchToSet.append("name", deckName);
      searchToSet.append(
        "list",
        textAreaRef.current.value.replaceAll("\n", "∆")
      );

      if ((searchToSet as any).size > 0) {
        history.pushState(
          undefined,
          "",
          location.origin + location.pathname + "?" + searchToSet.toString()
        );
      }
    }
  }, [textAreaValue, deckName]);

  useEffect(() => {
    if (cards.length === 0) {
      return;
    }
    const images: HCEntry[] = (toRender || [])
      .filter((entry) => entry != "" && !entry.startsWith("# "))
      .flatMap((name) => {
        const countTest = /^(\d+) (.*)/.exec(name);
        const responseObject = [];
        console.log(name, countTest);
        if (countTest) {
          const count = parseInt(countTest[1]);
          const foundName = countTest[2];

          for (let i = 0; i < count; i++) {
            if (basics[foundName.toLowerCase()]) {
              responseObject.push({
                Image: [basics[foundName.toLowerCase()]],
                Name: foundName,
              } as unknown as HCEntry);
            } else {
              const foundCard = cards.find(
                (entry) =>
                  entry["Name"].toLowerCase() === foundName.toLowerCase()
              );
              if (foundCard) {
                responseObject.push(foundCard);
              }
            }
          }
        } else {
          if (basics[name.toLowerCase()]) {
            responseObject.push({
              Image: [basics[name.toLowerCase()]],
              Name: name,
            } as unknown as HCEntry);
          } else {
            const foundCard = cards.find(
              (entry) => entry["Name"].toLowerCase() === name.toLowerCase()
            );
            console.log(foundCard, console.log(name));
            if (foundCard) {
              responseObject.push(foundCard);
            }
          }
        }
        if (responseObject.length == 0) {
          responseObject.push({
            Name: name + " - not found",
            Image: [
              "https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg",
            ],
          } as unknown as HCEntry);
        }
        return responseObject;
      });
    setRenderCards(images);
  }, [toRender, cards]);

  return (
    <div>
      <ImportInstructions />
      {renderCards.length > 0 &&
        (playtesting ? (
          <PlaytestArea cards={renderCards}></PlaytestArea>
        ) : (
          <button
            onClick={() => {
              setPlaytesthing(true);
            }}
          >
            Click here to playtest
          </button>
        ))}
      <FormField label="Deck Name">
        <TextInput
          defaultValue={deckName}
          onBlur={(event) => {
            setNameOfDeck(event.target.value);
          }}
        ></TextInput>
      </FormField>
      <StyledTextArea
        ref={textAreaRef}
        defaultValue={textAreaValue}
        placeholder="4 Strict Improvement
Swamp
Cock and Balls to Torture and Abuse"
      />
      <br></br>
      <button
        onClick={() => {
          if (textAreaRef.current) {
            setTextAreaValue(textAreaRef.current.value);
          }
        }}
      >
        generate deck image
      </button>
      <button
        disabled={!toRender}
        onClick={() => {
          if (ref.current) {
            downloadElementAsImage(ref.current, deckName);
          }
        }}
      >
        download deck as image sheet
      </button>{" "}
      <button
        onClick={() => {
          const val = toDeck(renderCards);
          const url =
            "data:text/plain;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = deckName + ".json";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download for TTS
      </button>{" "}
      Cards in deck {renderCards.length}
      <br></br>
      <DeckContainer ref={ref}>
        {renderCards?.map((entry, i) => {
          return (
            <Card
              width="250px"
              title={entry.Name}
              key={entry.Name + i}
              src={entry.Image[0]!}
              crossOrigin="anonymous"
            />
          );
        })}
      </DeckContainer>
    </div>
  );
};
const DeckContainer = styled.div({});
const Card = styled.img({ width: "250px" });

//245 × 341 px

// const OtherContainer = styled.div({ display: "flex" });

const StyledTextArea = styled.textarea({ width: "50%", minHeight: "400px" });
