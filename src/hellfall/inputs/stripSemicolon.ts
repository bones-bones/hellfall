export const stripSemicolon = (text: string) => {
  return text.startsWith(';') ? text.slice(1) : text;
};
