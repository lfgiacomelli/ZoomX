type formatFirstLetter = (text: string) => string;

export const formatFirstLetter: formatFirstLetter = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
