const express = require('express')
const { dataSource } = require('../db/data-source')
const { dbEntityNameCreditPackage } = require('../entities/CreditPackages')
const { dbEntityNameUser } = require('../entities/User')
const logger = require('../utils/logger')(dbEntityNameCreditPackage)
const creditPackage = require('../controllers/creditPackage')
const router = express.Router()
const config = require('../config/index')
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(dbEntityNameUser),
    logger
})

router.get('/', creditPackage.getAll)

router.post('/', creditPackage.postNew)

router.post('/:creditPackageId', auth, creditPackage.postUserBuy)

router.delete('/:creditPackageId', creditPackage.deletePackage)

module.exports = router