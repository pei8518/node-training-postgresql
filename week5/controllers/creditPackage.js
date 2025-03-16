const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('CreditPackageController')

function isUndefined (value) {
    return value === undefined
  }

function isNotValidSting (value) {
return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const creditPackageController = {
    // 取得方案資料表
    async getCreditPackages (req, res, next)  {
        const creditPackage = await dataSource.getRepository('CreditPackage').find({
            select: ['id', 'name', 'credit_amount', 'price']
        })
        res.status(200).json({
        status: 'success',
        data: creditPackage
        })        
    },
    // 新增課程方案資料
    async postCreateCreditPackage (req, res, next)  {
        const { name, credit_amount: creditAmount, price } = req.body
        if (isUndefined(name) || isNotValidSting(name) ||
          isUndefined(creditAmount) || isNotValidInteger(creditAmount) ||
                isUndefined(price) || isNotValidInteger(price)) {
          return next(appError(400, '欄位未填寫正確'))
        }
        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const existCreditPackage = await creditPackageRepo.find({
          where: {
            name
          }
        })
        if (existCreditPackage.length > 0) {
          return next(appError(409, '資料重複'))
        }
        const newCreditPurchase = await creditPackageRepo.create({
          name,
          credit_amount: creditAmount,
          price
        })
        const result = await creditPackageRepo.save(newCreditPurchase)
        res.status(200).json({
          status: 'success',
          data: result
        })        
    },
    // 新增使用者購買方案紀錄
    async postPurchaseCreditPackage (req, res, next)  {
        const { id } = req.user
        const { creditPackageId } = req.params
        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const creditPackage = await creditPackageRepo.findOne({
          where: {
            id: creditPackageId
          }
        })
        if (!creditPackage) {
          return next(appError(400, 'ID錯誤'))
        }
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const newPurchase = await creditPurchaseRepo.create({
          user_id: id,
          credit_package_id: creditPackageId,
          purchased_credits: creditPackage.credit_amount,
          price_paid: creditPackage.price,
          purchaseAt: new Date().toISOString()
        })
        await creditPurchaseRepo.save(newPurchase)
        res.status(200).json({
          status: 'success',
          data: null
        })        
    },
    // 刪除購買方案
    async deleteCreditPackage (req, res, next)  {
        const { creditPackageId } = req.params
        if (isUndefined(creditPackageId) || isNotValidSting(creditPackageId)) {
          return next(appError(400, '欄位未填寫正確'))
        }
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {
          return next(appError(400, 'ID錯誤'))
        }
        res.status(200).json({
          status: 'success',
          data: result
        })        
    }
}

module.exports = creditPackageController

