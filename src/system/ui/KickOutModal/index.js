import {Image, Modal, Text, TouchableWithoutFeedback, View,} from 'react-native';
import {appLogo} from '../../../utilities/assets';
import React from 'react';
import styles from './assets/style';
import {useTheme} from '../../../context/ThemeContext';
import {RoundButton} from '../components';
import scale from '../../../utilities/scale';
import {strings} from '../../../constant/strings';
import {onTrigger} from '../../../utilities/helper';
import PropTypes from 'prop-types';
import {userStatus} from "../../../utilities/constant";

KickOutModal.propTypes = {
    onRedirect: PropTypes.func,
};

export default function KickOutModal({onRedirect, status}) {
    const {theme, width, height} = useTheme();
    const style = styles(theme, width, height);
    const onUpdate = () => {
        onTrigger(onRedirect)
    };

    return (
        <Modal transparent={true} visible={true}>
            <TouchableWithoutFeedback>
                <View style={style.wrap}>
                    <View style={style.container}>
                        <View style={style.titleContainer}>
                            <Image style={style.logo} source={appLogo.min}/>
                            <Text style={style.title}>{strings.pc_heading}</Text>
                        </View>
                        <View style={style.titleContainer}>
                            <Text
                                style={style.subTitle}>{status === userStatus.archived ? strings.kick_archived_message : strings.kick_disabled_message}</Text>
                        </View>

                        <RoundButton
                            style={style.roundButton}
                            labelStyle={{fontSize: scale.font.s}}
                            label={strings.ok}
                            onPress={onUpdate}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
