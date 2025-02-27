const express = require('express')

const { dataSource } = require('../db/data-source')
const { dbEntityNameCoach } = require('../entities/Coach')
const logger = require('../utils/logger')(dbEntityNameCoach)
const responseSend = require('../utils/serverResponse')
const { isNotValidInteger, isNotValidUuid } = require('../utils/validation')
const router = express.Router()

/** 取得教練列表 */
router.get('/', async (req, res, next) => {
    try {
        const { per, page } = req.query

        const take = Number(per)
        const pageInt = Number(page)
        if (isNotValidInteger(take) || isNotValidInteger(pageInt) || (pageInt <= 0)) {
            responseSend(res, 400, "欄位未填寫正確", logger)
            return
        }

        const skip = (pageInt - 1) * take

        const findOptions = {
            relations: ["User"],
            select: {
                id: true,
                User: {
                    name: true
                }
            },
            skip,
            take
        }

        const coachRepo = await dataSource.getRepository(dbEntityNameCoach)
        const findResult = await coachRepo.find(findOptions)
        const formatResult = findResult.map(item => ({
            id: item.id,
            name: item.User.name
        }));
        responseSend(res, 200, formatResult)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

/** 取得教練詳細資訊 */
router.get('/:coachId', async (req, res, next) => {
    try {
        const { coachId } = req.params

        if (isNotValidUuid(coachId)) {
            responseSend(res, 400, "欄位未填寫正確", logger)
            return
        }

        const findOptions = {
            relations: ["User"],
            where: { id: coachId }
        }

        const coachRepo = await dataSource.getRepository(dbEntityNameCoach)
        const findResult = await coachRepo.find(findOptions)

        if (findResult.length === 0) {
            responseSend(res, 400, "找不到該教練", logger)
            return            
        }

        const { id, user_id, experience_years, description, profile_image_url, created_at, updated_at } = findResult[0]
        const { name, role } = findResult[0].User
        const result = {
            user: {
                name: name,
                role: role
            },
            coach: {
                id: id,
                user_id: user_id,
                experience_years: experience_years,
                description: description,
                profile_image_url: profile_image_url,
                created_at: created_at,
                updated_at: updated_at
            }
        }
        responseSend(res, 200, result)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

module.exports = router