/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from '../../context/ThemeContext';

import {
    Image,
    Keyboard,
    Modal,
    Pressable,
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity, TouchableWithoutFeedback,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {appLogo, lottie} from '../../utilities/assets';
import LottieView from 'lottie-react-native';
import AnimatedLoader from 'react-native-animated-loader';
import LinearGradient from 'react-native-linear-gradient';
import ImageIcon from '../../screens/components/utility/imageIcon';
import {onTrigger} from '../../utilities/helper';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useKeyboard from "../../lib/keyboard";
import alertStyle from "../styles/alertStyle";
import PropTypes from 'prop-types';

const makeStyle = ({colors}) => {
    return StyleSheet.create({
        screen: {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: colors.surfaceDark,
        },
        screenSecondary: {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#F2f2f8',
        },
        roundedButton: {
            alignSelf: 'center',
            zIndex: 20,
            backgroundColor: colors.buttonRed,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 20,
            margin: 5,
            width: scale.ms(250),
        },
        roundedButtonWrap: {
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
        },
        roundedButtonLabel: {
            color: colors.textSecondaryDark,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize: scale.font.xl,
            flex: 1,
        },
        lottie: {width: 75, height: 75, alignSelf: 'center'},
        loader: {height: 20},
        loader_overlay: {
            alignSelf: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: 'transparent',
            position: "absolute",
            zIndex: 24,
            width: '100%',
            height: '100%',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        min_loader_top:{
            position:"absolute",
            top:0,
        },
        min_loader_bottom:{
            position:"absolute",
            bottom:0,
        },
        min_loader_left:{
            position:"absolute",
            left:0,
        },
        min_loader_right:{
            position:"absolute",
            right:0,
        },
        mini_loader_overlay: {
            alignSelf: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: 'transparent',
            zIndex: 24,
            width: 40,
            height: 40,
        }, mini_lottie: {width: 50, height: 50, alignSelf: 'center'},
    });
};

export function Screen({
                           children,
                           style,
                           secondary,
                           translucent = false,
                           locations = [0.3, 0.5, 0.8],
                           colors = ['#0ddfee', '#a926f0', '#3c0ee2'],
                           navBarEnabled = false
                       }) {
    const {theme} = useTheme();
    const styles = makeStyle(theme);
    return (
        <View style={[secondary ? styles.screenSecondary : styles.screen, style]}>
            {translucent && (
                <LinearGradient
                    // colors={colors}
                    colors={theme.dark?['#000000','#000000','#000000']:['#ffffff','#ffffff','#ffffff']}
                    locations={[0.3, 0.5, 0.8]}
                    useAngle={true}
                    angle={90}
                    style={{width: '100%', height: StatusBar.currentHeight}}>
                    <SafeAreaView>
                        <StatusBar
                            hidden={!translucent}
                            translucent={translucent}
                            barStyle={theme.dark?'light-content':'dark-content'}
                            backgroundColor={theme.dark?'black':'white'}
                        />
                    </SafeAreaView>
                </LinearGradient>
            )}
            {navBarEnabled?
                <SafeAreaView style={{flex:1}}>
                    {children}
                </SafeAreaView>
            :
                children
            }
            

        </View>
    );
}

export function RoundButton({
                                label,
                                onPress,
                                style = {},
                                iconStyle = {},
                                icon,
                                labelStyle,
                                loading = false,
                            }) {
    const {theme} = useTheme();
    const styles = makeStyle(theme);
    return (
        <React.Fragment>
            <TouchableOpacity
                style={[styles.roundedButton, style]}
                onPress={event =>
                    typeof onPress === 'function' ? onPress(event) : {}
                }>
                <View style={styles.roundedButtonWrap}>
                    {icon && <Image source={icon} style={[iconStyle]}/>}
                    <Text
                        style={[styles.roundedButtonLabel, labelStyle]}
                        adjustsFontSizeToFit>
                        {' '}
                        {label}
                    </Text>
                    {loading && (
                        <LottieView
                            source={lottie.loader}
                            style={styles.loader}
                            autoPlay
                            loop
                        />
                    )}
                </View>
            </TouchableOpacity>
        </React.Fragment>
    );
}

export function ProgressLoader({visible = false}) {
    const {theme} = useTheme();
    const styles = makeStyle(theme);
    return (
        <AnimatedLoader
            visible={visible}
            overlayColor="rgba(0,0,0,0.30)"
            source={lottie.splash}
            animationStyle={styles.lottie}
            speed={1}
        />
    );
}

export function ScreenLoader({visible = false}) {
    const {theme} = useTheme();
    const styles = makeStyle(theme);
    return (
        <React.Fragment>
            {visible && (
                <View style={styles.loader_overlay}>
                    <LottieView
                        source={lottie.splash}
                        style={styles.lottie}
                        autoPlay
                        loop
                    />
                </View>
            )}
        </React.Fragment>
    );
}

export function MiniLoader({visible = false,position='relative'}) {
    const {theme} = useTheme();
    const styles = makeStyle(theme);
    let positionStyle = {}
    switch (position) {
        case 'left':positionStyle = styles.min_loader_left;break;
        case 'right':positionStyle = styles.min_loader_right;break;
        case 'top':positionStyle = styles.min_loader_top;break;
        case 'bottom':positionStyle = styles.min_loader_bottom;break;
    }

    return (
        <React.Fragment>
            {visible && (
                <View style={[styles.mini_loader_overlay,positionStyle]}>
                    <LottieView
                        source={lottie.splash}
                        style={styles.mini_lottie}
                        autoPlay
                        loop
                    />
                </View>
            )}
        </React.Fragment>
    );
}

// EH

export function RoundCornerButton({
                                      label,
                                      onPress,
                                      style = {},
                                      iconStyle = {},
                                      icon,
                                      labelStyle,
                                      loading = false,
                                  }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleSheet.create({
        cornerButton: {
            zIndex: 20,
            backgroundColor: colors.RoundedButtonBackground,
            paddingHorizontal: 20,
            paddingVertical: 5,
            borderRadius: 10,
            minWidth: scale.ms(250, 0.3),
            margin: 5,
        },
        cornerButtonCenter: {
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
        },
        cornerButtonLeft: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
        },
        cornerButtonLabel: {
            color: colors.textPrimary,
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            textAlignVertical: 'center',
            paddingHorizontal: 5,
            fontSize: scale.font.l,
        },
        cornerButtonLoader: {height: 20, marginHorizontal: 10},
    });

    return (
        <React.Fragment>
            <Pressable
                style={[styles.cornerButton, style]}
                onPress={event =>
                    typeof onPress === 'function' ? onPress(event) : {}
                }>
                <View
                    style={icon ? styles.cornerButtonLeft : styles.cornerButtonCenter}>
                    {icon && <Image source={icon} style={[iconStyle]}/>}
                    <Text
                        numberOfLines={1}
                        style={[styles.cornerButtonLabel, labelStyle]}
                        adjustsFontSizeToFit>
                        {' '}
                        {label}
                    </Text>
                    {loading && (
                        <LottieView
                            source={lottie.loader}
                            style={styles.cornerButtonLoader}
                            autoPlay
                            loop
                        />
                    )}
                </View>
            </Pressable>
        </React.Fragment>
    );
}

export function IconTitle({icon, title, style = {},textStyle={}}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleSheet.create({
        block: {flexDirection: 'row', alignItems: 'center', marginLeft: 15},
        text: {
            color: colors.secondaryText,
            marginLeft: 5,
            fontSize: scale.font.l,
            flexShrink: 1,
        },
    });
    return (
        <View style={[styles.block, style]}>
            {icon && <ImageIcon source={icon} size={25}/>}
            <Text style={[styles.text,textStyle]} numberOfLines={1}>
                {title}
            </Text>
        </View>
    );
}

export function LineView({width = '90%', spacing = 10, color}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleSheet.create({
        midGrayLine: {
            height: 0.5,
            backgroundColor: color ? color : colors.primaryLine,
            width: width,
            justifyContent: 'center',
            alignSelf: 'center',
            marginVertical: spacing,
        },
    });
    return <View style={styles.midGrayLine}/>;
}

export function Splitter({height = 5}) {
    return <View style={{height, width: '100%'}}/>;
}

export function ContainerScroll({children, style = {}, disabled = false,scrollToTop=false}) {
    const ref = useRef()
    useEffect(()=>{
        if(disabled===false)
            ref?.current?.scrollTo({
                y: 0,
                animated: true,
            });
    },[scrollToTop])
    return disabled === true ? (
        <View style={{flex: 1}}>{children}</View>
    ) : (
        <ScrollView
            ref={ref}
            style={[
                {paddingHorizontal: '0%', alignSelf: 'center', width: '100%'},
                style,
            ]}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps={'always'}>
            <View style={{flex: 1}}>{children}</View>
        </ScrollView>
    );
}

export function GradiantButton({
                                   rightIco,
                                   leftIco,
                                   iconSize = 15,
                                   cornerRadius = 20,
                                   onPress,
                                   style = {},
                                   label = '',
                                   labelStyle = {},
                                   angle = 90,
                                   locations = [0.4, 0.8],
                                   colors = ['#ab2ceb', '#3f09f2'],
                                   children,
                                   disabled = false,
                                   borderOnly,
                                   borderStyle={},
                                   height = scale.ms(35),
                               }) {
    const styles = StyleSheet.create({
        gradiantButton: {
            borderRadius: cornerRadius,
            height: height,
        },
        gradiantButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            paddingVertical: 3,
            paddingHorizontal: 3,
            backgroundColor: borderOnly ? 'white' : 'transparent',
            margin: 1.2,
            flex: 1,
            borderRadius: cornerRadius,
        },
        gradiantButtonLabel: {
            color: borderOnly ? 'red' : 'white',
            fontSize: scale.font.s,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        defButton: {height, minWidth: scale.ms(80), marginLeft: 10},
    });

    return (
        <Pressable
            onPress={onPress}
            style={[styles.defButton, style]}
            disabled={disabled}>
            <LinearGradient
                useAngle={true}
                angle={angle}
                style={StyleSheet.flatten([styles.gradiantButton,borderStyle])}
                colors={disabled ? ['#808080', '#808080'] : colors?.length===2?colors:['#ab2ceb', '#3f09f2']}
                locations={locations}>
                <View style={styles.gradiantButtonContent}>
                    {leftIco && (
                        <ImageIcon
                            size={iconSize}
                            rounded={false}
                            source={leftIco}
                            onPress={onPress}
                        />
                    )}
                    {label.length > 0 && (
                        <Text
                            style={[styles.gradiantButtonLabel, labelStyle]}
                            adjustsFontSizeToFit>
                            {label}
                        </Text>
                    )}
                    {children}
                    {rightIco && (
                        <ImageIcon size={iconSize} rounded={false} source={rightIco} onPress={onPress}/>
                    )}
                </View>
            </LinearGradient>
        </Pressable>
    );
}

export function SnackBar({
                             visible,
                             children,
                             variant = 'info',
                             buttonLabel,
                             callback,
                         }) {
    const [visibility, setVisibility] = useState(visible);

    useEffect(() => {
        let interval;
        if (variant === 'success') {
            interval = setInterval(() => {
                setVisibility(false);
            }, 5 * 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, []);

    const style = StyleSheet.create({
        container: {
            flexDirection: 'row',
            padding: 2,
            position: 'relative',
            bottom: 0,
            zIndex: 30,
            width: '100%',
            height: 20,
            backgroundColor: 'white',
            paddingHorizontal: 10,
        },
        label: {flex: 1, textAlign: 'center', fontSize: 12},
        button: {},
        c_info: {backgroundColor: '#0568d2'},
        l_info: {color: '#fff'},
        b_info: {color: '#e8e0e2'},
        c_warning: {backgroundColor: '#d54f07'},
        l_warning: {color: '#fff'},
        b_warning: {color: '#e8e0e2'},
        c_success: {backgroundColor: '#00760b'},
        l_success: {color: '#fff'},
        b_success: {color: '#e8e0e2'},
        c_danger: {backgroundColor: '#b30c0c'},
        l_danger: {color: '#fff'},
        b_danger: {color: '#e8e0e2'},
    });
    if (visibility) {
        return (
            <View style={[style.container, style['c_' + variant]]}>
                <Text style={[style.label, style['l_' + variant]]}>{children}</Text>
                {buttonLabel && (
                    <Text
                        style={[style.button, style['b_' + variant]]}
                        onPress={() => onTrigger(callback)}>
                        {buttonLabel}
                    </Text>
                )}
            </View>
        );
    } else {
        return null;
    }
}

export function AppModal({children, visibility, onDismiss,nestedScroll=false}) {
    const [showModal, setShowModal] = useState(false);
    const keyboard = useKeyboard()
    const onInnerClick = () => {
        keyboard && Keyboard.dismiss()
    }
    const onOuterClick = () => {
        keyboard ? Keyboard.dismiss() : onTrigger(onDismiss);
    }

    useEffect(() => {
        setTimeout(() => {
            setShowModal(visibility);
        }, 500)
    }, [visibility]);


    return (
        <Modal
            transparent={true}
            onRequestClose={onOuterClick}
            visible={showModal === true}>
            {nestedScroll?
                    <KeyboardAwareScrollView nestedScrollEnabled={true}>
                        {children}
                    </KeyboardAwareScrollView>
            :
                <Pressable onPress={onInnerClick}>
                    <KeyboardAwareScrollView>
                        {children}
                    </KeyboardAwareScrollView>
                </Pressable>
            }

        </Modal>
    )
}

export const AlertBox = ({config}) => {
    const {theme, width, height} = useTheme();
    const style = alertStyle(theme, width, height);
    const button = [{label: 'ok', callback: null}];
    const initState = {
        visibility: false,
        title: 'IDEACLIP',
        message: typeof config === 'string' ? config : '',
        buttons: button,
        cancellable: true,
        autoDismiss: true,
    };
    const [alertBox, setAlertBox] = useState(initState);

    useEffect(() => {
        setAlertBox({...initState, ...config})
    }, [config])

    const onCallback = callback => {
        if (typeof callback === 'function') {
            callback();
        }
        if (alertBox?.autoDismiss === true) {
            setAlertBox(initState);
        }
    };

    const onCancel = () => {
        if (alertBox?.cancellable === true) {
            setAlertBox(initState);
        }
    };

    const renderButtons = () => {
        return alertBox?.buttons?.map((_button, index) => {
            const trigger = () => onCallback(_button?.callback)
            return (
                <Text
                    key={index}
                    style={style.button}
                    onPress={trigger}>
                    {_button.label}
                </Text>
            );
        });
    };
    return (
        <Modal
            key="alert"
            transparent={true}
            onDismiss={onCancel}
            onTouchCancel={onCancel}
            onRequestClose={onCancel}
            hardwareAccelerated={true}
            visible={alertBox?.visibility === true}>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={style.wrap}>
                    <View style={style.container}>
                        <View style={style.titleContainer}>
                            <Image style={style.logo} source={appLogo.min}/>
                            <Text style={style.title}> {alertBox?.title}</Text>
                        </View>
                        <Text style={style.message}>{alertBox?.message}</Text>
                        <View style={style.buttonBar}>{renderButtons()}</View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
};


export const AnimatedTouchable = (props) => {
    const animated = new Animated.Value(1);
    const fadeIn = () => {
        Animated.timing(animated, {
            toValue: 0.4,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };
    const fadeOut = () => {
        Animated.timing(animated, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable onPressIn={fadeIn} onPressOut={fadeOut} {...props}>
            <Animated.View
                style={{
                    opacity: animated,
                    borderRadius: 30,
                }}
            >
                {props.children}
            </Animated.View>
        </Pressable>
    );
};
AnimatedTouchable.propTypes = {
    onPress: PropTypes.func.isRequired
}