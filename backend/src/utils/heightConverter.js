/**
 * Convert centimeters to feet and inches
 * @param {number} cm - Height in centimeters
 * @returns {object} Object with feet, inches, and display string
 */
function cmToFeetInches(cm) {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return {
    feet,
    inches,
    display: `${feet}'${inches}"`
  };
}

/**
 * Format height for display
 * @param {number} cm - Height in centimeters
 * @returns {object} Formatted height object
 */
function formatHeight(cm) {
  const imperial = cmToFeetInches(cm);
  
  return {
    cm: Math.round(cm),
    feet: imperial.feet,
    inches: imperial.inches,
    display: imperial.display
  };
}

module.exports = {
  cmToFeetInches,
  formatHeight
};

// Made with Bob
