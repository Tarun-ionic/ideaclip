import React, {useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {CardStyleInterpolators, createStackNavigator,} from '@react-navigation/stack';
import {
    BusinessSetupPage,
    CharitySetupPage,
    CreateUser,
    ForgetPassword,
    InitializeUser,
    InitialSetupPage,
    Landing,
    LoginPage,
    PhoneOTP,
    Questionnaire,
    QuestionnaireLoader,
    SignUp,
    Splash,
} from './authStack';
import PlacePicker from './map/placePicker';
import TermsAndCondition from './about/terms';
import PrivacyPolicy from './about/privacy.policy';
import ClipCoSpace from '../screens/co_space/clipCoSpace';
import Notification from '../screens/notification/notification';
import Followers from './profile/followers';
import Following from './profile/following';
import Settings from './settings/settings';
import ChangePassword from './settings/ChangePassword';
import MessengerUsers from '../screens/messenger/messengerUsers';
import MessengerChat from '../screens/messenger/messengerChat';
import PersonalSpace from '../screens/space/personalSpace';
import CollabSpaceSplash from '../screens/space/collabSpaceSplash';
import CollabSpace from '../screens/space/collabSpace';
import CollabSearch from '../screens/space/collabSearch';
import MostLovitsSpace from '../screens/co_space/mostLovitsSpace';
import CoSpaceSearch from '../screens/co_space/coSpaceSearch';
import PersonalSearch from '../screens/space/personalSearch';
import Reported from '../screens/reporting/reported';
import ReportedClip from '../screens/reporting/reportedClip';
import CoSpaceSplash from '../screens/co_space/coSpaceSplash';
import LovitzList from '../screens/space/components/lovitzList';
import CollabSettingsPage from '../screens/space/components/collabSettingsPage';
import IdeanGalleryView from "../screens/space/ideanGalleryView";
import noNetwork from "../screens/connection/noNetwork";
import Intro from "../screens/connection/Intro";
import BlockedUserList from '../screens/space/userBlocking/blockedUserList';
import MinimalInitialize from "./authStack/signup/minimalInitialize";
import PointziReact from "pointzi-react";


const Stack = createStackNavigator();
const options = {
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
};
export default function AppContainer() {
const navigationRef = useRef()
const routeNameRef = useRef()
    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name}
            onStateChange={() => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = navigationRef.current?.getCurrentRoute()?.name
                console.log("previousRouteName ",previousRouteName)
                console.log("currentRouteName ",currentRouteName)
                if (previousRouteName !== currentRouteName) {
                    // Let Contextual know about the change
                    PointziReact.viewWillRender(currentRouteName);
                }

                // Save the current route name for later comparision
                routeNameRef.current = currentRouteName;
            }}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{headerMode: 'none', headerShown: false}}>
                <Stack.Screen options={options} name="Splash" component={Splash}/>
                <Stack.Screen options={options} name="Landing" component={Landing}/>
                <Stack.Screen name="Register" component={SignUp}/>
                <Stack.Screen name="Login" component={LoginPage}/>
                <Stack.Screen name="TermsAndConditions" component={TermsAndCondition}/>
                <Stack.Screen name="PhoneOtp" component={PhoneOTP}/>
                <Stack.Screen name="ResetPassword" component={ForgetPassword}/>
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy}/>
                <Stack.Screen name="noNetwork" component={noNetwork}/>

                <Stack.Screen name="PlacePicker" component={PlacePicker}/>
                <Stack.Screen name="InitialSetup" component={InitialSetupPage}/>
                <Stack.Screen name="Initial" component={MinimalInitialize}/>
                <Stack.Screen name="LovitzList" component={LovitzList}/>
                <Stack.Screen
                    name="InitialSetupBusiness"
                    component={BusinessSetupPage}
                />
                <Stack.Screen name="InitialSetupCharity" component={CharitySetupPage}/>
                <Stack.Screen name="CreateUser" component={CreateUser}/>
                <Stack.Screen name="InitializeUser" component={InitializeUser}/>

                <Stack.Screen name="Intro" component={Intro}/>
                <Stack.Screen name="Questionnaire" component={Questionnaire}/>
                <Stack.Screen
                    name="IdeanGalleryView"
                    component={IdeanGalleryView}
                />

                <Stack.Screen name="ChangePassword" component={ChangePassword}/>
                <Stack.Screen name="Following" component={Following}/>
                <Stack.Screen name="Followers" component={Followers}/>
                <Stack.Screen name="BlockedUsers" component={BlockedUserList}/>
                <Stack.Screen name="Settings" component={Settings}/>
                <Stack.Screen
                    name="QuestionnaireLoader"
                    component={QuestionnaireLoader}
                    initialParams={{isUser: true}}
                />

                <Stack.Screen name="Notification" component={Notification}/>

                {/*Reporting*/}
                <Stack.Screen name="Reported" component={Reported}/>
                <Stack.Screen name="ReportedClip" component={ReportedClip}/>

                {/*Messenger*/}
                <Stack.Screen name="MessengerUsers" component={MessengerUsers}/>
                <Stack.Screen name="MessengerChat" component={MessengerChat}/>

                {/*Space*/}
                <Stack.Screen name="PersonalSpace" component={PersonalSpace}/>
                <Stack.Screen
                    name="CollabSpaceSplash"
                    options={options}
                    component={CollabSpaceSplash}
                />
                <Stack.Screen name="CollabSpace" component={CollabSpace}/>
                <Stack.Screen
                    name="CollabSpaceSettings"
                    component={CollabSettingsPage}
                />
                <Stack.Screen name="CollabSearch" component={CollabSearch}/>
                <Stack.Screen name="ClipCoSpace" component={ClipCoSpace}/>
                <Stack.Screen name="MostLovitsSpace" component={MostLovitsSpace}/>
                <Stack.Screen name="CoSpaceSearch" component={CoSpaceSearch}/>
                <Stack.Screen name="PersonalSearch" component={PersonalSearch}/>
                <Stack.Screen name="coSpaceSplash" component={CoSpaceSplash}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
