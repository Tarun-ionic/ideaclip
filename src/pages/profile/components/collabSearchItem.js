/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';

import {Text, View} from 'react-native';
import {placeHolders} from '../../../utilities/assets';
import {useTheme} from '../../../context/ThemeContext';
import {cacheFile} from '../../../lib/storage';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import ImageIcon from '../../../screens/components/utility/imageIcon';
import logger from '../../../lib/logger';
import {PopUpStyles} from './CollaberSearch';

function CollabSearchItem({setCollaber, collaber, onClose}) {
    const {theme} = useTheme();
    const styles = PopUpStyles(theme);
    const [logo, setLogo] = useState(placeHolders.avatar);

    useEffect(() => {
        let mounted = true;
        if (collaber.profileImage) {
            if (collaber.profileImageB64) {
                setLogo({uri: collaber.profileImageB64});
            } else {
                cacheFile(collaber.profileImage, 'dp')
                    .then(path => {
                        if (mounted) {
                            setLogo({uri: path});
                        }
                    })
                    .catch(logger.e);
            }
        }
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Pressable
            onPress={() => {
                setCollaber({name: collaber?.displayName, id: collaber?.uid});
                onClose();
            }}>
            <View style={styles.card}>
                <ImageIcon size={20} source={logo}/>
                <Text style={styles.cardInfo}>{collaber?.displayName}</Text>
            </View>
        </Pressable>
    );
}

export default React.memo(CollabSearchItem);
