const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
// const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')

const adminController = require('../controllers/admin')

// 新增教練課程
router.post('/coaches/courses', auth, isCoach, handleErrorAsync(adminController.postCourse));

router.put('/coaches/courses/:courseId', auth, isCoach, handleErrorAsync(adminController.putCourse));

router.post('/coaches/:userId', handleErrorAsync(adminController.postChangeUserRoleToCoach));

module.exports = router