let app;
try {
    app = require('../src/index.js');
} catch (error) {
    app = (req, res) => {
        res.status(500).json({
            error: 'Initialization failed',
            message: error.message,
            stack: error.stack
        });
    };
}

module.exports = app;

