// noinspection DuplicatedCode

import apolloLib from '../lib/apolloLib';
import {mutations} from '../schema';
import Toast from "react-native-simple-toast";
import {strings} from "../constant/strings";

const collab = (data, profileId, session) => {
    return new Promise(async (resolve, reject) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.following,
                variables: {
                    profileId: profileId,
                    data: data,
                },
            })
            .then(resp => {
                if (resp.data && resp.data.followerCreate) {
                    resolve(resp.data.followerCreate.followStatus);
                } else {
                    reject(resp.errors);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

const uncollab = (userId, profileId, session) => {
    return new Promise(async (resolve, reject) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.unfollow,
                variables: {
                    profileId: profileId,
                    userId: userId,
                },
            })
            .then(({data, error}) => {
                if (data && data.removeFollower) {
                    resolve(data.removeFollower.status);
                } else {
                    reject(error);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

// const block = (userId, profileId, status, session) => {
//     return new Promise(async (resolve, reject) => {
//         apolloLib.client(session)
//             .mutate({
//                 fetchPolicy: 'no-cache',
//                 mutation: mutations.block,
//                 variables: {
//                     followerId: profileId,
//                     userId: userId,
//                     status: status,
//                 },
//             })
//             .then(({data, error}) => {
//                 if (data && data.blockUnblockFollower) {
//                     resolve(data.blockUnblockFollower.status);
//                 } else {
//                     reject(error);
//                 }
//             })
//             .catch(err => {
//                 reject(err);
//             });
//     });
// };

const block = (userId, profileId, status, session) => {
    return new Promise(async (resolve, reject) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.userBlocking,
                variables: {
                    profileId: profileId,
                    uId: userId,
                },
            })
            .then(({data, error}) => {
                if (data) {
                    const {userBlocking} = data
                    if(userBlocking != null) {
                        resolve(userBlocking);
                    } else{
                        reject(error);
                    }
                } else {
                    reject(error);
                }
                if (error) {
                    reject(error);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

export {collab, uncollab, block};
