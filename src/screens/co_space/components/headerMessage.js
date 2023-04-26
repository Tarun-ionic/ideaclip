import React, {useEffect, useState} from "react";
import {Text} from "react-native";
// import {Text} from "native-base";
import {useTheme} from "../../../context/ThemeContext";
import PropTypes from "prop-types";
import {clipTypes} from "../../../utilities/constant";

const styles = {
    no_record: {textAlign: 'center', margin: 15, padding: 5},
};

HeaderMessage.propTypes = {
    isTemp: PropTypes.bool,
    spaceType: PropTypes.string,
}

export default function HeaderMessage({isTemp, spaceType=''}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const [message, setMessage] = useState(null)

    useEffect(() => {
        let mounted = true
        setTimeout(() => {
            if (!isTemp) {
                if(!spaceType)
                    mounted && setMessage(null)
                else if(spaceType === clipTypes.clip)
                    mounted && setMessage("Blast off your Wild Fan Insights and share Cheers!")
                else
                    mounted && setMessage("Call out for help to Collabers or share Updates here. Take Votes real time!")
            }
        }, 500)
        return () => {
            mounted = false
        }
    }, [isTemp,spaceType])


    return message === null ? null : (
        <Text style={[styles.no_record, {color: colors.textPrimaryDark}]}>
            {message}
        </Text>
    )
}
