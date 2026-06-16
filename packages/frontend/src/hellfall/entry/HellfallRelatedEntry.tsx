import styled from '@emotion/styled';
import { MouseEventHandler, useState } from 'react';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { clickableTitleStencil, imageStencil, linkStyles, loadedStyles, sharedContainer, titleLinkStyles, titleStencil, visuallyHiddenSpan } from './entryStyles';
import { Box, Text } from '@workday/canvas-kit-react';
import { Link } from 'react-router-dom';

export const HellfallRelatedEntry = ({
  url,
  id,
  name,
  otherNames,
  plainText,
  onClick,
  onClickTitle,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  plainText?: string;
  onClick: MouseEventHandler<HTMLImageElement>;
  onClickTitle?: MouseEventHandler<HTMLImageElement>;
}) => {
  const linkUrl = `/card/${encodeURIComponent(id)}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);

  const handleClick = (
    e: React.MouseEvent,
    customHandler?: MouseEventHandler<HTMLImageElement>
  ) => {
    if (e.button === 1 || e.metaKey || e.ctrlKey) {
      return;
    }
    e.preventDefault();
    if (customHandler) {
      customHandler(e as any);
    } else {
      onClick(e as any);
    }
  };

  return (
    <Box cs={container} key={id} role="button">
      {onClickTitle && (
        <Link
          key={id + '-title'}
          to={linkUrl}
          className={titleLinkStyles}
          onClick={e => handleClick(e, onClickTitle as any)}
        >
          <Text cs={clickableTitleStencil()}>{name}</Text>
        </Link>
      )}
      <Link
        to={linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        {...imageLinkStencil({imageLoaded})}
      >
        <img
          key={id}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          title={plainText ?? name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          {...imageStencil({hideImage:!(imageLoaded || imageErrored), isRelated:true})}
        />
        {!onClickTitle &&
            (<Text key={id + '-name'} cs={titleStencil({imageLoaded})}>{name}</Text>)
          // (imageLoaded ? (
          //   <Text key={id + '-name'} cs={visuallyHiddenSpan}>{name}</Text>
          // ) : (
          }
        {otherNames &&
          otherNames.map((otherName, i) => {
            return (
              <Text key={'other-name-' + i + '-' + id} cs={visuallyHiddenSpan}>{otherName}</Text>
            );
          })}
      </Link>
    </Box>
  );
};

const container = createStyles(sharedContainer,{
  display: 'flex',
  overflow: 'auto',
  maxheight: '500px',
  alignItems: 'center',
  justifyContent: 'center',
});

const imageLinkStencil = createStencil({
  vars: {},
  base: linkStyles,
  modifiers: {
    imageLoaded: {
      false: {
        height: '450px',
        width: '320px',
        ...loadedStyles,
      },
    },
  },
})
