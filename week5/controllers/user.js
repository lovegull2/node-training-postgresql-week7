const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const { dbEntityNameUser } = require('../entities/User')
const logger = require('../utils/logger')('Users')
const responseSend = require('../utils/serverResponse')
const { isNotValidString, isNotValidPassword, isNotValidUserName, isNotValidEmail } = require('../utils/validation')
const generateJWT = require('../utils/generateJWT')
const saltRounds = 10
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(dbEntityNameUser),
    logger
})

/** 使用者註冊 */
async function postSignup(req, res, next) {
    try {
        const { name, email, password } = req.body
        if (isNotValidString(name) || isNotValidString(password) || isNotValidString(email)) {
            responseSend(res, 400, '欄位未填寫正確', logger)
            return
        }
        if (isNotValidPassword(password)) {
            responseSend(res, 400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字', logger)
            return
        }
        if (isNotValidUserName(name)) {
            responseSend(res, 400, '使用者名稱不符合規則，最少2個字，最多10個字，不可包含任何特殊符號與空白', logger)
            return
        }
        if (isNotValidEmail(email)) {
            responseSend(res, 400, '不符合Email的格式字串', logger)
            return
        }

        const userRepository = dataSource.getRepository(dbEntityNameUser)
        // 檢查 email 是否已存在
        const existingUser = await userRepository.findOne({
            where: { email }
        })

        if (existingUser) {
            responseSend(res, 409, 'Email 已被使用', logger)
            return
        }

        // 建立新使用者
        const hashPassword = await bcrypt.hash(password, saltRounds)
        const newUser = userRepository.create({
            name,
            email,
            role: 'USER',
            password: hashPassword
        })

        const savedUser = await userRepository.save(newUser)
        logger.info('新建立的使用者ID:', savedUser.id)

        responseSend(res, 201, {
            user: {
                id: savedUser.id,
                name: savedUser.name
            }
        })
    } catch (error) {
        logger.error('建立使用者錯誤:', error)
        next(error)
    }
}

/** 使用者登入 */
async function postLogin(req, res, next) {
    try {
        const { email, password } = req.body
        if (isNotValidEmail(email)) {
            responseSend(res, 400, '不符合Email的格式字串', logger)
            return
        }
        if (isNotValidPassword(password)) {
            responseSend(res, 400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字', logger)
            return
        }
        const userRepository = dataSource.getRepository(dbEntityNameUser)
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'password'],
            where: { email }
        })

        if (!existingUser) {
            responseSend(res, 400, '使用者不存在或密碼輸入錯誤')
            return
        }
        logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            responseSend(res, 400, '使用者不存在或密碼輸入錯誤')
            return
        }
        const token = await generateJWT(
            { id: existingUser.id },
            config.get('secret.jwtSecret'),
            { expiresIn: `${config.get('secret.jwtExpiresDay')}` }
        )

        responseSend(res, 201, {
            token,
            user: {
                name: existingUser.name
            }
        })
    } catch (error) {
        logger.error('登入錯誤:', error)
        next(error)
    }
}

/** 取得個人資料 */
async function getProfile(req, res, next) {
    try {
        const { id } = req.user
        const userRepository = dataSource.getRepository(dbEntityNameUser)
        const user = await userRepository.findOne({
            select: ['name', 'email'],
            where: { id }
        })

        responseSend(res, 200, { user })
    } catch (error) {
        logger.error('取得使用者資料錯誤:', error)
        next(error)
    }
}

/** 更新個人資料 */
async function putProfile(req, res, next) {
    try {
        const { id } = req.user
        const { name } = req.body
        if (isNotValidUserName(name)) {
            responseSend(res, 400, '使用者名稱不符合規則，最少2個字，最多10個字，不可包含任何特殊符號與空白', logger)
            return
        }
        const userRepository = dataSource.getRepository(dbEntityNameUser)
        const user = await userRepository.findOne({
            select: ['name'],
            where: { id }
        })
        if (user.name === name) {
            responseSend(res, 400, '使用者名稱未變更')
            return
        }
        const updatedResult = await userRepository.update(
            { id, name: user.name },
            { name }
        )

        if (updatedResult.affected === 0) {
            responseSend(res, 400, '更新使用者失敗')
            return
        }

        responseSend(res, 200);  // API 文件只需要回傳 200

        // const result = await userRepository.findOne({
        //     select: ['name'],
        //     where: { id }
        // })

        // responseSend(res, 200, { user: result })
    } catch (error) {
        logger.error('更新使用者資料錯誤:', error)
        next(error)
    }
}

module.exports = {
    postSignup,
    postLogin,
    getProfile,
    putProfile,
}