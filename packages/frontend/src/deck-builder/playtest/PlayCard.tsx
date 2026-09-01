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
      data-tapped={tapped}
    />
  );
};

const imageStencil = createStencil({
  vars: {},
  base: {
    rotate: '0deg',
  },
  modifiers: {
    'data-tapped': {
      true: {
        rotate: '90deg',
      },
    },
  },
});
interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  'data-tapped'?: boolean;
}

const StyledImage = createStenciledImg<ImageProps>(imageStencil, 'StyledImage');
