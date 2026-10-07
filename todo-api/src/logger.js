 const fs = require("fs");
 const path = require("path");


 //log file path
    const logFilePath = path.join(__dirname, "../logs/app.log");

if(!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

 function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        context,
    };

    //write to file
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");


    //also print to console( for development purposes)
    if (process.env.NODE_ENV !== "production") {
        console.log(`[${level}] ${message}`, context);
    }
}

module.exports = {
    info: (message, context) => log("info", message, context),
    error: (message, context) => log("error", message, context),
    warn: (message, context) => log("warn", message, context),
    debug: (message, context) => log("debug", message, context),

};