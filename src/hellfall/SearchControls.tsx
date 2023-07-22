import { styled } from "@workday/canvas-kit-react/common";

import { CheckboxGroup } from "./inputs";
import { PillSearch2 } from "./inputs/PillSearch2";
import { Checkbox } from "@workday/canvas-kit-react/checkbox";
import { TextInput } from "@workday/canvas-kit-react/text-input";
import { FormField } from "@workday/canvas-kit-react/form-field";
import cardTypes from "../data/types.json";
import creators from "../data/creators.json";
import { CmcSelector } from "./inputs";

import { useAtom } from "jotai";
import {
  legalityAtom,
  nameSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorsAtom,
  searchSetAtom,
  creatorAtom,
  typeSearchAtom,
  searchColorsIdentityAtom,
} from "./searchAtoms";
import { colors } from "./constants";
import { Combobox } from "@workday/canvas-kit-labs-react/combobox";
import { DeprecatedMenuItem } from "@workday/canvas-kit-preview-react/menu";

export const SearchControls = () => {
  const [set, setSet] = useAtom(searchSetAtom);
  const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  const [searchCmc, setSearchCmc] = useAtom(searchCmcAtom);
  const [legality, setLegality] = useAtom(legalityAtom);
  const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  const [creator, setCreator] = useAtom(creatorAtom);
  const [searchColorsIdentity, setSearchColorsIdentityAtom] = useAtom(
    searchColorsIdentityAtom
  );

  return (
    <>
      <SearchContainer>
        <SearchCriteriaSection>
          <FormField label="Name">
            <TextInput
              defaultValue={nameSearch}
              onKeyDown={(event) => {
                if (event.key == "Enter") {
                  setNameSearch((event.target as any).value);
                }
              }}
              onBlur={(event) => {
                setNameSearch(event.target.value);
              }}
            />
          </FormField>
          <PillSearch2
            label={"Text"}
            possibleValues={[]}
            defaultValues={rulesSearch}
            onChange={setRulesSearch}
          />
          <PillSearch2
            label={"Type"}
            possibleValues={cardTypes.data}
            defaultValues={typeSearch}
            onChange={setTypeSearch}
          />
          <FormField label={"Creator"}>
            <Combobox
              onChange={(event) => setCreator(event?.target.value)}
              showClearButton={!!creator}
              initialValue={creator}
              autocompleteItems={creators.data.map((entry) => (
                <DeprecatedMenuItem key={entry}>{entry}</DeprecatedMenuItem>
              ))}
            >
              <TextInput />
            </Combobox>
          </FormField>
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <CheckboxGroup
            label="Colors (inclusive)"
            values={colors}
            initialValue={searchColors}
            onChange={setSearchColors}
          />

          <CheckboxGroup
            label="Within Color Identity"
            values={colors}
            initialValue={searchColorsIdentity}
            onChange={setSearchColorsIdentityAtom}
          />
        </SearchCriteriaSection>
        <SearchCriteriaSection>
          <CheckboxGroup
            initialValue={set}
            label={"Set"}
            values={["HLC", "HC2", "HC3", "HC4"]}
            onChange={setSet}
          />
          <FormField label={"Only Constructed Legal"}>
            <Checkbox
              type="checkbox"
              checked={legality == "legal"}
              onChange={(event) => {
                setLegality(event.target.checked ? "legal" : "");
              }}
            />
          </FormField>
          <CmcSelector onChange={setSearchCmc} initialValue={searchCmc} />
        </SearchCriteriaSection>
      </SearchContainer>
    </>
  );
};
const SearchCriteriaSection = styled("div")({
  justifyContent: "space-evenly",
  paddingLeft: "30px",
});
const SearchContainer = styled("div")({ display: "flex", flexWrap: "wrap" });
