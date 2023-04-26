import React, {useEffect, useState} from "react";
// import {Text} from "native-base";
import {Text} from "react-native";
import {useTheme} from "../../../context/ThemeContext";
import PropTypes from "prop-types";
import {clipTypes} from "../../../utilities/constant";

const styles = {
    no_record: {textAlign: 'center', margin: 15, padding: 5},
};

TempMessage.propTypes = {
    isTemp: PropTypes.bool,
    isEmpty: PropTypes.bool,
}

export default function TempMessage({isTemp, isEmpty}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const [message, setMessage] = useState(null)

    useEffect(() => {
        let mounted = true
        setTimeout(() => {
            if (isEmpty && isTemp) {
                mounted && setMessage(`Congrats! You’ve just made your first move to create a ripple of ‘good work’!`)
            } else if (isEmpty && !isTemp) {
                mounted && setMessage(null)
            } else if (!isEmpty && isTemp) {
                mounted && setMessage(`Invite other Community Advocates you may know and help business/charity achieve Fan-Driven Innovation.`)
            }
        }, 500)
        return () => {
            mounted = false
        }
    }, [isEmpty,isTemp])


    return message === null ? null : (
        <Text style={[styles.no_record, {color: colors.textPrimaryDark}]}>
            {message}
        </Text>
    )
}
