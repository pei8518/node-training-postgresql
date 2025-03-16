const express = require('express')
// const bcrypt = require('bcrypt')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
// const generateJWT = require('../utils/generateJWT')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
// const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const usersController = require('../controllers/users')

const app = require('../app')

// 用戶註冊
router.post('/signup', handleErrorAsync(usersController.postSignup));
// 用戶登入
router.post('/login', handleErrorAsync(usersController.postLogin));
// 取得用戶資料
router.get('/profile', auth, handleErrorAsync(usersController.getUserProfile));
// 更新用戶資料
router.put('/profile', auth, handleErrorAsync(usersController.putUserProfile));


module.exports = router