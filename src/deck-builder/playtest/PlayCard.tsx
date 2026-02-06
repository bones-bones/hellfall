import styled from '@emotion/styled';
import { useState } from 'react';

type Props = { image: string };
export const PlayCard = ({ image }: Props) => {
  const [tapped, setTapped] = useState(false);
  return (
    <StyledImage
      src={image}
      key={image}
      height="300px"
      onClick={() => {
        setTapped(!tapped);
      }}
      tapped={tapped}
    />
  );
};

const StyledImage = styled.img(({ tapped }: { tapped: boolean }) => ({
  rotate: tapped ? '90deg' : '0deg',
}));
