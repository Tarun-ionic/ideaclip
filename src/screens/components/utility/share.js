// noinspection JSUnresolvedVariable

import {Share} from 'react-native';
import {logger} from '../../../index';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';
import {strings} from '../../../constant/strings';
import {getUserSession} from "../../../lib/storage";

export default async function onShare() {
    const user = await getUserSession()
    setTimeout(async () => {
        try {
            await Share.share({
                message:
                    `Hey,\nI'm using IDEACLIP to collab with my favourite brands. Join me!
			\n\nEnter Referral Code ${user?.referralCode} upon signing up to earn lovitz!
			\n\nDownload it here!\nGoogle Play Store: https://ideaclip.page.link/android\nApple App Store: https://ideaclip.page.link/ios`,
            });
        } catch (error) {
            logger.e(error.message);
        }
    }, 500);
}

export function CopyText(text) {
    Clipboard.setString(text);
    Toast.show(strings.copied);
}

export function redirect2Messenger(navigation, cUser, pUser) {
    if (cUser.uid === pUser.uid) {
        navigation.push('MessengerUsers');
    } else {
        navigation.push('MessengerChat', {receiver: {...pUser}});
    }
}
