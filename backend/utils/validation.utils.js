const Joi = require("@hapi/joi");

class ValidationUtils {
    static signupValidation(data) {
        const schema = Joi.object({
            name: Joi.string().min(3).required(),
            lastName: Joi.string().min(3).required(),
            email: Joi.string().min(6).required().email().required(),
            password: Joi.string().min(6).required(),
            passwordRepeat: Joi.any().equal(Joi.ref('password'))
                .required()
                .messages({ 'any.only': '{{#label}} does not match' }),
        });
        return schema.validate(data, { abortEarly: false });
    }

    static loginValidation(data) {
        const schema = Joi.object({ //проверяет email, password и rememberMe
            email: Joi.string().min(6).required().email(), //должна быть строка
            password: Joi.string().min(6).required(), //должна быть строка
            rememberMe: Joi.boolean().default(false), //должен быть boolean
        });
        return schema.validate(data, { abortEarly: false});
    }

    static refreshTokenValidation(data) {
        const schema = Joi.object({
            refreshToken: Joi.string().required(),
            rememberMe: Joi.boolean().default(false),
        });
        return schema.validate(data, { abortEarly: false});
    }

    static logoutValidation(data) {
        const schema = Joi.object({
            refreshToken: Joi.string().required(),
        });
        return schema.validate(data, { abortEarly: false});
    }
}

module.exports = ValidationUtils;