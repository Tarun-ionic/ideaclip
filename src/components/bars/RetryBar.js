import React, {useState} from 'react';
import {Image, Modal, Pressable, StyleSheet, View} from "react-native";
import {icons} from "../../utilities/assets";
import {useTheme} from "../../context/ThemeContext";
import {RoundButton} from "../../system/ui/components";
import scale from "../../utilities/scale";
import {strings} from "../../constant/strings";
import PropTypes from "prop-types";

export default function RetryBar({position, onReSend, onDelete, metaData, clip, offset = 0}) {
    const {theme} = useTheme();
    const [modal, setModal] = useState(false)

    const openModal = () => setModal(true)
    const closeModal = () => setModal(false)
    const triggerCallBack = (func, params) => {
        if (typeof func === 'function') func(params)
        closeModal()
    }
    let _offset = offset
    const offsetPosition = () => {
        if (offset === 0) {
            _offset = 5
            return position === "left" ? "right" : "left";
        } else {
            _offset = offset + 20
            return position;
        }
    }
    let _position = offsetPosition()
    const styles = styleSheet(theme, clip, _offset);


    return (
        <>
            <Modal
                transparent={true}
                onDismiss={closeModal}
                onRequestClose={closeModal}
                visible={modal}>
                <View style={styles.wrap}>
                    <View style={styles.wrap_container}>
                        <RoundButton
                            style={styles.roundButton}
                            labelStyle={{fontSize: scale.font.s}}
                            label={strings.retryReSend}
                            onPress={() => triggerCallBack(onReSend, metaData)}
                        />
                        <RoundButton
                            style={styles.roundButton}
                            labelStyle={{fontSize: scale.font.s}}
                            label={strings.retryDelete}
                            onPress={() => triggerCallBack(onDelete, metaData)}
                        />
                        <RoundButton
                            style={styles.roundButton}
                            labelStyle={{fontSize: scale.font.s}}
                            label={strings.retryCancel}
                            onPress={closeModal}
                        />
                    </View>
                </View>
            </Modal>

            <Pressable style={[styles.container, styles[_position]]} onPress={openModal}>
                <Image source={icons.retry} style={styles.thumb}/>
                <Image source={icons.remove} style={styles.thumb}/>
            </Pressable>
        </>
    )
}

RetryBar.propTypes = {
    position: PropTypes.oneOf(['left', 'right']).isRequired,
    onReSend: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    metaData: PropTypes.object.isRequired,
};

const styleSheet = ({colors}, clip, offset) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            bottom: clip ? 0 : 30
        },
        left: {
            left: offset
        },
        right: {
            right: offset
        },
        thumb: {
            width: 20,
            height: 20,
            marginRight: 5
        },
        wrap: {
            width: "100%",
            height: "100%",
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            backgroundColor: 'transparent',
        },
        wrap_container: {
            elevation: 5,
            zIndex: 100,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            width: scale.ms(300),
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            paddingTop: 15,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            backgroundColor: colors.poll_surface,
        },
        roundButton: {
            backgroundColor: colors.poll_btn,
            color: colors.fp_btnText,
            marginBottom: 15,
            fontSize: scale.font.l,
            fontWeight: 'bold',
        }
    });
