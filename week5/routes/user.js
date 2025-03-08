const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const { dbEntityNameUser } = require('../entities/User')
const logger = require('../utils/logger')('Users')
const user = require('../controllers/user')
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(dbEntityNameUser),
    logger
})

router.post('/signup', user.postSignup)
router.post('/login', user.postLogin)
router.get('/profile', auth, user.getProfile)
// router.get('/credit-package', auth, users.getCreditPackage)
router.put('/profile', auth, user.putProfile)
// router.put('/password', auth, users.putPassword)
// router.get('/courses', auth, users.getCourseBooking)

module.exports = router