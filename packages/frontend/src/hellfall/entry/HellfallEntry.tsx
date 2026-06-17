// import styled from '@emotion/styled';
import { Box, Text } from '@workday/canvas-kit-react';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { useState } from 'react';
import {
  clickableTitleStencil,
  imageStencil,
  linkStyles,
  loadedStyles,
  sharedContainer,
  titleLinkStyles,
  titleStencil,
  visuallyHiddenSpan,
} from './entryStyles';
import { Link } from 'react-router-dom';

export const HellfallEntry = ({
  url,
  id,
  name,
  otherNames,
  plainText,
  onClick,
  onClickTitle,
  imgLinkUrl,
}: {
  url: string;
  id: string;
  name: string;
  otherNames?: string[];
  plainText?: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
  onClickTitle?: React.MouseEventHandler<HTMLImageElement>;
  imgLinkUrl?: string;
}) => {
  const linkUrl = `/card/${encodeURIComponent(id)}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);

  const handleClick = (
    e: React.MouseEvent,
    customHandler?: React.MouseEventHandler<HTMLImageElement>
  ) => {
    if (e.button === 1 || e.metaKey || e.ctrlKey) {
      // Let the link handle it naturally
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
          <Text
            as={imgLinkUrl ? 'h3' : 'span'}
            cs={clickableTitleStencil({ hasURL: !!imgLinkUrl })}
          >
            {name}
          </Text>
        </Link>
      )}
      <Link
        to={imgLinkUrl ?? linkUrl}
        onClick={e => handleClick(e)}
        title={plainText ?? name}
        {...imageLinkStencil({ imageLoaded })}
      >
        <img
          key={id + '-image'}
          src={url}
          referrerPolicy="no-referrer"
          aria-label={name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          {...imageStencil({ hideImage: !(imageLoaded || imageErrored) })}
        />
        {
          !onClickTitle && (
            <Text key={id + '-name'} cs={titleStencil({ imageLoaded })}>
              {name}
            </Text>
          )
          /*  (imageLoaded ? (
            <Text key={id + '-name'} cs={visuallyHiddenSpan}>{name}</Text>
          ) : (
          )) */
        }
        {otherNames &&
          otherNames.map((otherName, i) => {
            return (
              <Text key={'other-name-' + i + '-' + id} cs={visuallyHiddenSpan}>
                {otherName}
              </Text>
            );
          })}
      </Link>
    </Box>
  );
};

const container = createStyles(sharedContainer, {
  height: '340px',
  display: 'inline-block',
  position: 'relative',
});

const imageLinkStencil = createStencil({
  vars: {},
  base: linkStyles,
  modifiers: {
    imageLoaded: {
      false: {
        ...loadedStyles,
        height: '340px',
        width: '243px',
        display: 'block',
      },
    },
  },
});
