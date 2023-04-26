// noinspection NpmUsedModulesInstalled

import {ApolloClient, ApolloLink, createHttpLink, InMemoryCache,} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {Platform} from 'react-native';
import apiConstant from '../constant/apiConstant';
import {onError} from '@apollo/client/link/error';
import logger from './logger';
import {API_BASE_PATH} from '@env';
import {uncrunch} from 'graphql-crunch';
import auth from '@react-native-firebase/auth';
import {userStatus} from "../utilities/constant";

const uri = `${API_BASE_PATH}gql`;
const httpLink = createHttpLink({
    uri: uri,
});


const authLink = setContext(async _ => {
    const authToken = await auth()?.currentUser?.getIdToken();
    return {
        headers:
            Platform.OS === 'ios'
                ? {
                    ...apiConstant.iosHeader,
                    'idea-clip-x-auth-token': authToken,
                }
                : {
                    ...apiConstant.androidHeader,
                    'idea-clip-x-auth-token': authToken,
                },
    };
});

const logError = session =>
    onError(({graphQLErrors, networkError, operation}) => {
        if (networkError) {
            logger.e(
                '\nnetworkError url',
                uri,
                operation.query.definitions[0].operation,
                operation.operationName,
            );
            logger.e('networkErrorr', networkError, '\n\n');
            if (networkError.toString().includes('status code 409')) {
                if (session && typeof session.kickOut === 'function') {
                    session.kickOut(userStatus.disabled);
                }
            } else {
                if (networkError.toString().includes('status code 410')) {
                    if (session && typeof session.kickOut === 'function') {
                        session.kickOut(userStatus.archived);
                    }
                }
            }
        }
        if (graphQLErrors) {
            logger.e(
                '\n graphQLErrors url',
                uri,
                operation.query.definitions[0].operation,
                operation.operationName,
            );
            logger.e('graphQLErrors', JSON.stringify(graphQLErrors), '\n\n');
        }
    });

const logResponse = new ApolloLink((operation, forward) => {
    logger.l(
        '\nrequest url',
        uri,
        operation.query.definitions[0].operation,
        operation.operationName,
    );
    logger.l('request variables', operation);  //operation.variables
    return forward(operation).map(response => {
        logger.r(
            '\nresponse url',
            uri,
            operation.query.definitions[0].operation,
            operation.operationName,
        );
        response.data = uncrunch(response.data);
        logger.r('response data', JSON.stringify(response));
        return response;
    });
});

const client = session =>
    new ApolloClient({
        link: logError(session).concat(
            logResponse.concat(authLink.concat(httpLink)),
        ),
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                errorPolicy: 'all',
            },
            mutate: {
                errorPolicy: 'all',
            },
        },
    });

const apolloLib = {client};
export default apolloLib;
