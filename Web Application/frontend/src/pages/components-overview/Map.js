import { useEffect, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader, Circle, GroundOverlay } from '@react-google-maps/api';
import { Box, Container, Button, Grid } from '@mui/material';
import axios from 'axios';

//toast container
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//import assests
// import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import config from 'firebaseConfig';

const containerStyle = {
    width: 'auto',
    height: '480px'
};

// const markers = [
//     {
//         id: 1,
//         Name: 'Jeewantha Udeshika',
//         Tempurature: '29',
//         position: { lat: 6.928939, lng: 79.834294 }
//     },
//     {
//         id: 2,
//         name: 'Ishan Maduranga',
//         temperature: '32',
//         position: { lat: 6.928896, lng: 79.833564 }
//     },
//     {
//         id: 3,
//         name: 'Tharindu Chamod',
//         temperature: '24',
//         position: { lat: 6.929621, lng: 79.830603 }
//     }
// ];

//Map controls
const mapControls = {
    panControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    // zoomControl: false
    scrollWheel: false
};

const CircleOptions = {
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.3,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.1,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 10,
    zIndex: 1
};

const bounds = {
    north: 6.941293,
    south: 6.925233,
    west: 79.822749,
    east: 79.841718
};

const Map = () => {
    // Navigator
    const navigate = useNavigate();

    const [activeMarker, setActiveMarker] = useState(null);

    const [isMounted, setIsMounted] = useState(false);

    //get the markers
    const [state, setState] = useState({
        result: []
    });

    const [currentcenter, setCurrentCenter] = useState({
        result: { lat: 6.933966, lng: 79.832577 }
    });

    const handleActiveMarker = (marker) => {
        if (marker === activeMarker) {
            return;
        }
        setActiveMarker(marker);
    };

    //when you click on the marker
    const handleClick = (marker) => {
        navigate('/userstats', {
            state: marker.userName
        });
    };

    //notify the error
    const showError = (err) => {
        toast.error(err, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
        });
    };

    const showSuccess = (msg) => {
        toast.success(msg, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
        });
    };

    //notify handle
    const handleNotify = async () => {
        try {
            const result = await axios({
                baseURL: 'https://us-central1-smart-helmet-74616.cloudfunctions.net/SupervisorHelmet/notify',
                method: 'GET'
            });

            // console.log(result);
            showSuccess(result.data);
        } catch (err) {
            // console.log(err);
            showError(err.message);
        }
    };

    const [time, setTime] = useState({
        response: 1
    });

    //delay function
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    useEffect(() => {
        async function getData() {
            // console.log(res);
            firebase.initializeApp(config);

            //checks whether a user is successfully logged in or not
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    //if there is logged user already
                    //navigate to dashboard
                    setIsMounted(true);
                    navigate('/dashboard');
                    try {
                        const res = await axios({
                            method: 'GET',
                            url: `${process.env.REACT_APP_API_URL}/getSensors`
                        });

                        console.log(res.data);
                        setState({ ...state, result: res.data });

                        // console.log(state.result);
                    } catch (err) {
                        console.log(err.response);
                    }

                    // ...
                } else {
                    // User is signed out
                    // No user is signed in.
                    // console.log('No User Signed In');

                    //if there is no logged user go to login
                    navigate('/login');
                }
            });

            await delay(5000);
            setTime({ ...time, response: !time.response });

            // console.log('Map loaded');
        }

        getData();
    }, []);

    const handleOnLoad = (map) => {
        const bounds = new google.maps.LatLngBounds();
        state.result.forEach(({ Position }) => {
            bounds.extend(Position);
            // map.setCenter(Position);
            // map.setZoom(3);
        });
        // map.fitBounds(bounds);
    };

    const { isLoaded } = useJsApiLoader({
        mapId: process.env.REACT_APP_MAP_ID,
        googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY
    });

    return isLoaded ? (
        <>
            <ToastContainer />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        zoom={17}
                        options={mapControls}
                        onLoad={handleOnLoad}
                        center={currentcenter.result}
                    >
                        {/* {<Marker position={center} />} */}
                        {state.result.map((marker) => (
                            // <Marker key={id} position={position} onClick={() => handleActiveMarker(id)}>
                            //     {activeMarker === id ? (
                            //         <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                            //             <div>{name}</div>
                            //         </InfoWindow>
                            //     ) : null}
                            // </Marker>
                            <>
                                <Circle
                                    // key={uuid()}
                                    center={marker.Position}
                                    options={CircleOptions}
                                    visible={marker.Tempurature * 1 > 28 ? true : false}
                                ></Circle>
                                {isMounted && (
                                    <MarkerF
                                        key={marker.id != undefined ? marker.id : marker.Name}
                                        position={marker.Position}
                                        animation={
                                            marker.Tempurature * 1 > 28 ||
                                            marker.Noice_Level === 'unsafe' ||
                                            marker.Gas_Level === 'unsafe' ||
                                            marker.Vibration_Level === 'unsafe'
                                                ? window.google.maps.Animation.BOUNCE
                                                : null
                                        }
                                        onMouseOver={() => handleActiveMarker(marker.id != undefined ? marker.id : marker.Name)}
                                        onMouseOut={() => setActiveMarker(null)}
                                        onClick={() => handleClick(marker)}
                                    >
                                        {activeMarker === (marker.id != undefined ? marker.id : marker.Name) ? (
                                            <InfoWindowF
                                                onCloseClick={() => {
                                                    setActiveMarker(null);
                                                    setCurrentCenter(position);
                                                }}
                                            >
                                                <div>
                                                    <h3>{marker.Name}</h3>
                                                </div>
                                            </InfoWindowF>
                                        ) : null}
                                    </MarkerF>
                                )}
                                <GroundOverlay key={'url'} url="https://i.imgur.com/T7nHzB8.jpeg" bounds={bounds} />
                            </>
                        ))}
                    </GoogleMap>
                </Container>
            </Box>
            <Grid container justifyContent="center">
                <Box component="main" textAlign="center">
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{ width: 400 }}
                        style={{ backgroundColor: '#FF0000' }}
                        onClick={handleNotify}
                    >
                        Notify All
                    </Button>
                </Box>
            </Grid>
        </>
    ) : (
        <></>
    );
};

export default Map;
