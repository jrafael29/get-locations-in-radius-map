import { geraStringAleatoria } from "./utils.js";
const latInit = -8.235064287686178;
const lngInit = -35.74797364584551;

const locationsIdentifier = {
  allLocations: "locations",
  busesAvailable: "buses:available",
  taxisAvailable: "taxis:available",
  mototaxisAvailable: "mototaxis:available",
  storesAvailable: "stores:available",

};


class Controls {

  enumServiceTypes = {
    1: "taxis:available",
    2: "mototaxis:available",
    3: "buses:available",
    4: "stores:available",
  }

  constructor(socket, map) {
    this.socket = socket;
    this.map = map;
  }

  onChangeSelectRange() {
    const selectElement = document.getElementById("rangekm");

    selectElement.addEventListener("change", _ => {
      const radiusInKm = selectElement.value;
        console.log("radius", radiusInKm)
      if(isNaN(radiusInKm)){
        //clear map
        localStorage.removeItem('self-radiusInKM')
        this.map.removeMarkersFromGroup()
        this.map.removeRadius();
        return true;
      }

        localStorage.setItem('self-radiusInKM', radiusInKm);

        let latitude = localStorage.getItem("self-lat") || null;
        let longitude = localStorage.getItem("self-lng") || null;
            if(latitude && longitude){
                const choseTypeService = localStorage.getItem("self-typeService")
                this.map.updateMap({lat: latitude, lng: longitude, radiusInKm, key: choseTypeService})
                return true;

            }
        return false

    });
  }

  onChangeSelectTypeService(){
    const typeServiceElement = document.getElementById("typeservice")

    typeServiceElement.addEventListener("change", _ => {
        const typeService = typeServiceElement.value;
        
        if(this.enumServiceTypes[typeService]){
          console.log("tipo de serviço:", )
            localStorage.setItem("self-typeService", this.enumServiceTypes[typeService])
            const [lat, lng, radiusInKm, choseTypeService] = [
                +localStorage.getItem("self-lat"),
                +localStorage.getItem("self-lng"),
                +localStorage.getItem("self-radiusInKM"),
                localStorage.getItem("self-typeService")
            ]
            console.log("lat", lat);
            console.log("lng", lng);
            console.log("radiusInKm", radiusInKm);
            console.log("choseTypeService", choseTypeService);

            if(lat && lng && !isNaN(radiusInKm)){


              
              this.socket.emit("get-around-locations", {
                  lat, 
                  lng,
                  radiusInKm,
                  key: typeService
              })
              this.map.updateMap({ lat, lng, radiusInKm, key: choseTypeService });
            }
            return true;
        }
        return false;
    })

  }

  onClickButtonStoreLocation() {
    document.getElementById("storeLocation").addEventListener("click", _ => {
      const lat = this.getInputValue("lat");
      const lng = this.getInputValue("lng");
      const locationGroupName = document.getElementById("location-group-name").value
      console.log("locationGroupName", locationGroupName)
      if (lat && lng && !!locationGroupName) {
        const locationRandomName = geraStringAleatoria(7);
        // this.fillLocationNameInput(locationName);

        this.socket.emit("register-location", {
          lat: +lat.trim(),
          lng: +lng.trim(),
          name: locationRandomName,
          key: locationGroupName
        });
        this.clearInput("lat");
        this.clearInput("lng");
        this.clearInput("location-group-name");

      }
      return true;
    });
  }

  onClickButtonUpdateMap(){
    
    document.getElementById("updateMap").addEventListener("click", _ => {
        const [lat, lng] = [+this.getInputValue('self-lat').trim(), +this.getInputValue('self-lng').trim()]
        if(lat && lng){
            console.log("atualizar o mapa");
            const radiusInKm = this.getInputValue("rangekm")
              if(!isNaN(radiusInKm)){

                const choseTypeService = localStorage.getItem("self-typeService");

                this.map.updateMap({
                  lat,
                  lng,
                  radiusInKm: +radiusInKm,
                  key: choseTypeService
                })
                this.map.setView({lat, lng, viewRadius: 15})

                localStorage.setItem("self-lat", lat);
                localStorage.setItem("self-lng", lng);
                localStorage.setItem("self-radiusInKM", radiusInKm);

            }
            
            

        }
        
    })
  }

  clearInput(idInput) {
    document.getElementById(idInput).value = "";
    return true;
  }

  getInputValue(idInput) {
    return document.getElementById(idInput).value;
  }

  fillLocationNameInput(name) {
    document.getElementById("location-name").value = name;
  }
}

export default Controls;
