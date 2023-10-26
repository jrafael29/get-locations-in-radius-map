import Controls from "./controls.js";
import Map from "./map.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { websocketHandle } from "./websocket-handle.js";

const socket = io("ws://127.0.0.1:3010", {
  transports: ["websocket"],
});

const LAT_INIT_DEFAULT = -8.335061287686178;
const LNG_INIT_DEFAULT = -35.74797464584551;

const VIEW_RADIUS_DEFAULT = 15

const localStorageKeys = {
    selfLat: "self-lat",
    selfLng: "self-lng",
    selfRadius: "self-radiusInKM",
    choseTypeService: "self-typeService"
}

function getUserLocation(map) {
  if ("geolocation" in navigator) {
    // O navegador suporta a API de geolocalização
    navigator.geolocation.getCurrentPosition(function (position) {
      // `position` contém as informações de localização
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      localStorage.setItem("self-lat", latitude);
      localStorage.setItem("self-lng", longitude);
      const choseTypeService = localStorage.getItem("self-typeService")

      map.updateMap({ lat: latitude, lng: longitude, radiusInKm: 0, key: choseTypeService})
      map.setView({lat: latitude, lng: longitude, viewRadius: 16})
      // Agora, você pode usar `latitude` e `longitude` como quiser
    });
  } else {
    // O navegador não suporta a API de geolocalização
    console.log("Geolocalização não suportada no seu navegador");
  }
}

function clearLocalStorage(){
    const storageKeys = Object.values(localStorageKeys)
    storageKeys.map(key => {
        localStorage.removeItem(key);
    })
}

async function onload() {
  const map = new Map(socket);
  websocketHandle(socket, map);

  getUserLocation(map)

  clearLocalStorage();

  const controls = new Controls(socket, map);
  controls.onChangeSelectRange();
  controls.onClickButtonStoreLocation();
  controls.onClickButtonUpdateMap();
  controls.onChangeSelectTypeService();


  const selfLat = localStorage.getItem("self-lat");
  const selfLng = localStorage.getItem("self-lng");
  const radiusInKm = localStorage.getItem("self-radiusInKM")
  const choseTypeService = localStorage.getItem("self-typeService")


  if(selfLat && selfLng && !isNaN(radiusInKm) && choseTypeService){
    map.init({ lat: selfLat, lng: selfLng , viewRadius: VIEW_RADIUS_DEFAULT});
    map.updateMap({
      lat: selfLat, 
      lng: selfLng, 
      radiusInKm: radiusInKm,
      key: choseTypeService
    })
    return true;
  }
  map.init({ lat: LAT_INIT_DEFAULT, lng: LNG_INIT_DEFAULT , viewRadius: 5});
  return true;
  
}

window.onload = onload;
