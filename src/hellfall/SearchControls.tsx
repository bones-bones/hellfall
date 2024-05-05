import { styled } from "@workday/canvas-kit-react/common";

import { CheckboxGroup } from "./inputs";
import { PillSearch } from "./inputs";
import { Checkbox } from "@workday/canvas-kit-react/checkbox";
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
import { Select } from "@workday/canvas-kit-preview-react/select";

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
        />
        <FormField label="Color Comparison">
          <StyledManaSelect
            options={[{ value: "<=" }, { value: "=" }, { value: ">=" }]}
            defaultValue={colorComparison}
            value={colorComparison}
            onChange={(event) => {
              setColorComparison(event.target.value as any);
            }}
          />
        </FormField>
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
          values={["HLC", "HC2", "HC3", "HC4", "HC6"]}
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
        <FormField
          key={"Can Be Your Commander"}
          label={"Can Be Your Commander"}
        >
          <Checkbox
            type="checkbox"
            checked={isCommander === true}
            onChange={(event) => {
              setIsCommander(event.target.checked ? true : false);
            }}
          />
        </FormField>
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
const StyledManaSelect = styled(Select)({ width: "100px" });
