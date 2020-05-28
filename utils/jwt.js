const jwt = require('jsonwebtoken');

const generateToken = (id, userType) =>
{
  const token = jwt.sign({ _id: id, userType: userType}, 'blabla');
  return token;
}
 

module.exports.generateToken = generateToken; 