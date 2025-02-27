const responseSend = (res, code, data, logger) => {
    const responseData = { }

    switch (code) {
        case 200:
        case 201:
            responseData.status = 'success'
            break
        case 400:
        case 409:
            responseData.status = 'failed'
            break
        default:
            responseData.status = 'error'
    }

    if (responseData.status === 'success') {
        if (data)
            responseData.data = data
    } else {
        if (logger)
            logger.warn(data)
        responseData.message = data
    }

    res.status(code).json(responseData)
}

module.exports = responseSend