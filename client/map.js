
export default class Map {
  map;
  markers;
  marker;
  circle;
  markerGroup;
  iconsUrl = {
    car: "https://cdn1.iconfinder.com/data/icons/family-life-flat/340/car_vehicle_transportation_automobile_transport_auto_automotive-256.png",
    tree: "https://cdn1.iconfinder.com/data/icons/city-flat-2/512/spherical_nature_tree_park_plant-256.png",
    motorcycle: "https://cdn3.iconfinder.com/data/icons/font-awesome-solid/640/motorcycle-256.png",
    bus: "https://cdn1.iconfinder.com/data/icons/city-flat-2/512/bus_transport_transportation_travel_vehicle_public-256.png",
    store: "https://cdn1.iconfinder.com/data/icons/city-flat-2/512/urban_city_shop_sale_purchase_shopping_store-256.png"
  };

  constructor(socket) {
    this.socket = socket;
  }

  init({ lat, lng, viewRadius = 14 }) {
    this.map = L.map("map").setView([lat, lng], viewRadius);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(this.map);

    this.markerGroup = L.layerGroup().addTo(this.map);
  }

  removeMarkersFromGroup() {
    if (this.markerGroup) {
      this.markerGroup.eachLayer((layer) => {
        this.markerGroup.removeLayer(layer);
      });
      return true;
    }
    return false;
  }

  setView({ lat, lng, viewRadius = 14 }) {
    this.map.setView([lat, lng], viewRadius);
    return true;
  }

  addMarkerToGroup({ lat, lng, name = "unknown", iconType = 'tree' }) {
    console.log("adicionar marcador", iconType, lat, lng, name)
    const icon = L.icon({
      iconUrl: this.iconsUrl[iconType],
      iconSize: [38, 38],
    });
    L.marker([lat, lng], { icon })
      .bindPopup(name)
      .addTo(this.markerGroup);
  }

  addSelfMarker({ lat, lng, name = "você está aqui" }) {
    var myIcon = L.icon({
      iconUrl: this.iconsUrl.tree,
      iconSize: [38, 38],
    });

    this.marker = L.marker([lat, lng], {
      draggable: true,
      icon: myIcon,
    })
      .bindPopup(name)
      .addTo(this.map)
      .openPopup();


      this.marker.on("dragend", (event) => {
        const { lat, lng } = event.target._latlng;
        localStorage.setItem("self-lat", lat);
        localStorage.setItem("self-lng", lng);
  
        const radiusInKm = +localStorage.getItem("self-radiusInKM");
        const typeService = localStorage.getItem("self-typeService")
        this.updateMap({ lat, lng, radiusInKm: radiusInKm ?? 0, key: typeService });
      });
  }

  
  removeSelfMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      return true;
    }
    return false;
  }

  addRadius({ lat, lng, radiusInMeters }) {
    if (this.circle) {
      // Se o círculo já existe, atualize a posição e o raio.
      this.circle.setLatLng([lat, lng]);
      this.circle.setRadius(radiusInMeters);
    } else {
      // Caso contrário, crie um novo círculo.
      this.circle = L.circle([lat, lng], { radius: radiusInMeters }).addTo(
        this.map
      );
    }
  }

  removeRadius(){
    this.circle.setRadius(0)
    return true;
  }

  getAvailableAroundLocations({ lat, lng, radiusInKm, key }) {
    this.socket.emit("get-around-locations", {
      lat: lat,
      lng: lng,
      radiusInKm,
      key: key,
    });
  }

  updateMap({ lat, lng, radiusInKm = 0, viewRadius = 10, key }) {
    console.log("atualizando mapa", lat, lng, radiusInKm, key);
    // const radiusInKm = +localStorage.getItem("self-radiusInKM");
  
    const radiusInMeters = +radiusInKm * 1000;
    this.removeSelfMarker();

    this.removeMarkersFromGroup();

    this.addSelfMarker({ lat, lng, name: "você está aqui" });

    if(key){
      this.getAvailableAroundLocations({
        lat,
        lng,
        radiusInKm,
        key,
      });
    }
    
    this.addRadius({ lat, lng, radiusInMeters: radiusInMeters ?? 1000 });
  }
}
