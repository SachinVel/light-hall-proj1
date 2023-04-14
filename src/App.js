import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, query, collection, getDocs, onSnapshot } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { List, ListItem } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';


import './App.css';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Alert from '@mui/material/Alert';

import './App.css';
import "leaflet/dist/leaflet.css";


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


function App() {

  const [totalCount, setTotalCount] = useState(null);
  const [markerArr, setMarkerArr] = useState([]);
  const [isLocationSupported, setIsLocationSupported] = useState(true);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);


  const firebaseConfig = {
    apiKey: "AIzaSyDJjiMhDEeosN2FHc1TIC4mrWeHuCS_i2s",
    authDomain: "lighthall-134f1.firebaseapp.com",
    projectId: "lighthall-134f1",
    storageBucket: "lighthall-134f1.appspot.com",
    messagingSenderId: "698904814410",
    appId: "1:698904814410:web:89614660c0d088150757b3",
    measurementId: "G-GZQTRBPK4X"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const counterRef = doc(db, "clickInfo", "counter");

  const centerPos = [47.116386, -101.299591];


  onSnapshot(doc(db, "clickInfo", "counter"), (doc) => {
    let newCount = doc.data().totalClicks;
    setTotalCount(newCount);
  });

  const onSuccessLocation = (position) => {

    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    latitude = Math.trunc(latitude * 100) / 100;
    longitude = Math.trunc(longitude * 100) / 100;
    setLat(latitude);
    setLong(longitude);

  }

  const onErrorLocation = (position) => {
    setIsPermissionDenied(true);
  }

  const fetchGeoData = async () => {
    const q = query(collection(db, "geoData"));

    const querySnapshot = await getDocs(q);
    let curArr = [];
    await querySnapshot.forEach((doc) => {
      let curData = doc.data();
      curData.id = doc.id;
      curArr.push(curData);
    });
    setMarkerArr(curArr);

  }


  useEffect(() => {

    let firebaseConfig = {
      apiKey: "AIzaSyDJjiMhDEeosN2FHc1TIC4mrWeHuCS_i2s",
      authDomain: "lighthall-134f1.firebaseapp.com",
      projectId: "lighthall-134f1",
      storageBucket: "lighthall-134f1.appspot.com",
      messagingSenderId: "698904814410",
      appId: "1:698904814410:web:89614660c0d088150757b3",
      measurementId: "G-GZQTRBPK4X"
    };
    let app = initializeApp(firebaseConfig);
    let db = getFirestore(app);
    let counterRef = doc(db, "clickInfo", "counter");

    const getClickInfo = async () => {
      const docSnap = await getDoc(counterRef);
      let data = docSnap.data();
      setTotalCount(data.totalClicks);
    }

    const fetchGeoDatas = async () => {
      const q = query(collection(db, "geoData"));

      const querySnapshot = await getDocs(q);
      let curArr = [];
      querySnapshot.forEach((doc) => {
        let curData = doc.data();
        curData.id = doc.id;
        curArr.push(curData);
      });
      setMarkerArr(curArr);

    }

    if (!navigator.geolocation) {
      setIsLocationSupported(false);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation);
    }

    getClickInfo();
    fetchGeoDatas();

  }, []);

  const handleIncreaseCounter = async () => {

    const docSnap = await getDoc(counterRef);
    let data = docSnap.data();
    let newCount = data.totalClicks + 1;
    setDoc(counterRef, {
      totalClicks: data.totalClicks + 1
    });
    setTotalCount(newCount);

    if (isLocationSupported && !isPermissionDenied && lat !== null && long !== null) {
      let curLocDocId = 'A' + lat + 'B' + long;
      let locRef = doc(db, "geoData", curLocDocId);
      const locSnap = await getDoc(locRef);

      if (locSnap.exists()) {
        let curData = locSnap.data();
        curData.clicks = curData.clicks + 1;
        setDoc(locRef, curData);
      } else {
        let curData = {
          lat: lat,
          long: long,
          clicks: 1
        };
        setDoc(locRef, curData);
      }

      await fetchGeoData();

      console.log('curid : ', curLocDocId);
      document.getElementById(curLocDocId).click();

    }

  }

  return (
    <div className="App">

      <Box className='list-container'>
        <List  className='submit-list' >
          <ListItem sx={{
            fontSize: "20px",
            fontWeight: "bold"
          }}>Submitted by : </ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/> Name : Sachin Velmurugan</ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>Email : velsachin98@gmail.com</ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>Portfolio : &nbsp;<a href='https://sachinvel.github.io/portfolio/'>link</a></ListItem>
        </List>
        <List  className='note-list'>
          <ListItem sx={{
            fontSize: "20px",
            fontWeight: "bold"
          }}>Notes : </ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>Click on marker to view how many clicks occured in that area.</ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>If you can't find your current marker. zoom in to find.</ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>Counter is updated real time. Increasing counter somewhere will reflect here without refreshing.</ListItem>
          <ListItem><CircleIcon sx={{ fontSize :'10px', marginRight:"5px"}}/>Mobile Friendly</ListItem>
        </List>
        
      </Box>
      {
        totalCount !== null &&
        <Box className="counter-container">
          <Typography sx={{
            fontSize: "30px",
            color: "red"
          }}>{totalCount}</Typography>
          <br></br>
          {<Button variant='contained' onClick={() => { handleIncreaseCounter() }}>Increase Counter</Button>}
        </Box>
      }

      {
        (!isLocationSupported || isPermissionDenied) &&
        <>
          <Alert severity="error">Unable to collect location data : change browser or allow location permision.</Alert>
          <br></br>
          <br></br>
        </>

      }

      <MapContainer center={centerPos} zoom={3} scrollWheelZoom={false} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          markerArr.length > 0 &&
          markerArr.map((loc) => {
            let position = [loc.lat, loc.long];
            let clickInfo = 'Clicks : ' + loc.clicks;
            return (

              <Marker position={position} key={position} id={loc.id}>
                <Popup>{clickInfo}</Popup>
              </Marker>
            )
          })
        }
      </MapContainer>



    </div>
  );
}

export default App;
