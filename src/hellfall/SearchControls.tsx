import styled from "@emotion/styled";

import { CheckboxGroup } from "./inputs";
import { PillSearch } from "./inputs";
import { TextInput } from "@workday/canvas-kit-react/text-input";
import { FormField } from "@workday/canvas-kit-react/form-field";
import cardTypes from "../data/types.json";
import creators_data from "../data/creators.json";
import tags_data from "../data/tags.json";
import { CmcSelector } from "./inputs";
import { SearchCheckbox } from "./SearchCheckbox";

import { useAtom } from "jotai";
import {
  nameSearchAtom,
  idSearchAtom,
  costSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorsAtom,
  searchSetAtom,
  creatorsAtom,
  typeSearchAtom,
  searchColorsIdentityAtom,
  searchColorComparisonAtom,
  useHybridIdentityAtom,
  powerAtom,
  toughnessAtom,
  tagsAtom,
} from "./searchAtoms";
import { colors } from "./constants";
import { StyledLabel } from "./StyledLabel";
import { CardLegalityControls } from "./search-controls/CardLegalityControls";
import { StyledComponentHolder } from "./StyledComponentHolder";

// TODO: add or functionality (maybe just entirely switch over to how scryfall does it?)

export const SearchControls = () => {
  const [set, setSet] = useAtom(searchSetAtom);
  const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  const [idSearch, setIdSearch] = useAtom(idSearchAtom);
  const [costSearch, setCostSearch] = useAtom(costSearchAtom);
  const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  const [searchCmc, setSearchCmc] = useAtom(searchCmcAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);

  const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  const [creators, setCreators] = useAtom(creatorsAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [searchColorsIdentity, setSearchColorsIdentityAtom] = useAtom(
    searchColorsIdentityAtom
  );
  const [useHybrid, setUseHybrid] = useAtom(useHybridIdentityAtom);
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
        <FormField label="Id">
          <TextInput
            defaultValue={idSearch}
            onKeyDown={(event) => {
              if (event.key == "Enter") {
                setIdSearch((event.target as any).value);
              }
            }}
            onBlur={(event) => {
              setIdSearch(event.target.value);
            }}
          />
        </FormField>
        <PillSearch
          label={"Cost"}
          possibleValues={[]}
          defaultValues={costSearch}
          onChange={setCostSearch}
        />
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
        />
        <PillSearch
          label={"Tags"}
          possibleValues={tags_data.data}
          defaultValues={tags}
          onChange={setTags}
        />
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
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="useHybrid">
              {"Use Alternate Hybrid Rule"}
            </StyledLabel>
            <SearchCheckbox
              id="useHybrid"
              type="checkbox"
              checked={useHybrid === true}
              onChange={(event) => {
                setUseHybrid(event.target.checked);
              }}
            />
          </StyledComponentHolder>
        </CheckboxGroup>
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          initialValue={set}
          label={"Set"}
          values={[
            "HLC",
            "HC2",
            "HC3",
            "HC4",
            "HCV",
            "HC6",
            "HCC",
            "HCP",
            "HC7",
            "HCK",
            "HC8",
            "HCJ",
          ]}
          onChange={setSet}
        />
        <CardLegalityControls />
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
