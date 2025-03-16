const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
// const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const creditPackageController = require('../controllers/creditPackage')

// 取得方案資料表
router.get('/', handleErrorAsync(creditPackageController.getCreditPackages));
// 新增課程方案資料
router.post('/', handleErrorAsync(creditPackageController.postCreateCreditPackage));
// 新增使用者購買方案紀錄
router.post('/:creditPackageId', auth, handleErrorAsync(creditPackageController.postPurchaseCreditPackage));
// 刪除購買方案
router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage));

module.exports = router