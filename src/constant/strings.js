import {userType} from '../utilities/constant';
import config from './config';

const labels = {
    interestedIndustries: 'Industries of interest',
    interestedIndustriesCollab: 'Industries of my Interest',
    relatedIndustries: 'Related industries',
    ethnicCommunities: 'Ethnic communities of interest',
    ethnicCommunitiesCollab: 'Ethnic Communities of my Interest',
    mainActivities: 'Main Activities',
    mainActivitiesCollab: 'Charities/NFPs of my Interest',
};

const titles = {
    verifyAccount: 'Verify your account',
};
const subTitles = {
    verifyOtp: 'A verification code has been sent to your phone number.',
};

const buttonLabels = {};

export {labels, titles, subTitles, buttonLabels};

export const strings = {
    referralCodeMessage : 'Enter the referral code which you recevied on the mail',
    ideanGalleryFilteredSearchInitialMessage:
        'Initial search based on the new filter settings may take up to 10 seconds.',
    ideanGalleryFilteredSearchEmptyMessage:
        'Oops! No businesses/charities found based on your setting. Please try again.',
    profile_updated: 'Profile updated',
    file_limit_reached: `Can't share more than ${config.fileUpload.maxLimit} media items.`,
    reporter_list: 'Reporter List',
    remove_clip_message: 'Are you sure you want to remove the Clip?',
    remove_reported_clip_message: 'Are you sure you want to remove the Clip from the ',
    remove_clip_message_co_space: 'Are you sure you want to remove the Clip?',
    cancel: 'cancel',
    ok: 'ok',
    signUpIntro: 'You are Signing Up as ',
    signUpMap1: 'Match your ',
    signUpMap2: ' Address ',
    signUpMap3: 'shown on ',
    signUpMap4: 'Google ',
    signUpMap5: 'with IDEACLIP to appear in Search Result.',
    mySpace: 'My SPACE',
    km_string: ' km (kilometre)',
    submit: 'submit',
    block_clip_message: 'Are you sure you want to hide this Clip?',
    hide_all_clip_message: 'Are you sure you want to hide this Clip from All?\n(Please ONLY remove the clip if it violates Communal ethos.)',
    report_reason_placeholder: 'Enter your reason for reporting.',
    report_reason: 'Reason',
    disableMessage1: 'Your account has been disabled. An email has been sent to you. To submit a plea for \'Reactivation of your Account\' with relevant reasoning, please ',
    disableMessage2: 'click here',
    disableMessage3: '.',
    archiveMessage1: 'You account had been permanently archived. An email confirming the archival of your account has already been sent.\n' +
        'If you have any questions, please contact ',
    archiveMessage2: 'admin@ideaclip.com.au',
    archiveMessage3: '.',
    report: 'Report',
    reportUser: 'Report User',
    userBlockMessage: 'Are you sure you want to block this user?',
    userUnblockMessage: 'Are you sure you want to unblock this user?',
    archiveSubmittedMessage1: 'The request is already submitted and is under process. Please contact ',
    archiveSubmittedMessage2: 'admin@ideaclip.com.au',
    archiveSubmittedMessage3: ' if you have further queries.',
    reset_link_send_message:
        'A password reset link has been sent to your email address. Please check your SPAM folder in case you don\'t receive an email shortly.',
    confirm_app_exit: 'Are you sure you want to exit?',
    user_archived_message: 'This space is permanently Archived.',
    network_error_message:
        'Unable to contact our server. Please check your internet connectivity.',
    duplicate_email_message:
        'An account with the given email address already exists.',
    no_user_message:
        'The user was not found. Please check your sign-in credentials and try again.',
    confirm_clip_delete: 'Are you sure you want to delete this Clip?',
    confirm_clip_hide: 'Are you sure you want to hide this Clip?',
    location_warning: 'Location is required for search.',
    location_warning2:
        'Unable to fetch location information. Please make sure device location is turned on.',
    location_warning3:
        'Location access permission is denied. Please make sure location access permission is turned on.',
    getting_your_location: 'Please wait while we get your location.',
    profile_update_failed: 'failed to update profile.',
    something_went_wrong: 'Something went wrong. Please try again later.',
    already_in_use_location: 'Already used.',
    location_mismatch: 'LOCATION MISMATCH',
    account_exists: 'An account with the given credentials already exists.',
    underAgeMessage1: 'Users under the age of 13 are not eligible to create an account on the Platform by Law. Please refer to the ',
    underAgeMessage2: 'Privacy Policy',
    underAgeMessage3: '.',
    already_location_used_message:
        'The following business is already used in another account.',
    already_location_used_message_charity:
        'The following charity is already used in another account.',
    alread_used_message_business: 'If this address is a shared location, please register your business via Google Map first. Upon Google’s approval for your business location, your business name with the correct address will be found under ‘Find Your Business’ in the App.',
    alread_used_message_charity: 'If this address is a shared location, please register your charity/NFP via Google Map first. Upon Google’s approval for your charity/NFP location, your charity/NFP name with the correct address will be found under ‘Find Your Charity/NFP’ in the App.',

    confirm_location: 'Confirm your Business.',
    confirm_location_charity: 'Confirm your Charity/NFP',
    confirm_location_alert: 'Are you sure that the following is your business?',
    confirm_location_alert_charity:
        'Are you sure that the following is your Charity/NFP?',
    no: 'No',
    yes: 'Yes',
    user_creation_failed:
        'We are unable to save your data. Please try again later.',
    gender: 'gender',
    other_fields_empty_warning: '"Other" cannot be empty.',
    save: 'Save',
    signupCreateAccount: 'Create Account',
    reset_credentials_string: 'Reset Password',
    general_user: 'General User',
    business: 'Business',
    sign_up_as: 'Sign up as',
    login: 'Sign in',
    login_to_account: 'Login to my account',
    create_an_account: 'Create new account',
    what_is_ideaclip: 'What is IDEACLIP?',
    forget_password: 'Forgot password?',
    sign_up: ' Sign up',
    verify: 'Verify',
    registered_business_account: 'Business Name',
    registered_charity_account: 'Charity/NFP Name',
    business_channel: 'Main Business Channel',
    first_name: 'First name',
    last_name: 'Last name',
    search: 'Search',
    userName: 'Username',
    state: 'State',
    update: 'Update',
    clip_description_required: 'Clip description is required.',
    credential_updated: 'Password updated',
    credential_updating_failed: 'Failed to update password. Try again later.',
    enter_business_name: 'Enter business name',
    enter_charity_name: 'Enter charity name',
    enter_ABN: 'Enter ABN',
    enter_valid_ABN: 'Enter a valid ABN',
    no_application_found: 'No supported application found.',
    collabAlertMessage: 'Click on the business/charity profile to Collab.',
    credential_length_alert: 'Password should be 6 characters long.',
    enter_valid_mail: 'Enter valid email address.',
    clip_remove_failed: 'Clip removal failed',
    clip_remove_success: 'Clip removed',
    reset: 'Reset',
    clearAll: 'clear all',
    copied: 'Copied !',
    confirm_location_retry: "Your device's location could not be determined.",
    messenger: 'Chat SPACE',
    no_chat_room_user: 'collabers not found',
    messenger_block: 'Block',
    messenger_unblock: 'Unblock',
    messenger_blocked: 'This chat is blocked.',
    messenger_blocked_by_user:
        'You blocked this chat. Please unblock to continue chatting.',
    blocked_by_user:
        'You blocked this user. Please unblock in the Collaber List to continue chatting.',
    blocked_user_menu:
        'You blocked this user. Please unblock in the user space to continue chatting.',
    charity: 'Charity/NFP',
    signup_title: 'Your real fans collab with you.',
    signup_user_title: 'Create social synergy, your way.',
    or: 'or',
    phoneNumberMessage:
        'Enter a phone number to receive a text message with a verification code.',
    login_title: 'Sign in',
    login_slogan: 'Collaborate and Innovate.',
    facebook_login: 'Sign in with Facebook',
    facebook_signup: 'Signup with Facebook',
    google_login: 'Sign in with Google',
    google_signup: 'Signup with Google',
    apple_login: 'Sign in with Apple',
    apple_signup: 'Signup with Apple',
    continue: 'CONTINUE',
    terms_and_condition: 'Terms & Conditions',
    agree: 'Agree',
    dis_agree: 'Disagree',
    welcome_text: 'Welcome to',
    social_collab_platform: 'Social Collaboration Platform',
    clips: 'Clips',
    myInsights: 'My Insights',
    Title: 'Title',
    Collabing: 'Collabing',
    Collaber: 'Collaber',
    Collab: 'Collab',
    collabSpace: 'Collab SPACE',
    charitySpace: 'Charity/NFP SPACE',
    businessSpace: 'Business SPACE',
    userSpace: 'Personal SPACE',
    idea_clip_co_space: 'IDEACLIP Co-space',
    coSpaceButton: '\'IDEA\' CLIP',
    notification: 'Notifications',
    most_lovit_clips: 'Clips with most lovitz',
    announcement_co_space: 'News & Asks',
    additz: 'Back with additz',
    chatTextPlaceholder: 'Use #tags to highlight keywords ...',
    collabSpaceSearchPlaceHolder: 'Enter business/charity name, suburb, etc.',
    collabPending:
        'Your Collab request is pending. Please wait for the status to change to "Collabing".',
    userAccessDenied:
        'This SPACE is not accessible.',
    collabFirst: 'Click on "Collab" button.',
    most_lovits_title: 'Clips with most lovitz...',
    my_most_lovits_title: 'My Clips with most lovitz...',
    most_lovits_heading: 'Most Loved Fan Insights',
    idea_gallery: 'Upvote Idean Gallery with lovitz',
    collabSpaceIdeanGallery: 'Business/Charity/NFP Gallery',
    fan_lovits: 'Upvote fan insights with lovitz',
    reportingCompleted: 'The Clip is now reported.',
    userReportingCompleted: 'The user has been reported.',
    userBlockingCompleted: 'The user has been blocked.',
    userUnblockingCompleted: 'The user has been unblocked.',
    reportingFailed: 'Reporting failed.',
    blockFailed: 'Blocking failed.',
    unblockFailed: 'UnBlocking failed.',
    hidingCompleted: 'The Clip is now hidden.',
    hidingCompletedAll: 'The Clip is now hidden from all.',
    removingCompleted: 'The Clip is removed.',
    alreadyReported: 'Already reported.',
    slogan: 'Do good, Get great!',
    slogan_2: 'Activate your Fan Insights!',
    pc_post: 'Post',
    pc_heading: 'IDEACLIP',
    pc_title: 'How would you like to post your Clip?',
    setTimeFrame: 'Set time frame',
    pc_maximum: '(Max. 24 hrs from now)',
    pc_timeEnd: 'Time Ended',
    pc_timeLeft: 'Left',
    kick_archived_message:
        'Your account is now Archived. Please check the email notification for further information.',
    kick_disabled_message:
        'Your account is now Disabled. Please check the email notification for further information.',
    poll_create_heading: 'IDEACLIP - Create a Poll',
    poll_create_quiz: 'Type Question here.',
    poll_create_quiz_info: '(max. 100 characters)',
    poll_type_option1: 'Type Option 1 here.',
    poll_type_option2: 'Type Option 2 here.',
    poll_type_option3: 'Type Option 3 here.',
    poll_previewBtn: 'Preview',
    poll_post: 'Post',
    retryReSend: 'RE-SEND',
    retryDelete: 'DELETE',
    retryCancel: 'CANCEL',
    signup_cancelled: 'The user cancelled the signup.',
    login_cancelled: 'The user cancelled the login.',


    login_as(userLoginType) {
        switch (userLoginType) {
            case userType.business:
                return `Sign in as ${strings.business}`;
            case userType.charity:
                return `Sign in as ${strings.charity}`;
            default:
                return `Sign in as ${strings.general_user}`;
        }
    },
    selectIndustry(isUser) {
        return `Choose ${
            isUser ? 'industries of interest' : 'related industries'
        }.`;
    },
    sign_up_as_(userLoginType) {
        switch (userLoginType) {
            case userType.business:
                return `Sign up as ${strings.business}`;
            case userType.charity:
                return `Sign up as ${strings.charity}`;
            default:
                return `Sign up as ${strings.general_user}`;
        }
    },
    archiveRequestCompleteMessage: "It may take up to 5 working days to process your request. Once successfully archived, an email notification will be sent to you. Similarly, if your request is denied for reasons, an email will be sent to you explaining why.",
    fileSizeExceed: "File(s) exceed size limit of 10 MB. Please try again.",
    attachFile: "Attach a media file.",
    radius: "Radius settings updated.",
    lovitzCountBegin: 'Woo-hoo! Total of ',
    lovitzCountEnd: ' Lovitz earned so far!',
    single_upload_crop: 'Upload 1 image at a time to access Cropping feature',

};
