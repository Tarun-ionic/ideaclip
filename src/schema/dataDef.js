export const myTitle = ` myTitle{
              title{
               createdOn
                icon
                id
                name
              }
              profileId
              clipId
              clipType
              uid
              titleId
            }
`;
export const pollData = ` 
              pollData{
               	question
                option1
                option2
                option3
              }`;
export const pollCount = ` 
              pollCount{
                option1
                option2
                option3
                answered
              }`;

export const clip = `
   			id
            uid
            rid
            text
            commentCount
            medias {
                mediaPath
                mediaType
                thumbPath
                mediaLabel
                mediaSize
                thumbnail
            }
            parentThread {
                id
                text
                user {
                    displayName
                    profileImage
                    profileImageB64
                }
                isBlocked
                isDeleted
                isArchived
                isReported
            }
            user {
                displayName
                profileImage
                profileImageB64
                userType
                uid
            }
            hashTags {
                id
                tag
            }
            createdOn
            updatedOn
            isBlocked
            isDeleted
            isArchived
            isReported
            blockedBy
            deletedBy
            publishedOn
            reactionCount
            threadCount
            clipContentType
            linkPreview{
				url
				image
				title
				description
            }
           ${myTitle}
           ${pollData}
           ${pollCount}           
            badgeAdded
            latestReaction{
                userDetails{
                    uid
                    profileImage
                    profileImageB64
                }
                createdOn
                updatedOn
            }
            myReaction {
                id
                type
            }`;
export const userDetails = ` userDetails {
                displayName
                uid
                profileImage
                profileImageB64
                userType
                status
              }`;
export const user = ` 
                displayName
                uid
                referralCode
                profileImage
                profileImageB64
                userType
              `;


export const userExists = `
 status
 user{
  ${user}
 }
`;

export const ideanGallery = `
      id
      uid
      mediafile
      mediaType
      text
      type
      duration
      updatedOn
      createdOn
      isDeleted
      isArchived
      isLoved
      isPublished
      lovitsCount
      lovitsLatest {
        userDetails {
          uid
          profileImage
          profileImageB64
          userType
        }
      }
      userDetails {
      	uid
        displayName
        profileImage
        profileImageB64
        userType
	    followStatus
		blockStatus
		status
        userProfile {
          suburb
          state
          countryCode
          stateShort
        }
      }
      userType
      isHidden
      isPrivate

      isMultiple
      mediaCount
      mediaFiles {
        mediafile
        mediaType
      }
`

export const dataDef = {
    clip,
    userDetails,
    myTitle,
    user,
    userExists,
    pollData,
    ideanGallery
};
