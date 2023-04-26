import {dataDef, ideanGallery} from './dataDef';

const {gql} = require('@apollo/client');

// Profile create
const createUser = gql`
    mutation AddUser(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $email: String
        $firstName: String
        $lastName: String
        $gender: String
        $dob: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $lifeMotto: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $personalBlog: String
        $interestsIndustry: [String]
        $ethnicCommunity: [String]
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $stateShort: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $referralCode: String
    ) {
        profileCreate(
            uid: $uid
            referralCode: $referralCode
            data: {
                uid: $uid
                gid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    gender: $gender
                    dob: $dob
                    phoneNumber: $phoneNumber
                    lifeMotto: $lifeMotto
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    personalBlog: $personalBlog
                    interestsIndustry: $interestsIndustry
                    ethnicCommunity: $ethnicCommunity
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            gid
            status
            referralCode
            userType
            loginMethod
            displayName
            profileImage
            profileImageB64
            email
            createdOn
            notificationStatus
            clipCount
            intro
            followingCount
            followStatus
            followersCount
            keywords
            titleCount {
                total
                details {
                    id
                    name
                    count
                    iconFile
                    iconB64
                }
            }
            userProfile {
                firstName
                lastName
                gender
                dob
                phoneNumber {
                    phNumber
                    countryCode
                    phoneCode
                }
                lifeMotto
                fbLink
                twitterLink
                linkedInLink
                youtubeLink
                personalBlog
                interestsIndustry
                ethnicCommunity
                location
                address
                country
                countryCode
                state
                stateShort
                suburb
                streetNo
                postCode
                questionnaire {
                    id
                    answer
                    answeredDate
                }
                isActive
                isBlocked
                updatedOn
            }
        }
    }
`;

const createBusiness = gql`
    mutation AddBusiness(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $orgName: String
        $email: String
        $firstName: String
        $lastName: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $orgMobile: PhoneStrctInput
        $slogan: String
        $ABN: String
        $industryList: [String]
        $ethnicCommunity: [String]
        $businessChannel: [String]
        $businessChannelOther: String
        $websiteURL: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $stateShort: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $placeId: String
        $placesName: String
        $latitude: String
        $longitude: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $referralCode: String
    ) {
        profileCreate(
            uid: $uid
            referralCode: $referralCode
            data: {
                uid: $uid
                gid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                orgName: $orgName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    phoneNumber: $phoneNumber
                    orgMobile: $orgMobile
                    slogan: $slogan
                    ABN: $ABN
                    industryList: $industryList
                    ethnicCommunity: $ethnicCommunity
                    businessChannel: $businessChannel
                    businessChannelOther: $businessChannelOther
                    websiteURL: $websiteURL
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    placeId: $placeId
                    placesName: $placesName
                    latitude: $latitude
                    longitude: $longitude
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            gid
            status
            referralCode
            userType
            loginMethod
            displayName
            orgName
            profileImage
            profileImageB64
            email
            createdOn
            notificationStatus
            clipCount
            intro
            followingCount
            followStatus
            followersCount
            titleCount {
                total
                details {
                    id
                    name
                    count
                    iconFile
                    iconB64
                }
            }
            userProfile {
                firstName
                lastName
                phoneNumber {
                    phNumber
                    countryCode
                    phoneCode
                }
                orgMobile {
                    phNumber
                    countryCode
                    phoneCode
                }
                slogan
                ABN
                industryList
                ethnicCommunity
                businessChannel
                businessChannelOther
                websiteURL
                fbLink
                twitterLink
                linkedInLink
                youtubeLink
                location
                address
                country
                countryCode
                state
                stateShort
                suburb
                streetNo
                postCode
                placeId
                placesName
                latitude
                longitude
                questionnaire {
                    id
                    answer
                    answeredDate
                }
                isActive
                isBlocked
                updatedOn
            }
        }
    }
`;

const createTemp = gql`
    mutation AddTemp(
        $cuid:String!
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $orgName: String
        $email: String
        $firstName: String
        $lastName: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $orgMobile: PhoneStrctInput
        $slogan: String
        $ABN: String
        $industryList: [String]
        $ethnicCommunity: [String]
        $businessChannel: [String]
        $businessChannelOther: String
        $websiteURL: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $stateShort: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $placeId: String
        $placesName: String
        $latitude: String
        $longitude: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $referralCode: String
    ) {
        tempCreate(
            cuid:$cuid
            uid: $uid
            referralCode: $referralCode
            data: {
                uid: $uid
                gid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                orgName: $orgName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    phoneNumber: $phoneNumber
                    orgMobile: $orgMobile
                    slogan: $slogan
                    ABN: $ABN
                    industryList: $industryList
                    ethnicCommunity: $ethnicCommunity
                    businessChannel: $businessChannel
                    businessChannelOther: $businessChannelOther
                    websiteURL: $websiteURL
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    placeId: $placeId
                    placesName: $placesName
                    latitude: $latitude
                    longitude: $longitude
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            status
            referralCode
            userType
            loginMethod
            displayName
            orgName
            profileImage
            profileImageB64
            email
            createdOn
            notificationStatus
            clipCount
            intro
            followingCount
            followStatus
            followersCount
            titleCount {
                total
                details {
                    id
                    name
                    count
                    iconFile
                    iconB64
                }
            }
            userProfile {
                firstName
                lastName
                phoneNumber {
                    phNumber
                    countryCode
                    phoneCode
                }
                orgMobile {
                    phNumber
                    countryCode
                    phoneCode
                }
                slogan
                ABN
                industryList
                ethnicCommunity
                businessChannel
                businessChannelOther
                websiteURL
                fbLink
                twitterLink
                linkedInLink
                youtubeLink
                location
                address
                country
                countryCode
                state
                stateShort
                suburb
                streetNo
                postCode
                placeId
                placesName
                latitude
                longitude
                questionnaire {
                    id
                    answer
                    answeredDate
                }
                isActive
                isBlocked
                updatedOn
            }
        }
    }
`;
const createCharity = gql`
    mutation AddCharity(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $orgName: String
        $email: String
        $firstName: String
        $lastName: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $orgMobile: PhoneStrctInput
        $slogan: String
        $ACN: String
        $activityList: [String]
        $ethnicCommunity: [String]
        $websiteURL: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $stateShort: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $placeId: String
        $placesName: String
        $latitude: String
        $longitude: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $referralCode: String
    ) {
        profileCreate(
            uid: $uid
            referralCode: $referralCode
            data: {
                uid: $uid
                gid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                orgName: $orgName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    phoneNumber: $phoneNumber
                    orgMobile: $orgMobile
                    slogan: $slogan
                    ACN: $ACN
                    activityList: $activityList
                     ethnicCommunity: $ethnicCommunity
                     websiteURL: $websiteURL
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    placeId: $placeId
                    placesName: $placesName
                    latitude: $latitude
                    longitude: $longitude
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            gid
            status
            referralCode
            userType
            loginMethod
            displayName
            orgName
            profileImage
            profileImageB64
            email
            createdOn
            notificationStatus
            clipCount
            intro
            followingCount
            followStatus
            followersCount
            titleCount {
                total
                details {
                    id
                    name
                    count
                    iconFile
                    iconB64
                }
            }
            userProfile {
                firstName
                lastName
                phoneNumber {
                    phNumber
                    countryCode
                    phoneCode
                }
                orgMobile {
                    phNumber
                    countryCode
                    phoneCode
                }
                slogan
                ACN
                activityList
                ethnicCommunity
                websiteURL
                fbLink
                twitterLink
                linkedInLink
                youtubeLink
                location
                address
                country
                countryCode
                state
                stateShort
                suburb
                streetNo
                postCode
                placeId
                placesName
                latitude
                longitude
                questionnaire {
                    id
                    answer
                    answeredDate
                }
                isActive
                isBlocked
                updatedOn
            }
        }
    }
`;

// Profile updates
const updateUser = gql`
    mutation EditUser(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $email: String
        $firstName: String
        $lastName: String
        $gender: String
        $dob: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $lifeMotto: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $personalBlog: String
        $interestsIndustry: [String]
        $ethnicCommunity: [String]
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $stateShort: String
    ) {
        profile(
            uid: $uid
            data: {
                uid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    gender: $gender
                    dob: $dob
                    phoneNumber: $phoneNumber
                    lifeMotto: $lifeMotto
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    personalBlog: $personalBlog
                    interestsIndustry: $interestsIndustry
                    ethnicCommunity: $ethnicCommunity
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            gid
        }
    }
`;
const updateBusiness = gql`
    mutation AddBusiness(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $orgName: String
        $email: String
        $firstName: String
        $lastName: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $orgMobile: PhoneStrctInput
        $slogan: String
        $ABN: String
        $industryList: [String]
        $ethnicCommunity: [String]
        $businessChannel: [String]
        $businessChannelOther: String
        $websiteURL: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $placeId: String
        $placesName: String
        $latitude: String
        $longitude: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
        $stateShort: String
    ) {
        profile(
            uid: $uid
            data: {
                uid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                orgName: $orgName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    phoneNumber: $phoneNumber
                    orgMobile: $orgMobile
                    slogan: $slogan
                    ABN: $ABN
                    industryList: $industryList
                    ethnicCommunity: $ethnicCommunity
                    businessChannel: $businessChannel
                    businessChannelOther: $businessChannelOther
                    websiteURL: $websiteURL
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    placeId: $placeId
                    placesName: $placesName
                    latitude: $latitude
                    longitude: $longitude
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
            gid
        }
    }
`;
const updateCharity = gql`
    mutation EditCharity(
        $uid: String!
        $userType: String
        $loginMethod: loginMethods
        $displayName: String
        $orgName: String
        $email: String
        $firstName: String
        $lastName: String
        $profileImage: String
        $profileImageB64: String
        $phoneNumber: PhoneStrctInput
        $orgMobile: PhoneStrctInput
        $slogan: String
        $ACN: String
        $activityList: [String]
        $ethnicCommunity: [String]
        $websiteURL: String
        $fbLink: String
        $twitterLink: String
        $linkedInLink: String
        $youtubeLink: String
        $location: String
        $address: String
        $country: String
        $countryCode: String
        $state: String
        $stateShort: String
        $suburb: String
        $streetNo: String
        $postCode: String
        $placeId: String
        $placesName: String
        $latitude: String
        $longitude: String
        $questionnaire: [InputQuestionnaire]
        $isActive: Boolean
        $isBlocked: Boolean
    ) {
        profile(
            uid: $uid
            data: {
                uid: $uid
                userType: $userType
                loginMethod: $loginMethod
                displayName: $displayName
                orgName: $orgName
                profileImage: $profileImage
                profileImageB64: $profileImageB64
                email: $email
                userProfile: {
                    firstName: $firstName
                    lastName: $lastName
                    phoneNumber: $phoneNumber
                    orgMobile: $orgMobile
                    slogan: $slogan
                    ACN: $ACN
                    activityList: $activityList
                    ethnicCommunity: $ethnicCommunity
                    websiteURL: $websiteURL
                    fbLink: $fbLink
                    twitterLink: $twitterLink
                    linkedInLink: $linkedInLink
                    youtubeLink: $youtubeLink
                    location: $location
                    address: $address
                    country: $country
                    countryCode: $countryCode
                    state: $state
                    stateShort: $stateShort
                    suburb: $suburb
                    streetNo: $streetNo
                    postCode: $postCode
                    placeId: $placeId
                    placesName: $placesName
                    latitude: $latitude
                    longitude: $longitude
                    questionnaire: $questionnaire
                    isActive: $isActive
                    isBlocked: $isBlocked
                }
            }
        ) {
            uid
        }
    }
`;

const updateImage = gql`
    mutation EditImage(
        $uid: String!
        $profileImage: String
        $profileImageB64: String
    ) {
        profile(
            uid: $uid
            data: {profileImage: $profileImage, profileImageB64: $profileImageB64}
        ) {
            uid
        }
    }
`;

const updateKeywords = gql`
    mutation UpdateKeywords($uid: String!, $keywords: [String]) {
        addKeywords(uid: $uid, keywords: $keywords)
    }
`;
const removeKeywords = gql`
    mutation DeleteKeywords($uid: String!, $keywords: [String]) {
        removeKeywords(uid: $uid, keywords: $keywords)
    }
`;

const updateIntro = gql`
    mutation EditImage($uid: String!, $intro: String) {
        profile(uid: $uid, data: {intro: $intro}) {
            uid
        }
    }
`;

const following = gql`
    mutation following($profileId: String, $data: FollowerDetails) {
        followerCreate(profileId: $profileId, data: $data) {
            followStatus
        }
    }
`;

const unfollow = gql`
    mutation unfollow($userId: String, $profileId: String) {
        removeFollower(profileId: $profileId, userId: $userId) {
            status
        }
    }
`;

const block = gql`
    mutation block($userId: String, $followerId: String, $status: Boolean) {
        blockUnblockFollower(
            userId: $userId
            followerId: $followerId
            status: $status
        ) {
            status
        }
    }
`;

/* ===================== Begin : clip =========================== */
const clipCreate = gql`
    mutation clipCreate(
        $id:String,
        $uid:String,
        $rid:String,
        $text:String,
        $medias:[InputMedia],
        $hashTags:[InputHashtag],
        $isActive:Boolean,
        $isBlocked:Boolean,
        $isDeleted:Boolean,
        $blockedBy:String,
        $deletedBy:String,
        $isPublished:Boolean,
        $parentThread:String
    ) {
        clipCreate(
            id:$id,
            data:{
                id:$id,
                uid:$uid,
                rid:$rid,
                text:$text,
                medias:$medias,
                hashTags:$hashTags,
                isActive:$isActive,
                isBlocked:$isBlocked,
                isDeleted:$isDeleted,
                blockedBy:$blockedBy,
                deletedBy:$deletedBy,
                isPublished:$isPublished,
                parentThread:$parentThread
            }
        ){
            ${dataDef.clip}
        }
    }`;

const editClip = gql`
    mutation editClip(
        $id:String,
        $publish:Boolean,
        $medias:[InputMedia]
    ) {
        clipEdit(
            id:$id,
            publish:$publish
            data:{
                isPublished:$publish,
                medias:$medias
            }
        ){
            ${dataDef.clip}
        }
    }`;

const awesomeBadge = gql`
    mutation editClip($id: String, $awesomeBadge: String) {
        clipEdit(id: $id, data: {badgeAdded: $awesomeBadge}) {
            badgeAdded
        }
    }
`;

const reaction = gql`
    mutation reaction(
        $uid: String
        $ownerId: String
        $clipId: String
        $type: String
        $isActive: Boolean
    ) {
        reaction(
            data: {uid: $uid, ownerId: $ownerId, clipId: $clipId, type: $type, isActive: $isActive}
        ) {
            id
            uid
            clipId
            type
        }
    }
`;

const clipBlock = gql`
    mutation clipBlock(
        $uid: String
        $clipId: String
        $isBlocked: Boolean
        $isDeleted: Boolean
    ) {
        clipBlock(
            uId: $uid
            clipId: $clipId
            isBlocked: $isBlocked
            isDeleted: $isDeleted
        ) {
            id
            uid
            isBlocked
            isDeleted
        }
    }
`;

const clipUserBlock = gql`
    mutation clipUserBlock(
        $uid: String
        $orgId: String
        $clipId: String
        $reason: String
    ) {
        clipUserBlock(uId: $uid, clipId: $clipId, orgId: $orgId, reason: $reason) {
            isBlocked
        }
    }
`;

const reportClip = gql`
    mutation reportClip($data: InputReporting) {
        reportClip(data: $data)
    }
`;
const reportClipCancel = gql`
    mutation reportClipCancel($data: InputReporting) {
        reportClipCancel(data: $data)
    }
`;

/* ===================== End : clip =========================== */

/* ===================== Begin : Announcement =========================== */

const anClipCreate = gql`
    mutation anClipCreate(
        $id:String,
        $uid:String,
        $rid:String,
        $text:String,
        $medias:[InputMedia],
        $hashTags:[InputHashtag],
        $isActive:Boolean,
        $isBlocked:Boolean,
        $isDeleted:Boolean,
        $blockedBy:String,
        $deletedBy:String,
        $isPublished:Boolean,
        $parentThread:String,
        $clipContentType:String,
        $pollData:InputPollData,
    ) {
        anClipCreate(
            id:$id,
            data:{
                id:$id,
                uid:$uid,
                rid:$rid,
                text:$text,
                medias:$medias,
                hashTags:$hashTags,
                isActive:$isActive,
                isBlocked:$isBlocked,
                isDeleted:$isDeleted,
                blockedBy:$blockedBy,
                deletedBy:$deletedBy,
                isPublished:$isPublished,
                parentThread:$parentThread,
                clipContentType:$clipContentType,
                pollData:$pollData
            }
        ){
            ${dataDef.clip}
        }
    }`;

const anClipEdit = gql`
    mutation anClipEdit(
        $id:String,
        $publish:Boolean,
        $medias:[InputMedia]
    ) {
        anClipEdit(
            id:$id,
            publish:$publish
            data:{
                isPublished:$publish,
                medias:$medias
            }
        ){
            ${dataDef.clip}
        }
    }`;

const anAwesomeBadge = gql`
    mutation anClipEdit($id: String, $awesomeBadge: String) {
        anClipEdit(id: $id, data: {badgeAdded: $awesomeBadge}) {
            badgeAdded
        }
    }
`;

const anReaction = gql`
    mutation anReaction(
        $uid: String
        $ownerId: String
        $clipId: String
        $type: String
        $isActive: Boolean
    ) {
        anReaction(
            data: {uid: $uid,ownerId: $ownerId, clipId: $clipId, type: $type, isActive: $isActive}
        ) {
            id
            uid
            clipId
            type
        }
    }
`;

const anClipBlock = gql`
    mutation anClipBlock(
        $uid: String
        $clipId: String
        $isBlocked: Boolean
        $isDeleted: Boolean
    ) {
        anClipBlock(
            uId: $uid
            clipId: $clipId
            isBlocked: $isBlocked
            isDeleted: $isDeleted
        ) {
            id
            uid
            isBlocked
            isDeleted
        }
    }
`;

const anClipUserBlock = gql`
    mutation anClipUserBlock(
        $uid: String
        $orgId: String
        $clipId: String
        $reason: String
    ) {
        anClipUserBlock(
            uId: $uid
            clipId: $clipId
            orgId: $orgId
            reason: $reason
        ) {
            isBlocked
        }
    }
`;

const anReportClip = gql`
    mutation anReportClip($data: InputReporting) {
        anReportClip(data: $data)
    }
`;
const reportUGC = gql`
    mutation createReport($data: InputReport, $type: clipType) {
        createReport(data: $data, type: $type)
    }
`;
const reportUser = gql`
mutation createUserReport($data: InputUserReport) {
    createUserReport(data: $data)
}
`;
const userBlocking = gql`
mutation userBlocking($profileId: String, $uId:String) {
    userBlocking(profileId: $profileId,uId:$uId)
}
`;

const anReportClipCancel = gql`
    mutation anReportClipCancel($data: InputReporting) {
        anReportClipCancel(data: $data)
    }
`;

/* ===================== End : Announcement =========================== */

const notificationSubscribe = gql`
    mutation notificationSubscribe(
        $organisationId: String
        $notificationStatus: Boolean
        $userId: String
    ) {
        notificationStatusUpdate(
            profileId: $organisationId
            userId: $userId
            notificationStatus: $notificationStatus
        ) {
            userId
            status
        }
    }
`;

const addToken = gql`
    mutation addToken($userId: String, $data: deviceToken) {
        addToken(userId: $userId, data: $data) {
            deviceId
        }
    }
`;

const deleteToken = gql`
    mutation deleteToken($userId: String, $deviceId: String) {
        deleteToken(userId: $userId, deviceId: $deviceId) {
            status
        }
    }
`;

const notificationRead = gql`
    mutation updateReadStatus(
        $userId: String
        $notificationId: String
        $readStatus: Boolean
    ) {
        notificationReadStatus(
            userId: $userId
            notificationId: $notificationId
            readStatus: $readStatus
        ) {
            status
            userId
        }
    }
`;
const lovitzNotificationRead = gql`
    mutation updateReadStatus(
        $userId: String
        $notificationId: String
        $readStatus: Boolean
    ) {
        notificationReadStatus(
            userId: $userId
            notificationId: $notificationId
            readStatus: $readStatus
            lovitz: true
        ) {
            status
            userId
        }
    }
`;
const addTitle = gql`
    mutation assignTitle(
        $uid: String
        $titleId: String
        $profileId: String
        $clipId: String
        $clipType: String
    ) {
        assignTitle(
            uid: $uid
            titleId: $titleId
            profileId: $profileId
            clipId: $clipId
            clipType: $clipType
        ) {
            title {
                createdOn
                icon
                iconFile
                iconB64
                id
                name
            }
            profileId
            clipId
            uid
            titleId
            clipType
        }
    }
`;

const removeTitle = gql`
    mutation unAssignTitle(
        $uid: String
        $titleId: String
        $profileId: String
        $clipId: String
    ) {
        unAssignTitle(
            uid: $uid
            titleId: $titleId
            clipId: $clipId
            profileId: $profileId
        )
    }
`;

const initiateChat = gql`
    mutation initiateChat($from:String, $to:String){
        initiateChat(from:$from, to:$to){
            id
            from
            to
            isBlocked
            blockedBy
            createdOn
            ${dataDef.userDetails}
        }
    }`;

const blockChangeChat = gql`
    mutation blockChangeChat($id: String, $uId: String, $status: Boolean) {
        blockChangeChat(id: $id, uId: $uId, status: $status) {
            id
            from
            to
            isBlocked
            blockedBy
            createdOn
            userDetails {
                displayName
                uid
                profileImage
            }
        }
    }
`;

const createPersonalClip = gql`
    mutation personalClipCreate(
        $id: String
        $uid: String
        $mediafile: String
        $mediaType: String
        $text: String
        $duration: String
        $type: personalClipTypes
        $isDeleted: Boolean
        $isPublished: Boolean
        $isPrivate: Boolean
        $isMultiple: Boolean
        $mediaCount:Int
        $mediaFiles:[mediaFileInput]
    ) {
        personalClipCreate(
            id: $id
            data: {
                uid: $uid
                mediafile: $mediafile
                mediaType: $mediaType
                text: $text
                isDeleted: $isDeleted
                isPublished:$isPublished
                isPrivate: $isPrivate
                isMultiple:$isMultiple
                mediaCount:$mediaCount
                mediaFiles:$mediaFiles
            }
            type: $type
            duration: $duration
        ) {
            ${ideanGallery}
        }
    }
`;

const editPersonalClip = gql`
    mutation personalClipCreate(
        $id: String
        $uid: String
        $mediafile: String
        $mediaType: String
        $text: String
        $isDeleted: Boolean
        $isPublished: Boolean
        $isPrivate: Boolean
        $isMultiple: Boolean
        $mediaCount:Int
        $mediaFiles:[mediaFileInput]
    ) {
        personalClipEdit(
            id: $id
            data: {
                uid: $uid
                mediafile: $mediafile
                mediaType: $mediaType
                text: $text
                isDeleted: $isDeleted
                isPublished:$isPublished
                isPrivate: $isPrivate
                isMultiple:$isMultiple
                mediaCount:$mediaCount
                mediaFiles:$mediaFiles
            }
        ) {
            ${ideanGallery}
        }
    }
`;
const editPersonalClipText = gql`
    mutation personalClipEditText(
        $id: String
        $uid: String
        $text: String
    ) {
        personalClipEditText(
            id: $id
            uid: $uid
            text: $text
        ) {
            id
        }
    }
`;


const deletePersonalClip = gql`
    mutation personalClipDelete($id: String, $uid: String, $isDeleted: Boolean) {
        personalClipEdit(id: $id, data: {uid: $uid, isDeleted: $isDeleted}) {
            id
        }
    }
`;
const changeMyDiaryMode = gql`
    mutation changeMode($id: String,$isPrivate:Boolean, $uid: String, $type: personalClipTypes) {
        changeMode(id: $id, data: {uid: $uid,isPrivate: $isPrivate}, type: $type) {
            id
        }
    }
`;
const hidePersonalClip = gql`
    mutation personalClipHide($id: String, $data: inputHidePersonalClip) {
        hidePersonalClip(uId: $id, data: $data)
    }
`;

const personalClipLike = gql`
    mutation personalClipLoveit(
        $id: String
        $uId: String
        $profileId: String
        $isLoved: Boolean
    ) {
        personalClipLoveit(
            id: $id
            uId: $uId
            profileId: $profileId
            isLoved: $isLoved
        )
    }
`;

const saveCollabSettings = gql`
    mutation collabIdeanSettings($collabSettings: collabIdeanGalleryInput) {
        collabIdeanSettings(collabSettings: $collabSettings)
    }
`;
const login = gql`
    mutation login($uid: String) {
        login(uid: $uid)
    }
`;
const requestArchival = gql`
    mutation requestArchival($userId: String,$reason:String) {
        requestArchival(userId: $userId,reason: $reason)
    }
`;

const updatePollCount = gql`
    mutation updatePollCount(
        $spaceId: String,
        $pollId: String,
        $userId: String,
        $option: options,
    ) {
        updatePollCount(data:{
            spaceId :$spaceId,
            pollId: $pollId,
            userId:$userId,
            option:$option,
        }){
            option1
            option2
            option3
            answered
        }
    }
`;


const mutations = {
    createUser,
    createBusiness,
    createTemp,
    createCharity,
    updateUser,
    updateBusiness,
    updateCharity,
    updateImage,
    updateKeywords,
    removeKeywords,
    updateIntro,
    following,
    addToken,
    deleteToken,
    notificationSubscribe,
    unfollow,
    notificationRead,
    lovitzNotificationRead,
    addTitle,
    removeTitle,
    initiateChat,
    blockChangeChat,
    createPersonalClip,
    editPersonalClip,
    editPersonalClipText,
    deletePersonalClip,
    changeMyDiaryMode,
    hidePersonalClip,
    personalClipLike,
    //clip
    clipCreate,
    editClip,
    reaction,
    clipBlock,
    clipUserBlock,
    reportClip,
    reportClipCancel,
    awesomeBadge,
    //an clip
    anClipCreate,
    anClipEdit,
    anReaction,
    anClipBlock,
    anClipUserBlock,
    anReportClip,
    anReportClipCancel,
    anAwesomeBadge,
    block,
    saveCollabSettings,
    reportUGC,
    reportUser,
    userBlocking,
    login,
    requestArchival,
    updatePollCount
};

export {mutations};
