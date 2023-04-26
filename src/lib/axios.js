import axios from 'axios';
import apiConstant from '../constant/apiConstant';
import {Platform} from 'react-native';
import logger from './logger';
// noinspection NpmUsedModulesInstalled
import {API_BASE_PATH} from '@env';

const url_sendAccessCode = `${API_BASE_PATH}accessCode/send`;
const url_verifyAccessCode = `${API_BASE_PATH}accessCode/verify`;
const url_checkePhoneNumber = `${API_BASE_PATH}phonenoverification/checkephonenumber`;
const url_checkEmail = `${API_BASE_PATH}emailverification/checkemail`;
const url_sendOtp = `${API_BASE_PATH}sms/send`;
const url_verifyOtp = `${API_BASE_PATH}sms/verify`;

function sendAccessCode(email) {
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_sendAccessCode,
                {
                    email: email,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'sendAccessCode', error);
                reject(error.response);
            });
    });
}

function verifyAccessCode(email, accessCode) {
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_verifyAccessCode,
                {
                    email: email,
                    accessCode: accessCode,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'verifyAccessCode', error);
                reject(error.response.status);
            });
    });
}

function checkPhoneNumber(phone) {
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_checkePhoneNumber,
                {
                    phoneNumber: phone,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'checkPhoneNumber', error);
                reject(error.response.data);
            });
    });
}

function checkUserEmail(email) {
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_checkEmail,
                {
                    email: email,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'checkingemail', error);
                // reject(error);
            });
    });
}

function sendPhoneOtp(phone, hash) {
    console.log("url : ",url_sendOtp)
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_sendOtp,
                {
                    number: phone,
                    hash: hash,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'sendOtp', error);
                reject(error.response);
            });
    });
}

function verifyPhoneOtp(phone, otp) {
    return new Promise((resolve, reject) => {
        axios
            .post(
                url_verifyOtp,
                {
                    number: phone,
                    accessCode: otp,
                },
                {
                    headers:
                        Platform.OS === 'ios'
                            ? apiConstant.iosHeader
                            : apiConstant.androidHeader,
                },
            )
            .then(function (response) {
                resolve(response.status);
            })
            .catch(function (error) {
                logger.e('axios', 'verifyOtp', error);
                reject(error.response);
            });
    });
}

export {
    sendAccessCode,
    verifyAccessCode,
    checkPhoneNumber,
    checkUserEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
};
