// Convert hex to rgba
export default function hexToRgba(hex: string, opacity: number): string {
  // Remove the hash at the start if it's there
  hex = hex.replace('#', '');

  // Parse the r, g, b values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Return the rgba string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};