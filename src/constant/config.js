const thumbnail = {
    base64: true,
    format: 'JPEG', //JPEG , PNG
    quality: 50,
    maxWidth: 400,
    maxHeight: 400,
    maxSize: 100000, //for gif
};
const fileSize = {
    chat: 10485760,
    coSpace: 10485760,
    ideanGallery: 10485760,
}
const fileUpload = {
    maxLimit: 10,
};
const textLimit = {
    chat: 500,
    coSpace: 500,
    ideanGallery: 1500,
}
const showMore = {
    chat: 300,
    coSpace: 300,
    ideanGallery: 0
}

const config = {thumbnail, fileUpload, textLimit, fileSize, showMore};
export default config;
