import { createStencil } from '@workday/canvas-kit-styling';
import { useState } from 'react';
import { createStenciledImg } from '../../styling';

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

const imageStencil = createStencil({
  vars: {},
  base: {
    rotate: '0deg',
  },
  modifiers: {
    tapped: {
      true: {
        rotate: '90deg',
      },
    },
  },
});
interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  tapped?: boolean;
}

const StyledImage = createStenciledImg<ImageProps>(imageStencil, 'StyledImage');
