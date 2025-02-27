const express = require('express')
const { IsNull } = require('typeorm')
const { dbEntityNameCourse } = require('../entities/Course')
const { dbEntityNameUser } = require('../entities/User')
const { dbEntityNameCreditPurchase } = require('../entities/CreditPurchase')
const { dbEntityNameCourseBooking } = require('../entities/CourseBooking')
const { isNotValidUuid } = require('../utils/validation')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')(dbEntityNameCourse)
const responseSend = require('../utils/serverResponse')
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(dbEntityNameUser),
    logger
})

/** 取得課程列表 */
router.get('/', async (req, res, next) => {
    try {
        const courses = await dataSource.getRepository(dbEntityNameCourse).find({
            select: {
                id: true,
                name: true,
                description: true,
                start_at: true,
                end_at: true,
                max_participants: true,
                User: {
                    name: true
                },
                Skill: {
                    name: true
                }
            },
            relations: {
                User: true,
                Skill: true
            }
        })

        responseSend(res, 200, courses.map((course) => {
            return {
                id: course.id,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants,
                coach_name: course.User.name,
                skill_name: course.Skill.name
            }
        }))
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

/** 報名課程 */
router.post('/:courseId', auth, async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params
        if (isNotValidUuid(courseId)) {
            responseSend(res, 400, 'ID錯誤', logger)
            return
        }
        const courseRepo = dataSource.getRepository(dbEntityNameCourse)
        const course = await courseRepo.findOne({
            where: { id: courseId }
        })
        if (!course) {
            responseSend(res, 400, '課程不存在', logger)
            return
        }
        const creditPurchaseRepo = dataSource.getRepository(dbEntityNameCreditPurchase)
        const courseBookingRepo = dataSource.getRepository(dbEntityNameCourseBooking)
        const userCourseBooking = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        if (userCourseBooking) {
            responseSend(res, 400, '已經報名過此課程', logger)
            return
        }
        const userCredit = await creditPurchaseRepo.sum('purchased_credits', {
            user_id: id
        })
        const userUsedCredit = await courseBookingRepo.count({
            where: {
                user_id: id,
                cancelledAt: IsNull()
            }
        })
        const courseBookingCount = await courseBookingRepo.count({
            where: {
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        if (userUsedCredit >= userCredit) {
            responseSend(res, 400, '已無可使用堂數', logger)
            return
        } else if (courseBookingCount >= course.max_participants) {
            responseSend(res, 400, '已達最大參加人數，無法參加', logger)
            return
        }
        const newCourseBooking = await courseBookingRepo.create({
            user_id: id,
            course_id: courseId
        })
        await courseBookingRepo.save(newCourseBooking)
        responseSend(res, 201)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

router.delete('/:courseId', auth, async (req, res, next) => {
    try {
        const { id } = req.user
        const { courseId } = req.params
        if (isNotValidUuid(courseId)) {
            responseSend(res, 400, 'ID錯誤', logger)
            return
        }
        const courseBookingRepo = dataSource.getRepository(dbEntityNameCourseBooking)
        const userCourseBooking = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId,
                cancelledAt: IsNull()
            }
        })
        if (!userCourseBooking) {
            responseSend(res, 400, '課程不存在', logger)
            return
        }
        const updateResult = await courseBookingRepo.update(
            {
                user_id: id,
                course_id: courseId,
                cancelledAt: IsNull()
            },
            {
                cancelledAt: new Date().toISOString()
            }
        )
        if (updateResult.affected === 0) {
            responseSend(res, 400, '取消失敗', logger)
            return
        }

        responseSend(res, 200)
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

module.exports = router