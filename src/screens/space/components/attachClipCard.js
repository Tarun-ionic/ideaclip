import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from 'utilities/scale';
import {screens} from 'utilities/assets';
import {useTheme} from 'context/ThemeContext';
import ImageIcon from '../../components/utility/imageIcon';
import {userType} from '../../../utilities/constant';

export default function AttachClipCard({onPress, isCollab = false, type}) {
    const {theme} = useTheme();
    const styles = AttachClipCardStyles();
    const {colors} = theme;

    const slateBusiness = () => {
        return (
            <Text style={styles.ideanText}>
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.l}}>
                    {'This is Idean Gallery.\n'}
                </Text>
                {'Share '}
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'BTS '}
                </Text>
                {
                    "(Behind the Scenes) of your business here. Clip images by clicking the 'clip' icon on the bottom of your SPACE. Your Idean Gallery will also be shared in "
                }
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'Collab SPACE'}
                </Text>
                {'.'}
            </Text>
        );
    };

    const slateCharity = () => {
        return (
            <Text style={styles.ideanText}>
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.l}}>
                    {'This is Idean Gallery.\n'}
                </Text>
                {'Share '}
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'BTS '}
                </Text>
                {
                    "(Behind the Scenes) of your Charity/NFP here. Clip images by clicking the 'clip' icon on the bottom of your SPACE. Your Idean Gallery will also be shared in "
                }
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'Collab SPACE'}
                </Text>
                {'.'}
            </Text>
        );
    };

    const slateGeneralUser = () => {
        return (
            <Text style={styles.ideanText}>
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.l}}>
                    {'This is Idean Gallery.\n'}
                </Text>
                {'Share your inspirational '}
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'#interest-related images'}
                </Text>
                {" by clicking the 'clip' icon on the bottom of your SPACE."}
            </Text>
        );
    };

    let slateView;
    switch (type) {
        case userType.general:
            slateView = slateGeneralUser();
            break;
        case userType.business:
            slateView = slateBusiness();
            break;
        case userType.charity:
            slateView = slateCharity();
            break;
        default:
            slateView = null;
            break;
    }

    const collabView = () => {
        return (
            <Text style={[styles.ideanText, {marginTop: 70}]}>
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.l}}>
                    {'This is Idean Gallery.\n\n'}
                </Text>
                {/*<Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>*/}
                {/*  {'Idean Gallery of businesses, charities and NFPs '}*/}
                {/*</Text>*/}
                {/*{'will be shared here. You can '}*/}
                {/*<Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>*/}
                {/*  {'visit the SPACE '}*/}
                {/*</Text>*/}
                {/*{'by clicking on the image. '}*/}
                {/*<Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>*/}
                {/*  {'Upvote '}*/}
                {/*</Text>*/}
                {/*{*/}
                {/*  'your favourite Idean Gallery images and support Businesses and Charities/NFPs.\n\n'*/}
                {/*}*/}
                {
                    'Oops, no businesses/charities found based on your setting. Please try again.'
                }
            </Text>
        );
    };

    return isCollab === true ? (
        <View style={styles.card}>{collabView()}</View>
    ) : (
        <TouchableOpacity style={styles.card2} onPress={onPress}>
            <Image source={screens.ideanGalleryDefaultAttach} style={{width:'55%',height:'55%',resizeMode:'contain'}} />
            {/* <ImageIcon
                rounded={false}
                size={100}
                source={screens.personalClipEmpty}
                onPress={onPress}
            />
            {slateView}
            <Text style={styles.ideanText2}>
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {"Watch 'IDEACLIP Explanatory Animation'"}
                </Text>
                {' by going to '}
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'Settings '}
                </Text>
                {'in the '}
                <Text style={{color: colors.secondaryDark, fontSize: scale.font.xs}}>
                    {'three-dotted button '}
                </Text>
                {'on the top right hand corner.'}
            </Text> */}
        </TouchableOpacity>
    );
}
const AttachClipCardStyles = () =>
    StyleSheet.create({
        card: {
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: '#999898',
            borderWidth: 1,
            flex: 1,
            marginHorizontal: 10,
            paddingBottom: 30,
            borderRadius: 40,
        },
        card2: {
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: '#999898',
            borderWidth: 1,
            flex: 1,
            marginHorizontal: 10,
            borderRadius: 40,
            aspectRatio:1
        },
        ideanText: {
            color: '#9b9a9a',
            textAlignVertical: 'center',
            textAlign: 'center',
            marginHorizontal: '10%',
            fontSize: scale.font.xs,
            lineHeight: 20,
        },
        ideanText2: {
            color: '#9b9a9a',
            textAlignVertical: 'center',
            textAlign: 'center',
            marginHorizontal: '10%',
            fontSize: scale.font.xs,
            lineHeight: 20,
            marginTop: 20,
        },
    });
