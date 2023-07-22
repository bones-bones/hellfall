import styled from "@emotion/styled";
import { Pagination, getLastPage } from "@workday/canvas-kit-react/pagination";

type Props = {
  chunkSize: number;
  total: number;
  onChange: (value: number) => void;
};
export const PaginationComponent = ({ chunkSize, total, onChange }: Props) => {
  return (
    <PaginationContainer>
      <Pagination
        aria-label="pagination"
        lastPage={getLastPage(chunkSize, total)}
        onPageChange={(pageNumber) => {
          onChange((pageNumber - 1) * chunkSize);
        }}
      >
        <Pagination.Controls>
          <Pagination.JumpToFirstButton aria-label="First" />
          <Pagination.StepToPreviousButton aria-label="Previous" />
          <Pagination.PageList>
            {({ state }) =>
              state.range.map((pageNumber) => (
                <Pagination.PageListItem key={pageNumber}>
                  <Pagination.PageButton
                    aria-label={`Page ${pageNumber}`}
                    pageNumber={pageNumber}
                  />
                </Pagination.PageListItem>
              ))
            }
          </Pagination.PageList>
          <Pagination.StepToNextButton aria-label="Next" />
          <Pagination.JumpToLastButton aria-label="Last" />
        </Pagination.Controls>
      </Pagination>
    </PaginationContainer>
  );
};

const PaginationContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  padding: "20px",
});
