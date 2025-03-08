const express = require('express')
const coaches = require('../controllers/coaches')
const router = express.Router()

router.get('/', coaches.getCoaches)

router.get('/:coachId', coaches.getCoachDetail)

// router.get('/:coachId/courses', coaches.getCoachCourses)

module.exports = router