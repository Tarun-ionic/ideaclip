const successMessages = {
    send: 'An access code send successfully.',
    verify: 'Email verified successfully.',
};
const errorMessages = {
    send: 'Invalid email id.',
    verify: 'Invalid access code.',
};
const failureMessages = {
    send: 'Failed to send email.',
    verify: 'Access code has expired.',
};
const statusSuccess = 200;
const statusError = 400;
const statusFailure = 500;

const appToken = 'idea-clip-x-app-token';
const appType = 'idea-clip-x-app-type';

const androidHeader = {
    [appToken]:
        'cAwQkbukR8r8XTjtnrhLFyN6nskAFNKue79aTtkmsAkZjehgfbDLkguyjDJP4jTT',
    [appType]: 'android',
};
const iosHeader = {
    [appToken]:
        'ZKTne6EP4hUZ3Uhqx7LkXTLKeA34EA2vbKGfscGkksWYXQdkMPfnyRWq4Phye9S2',
    [appType]: 'ios',
};

const statusCodes = {
    success: statusSuccess,
    error: statusError,
    failure: statusFailure,
};
const sendMessages = {
    success: successMessages.send,
    error: errorMessages.send,
    failure: failureMessages.send,
};
const verifyMessages = {
    success: successMessages.verify,
    error: errorMessages.verify,
    failure: failureMessages.verify,
};

const spaceTypes = {
    coSpace: 'coSpace',
    anCoSpace: 'anCoSpace',
    ideanGallery: 'ideanGallery',
};
const userStatus = {
    Active: 'Active',
    Disabled: 'Disabled',
    Archived: 'Archived',
};

const apiConstant = {
    statusCodes,
    sendMessages,
    verifyMessages,
    iosHeader,
    androidHeader,
    appToken,
    appType,
    spaceTypes,
    userStatus,
};
export default apiConstant;
