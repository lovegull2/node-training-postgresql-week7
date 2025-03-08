const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const { dbEntityNameUser, userRole } = require('../entities/User')
const { dbEntityNameCoach } = require('../entities/Coach')
const { dbEntityNameCourse } = require('../entities/Course')
const { dbEntityNameSkill } = require('../entities/Skill')
const responseSend = require('../utils/serverResponse')
const { isNotValidUuid, isNotValidString, isNotValidInteger, isNotValidUrl } = require('../utils/validation')

/** 新增教練課程資料 */
async function postCourse(req, res, next) {
    try {
        const {
            user_id: userId, skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
            max_participants: maxParticipants, meeting_url: meetingUrl
        } = req.body

        if (isNotValidUuid(userId) ||
            isNotValidUuid(skillId) ||
            isNotValidString(name) ||
            isNotValidString(description) ||
            isNotValidString(startAt) ||
            isNotValidString(endAt) ||
            isNotValidInteger(maxParticipants) ||
            isNotValidUrl(meetingUrl)) {
            responseSend(res, 400, '欄位未填寫正確', logger)
            return
        }
        const userRepository = dataSource.getRepository(dbEntityNameUser)
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'role'],
            where: { id: userId }
        })
        if (!existingUser) {
            responseSend(res, 400, '使用者不存在', logger)
            return
        } else if (existingUser.role !== userRole.COACH) {
            responseSend(res, 400, '使用者尚未成為教練', logger)
            return
        }

        const skillRepository = dataSource.getRepository(dbEntityNameSkill)
        const existingSkill = await skillRepository.findOne({ where: { id: skillId } })
        if (!existingSkill) {
            responseSend(res, 400, '專長不存在', logger)
            return
        }

        const courseRepo = dataSource.getRepository(dbEntityNameCourse)
        const newCourse = courseRepo.create({
            user_id: userId,
            skill_id: skillId,
            name,
            description,
            start_at: startAt,
            end_at: endAt,
            max_participants: maxParticipants,
            meeting_url: meetingUrl
        })
        const savedCourse = await courseRepo.save(newCourse)
        const course = await courseRepo.findOne({ where: { id: savedCourse.id } })
        responseSend(res, 201, { course })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

/** 編輯教練課程資料 */
async function putCoachCourseDetail(req, res, next) {
    try {
        const { courseId } = req.params
        const { skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
            max_participants: maxParticipants, meeting_url: meetingUrl } = req.body

        if (isNotValidUuid(courseId) ||
            isNotValidUuid(skillId) ||
            isNotValidString(name) ||
            isNotValidString(description) ||
            isNotValidString(startAt) ||
            isNotValidString(endAt) ||
            isNotValidInteger(maxParticipants) ||
            isNotValidUrl(meetingUrl)) {
            responseSend(res, 400, '欄位未填寫正確', logger)
            return
        }
        const courseRepo = dataSource.getRepository(dbEntityNameCourse)
        const existingCourse = await courseRepo.findOne({ where: { id: courseId } })
        if (!existingCourse) {
            responseSend(res, 400, '課程不存在', logger)
            return
        }

        const skillRepository = dataSource.getRepository(dbEntityNameSkill)
        const existingSkill = await skillRepository.findOne({ where: { id: skillId } })
        if (!existingSkill) {
            responseSend(res, 400, '專長不存在', logger)
            return
        }

        const updateCourse = await courseRepo.update(
            { id: courseId },
            {
                skill_id: skillId,
                name,
                description,
                start_at: startAt,
                end_at: endAt,
                max_participants: maxParticipants,
                meeting_url: meetingUrl
            }
        )

        if (updateCourse.affected === 0) {
            responseSend(res, 400, '更新課程失敗', logger)
            return
        }

        const savedCourse = await courseRepo.findOne({ where: { id: courseId } })
        responseSend(res, 200, { savedCourse })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

/** 將使用者新增為教練 */
async function postCoach(req, res, next) {
    try {
        const { userId } = req.params
        const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
        if (isNotValidUuid(userId) || isNotValidInteger(experienceYears) || isNotValidString(description)) {
            responseSend(res, 400, '欄位未填寫正確', logger)
            return
        }
        if (isNotValidUrl(profileImageUrl)) {
            responseSend(res, 400, '大頭貼網址錯誤', logger)
            return
        }
        const userRepository = dataSource.getRepository(dbEntityNameUser)
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'role'],
            where: { id: userId }
        })
        if (!existingUser) {
            responseSend(res, 400, '使用者不存在', logger)
            return
        } else if (existingUser.role === userRole.COACH) {
            responseSend(res, 409, '使用者已經是教練', logger)
            return
        }
        const coachRepo = dataSource.getRepository(dbEntityNameCoach)
        const newCoach = coachRepo.create({
            user_id: userId,
            experience_years: experienceYears,
            description,
            profile_image_url: profileImageUrl
        })
        const updatedUser = await userRepository.update(
            { id: userId, role: userRole.USER },
            { role: userRole.COACH }
        )
        if (updatedUser.affected === 0) {
            responseSend(res, 400, '更新使用者失敗', logger)
            return
        }
        const savedCoach = await coachRepo.save(newCoach)
        const savedUser = await userRepository.findOne({
            select: ['name', 'role'],
            where: { id: userId }
        })
        responseSend(res, 201, {
            user: savedUser,
            coach: savedCoach
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

module.exports = {
    postCourse,
    putCoachCourseDetail,
    postCoach,
}