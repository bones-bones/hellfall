import styled from '@emotion/styled';
import { Pagination, PaginationModel } from '@workday/canvas-kit-react/pagination';

export const PaginationComponent = ({ model }: { model: PaginationModel }) => {
  return (
    <PaginationContainer>
      <Pagination aria-label="pagination" model={model}>
        <Pagination.Controls>
          <Pagination.JumpToFirstButton aria-label="First" />
          <Pagination.StepToPreviousButton aria-label="Previous" />
          <Pagination.PageList>
            {({ state }) =>
              state.range.map(pageNumber => (
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

const PaginationContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '20px',
});
