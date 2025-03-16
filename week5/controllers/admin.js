const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('AdminController')

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const adminController = {
  // 新增教練課程
  async postCourse (req, res, next)  {
    const { id } = req.user
    const {
      skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
      max_participants: maxParticipants, meeting_url: meetingUrl
    } = req.body
    if (isUndefined(skillId) || isNotValidSting(skillId) ||
      isUndefined(name) || isNotValidSting(name) ||
      isUndefined(description) || isNotValidSting(description) ||
      isUndefined(startAt) || isNotValidSting(startAt) ||
      isUndefined(endAt) || isNotValidSting(endAt) ||
      isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
      isUndefined(meetingUrl) || isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
      logger.warn('欄位未填寫正確')
      return next(appError(400, '欄位未填寫正確'))
    }
    const courseRepo = dataSource.getRepository('Course')
    const newCourse = courseRepo.create({
      user_id: id,
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    const savedCourse = await courseRepo.save(newCourse)
    const course = await courseRepo.findOne({
      where: { id: savedCourse.id }
    })
    res.status(201).json({
      status: 'success',
      data: {
        course
      }
    })      
  },

  async putCourse (req, res, next)  {
    const { id } = req.user
    const { courseId } = req.params
    const {
      skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
      max_participants: maxParticipants, meeting_url: meetingUrl
    } = req.body
    if (isNotValidSting(courseId) ||
      isUndefined(skillId) || isNotValidSting(skillId) ||
      isUndefined(name) || isNotValidSting(name) ||
      isUndefined(description) || isNotValidSting(description) ||
      isUndefined(startAt) || isNotValidSting(startAt) ||
      isUndefined(endAt) || isNotValidSting(endAt) ||
      isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
      isUndefined(meetingUrl) || isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
      logger.warn('欄位未填寫正確')
      return next(appError(400, '欄位未填寫正確'))
    }
    const courseRepo = dataSource.getRepository('Course')
    const existingCourse = await courseRepo.findOne({
      where: { id: courseId, user_id: id }
    })
    if (!existingCourse) {
      logger.warn('課程不存在')
      return next(appError(400, '課程不存在'))
    }
    const updateCourse = await courseRepo.update({
      id: courseId
    }, {
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    if (updateCourse.affected === 0) {
      logger.warn('更新課程失敗')
      return next(appError(400, '更新課程失敗'))
    }
    const savedCourse = await courseRepo.findOne({
      where: { id: courseId }
    })
    res.status(200).json({
      status: 'success',
      data: {
        course: savedCourse
      }
    })      
  },

  async postChangeUserRoleToCoach (req, res, next)  {
    const { userId } = req.params
    const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
    if (isUndefined(experienceYears) || isNotValidInteger(experienceYears) || isUndefined(description) || isNotValidSting(description)) {
      logger.warn('欄位未填寫正確')
      return next(appError(400, '欄位未填寫正確'))
    }
    if (profileImageUrl && !isNotValidSting(profileImageUrl) && !profileImageUrl.startsWith('https')) {
      logger.warn('大頭貼網址錯誤')
      return next(appError(400, '欄位未填寫正確'))
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id', 'name', 'role'],
      where: { id: userId }
    })
    if (!existingUser) {
      return next(appError(400, '使用者不存在'))
    } else if (existingUser.role === 'COACH') {
      return next(appError(409, '使用者已經是教練'))
    }
    const coachRepo = dataSource.getRepository('Coach')
    const newCoach = coachRepo.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl
    })
    const updatedUser = await userRepository.update({
      id: userId,
      role: 'USER'
    }, {
      role: 'COACH'
    })
    if (updatedUser.affected === 0) {
      return next(appError(400, '更新使用者失敗'))
    }
    const savedCoach = await coachRepo.save(newCoach)
    const savedUser = await userRepository.findOne({
      select: ['name', 'role'],
      where: { id: userId }
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: savedUser,
        coach: savedCoach
      }
    })      
  }
}

module.exports = adminController

