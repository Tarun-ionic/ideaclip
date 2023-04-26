import React, {Component} from 'react';
import {TextInput} from 'react-native-paper';
import PropTypes from 'prop-types';

export default class TextInputBox extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TextInput
                label={this.props.label}
                theme={
                    this.props.theme
                        ? this.props.theme
                        : {
                            colors: {
                                primary: this.props.colors.textInputBorder,
                                background: this.props.colors.textInputBackground,
                                text: this.props.colors.textPrimaryDark,
                                placeholder: this.props.colors.textPrimary,
                                underlineColor: 'transparent',
                                disabled: this.props.colors.textInputDisabled,
                            },
                        }
                }
                value={this.props.value}
                onChangeText={this.props.onChangeText}
                maxLength={this.props.maxLength}
                mode={this.props.mode}
                style={this.props.style}
                pointerEvents={this.props.pointerEvents}
                editable={this.props.editable}
                onBlur={this.props.onBlur}
                keyboardType={this.props.keyboardType}
                multiLine={this.props.multiLine}
                numberOfLines={this.props.numberOfLines}
                autoCapitalize={this.props.autoCapitalize}
                disabled={this.props.disabled}
                secureTextEntry={this.props.secureTextEntry}
                outlineColor={this.props.colors.textPrimary}
            />
        );
    }
}

TextInputBox.propTypes = {
    label: PropTypes.string,
    theme: PropTypes.object,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    maxLength: PropTypes.number,
    numberOfLines: PropTypes.number,
    mode: PropTypes.string,
    style: PropTypes.object,
    pointerEvents: PropTypes.string,
    editable: PropTypes.bool,
    onBlur: PropTypes.func,
    keyboardType: PropTypes.string,
    multiLine: PropTypes.bool,
    autoCapitalize: PropTypes.string,
    disabled: PropTypes.bool,
    secureTextEntry: PropTypes.bool,
    colors: PropTypes.object,
};
