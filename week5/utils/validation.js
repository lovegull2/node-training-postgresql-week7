const { validate } = require('uuid')

const isNotValidString = (value) => {
    return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

const isNotValidInteger = (value) => {
    return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const isNotValidUuid = (value) => {
    return !validate(value)
}

const isNotValidUserName = (value) => {
    const userNamePattern = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,10}$/
    if (!isNotValidString(value))
        return !userNamePattern.test(value)
    else
        return false
}

const isNotValidEmail = (value) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (isNotValidString(value))
        return !emailPattern.test(value)
    else
        return false
}

const isNotValidPassword = (value) => {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    if (isNotValidString(value))
        return !passwordPattern.test(value)
    else
        return false
}

const isNotValidUrl = (value) => {
    return isNotValidString(value) || !value.startsWith('https')
}

module.exports = { 
    isNotValidString,
    isNotValidInteger,
    isNotValidUuid,
    isNotValidPassword,
    isNotValidUserName,
    isNotValidEmail,
    isNotValidUrl,
}