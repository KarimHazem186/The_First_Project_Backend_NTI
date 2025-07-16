class AppError extends Error {
    constructor() {
        super();
    }
    create(message,statusCode,statusText,errors=[],meta = {}) {
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errors = errors;
        this.statusText = statusText;
        
        return this;
    }
}

module.exports = new AppError();
