import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {useTheme} from 'context/ThemeContext';
import {strings} from 'constant/strings';
import {LineView} from '../../../system/ui/components';
import SearchBar from '../../components/toolbar/searchBar';
import scale from '../../../utilities/scale';

export default function PersonalSearchBar({
                                              title,
                                              placeHolder,
                                              onSearch,
                                              searchObj,
                                          }) {
    const {theme} = useTheme();
    const styles = searchStyleSheet(theme);
    const [state, setState] = useState(searchObj ? searchObj : {keyword: ''});
    const onChange = text => {
        setState(s => ({...s, keyword: text}));
    };

    const handleSearch = () => {
        onSearch(state);
    };

    return (
        <React.Fragment>
            <Text style={styles._viewTitle}>{title}</Text>
            <SearchBar
                placeHolder={
                    placeHolder ? placeHolder : strings.collabSpaceSearchPlaceHolder
                }
                onChange={onChange}
                defValue={searchObj ? searchObj.keyword : state.keyword}
                onSearch={handleSearch}
            />
            <LineView spacing={7}/>
        </React.Fragment>
    );
}

const searchStyleSheet = ({colors}) =>
    StyleSheet.create({
        _viewTitle: {
            fontSize: scale.font.s,
            color: colors.secondaryDark,
            paddingTop: 5,
            width: '90%',
            marginHorizontal: '5%',
            marginBottom: 10,
        },
    });
