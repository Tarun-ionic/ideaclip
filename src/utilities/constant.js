const socialURLs = {
    facebook: 'https://www.facebook.com/',
    linkedIn: 'https://www.linkedin.com/',
    twitter: 'https://twitter.com/',
    youtube: 'https://www.youtube.com/',
};
const pageTypes = {
    chat: 'chat',
    coSpace: 'clip',
    news_asks: 'anClip',
    profile: 'profile',
};
const userData = {
    uid: '',
    userType: 'g-user',
    loginMethod: 'email',
    displayName: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    profileImage: '',
    profileImageB64: '',
    phoneNumber: {
        phNumber: '',
        countryCode: 'AU',
        phoneCode: '+61',
    },
    lifeMotto: '',
    fbLink: 'https://www.facebook.com/',
    twitterLink: 'https://twitter.com/',
    linkedInLink: 'https://www.linkedin.com/',
    youtubeLink: 'https://www.youtube.com/',
    personalBlog: '',
    interestsIndustry: [],
    ethnicCommunity: [],
    location: '',
    address: '',
    country: 'Australia',
    countryCode: 'AU',
    state: '',
    suburb: '',
    streetNo: '',
    postCode: '',
    questionnaire: [],
    isActive: true,
    isBlocked: false,
    updatedOn: '',
    referralCode: '',
    status: 'Active',
};

const businessData = {
    uid: '',
    userType: 'b-user',
    loginMethod: 'email',
    displayName: '',
    orgName: '',
    email: '',
    profileImage: '',
    profileImageB64: '',

    firstName: '',
    lastName: '',
    phoneNumber: {
        phNumber: '',
        countryCode: 'AU',
        phoneCode: '+61',
    },
    orgMobile: {
        phNumber: '',
        countryCode: 'AU',
        phoneCode: '+61',
    },
    slogan: '',
    ABN: '',
    industryList: [],
    ethnicCommunity: [],
    businessChannel: [],
    businessChannelOther: '',
    websiteURL: '',
    fbLink: 'https://www.facebook.com/',
    twitterLink: 'https://twitter.com/',
    linkedInLink: 'https://www.linkedin.com/',
    youtubeLink: 'https://www.youtube.com/',
    location: '',
    address: '',
    country: 'Australia',
    countryCode: 'AU',
    state: '',
    suburb: '',
    streetNo: '',
    postCode: '',
    placeId: '',
    placesName: '',
    latitude: '',
    longitude: '',
    questionnaire: [],
    isActive: true,
    isBlocked: false,
    updatedOn: '',
    referralCode: '',
    status: 'Active',
};

const charityData = {
    uid: '',
    userType: 'c-user',
    loginMethod: 'email',
    displayName: '',
    orgName: '',
    email: '',
    firstName: '',
    lastName: '',
    profileImage: '',
    profileImageB64: '',
    phoneNumber: {
        phNumber: '',
        countryCode: 'AU',
        phoneCode: '+61',
    },
    orgMobile: {
        phNumber: '',
        countryCode: 'AU',
        phoneCode: '+61',
    },
    slogan: '',
    ACN: '',
    activityList: [],
    ethnicCommunity: [],
    websiteURL: '',
    fbLink: 'https://www.facebook.com/',
    twitterLink: 'https://twitter.com/',
    linkedInLink: 'https://www.linkedin.com/',
    youtubeLink: 'https://www.youtube.com/',
    location: '',
    address: '',
    country: 'Australia',
    countryCode: 'AU',
    state: '',
    suburb: '',
    streetNo: '',
    postCode: '',
    placeId: '',
    placesName: '',
    latitude: '',
    longitude: '',
    questionnaire: [],
    isActive: true,
    isBlocked: false,
    updatedOn: '',
    status: 'Active',
};

const profileData = {
    uid: '',
    userType: 'g-user',
    displayName: '',
    profileImage: '',
    profileImageB64: '',
    motto: '',
    intro: '',
    suburb: '',
    clipCount: '',
    followingCount: 0,
    followStatus: false,
    followersCount: 0,
    titleCount: {
        total: 0,
        details: [],
    },
    keywords: [],
    status: 'Active',
};

const newClip = {
    uid: '',
    bid: '',
    text: '',
    medias: [],
    hashTags: [],
    isActive: true,
    isBlocked: false,
    isDeleted: false,
    blockedBy: '',
    deletedBy: '',
    isPublished: false,
};
const newMedia = {
    mediaPath: '',
    mediaType: '',
};

const followData = {
    organisationId: '',
    uid: '',
    followStatus: false,
    notificationStatus: false,
    organisationName: '',
    username: '',
};
const newProfileData = {
    id: '',
    title: '',
    name: '',
    clipCount: 0,
    titleCount: 0,
    titles: [],
    followerCount: '0',
    followStatus: false,
    notificationStatus: false,
    followingCount: '0',
    dp: '',
};
const dateFilter = {
    from: '',
    to: '',
};

const webURLs = {
    home: 'https://ideaclip.com.au/explainer',
    faq: 'https://ideaclip.com.au/faq',
    contact: 'https://ideaclip.com.au/contact',
    // disabled: 'https://ideaclip-app-dev.web.app/re-enable-account',
    disabled: 'https://ideaclip-app.web.app/re-enable-account',
    adminMail: 'mailto:admin@ideaclip.com.au',
    privacyApp: 'https://ideaclip.com.au/privacy',
    privacyPolicy: 'https://ideaclip.com.au/privacy-policy',
    resourceUrl: "https://ideaclip.com.au/resource",
    terms_condition: 'https://ideaclip.com.au/tc'

};

const loginMethods = {
    facebook: 'facebook',
    email: 'email',
    google: 'google',
    apple: 'apple',
};

const personalClipData = {
    uid: '',
    mediafile: '',
    text: '',
    isDeleted: false,
    isPublished: true,
};

const stringKeys = {
    countryCode: 'AU',
};

export const userType = {
    charity: 'c-user',
    general: 'g-user',
    business: 'b-user',
};
export const userStatus = {
    active: 'Active',
    disabled: 'Disabled',
    archived: 'Archived',
};

export const toggleState = {
    on: 'ON',
    off: 'OFF',
};

export const displayOrientation = {
    portrait: 'portrait',
    landscape: 'landscape',
};

export const clipTypes = {clip: 'clips', announcement: 'anClips'};
export const awesomeTag = {def: 'awesome'};
export const userNameChars = 'abcdefghijklmnopqrstuvwxyz0123456789._@';
export const pcTypes = {
    personalClip: 'personalClip',
    flashDeal: 'flashDeal',
    myDiary: 'myDiary',
    charityEventBoost: 'charityEventBoost',
    businessEventBoost: 'businessEventBoost',
    volunteerNeeded: 'volunteerNeeded',
};
export const clipContentType = {
    poll: 'poll',
    clip: 'clip',
}

export const viewWidth = {
    ideanGallery: 0.70,
    stickers: 0.30
}

export {
    userData,
    businessData,
    charityData,
    newClip,
    newMedia,
    followData,
    newProfileData,
    webURLs,
    dateFilter,
    socialURLs,
    stringKeys,
    loginMethods,
    profileData,
    personalClipData,
    pageTypes
};
