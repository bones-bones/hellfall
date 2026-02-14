import { FormField } from "@workday/canvas-kit-react/form-field";
import { Select } from "@workday/canvas-kit-preview-react/select";
import { useAtom } from "jotai";
import { sortAtom, dirAtom } from "./searchAtoms";
import styled from "@emotion/styled";
import { space } from "@workday/canvas-kit-react/tokens";

export const SortComponent = () => {
  const [sortRule, setSortRule] = useAtom(sortAtom);
  const [dirRule, setDirRule] = useAtom(dirAtom);

  return (
    <Container>
      <FormField label="Sort By">
        <Select
          value={sortRule}
          options={[{ value: "Alpha" }, { value: "CMC" }, { value: "Color" }]}
          onChange={(ev) => {
            ev.target.value;
            setSortRule((ev as any).target.value || "Color");
          }}
        />{" "}
        :{" "}
        <Select
          value={dirRule}
          options={[{ value: "Asc" }, { value: "Desc" }]}
          onChange={(ev) => {
            setDirRule((ev as any).target.value || "Asc");
          }}
        />
      </FormField>
    </Container>
  );
};

const Container = styled('div')({ paddingLeft: space.l });
