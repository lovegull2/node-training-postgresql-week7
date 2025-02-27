const express = require('express')
const { dataSource } = require('../db/data-source')
const { dbEntityNameSkill } = require('../entities/Skill')
const logger = require('../utils/logger')(dbEntityNameSkill)
const responseSend = require('../utils/serverResponse')
const { isNotValidString,  isNotValidUuid } = require('../utils/validation')
const router = express.Router()

/** 取得教練專長列表 */
router.get('/', async (req, res, next) => {
    try {
        const skill = await dataSource.getRepository(dbEntityNameSkill).find({
            select: ['id', 'name']
        })
        responseSend(res, 200, skill)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

/** 新增教練專長 */
router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body
        if (isNotValidString(name)) {
            responseSend(res, 400, '欄位未填寫正確', logger)
            return
        }
        const skillRepo = await dataSource.getRepository(dbEntityNameSkill)
        const existSkill = await skillRepo.find({
            where: { name }
        })
        if (existSkill.length > 0) {
            responseSend(res, 409, '資料重複', logger)
            return
        }
        const newSkill = await skillRepo.create({ name })
        const result = await skillRepo.save(newSkill)
        responseSend(res, 200, result)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

/** 刪除教練專長 */
router.delete('/:skillId', async (req, res, next) => {
    try {
        const { skillId } = req.params
        if (isNotValidUuid(skillId)) {
            responseSend(res, 400, 'ID錯誤', logger)
            return
        }
        const result = await dataSource.getRepository(dbEntityNameSkill).delete(skillId)
        if (result.affected === 0) {
            responseSend(res, 400, 'ID錯誤', logger)
            return
        }
        responseSend(res, 200)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

module.exports = router