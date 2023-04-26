import {dataDef, ideanGallery} from './dataDef';

const {gql} = require('@apollo/client');

const getUserProfile = gql`
    query userProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
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
            userBlockingStatus
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

const getBusinessProfile = gql`
    query businessProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
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
            userBlockingStatus
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

const getCharityProfile = gql`
    query charityProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
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
            userBlockingStatus
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

const getQuestionnaire = gql`
    query questionerGet($isUser: Boolean!) {
        questioner(isUser: $isUser) {
            questionnaireId
            question
            questionOptions
            isMultiple
            uid
            lastUpdate
            addedDate
            status
            userName
            multipleCount
            isUser
        }
    }
`;

const places = gql`
    query places(
        $keyword: String!
        $location: String!
        $radius: String!
        $type: String!
        $nextPageToken: String
        $userId: String
    ) {
        places(
            keyword: $keyword
            location: $location
            radius: $radius
            type: $type
            nextPageToken: $nextPageToken
            userId: $userId
        ) {
            nextPageToken
            results {
                business_status
                name
                displayName
                userType
                bid
                place_id
                rating
                member_organisation
                logo
                likesCount
                postCount
                followersCount
                slogan
                distance
                address
                suburb
                isFollower
                notificationStatus
            }
        }
    }
`;

const checkTempUser = gql`
    query checkTempUser($placeId: String) {
        checkTempUser(placeId: $placeId) {
            ${dataDef.userExists}
        }
    }
`;

const searchPagination = gql`
    query ResultsGet(
        $keyword: String!
        $location: String!
        $radius: String!
        $type: String!
        $nextPageToken: String
    ) {
        nextPlaces(
            keyword: $keyword
            location: $location
            radius: $radius
            type: $type
            nextPageToken: $nextPageToken
        ) {
            nextPageToken
            results {
                business_status
                name
                bid
                place_id
                rating
                member_organisation
                logo
                likesCount
                postCount
                followersCount
                slogan
                distance
                address
                suburb
                isFollower
                notificationStatus
            }
        }
    }
`;

const getStates = gql`
    query states($countryId: String!) {
        states(countryId: $countryId) {
            id
            countryId
            stateName
            shortName
        }
    }
`;

const getIndustries = gql`
    query industries {
        industries {
            id
            industryName
        }
    }
`;

const getActivities = gql`
    query activities {
        activities {
            id
            activityName
        }
    }
`;

const getEthnicCommunities = gql`
    query ethnicCommunities {
        ethnicCommunities {
            id
            communityName
        }
    }
`;

const nicknameCheck = gql`
    query nicknameCheck($displayName: String!) {
        nameExist(displayName: $displayName) {
            isUsed
        }
    }
`;
const emailCheck = gql`
    query emailCheck($email: String!) {
        emailCheck(email: $email) 
    }
`;

const userCheck = gql`
    query checkUser($id: String!) {
        checkUser(userId: $id) {
            userId
            status
            userType
        }
    }
`;

const notify = gql`
    query notify(
        $uid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        notify(
            uid: $uid
            startAt: $startAt
            limit: $limit
            order: $order
        ) {
            id
            orgID
            clipId
            chatId
            title
            notificationType
            message
            isActive
            createdOn
            updatedOn
            readStatus
            orgData{
                ${dataDef.user}
            }
        }
    }
`;

const notifyLovitz = gql`
    query notify(
        $uid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        notify(
            uid: $uid
            startAt: $startAt
            limit: $limit
            order: $order
            lovitz: true
        ) {
            id
            orgID
            clipId
            chatId
            title
            notificationType
            message
            isActive
            createdOn
            updatedOn
            readStatus
            clipType
            orgData{
                ${dataDef.user}
            }
        }
    }
`;

const getFollowers = gql`
    query getFollower(
        $profileId: String
        $uid: String
        $limit: Int
        $startAt: String
        $order: String
    ) {
        getFollowers(
            profileId: $profileId
            userId: $uid
            limit: $limit
            order: $order
            startAt: $startAt
        ) {
            followerData {
                uid
                createdOn
                followStatus
                blockStatus
                notificationStatus
                displayName
                details {
                    uid
                    profileImage
                    profileImageB64
                    displayName
                    userType
                }
            }
        }
    }
`;

const getFollowing = gql`
    query getFollowings(
        $profileId: String
        $uid: String
        $limit: Int
        $startAt: String
        $order: String
    ) {
        getFollowing(
            limit: $limit
            order: $order
            profileId: $profileId
            userId: $uid
            startAt: $startAt
        ) {
            followingData {
                uid
                createdOn
                followStatus
                notificationStatus
                displayName
                details {
                    uid
                    profileImage
                    profileImageB64
                    displayName
                    userType
                }
            }
        }
    }
`;



const getBlockedUsers = gql`
    query getBlockedUsers(
        $uid: String
        $limit: Int
        $startAt: String
        $order: String
    ) {
        getBlockedUsers(
            limit: $limit
            order: $order
            userId: $uid
            startAt: $startAt
        ) {
            id
            displayName
            profileId
            createdOn
            updatedOn
            isBlocked
            details {
                uid
                profileImage
                profileImageB64
                userType
           }
        }
    }
`;

const getUserTitles = gql`
    query getUserTitles($profileId: String, $userId: String) {
        userTitles(profileId: $profileId, userId: $userId) {
            title {
                createdOn
                icon
                id
                name
                iconFile
                iconB64
            }
            profileId
            clipId
            uid
            titleId
        }
    }
`;

const getTitles = gql`
    query getTitles($keyword: String, $page: Int, $limit: Int) {
        titleSearch(keyword: $keyword, page: $page, limit: $limit) {
            createdOn
            icon
            id
            name
            iconB64
            iconFile
        }
    }
`;

const getTitleCount = gql`
    query getTitles($keyword: String, $page: Int, $limit: Int) {
        userTitlesCount(profileId: String) {
            total
            details {
                id
                name
                count
                iconFile
                iconB64
            }
        }
    }
`;

const hashtagSearch = gql`
    query hashtagSearch($keyword: String) {
        hashtagSearch(keyword: $keyword) {
            createdOn
            id
            tag
        }
    }
`;

const mensionSearch = gql`
    query mensionSearch($keyword: String) {
        mensionSearch(keyword: $keyword,page:0,limit:10) {
            ${dataDef.user}
        }
    }
`;

const searchCollabers = gql`
    query searchCollabers($uId:String,$keyword: String) {
        searchCollabers(keyword: $keyword,uId:$uId) {
            ${dataDef.user}
        }
    }
`;

const userSearch = gql`
    query mensionSearch($keyword: String,$page:Int,$limit:Int) {
        mensionSearch(keyword: $keyword,page:$page,limit:$limit) {
            ${dataDef.user}
        }
    }
`;

const placeStatus = gql`
    query placeStatus($place_id: String) {
        placeStatus(place_id: $place_id) {
            place_id
            isUsed
        }
    }
`;

const myChatRooms = gql`
    query myChatRooms($from:String,$page:Int,$limit:Int) {
        myChatRooms(from:$from,page:$page,limit:$limit) {
            id
            from
            to
            isBlocked
            blockedBy
            createdOn
            lastMessageOn
            ${dataDef.userDetails}
        }
    }
`;

const getChatroom = gql`
    query getChatroom($from:String,$id:String) {
        getChatroom(from:$from,id:$id) {
            id
            from
            to
            isBlocked
            blockedBy
            createdOn
            ${dataDef.userDetails}
        }
    }
`;

const getProfile = gql`
    query ProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
            referralCode
            uid
            gid
            userType
            displayName
            orgName
            profileImage
            profileImageB64
            clipCount
            followingCount
            followStatus
            userBlockingStatus
            blockStatus
            intro
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
            followersCount
            userProfile {
                slogan
                lifeMotto
                suburb
                countryCode
                stateShort
                state
            }
            keywords
        }
    }
`;

const getBlockStatus = gql`
    query ProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
            referralCode
            uid
            gid
            userType
            displayName
            orgName
            profileImage
            profileImageB64
            followStatus
            blockStatus
            status
            reportStatus
            userBlockingStatus
        }
    }
`;

const getURLPreview = gql`
    query getURLPreview($url: String) {
        getURLPreview(url: $url) {
            url
            image
            title
            description
        }
    }
`;



/* ====================== Begin : Clip ==================  */

const getClipUser = gql`
    query ProfileGet($id: String!, $uid: String) {
        profile(profileId: $id, uId: $uid) {
            referralCode
            uid
            gid
            userType
            displayName
            orgName
            profileImage
            profileImageB64
            followStatus
            userBlockingStatus
            blockStatus
            status
            userProfile {
                slogan
                lifeMotto
                suburb
                countryCode
                stateShort
                state
            }
        }
    }
`;
const getClipUserStatus = gql`
    query ProfileGet($id: String!) {
        profile(profileId: $id, uId: $id) {
            uid
            gid
            status
        }
    }
`;
const clips = gql`
    query clips(
        $bid: String!
        $uid: String!
        $startAt: String!
        $limit: Int
        $order: String!
    ) {
        clips(
            rid: $bid
            uId: $uid
            startAt: $startAt
            limit: $limit
            order: $order
        ) {
            ${dataDef.clip}
        }
    }
`;

const clipReactions = gql`
    query clipLovitz($id: String!) {
        clipLovitz(id: $id) {
            lovitzCount
            lovitzUsers{
                userDetails {
                    uid
                    displayName
                    profileImage
                    profileImageB64
                }
                createdOn
                updatedOn
            }
        }
    }
`;

const clip = gql`
    query clip(
        $id: String!
        $uid: String!
    ) {
        clip(
            id: $id
            uId: $uid
        ) {
            ${dataDef.clip}
        }
    }
`;

const anClip = gql`
    query anClip(
        $id: String!
        $uid: String!
    ) {
        anClip(
            id: $id
            uId: $uid
        ) {
            ${dataDef.clip}
        }
    }
`;

const clipSearch = gql`
    query clipSearch(
        $rid: String
        $uid: String
        $currentUser: String
        $keyword: String
        $limit: Int
        $page: Int,
        $loveitsSort: Boolean,
        $dateFilter: dateFilter
    ) {
        clipSearch(
            rid: $rid
            uid: $uid
            currentUser: $currentUser
            keyword: $keyword
            limit: $limit
            page: $page,
            loveitsSort:$loveitsSort,
            dateFilter: $dateFilter
        ) {
            ${dataDef.clip}
        }
    }
`;

const clipsHistory = gql`
    query clipsHistory(
        $uid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        clipsHistory(
            uId: $uid
            startAt: $startAt
            limit: $limit
            order: $order
        ) {
            ${dataDef.clip}
        }
    }
`;

const reportedClips = gql`
    query reportedClips(
        $bid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        reportedClips(rid: $bid, startAt: $startAt, limit: $limit, order: $order) {
            ${dataDef.clip}
        }
    }
`;

const clipReports = gql`
    query clipReports($clipId: String) {
        clipReports(clipId: $clipId) {
            uId
            clipId
            reason
            updatedOn
            userDetails {
                displayName
                uid
                profileImage
                profileImageB64
            }
        }
    }
`;

/* ====================== End : Clip ==================  */

/* ====================== Begin : Announcement Clip ==================  */
const anClips = gql`
    query anClips(
        $bid: String!
        $uid: String!
        $startAt: String!
        $limit: Int
        $order: String!
    ) {
        anClips(
            rid: $bid
            uId: $uid
            startAt: $startAt
            limit: $limit
            order: $order
        ) {
            ${dataDef.clip}
        }
    }
`;

const anClipReactions = gql`
    query anClipLovitz($id: String!) {
        anClipLovitz(id: $id) {
            lovitzCount
            lovitzUsers{
                userDetails {
                    uid
                    displayName
                    profileImage
                    profileImageB64
                }
                createdOn
                updatedOn
            }
        }

    }
`;

const anClipSearch = gql`
    query anClipSearch(
        $rid: String
        $uid: String
        $currentUser: String
        $keyword: String
        $limit: Int
        $page: Int,
        $loveitsSort: Boolean,
        $dateFilter: dateFilter
    ) {
        anClipSearch(
            rid: $rid
            uid: $uid
            currentUser: $currentUser
            keyword: $keyword
            limit: $limit
            page: $page,
            loveitsSort:$loveitsSort,
            dateFilter: $dateFilter
        ) {
            ${dataDef.clip}
        }
    }
`;

const anClipsHistory = gql`
    query anClipsHistory(
        $uid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        anClipsHistory(
            uId: $uid
            startAt: $startAt
            limit: $limit
            order: $order
        ) {
            ${dataDef.clip}
        }
    }
`;

const anReportedClips = gql`
    query anReportedClips(
        $bid: String
        $startAt: String
        $limit: Int
        $order: String
    ) {
        anReportedClips(rid: $bid, startAt: $startAt, limit: $limit, order: $order) {
            ${dataDef.clip}
        }
    }
`;

const anClipReports = gql`
    query anClipReports($clipId: String) {
        anClipReports(clipId: $clipId) {
            uId
            clipId
            reason
            updatedOn
            userDetails {
                displayName
                uid
                profileImage
                profileImageB64
            }
        }
    }
`;

/* ====================== End : Clip ==================  */

/* ====================== Begin : Lovits Clip ==================  */

const lovitz = gql`
    query allClipSearch(
        $rid: String
        $uid: String
        $currentUser: String
        $keyword: String
        $limit: Int
        $page: Int,
        $loveitsSort: Boolean,
        $dateFilter: dateFilter
        $clipType: String
    ) {
        allClipSearch(
            rid: $rid
            uid: $uid
            currentUser: $currentUser
            keyword: $keyword
            clipType: $clipType
            limit: $limit
            page: $page,
            loveitsSort:$loveitsSort,
            dateFilter: $dateFilter
        ) {
            clipType
            ${dataDef.clip}
        }
    }
`;

/* ====================== End : Clip ==================  */

const getPersonalClip = gql`
    query personalClip($id: String, $uId: String, $profileId: String) {
        personalClip(id: $id, uId: $uId, profileId: $profileId) {
            id
            lovitsCount
            lovitsDetails {
                userDetails {
                    displayName
                    profileImage
                    profileImageB64
                }
                createdOn
                updatedOn
            }
        }
    }
`;

const getIdeanGalleryClip = gql`
    query personalClip($id: String, $uId: String, $profileId: String) {
        personalClip(id: $id, uId: $uId, profileId: $profileId) {
        ${dataDef.ideanGallery}
        }
    }
`;


const getPersonalClipLovitz = gql`
    query personalClipLovitz($id: String, $uId: String, $profileId: String) {
        personalClipLovitz(id: $id, uId: $uId, profileId: $profileId) {
            lovitzCount
            lovitzUsers{
                userDetails {
                    uid
                    displayName
                    profileImage
                    profileImageB64
                }
                createdOn
                updatedOn
            }
        }
    }
`;

const getPersonalClips = gql`
    query personalClips(
        $uId: String
        $profileId: String
        $showCollab: Boolean
        $page: Int
        $limit: Int
    ) {
        personalClips(
            uId: $uId
            profileId: $profileId
            showCollab: $showCollab
            page: $page
            limit: $limit
        ) {
            ${ideanGallery}
            }
    }
`;

const getCollabPersonalClips = gql`
    query personalClipsLatest(
        $uId: String
        $profileId: String
        $page: Int
        $limit: Int
    ) {
        personalClipsLatest(
            uId: $uId
            profileId: $profileId
            page: $page
            limit: $limit
        ) {
            ${ideanGallery}
            }
    }
`;

const getCollabPersonalClipsFiltered = gql`
    query personalClipsLatestFiltered(
        $uId: String
        $profileId: String
        $page: Int
        $limit: Int
        $filters: personalClipFilters
    ) {
        personalClipsLatestFiltered(
            uId: $uId
            profileId: $profileId
            page: $page
            limit: $limit
            filters: $filters
        ) {
            ${ideanGallery}
            }
    }
`;

const getCollabSettings = gql`
    query collabIdeanSettings($uId: String) {
        collabIdeanSettings(uId: $uId) {
            uid
            radius
            radiusIndicator
            ethnicCommunity
            industryList
            activityList
            updatedOn
        }
    }
`;

const checkReferralCode = gql`
    query checkReferralCode($code: String) {
        checkReferralCode(code: $code)
    }
`;

const getReasons = gql`
    query getReasons {
        getReasons {
            status
            title
        }
    }
`;

const isArchiveRequested = gql`
    query isRequested($userId:String) {
        isRequested(userId: $userId)
    }
`;

const getContactInfo = gql`
    query getContactInfo {
        getContactInfo{
            ${dataDef.user}
        }
    }
`;

const getAppState = gql`
    query getAppState($os:String,$version:String) {
        getAppState(os:$os,version:$version){
            serverState
            appUpdate
        }
    }
`;
const verifyPersonalClips = gql`
    query verifyClips($ids:[String],$uid:String) {
        verifyClips(ids:$ids,uid:$uid)
    }
`;

const queries = {
    getUserProfile,
    getBusinessProfile,
    getCharityProfile,

    getProfile,
    getBlockStatus,
    getURLPreview,

    getQuestionnaire,
    places,
    getStates,
    getIndustries,
    getActivities,
    getEthnicCommunities,
    checkNickname: nicknameCheck,
    checkUser: userCheck,
    emailCheck,
    searchPagination,
    notify,
    notifyLovitz,
    getFollowers,
    getFollowing,
    getBlockedUsers,
    getUserTitles,
    getTitles,
    getTitleCount,
    hashtagSearch,

    mensionSearch,
    placeStatus,
    myChatRooms,
    getChatroom,
    getClipUser,
    getClipUserStatus,
    clips,
    clipReactions,
    clip,
    clipSearch,
    clipsHistory,
    reportedClips,
    clipReports,
    anClip,
    anClipReactions,
    anClips,
    anClipSearch,
    anClipsHistory,
    anReportedClips,
    anClipReports,
    lovitz,

    getPersonalClip,
    getPersonalClipLovitz,
    getPersonalClips,
    getCollabPersonalClips,
    getCollabPersonalClipsFiltered,
    userSearch,
    checkTempUser,
    searchCollabers,
    getCollabSettings,

    checkReferralCode,
    getReasons,
    isArchiveRequested,
    getContactInfo,
    getAppState,
    getIdeanGalleryClip,
    verifyPersonalClips
};

export {queries};
