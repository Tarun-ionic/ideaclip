import React, {useEffect, useRef, useState} from 'react';
import {Image, Linking, Pressable, Text, View} from 'react-native';
import {useIsFocused} from "@react-navigation/native";
import {getLinkPreview} from "link-preview-js";
import LottieView from "lottie-react-native";
import {lottie} from "../../utilities/assets";
import apolloLib from "../../lib/apolloLib";
import {useSession} from "../../context/SessionContext";
import {queries} from "../../schema";
import logger from "../../lib/logger";

const noPreview = require('./assets/noPreview.png');

const UrlPreview = ({
                        url = "",
                        linkPreview = {},
                        containerStyle = {},
                        textStyle = {},
                        imageStyle = {},
                        titleStyle = {},
                        descriptionStyle = {},
                        size,
                        fetchData = false,
                        chatSpace = false
                    }) => {
    const isFocused = useIsFocused()
    const [data, setData] = useState({url: "", image: "", title: "", description: ""})
    const [noData, setNoData] = useState(false)
    const [loading, setLoading] = useState(false)
    const [iLoading, setILoading] = useState(false)
    const session = useSession();

    const defStyles = {
        loader: {
            height: 40,
            width: 40,

        },
        containerStyle: {
            marginTop: 10,
            backgroundColor: 'rgba(200, 200, 200,0.62)',
            borderRadius: 10,
            height: size,
            width: size,
        },
        imageContainerStyle: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            width: '100%',
            flex: 1,
            overflow: 'hidden'
        },
        imageStyle: {
            backgroundColor: 'transparent',
            flex: 1,
            width: '100%',
            resizeMode:'contain'
        },  imageStyle2: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: 'transparent',
            flex: 1,
            width: '100%',
            resizeMode:'cover'
        },
        textContainerStyle: {
            marginHorizontal: 5,
            marginVertical: 5,
        },
        descriptionStyle: {
            color: 'black',
            marginTop: 4,
            fontSize: 12
        },
        titleStyle: {
            color: 'black',
            fontWeight: 'bold',
            fontSize: 13
        },
    }
    const getMetaData=()=>{
        if(isFocused) {
            let trimmedLink = url.trim().toLowerCase();
            let URL =
                trimmedLink.length > 8 && trimmedLink.substring(0, 8).toLowerCase() === 'https://'
                    ? trimmedLink
                    : trimmedLink.length > 8 && trimmedLink.substring(0, 7).toLowerCase() === 'http://'
                        ? trimmedLink
                        : `https://${trimmedLink}`;
                    getLinkPreview(URL,{
                        headers:{'user-agent': 'googlebot'}
                    }).then((data) => {
                    const {images,description,title} = data
                    const newData = {
                        url:URL,
                        image:images?.length > 0 ? {uri:images[0]}:noPreview,
                        title:title||"",
                        description:description||""
                    }
                    setNoData(false)
                    setData({...newData})
                    setLoading(false)
                        if(chatSpace){
                            fetchURLData()
                        }
                }
            ).catch(err => {
                setData({
                    url:URL,
                    image: noPreview,
                    title: "",
                    description: ""
                })
                setLoading(false)
                setNoData(true)
                console.log("err ", err)
                console.log("url ", URL)
            })
        }
    }

    const fetchURLData=()=> {
        if (isFocused) {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getURLPreview,
                    variables: {
                        url: url,
                    },
                })
                .then(({data}) => {
                    const {getURLPreview} = data
                    const {description,image,title,url} = getURLPreview
                    let trimmedLink = url.trim().toLowerCase();
                    let URL =
                        trimmedLink.length > 8 && trimmedLink.substring(0, 8).toLowerCase() === 'https://'
                            ? trimmedLink
                            : trimmedLink.length > 8 && trimmedLink.substring(0, 7).toLowerCase() === 'http://'
                                ? trimmedLink
                                : `https://${trimmedLink}`;
                    const newData = {
                        url:URL,
                        image:image?.length>0? {uri:image}:noPreview,
                        title:title||"",
                        description:description||""
                    }
                    setData({...newData})
                })
                .catch(err => {
                    logger.e(err);
                });
        }
    }

    useEffect(() => {
        if (isFocused) {
            if (linkPreview?.url?.length > 0) {
                if (data?.url !== linkPreview.url) {
                    setData({...linkPreview, image:linkPreview.image?.length>0? {uri:linkPreview.image}:noPreview})
                }
            } else {
                if (url && fetchData) {
                    setLoading(true)
                    getMetaData()
                }
            }
        }
    }, [isFocused])
    const navigate = () => {
        Linking.canOpenURL(data?.url).then(()=>{
            Linking.openURL(data?.url).then( );
        })
    }

    const imagePreview = () => {
        return (
            <Pressable style={defStyles.imageContainerStyle} onPress={navigate}>
                {data?.image !== '' &&
                    <Image source={data?.image}
                            style={[data?.image !== noPreview ? defStyles.imageStyle: defStyles.imageStyle2, imageStyle, (iLoading) && {opacity: 0}]}
                            onLoadStart={() => {
                                setILoading(true)
                            }}
                            onLoad={() => {
                                setILoading(false)
                            }}
                            onLoadEnd={() => {
                                setILoading(false)
                            }}
                            onError={() => {
                                setData(s => ({...s, image: noPreview}))
                                setILoading(false)
                            }}
                    />
                }
                {(iLoading || loading) &&
                <View style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100
                }}>
                    <LottieView source={lottie.loader} autoPlay={true} loop={true} style={defStyles.loader}/>
                </View>
                }
            </Pressable>
        )
    }

    const textPreview = () => {
        return (
            <View style={[defStyles.textContainerStyle]}>
                <Text style={[defStyles.titleStyle, titleStyle]} numberOfLines={2} onPress={() => {
                    navigate()
                }}>
                    {data?.title}
                </Text>
                <Text style={[defStyles.descriptionStyle, descriptionStyle]} onPress={() => {
                    navigate()
                }} numberOfLines={3}>
                    {data?.description}
                </Text>
            </View>
        )
    }
    if (linkPreview?.url?.length>0 || (url && fetchData && !noData)) {
        return (<Pressable style={[defStyles.containerStyle, containerStyle]} onPress={() => {
                if (!loading) {
                    navigate()
                }
            }}>
                {imagePreview()}
                {textPreview()}
            </Pressable>
        )
    } else
        return (<></>)

}
export default React.memo(UrlPreview);