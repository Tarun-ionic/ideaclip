import React, {useEffect, useRef, useState} from 'react';
import flashDealStyle from './assets/style';
import FastImage from 'react-native-fast-image';
import {logger} from '../../../index';
import deal from './assets/flashdeal.png';
import dealEnd from './assets/flashdealEnd.png';
import {Text, View} from 'react-native';
import Moment from 'moment';
import {strings} from '../../../constant/strings';
import {useTheme} from '../../../context/ThemeContext';

const FlashDeal = ({item, offset, size}) => {
    const {theme} = useTheme();
    const styles = flashDealStyle(theme, offset, size);
    const Ref = useRef(null);
    const [timer, setTimer] = useState({isClose: false, time: ''});
    const [timerSet, setTimerSet] = useState(0);

    useEffect(() => {
        const mounted = true
        if (mounted) {
            const timestamp = Moment(parseInt(item.createdOn))
                .add(parseInt(item.duration) || 0, 's')
                .local()
                .valueOf();
            setTimerSet(timestamp)
        }
    }, [item])

    const time2Array = (time) => {
        const r = {total: time};
        const s = {
            hour: 3600,
            minute: 60,
            second: 1,
        };

        Object.keys(s).forEach(function (key) {
            r[key] = Math.floor(time / s[key]);
            time -= r[key] * s[key];
        });
        const {hour, minute, second} = r
        r["timeString"] = (hour > 9 ? hour : '0' + hour) +
            ':' +
            (minute > 9 ? minute : '0' + minute) +
            ':' +
            (second > 9 ? second : '0' + second) +
            ' ' + strings.pc_timeLeft
        return r;
    }


    const startTimer = dateFuture => {
        const {total, timeString} = time2Array(Moment(dateFuture).local().diff(Moment().local(), 'seconds'));
        if (total >= 0 && item.isPublished === true) {
            setTimer({
                isClose: false,
                time: timeString,
            });
        } else if (item.isPublished !== true || item.cache === true) {
            const initTime = time2Array(parseInt(item.duration) || 0);
            setTimer({isClose: false, time: initTime.timeString});
        } else {
            setTimer({isClose: true, time: '00:00:00'});
        }
    };


    // mount only
    useEffect(() => {
        let mount = true
        setTimer({isClose: false, time: ''});
        if (Ref.current) {
            clearInterval(Ref.current);
        }

        Ref.current = setInterval(() => {
            mount && startTimer(timerSet);
        }, 1000);

        return () => {
            mount = false
            Ref.current && clearInterval(Ref.current);
        }
    }, [timerSet]);

    return (
        <View style={styles.flashView}>
            <FastImage
                style={styles.flashImage}
                source={timer.isClose === false ? deal : dealEnd}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => logger.e('ImageIcon', error)}
            />
            {timer.isClose === false &&
            <Text style={styles.flashTimer}>
                {timer.isClose ? strings.pc_timeEnd : timer?.time}
            </Text>
            }
        </View>
    );
};

export default FlashDeal;
