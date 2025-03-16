const jwt = require('jsonwebtoken')
const config = require('../config/index')
const appError = require('./appError')

/**
 * create JSON Web Token
 * @param {Object} payload token content
 * @param {String} secret token secret
 * @param {Object} [option] same to npm package - jsonwebtoken
 * @returns {String}
 */
module.exports = (payload, secret, option = {}) => new Promise((resolve, reject) => {
  jwt.sign(payload, secret, option, (err, token) => {
    if (err) {
      reject(err)
      return
    }
    resolve(token)
  })
})


// 另一種寫法
// const generateJWT = (payload) => {
//   // 產生JWT token
//   return jwt.sign(
//     payload,
//     config.get('secret.jwtScret'),
//     {expiresIn: config.get('secret.jwtExpiresDay')}
//   );

// }

// // 驗證token, token錯誤, 失效等
// const verifyJWT = (token) => {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, config.get('secret.jwtSecret'), (err, decoded) => {
//       if (err) {
//         switch (err.name) {
//           case 'TokenExpiredError':
//             reject(appError(401, 'Token 已過期'))
//             break
//           default:
//             reject(appError(401, '無效的 token'))
//             break
//         }
//       } else {
//         resolve(decoded)
//       }
//     })
//   })
// }


// module.exports = {
//   generateJWT,
//   verifyJWT

// }

