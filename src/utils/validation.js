/**
 * Runtime prop validation utility
 * @param {Object} props - Component props to validate
 * @param {Object} validations - Validation rules
 * @returns {boolean} - Returns true if all validations pass
 */
export const validateProps = (props, validations) => {
  if (process.env.NODE_ENV === 'development') {
    Object.keys(validations).forEach(key => {
      const value = props[key];
      const validation = validations[key];
      
      if (validation.required && (value === undefined || value === null)) {
        console.error(`[Validation Error] ${key} is required`);
        return false;
      }
      
      if (value !== undefined && validation.type) {
        const type = Array.isArray(value) ? 'array' : typeof value;
        if (Array.isArray(validation.type)) {
          if (!validation.type.includes(type)) {
            console.error(`[Validation Error] ${key} must be one of ${validation.type.join(', ')}`);
            return false;
          }
        } else if (type !== validation.type) {
          console.error(`[Validation Error] ${key} must be of type ${validation.type}`);
          return false;
        }
      }
      
      if (validation.validate && !validation.validate(value)) {
        console.error(`[Validation Error] ${key} failed custom validation`);
        return false;
      }
    });
  }
  return true;
};

/**
 * Common validation types
 */
export const ValidationTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  FUNCTION: 'function',
  OBJECT: 'object',
  ARRAY: 'array',
  ANY: ['string', 'number', 'boolean', 'function', 'object', 'array']
};
