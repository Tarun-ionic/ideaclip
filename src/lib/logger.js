/**
 * custom logger
 * @type {boolean}
 */

const showLog = true;
const showResp = false   ;
const logger = {
    l: (message, ...optionalParams) => {
        if (showLog) {
            console.log(message, ...optionalParams);
        }
    },
    i: (message, ...optionalParams) => {
        if (showLog) {
            console.info(message, ...optionalParams);
        }
    },
    w: (message, ...optionalParams) => {
        if (showLog) {
            console.warn(message, ...optionalParams);
        }
    },
    d: (message, ...optionalParams) => {
        if (showLog) {
            console.debug(message, ...optionalParams);
        }
    },
    e: (message, ...optionalParams) => {
        if (showLog) {
            console.error(message, ...optionalParams);
        }
    },
    r: (message, ...optionalParams) => {
        if (showResp) {
            console.debug(message, ...optionalParams);
        }
    },
};

export default logger;
