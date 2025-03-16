const { dataSource } = require('../db/data-source')
const { IsNull, In } = require('typeorm')
const bcrypt = require('bcrypt')
const config = require('../config/index')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('UserController')
const generateJWT = require('../utils/generateJWT')

function isUndefined (value) {
    return value === undefined
  }

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === '';
}

const usersController = {
    async postSignup (req, res, next)  {
      const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
      const { name, email, password } = req.body
      if (isUndefined(name) || isNotValidSting(name) || isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
        logger.warn('欄位未填寫正確')
        return next(appError(400, '欄位未填寫正確'))
      }
      if (!passwordPattern.test(password)) {
        logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      
        return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'))
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
      where: { email }
      })

      if (existingUser) {
        logger.warn('建立使用者錯誤: Email 已被使用')
        return next(appError(409, 'Email 已被使用'))
      }
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)
      const newUser = userRepository.create({
        name,
        email,
        role: 'USER',
        password: hashPassword
      })

      const savedUser = await userRepository.save(newUser)
      logger.info('新建立的使用者ID:', savedUser.id)

      res.status(201).json({
      status: 'success',
      data: {
          user: {
          id: savedUser.id,
          name: savedUser.name
          }
        }
      })
    },

    async postLogin (req, res, next)  {
        const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
        const { email, password } = req.body
        if (isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
          logger.warn('欄位未填寫正確')
          return next(appError(400, '欄位未填寫正確'))
        }
        if (!passwordPattern.test(password)) {
          logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
          return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'))
        }
        const userRepository = dataSource.getRepository('User')
        // 使用者不存在或密碼錯誤
        const existingUser = await userRepository.findOne({
          select: ['id', 'name', 'password'],
          where: { email }
        })
    
        if (!existingUser) {
          return next(appError(400, '使用者不存在或密碼輸入錯誤'))
        }
        logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
          return next(appError(400, '使用者不存在或密碼輸入錯誤'))
        }
        const token = await generateJWT({
          id: existingUser.id
        }, config.get('secret.jwtSecret'), {
          expiresIn: `${config.get('secret.jwtExpiresDay')}`
        })
    
        res.status(201).json({
          status: 'success',
          data: {
            token,
            user: {
              name: existingUser.name
            }
          }
        })            
    },

    async getUserProfile (req, res, next)  {
      const { id } = req.user
      console.log('Request user:', req.user)
      console.log(id)

      if(isNotValidSting(id)) {
          return next(appError(400, '欄位未填寫正確'))
      }
      const userRepository = dataSource.getRepository('User')
      const user = await userRepository.findOne({
        select: ['name', 'email'],
        where: { id }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      })        
    },

    async putUserProfile (req, res, next)  {
        const { id } = req.user
        const { name } = req.body
        if (isUndefined(name) || isNotValidSting(name)) {
          logger.warn('欄位未填寫正確')
          return next(appError(400, '欄位未填寫正確'))
        }
        // 增加檢查name長度與輸入格式
        const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,10}$/
        if (!nameRegex.test(name)) {
          logger.warn('名稱格式不符合規則')
          return next(appError(400, '名稱必須為 2-10 個字，且不可包含特殊符號或空白'))
        }
    
        const userRepository = dataSource.getRepository('User')
        const user = await userRepository.findOne({
          select: ['name'],
          where: {
            id
          }
        })
        // 檢查名稱與DB儲存的名稱是否相同
        if (user.name === name) {
          return next(appError(400, '使用者名稱未變更'))
        }
        const updatedResult = await userRepository.update({
          id,
          name: user.name
        }, {
          name
        })
        // 檢查資料是否有更新
        if (updatedResult.affected === 0) {
          return next(appError(400, '更新使用者資料失敗'))
        }
        const result = await userRepository.findOne({
          select: ['name'],
          where: {
            id
          }
        })
        res.status(200).json({
          status: 'success',
          data: {
            user: result
          }
        })            
    }
}

module.exports = usersController










