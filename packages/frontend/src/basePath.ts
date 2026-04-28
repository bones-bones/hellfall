const HELLFALL_BASE_PATH = '/hellfall';

export const getBasePath = () => {
  if (typeof window === 'undefined') {
    return HELLFALL_BASE_PATH;
  }

  const { pathname } = window.location;
  if (pathname === HELLFALL_BASE_PATH || pathname.startsWith(`${HELLFALL_BASE_PATH}/`)) {
    return HELLFALL_BASE_PATH;
  }

  return '';
};

export const withBasePath = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBasePath()}${normalizedPath}`;
};
