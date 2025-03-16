const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
// const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const courseController = require('../controllers/course')

router.get('/', handleErrorAsync(courseController.getCourses));

router.post('/:courseId', auth, handleErrorAsync(courseController.postCourse));

router.delete('/:courseId', auth, handleErrorAsync(courseController.deleteCourse));

module.exports = router