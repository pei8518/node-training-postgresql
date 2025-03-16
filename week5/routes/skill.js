// skill.js routes
const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
// const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const skillController = require('../controllers/skill')

// const logger = require('../utils/logger')('Skill')

// 取得技能資料
router.get('/', handleErrorAsync(skillController.getSkills));
// 更新技能資料表
router.post('/', handleErrorAsync(skillController.postSkill));
// 刪除技能資料
router.delete('/:skillId', handleErrorAsync(skillController.deleteSkill));

module.exports = router