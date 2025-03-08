const express = require('express')
const { dbEntityNameCourse } = require('../entities/Course')
const { dbEntityNameUser } = require('../entities/User')
const router = express.Router()
const courses = require('../controllers/courses')
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')(dbEntityNameCourse)
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository(dbEntityNameUser),
    logger
})

router.get('/', courses.getAllCourses)
router.post('/:courseId', auth, courses.postCourseBooking)
router.delete('/:courseId', auth, courses.deleteCourseBooking)

module.exports = router