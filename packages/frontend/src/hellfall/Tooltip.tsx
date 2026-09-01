import { createStencil } from '@workday/canvas-kit-styling';
import { useEffect, useRef, useState } from 'react';
import { createStenciledImg } from '../styling';
import { useAtomValue } from 'jotai';
import { mouseXAtom, mouseYAtom, tooltipSrcAtom } from './atoms/tooltipAtom';

export interface ImageProps extends React.ComponentProps<'img'> {
  imageLoaded?: boolean;
  left: string;
  top: string;
  hideImage?: boolean;
  hideTooltip?: boolean;
}

const srcToKey = (src: string | undefined) => (src ? `${src}-${Date.now()}` : undefined);
const space = 30;
const getPreferredRenderPos = (
  pos1: number,
  pos2: number,
  imageMeasure: number,
  windowMeasure: number
) => {
  const pos1Collides = pos1 < 0;
  const pos2Collides = pos2 + imageMeasure > windowMeasure;
  if (pos1Collides == pos2Collides) return;
  return pos1Collides ? pos2 : pos1;
};
export const Tooltip = ({ renderToLeft }: { renderToLeft?: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);
  const [imageWidth, setImageWidth] = useState(243);
  const [imageHeight, setImageHeight] = useState(340);
  const imgRef = useRef<HTMLImageElement>(null);
  const tooltipSrc = useAtomValue(tooltipSrcAtom);
  const mouseX = useAtomValue(mouseXAtom);
  const mouseY = useAtomValue(mouseYAtom);
  // the X position to render the top left of the image at, if the image is rendered to the left of the cursor
  const leftPos = mouseX - imageWidth - space;
  // the X position to render the top left of the image at, if the image is rendered to the right of the cursor
  const rightPos = mouseX + space;
  // the Y position to render the top left of the image at, if the image is rendered above the cursor
  const topPos = mouseY - imageHeight + space;
  // the Y position to render the top left of the image at, if the image is rendered below the cursor
  const bottomPos = mouseY - space;

  const left =
    getPreferredRenderPos(leftPos, rightPos, imageWidth, window.innerWidth) ??
    (renderToLeft ? leftPos : rightPos);
  const top =
    getPreferredRenderPos(topPos, bottomPos, imageHeight, window.innerHeight) ?? bottomPos;

  useEffect(() => {
    setImageLoaded(false);
    setImageErrored(false);
    setImageHeight(243);
    setImageWidth(340);
  }, [tooltipSrc]);

  useEffect(() => {
    if (imageLoaded && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      setImageWidth(rect.width || 243);
      setImageHeight(rect.height || 340);
    }
  }, [imageLoaded, imgRef.current]);

  useEffect(() => {
    // This is necessary due to how chrome caches images.
    if (imgRef.current?.complete && !imageLoaded) {
      setImageLoaded(true);
    }
  }, [tooltipSrc, imgRef.current?.complete]);

  return (
    <TooltipImage
      ref={imgRef}
      left={`${left}px`}
      top={`${top}px`}
      onLoad={e => {
        setImageLoaded(true);
      }}
      onError={() => setImageErrored(true)}
      src={tooltipSrc}
      hideImage={!(imageLoaded || imageErrored)}
      hideTooltip={!tooltipSrc}
    />
  );
};

const imageStencil = createStencil({
  vars: {
    left: '0px',
    top: '0px',
  },
  base: ({ left, top }) => ({
    maxWidth: '500px',
    maxHeight: '340px',
    display: 'block',
    left,
    top,
    position: 'fixed',
    zIndex: '1000000',
  }),
  modifiers: {
    imageLoaded: {
      false: {
        backgroundImage: 'repeating-linear-gradient(-55deg, #DDD, #DDD 5px, #CCC 5px, #CCC 10px)',
        borderRadius: '4.75% / 3.5%',
        overflow: 'hidden',
        height: '340px',
        width: '243px',
        display: 'block',
      },
    },
    hideImage: {
      true: {
        visibility: 'hidden',
        display: 'inline',
        // width: 0,
        // height: 0,
        opacity: 0,
      },
    },
    hideTooltip: {
      true: {
        display: 'none',
      },
    },
  },
});
const TooltipImage = createStenciledImg<ImageProps>(imageStencil, 'TooltipImage');
