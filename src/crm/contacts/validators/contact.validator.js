const { body } = require('express-validator');

function SaveContactValidation() {
  return [
    body('email', 'Invalid email').isEmail().normalizeEmail().toLowerCase().exists(),
    body('firstname', 'Invalid firstname').notEmpty().exists(),
    body('lastname', 'Invalid password').exists(),
    body('whatsapp', 'Invalid whatsapp').exists(),
    body('mobilephone', 'Invalid mobilephone').exists(),
    body('address', 'Invalid address').exists(),
    body('state', 'Invalid state').exists(),
    body('city', 'Invalid city').exists(),
    body('postalCode', 'Invalid postalCode').isPostalCode().exists(),
    body('country', 'Invalid country').exists(),
  ];
}

module.exports = SaveContactValidation;
