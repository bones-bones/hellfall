import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledIntrinsic } from '../styling';

const pageContainerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f9f9f9',
  minHeight: '100vh',
});
export const PageContainer = createStyledDiv(pageContainerStyles, 'PageContainer');

const titleStyles = createStyles({ textAlign: 'center', marginBottom: '10px' });
export const Title = createStyledIntrinsic('h1', titleStyles, 'Title');

const subtitleStyles = createStyles({ textAlign: 'center', marginBottom: '30px' });
export const Subtitle = createStyledIntrinsic('h3', subtitleStyles, 'Subtitle');

const componentStyles = createStyles({ color: 'purple', display: 'flex' });
export const StyleComponent = createStyledDiv(componentStyles, 'StyleComponent');
