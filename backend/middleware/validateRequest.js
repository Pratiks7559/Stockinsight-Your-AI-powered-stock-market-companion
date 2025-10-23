// middleware/validateRequest.js
export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] && req.body[field] !== 0) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }
    
    // Validate numeric fields
    const numericFields = ['quantity', 'price'];
    for (const field of numericFields) {
      if (req.body[field] !== undefined) {
        const value = parseFloat(req.body[field]);
        if (isNaN(value) || value <= 0) {
          return res.status(400).json({
            error: `Invalid ${field}: must be a positive number`
          });
        }
        req.body[field] = value;
      }
    }
    
    // Validate symbol format
    if (req.body.symbol) {
      req.body.symbol = req.body.symbol.toString().toUpperCase().trim();
      if (!/^[A-Z]{1,10}$/.test(req.body.symbol)) {
        return res.status(400).json({
          error: 'Invalid symbol format'
        });
      }
    }
    
    next();
  };
};