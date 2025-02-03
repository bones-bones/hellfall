import styled from "@emotion/styled";

import { CheckboxGroup } from "./inputs";
import { PillSearch } from "./inputs";
import { TextInput } from "@workday/canvas-kit-react/text-input";
import { FormField } from "@workday/canvas-kit-react/form-field";
import cardTypes from "../data/types.json";
import creators_data from "../data/creators.json";
import tags_data from "../data/tags.json";
import { CmcSelector } from "./inputs";

import { useAtom } from "jotai";
import {
  legalityAtom,
  nameSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorsAtom,
  searchSetAtom,
  creatorsAtom,
  typeSearchAtom,
  searchColorsIdentityAtom,
  searchColorComparisonAtom,
  isCommanderAtom,
  powerAtom,
  toughnessAtom,
  tagsAtom,
} from "./searchAtoms";
import { colors } from "./constants";
import { SearchCheckbox } from "./SearchCheckbox";
import { StyledLabel } from "./StyledLabel";

export const SearchControls = () => {
  const [set, setSet] = useAtom(searchSetAtom);
  const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  const [searchCmc, setSearchCmc] = useAtom(searchCmcAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);

  const [legality, setLegality] = useAtom(legalityAtom);
  const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  const [creators, setCreators] = useAtom(creatorsAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [isCommander, setIsCommander] = useAtom(isCommanderAtom);
  const [searchColorsIdentity, setSearchColorsIdentityAtom] = useAtom(
    searchColorsIdentityAtom
  );
  const [colorComparison, setColorComparison] = useAtom(
    searchColorComparisonAtom
  );

  return (
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
        <PillSearch
          label={"Text"}
          possibleValues={[]}
          defaultValues={rulesSearch}
          onChange={setRulesSearch}
        />
        <PillSearch
          label={"Type"}
          possibleValues={cardTypes.data}
          defaultValues={typeSearch}
          onChange={setTypeSearch}
        />
        <PillSearch
          label={"Creator"}
          possibleValues={creators_data.data}
          defaultValues={creators}
          onChange={setCreators}
        ></PillSearch>
        <PillSearch
          label={"Tags"}
          possibleValues={tags_data.data}
          defaultValues={tags}
          onChange={setTags}
        ></PillSearch>
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          label="Colors"
          values={colors}
          initialValue={searchColors}
          onChange={setSearchColors}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="styledManaSelect">
              {"Color Comparison"}
            </StyledLabel>
            <StyledManaSelect
              id="styledManaSelect"
              defaultValue={colorComparison}
              value={colorComparison}
              onChange={(event) => {
                setColorComparison(event.target.value as any);
              }}
            >
              {["<=", "=", ">="].map((entry) => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledManaSelect>
          </StyledComponentHolder>
        </CheckboxGroup>
        <CheckboxGroup
          label="Color Identity (Commander)"
          values={colors}
          initialValue={searchColorsIdentity}
          onChange={setSearchColorsIdentityAtom}
        />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          initialValue={set}
          label={"Set"}
          values={["HLC", "HC2", "HC3", "HC4", "HCV", "HC6", "HCP"]}
          onChange={setSet}
        />
        <StyledComponentHolder>
          <StyledLabel htmlFor="constructedLegal">
            Only Constructed Legal
          </StyledLabel>
          <SearchCheckbox
            id="constructedLegal"
            type="checkbox"
            checked={legality == "legal"}
            onChange={(event) => {
              setLegality(event.target.checked ? "legal" : "");
            }}
          />
        </StyledComponentHolder>
        <StyledComponentHolder>
          <StyledLabel htmlFor="canBeYourCommander">
            {"Can Be Your Commander"}
          </StyledLabel>
          <SearchCheckbox
            id="canBeYourCommander"
            type="checkbox"
            checked={isCommander === true}
            onChange={(event) => {
              setIsCommander(event.target.checked ? true : false);
            }}
          />
        </StyledComponentHolder>
        <CmcSelector
          label={"Mana value"}
          onChange={setSearchCmc}
          initialValue={searchCmc}
        />
        <CmcSelector label={"Power"} onChange={setPower} initialValue={power} />
        <CmcSelector
          label={"Toughness"}
          onChange={setToughness}
          initialValue={toughness}
        />
      </SearchCriteriaSection>
    </SearchContainer>
  );
};
const SearchCriteriaSection = styled("div")({
  justifyContent: "space-evenly",
  paddingLeft: "30px",
});
const SearchContainer = styled("div")({ display: "flex", flexWrap: "wrap" });
const StyledManaSelect = styled("select")({ width: "100px", height: "30px" });

const StyledComponentHolder = styled.div({
  display: "flex",
  flexDirection: "column",
  marginTop: "10px",
});
