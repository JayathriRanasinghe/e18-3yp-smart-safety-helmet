import React, { useEffect, useState } from "react";
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { DashboardLayout } from "../components/dashboard-layout";
import { Box, Container, Grid, Button, Typography } from "@mui/material";
import { Google as GoogleIcon } from "../icons/google";
import axios from "axios";

const containerStyle = {
  width: "auto",
  height: "480px",
};

const markers = [
  {
    id: 1,
    name: "Jeewantha Udeshika",
    position: { lat: 36.265095, lng: -115.236933 },
  },
  {
    id: 2,
    name: "Ishan Maduranga",
    position: { lat: 36.265052, lng: -115.236364 },
  },
  {
    id: 3,
    name: "Tharindu Chamod",
    position: { lat: 36.264941, lng: -115.236773 },
  },
  {
    id: 4,
    name: "Lakshan Wijekoon",
    position: { lat: 36.265248, lng: -115.237256 },
  },
];
const mapControls = {
  panControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
};

function Map() {
  const [activeMarker, setActiveMarker] = useState(null);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  useEffect(() => {
    async function getData() {
      // Send the application data to the backend
      const res = await axios({
        method: "GET",
        url: "https://dog.ceo/api/breeds/image/random",
      });

      console.log(res);
    }

    getData();
  }, []);

  const handleOnLoad = (map) => {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach(({ position }) => bounds.extend(position));
    map.fitBounds(bounds);
  };

  const { isLoaded } = useJsApiLoader({
    mapId: process.env.MAP_ID,
    googleMapsApiKey: process.env.MAPS_API_KEY, // Add your API key
  });

  return isLoaded ? (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <GoogleMap
            mapContainerStyle={containerStyle}
            zoom={50}
            options={mapControls}
            onLoad={handleOnLoad}
          >
            {/* {<Marker position={center} />} */}
            {markers.map(({ id, name, position }) => (
              <Marker key={id} position={position} onClick={() => handleActiveMarker(id)}>
                {activeMarker === id ? (
                  <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                    <div>{name}</div>
                  </InfoWindow>
                ) : null}
              </Marker>
            ))}
          </GoogleMap>
        </Container>
      </Box>

      {/* <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Button
            color="error"
            fullWidth
            // onClick={handleClick}
            size="large"
            startIcon={<GoogleIcon />}
            variant="contained"
          >
            Login with Google
          </Button>
        </Grid>
      </Grid> */}
    </>
  ) : (
    <></>
  );
}

Map.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Map;