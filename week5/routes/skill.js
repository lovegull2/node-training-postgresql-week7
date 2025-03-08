const express = require('express')
const router = express.Router()
const skill = require('../controllers/skill')

router.get('/', skill.getAll)

router.post('/', skill.addOne)

router.delete('/:skillId', skill.deleteOne)

module.exports = router