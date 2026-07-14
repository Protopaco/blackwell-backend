const getUniqueCode = (label: string) =>
  `T${label.slice(0, 10).toUpperCase()}${Date.now().toString(36)}`;

export default getUniqueCode;
