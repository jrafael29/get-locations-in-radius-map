import Map from "./map.js";

export function websocketHandle(socket, map){
    socket.on("connect", _ => {
        console.log("socket conectado: ", socket.id)
    })

    socket.on("add-marker", data => {
        console.log("novo marcador", data);

        console.log("tipo de serviço selecionado", )
        const choseTypeService = localStorage.getItem("self-typeService")
        if(data.lat && data.lng){
            const key = data.key
            const iconType = getIconType(key)

            if(choseTypeService == key){
                map.addMarkerToGroup({
                    lat: data.lat, 
                    lng: data.lng, 
                    name: data.name || '',
                    iconType
                })
            }
            
        }
    })

    function getIconType(key){
        let iconType ;
        if(key.includes("taxis")) iconType = "car"

        if(key.includes("buses")) iconType = "bus"

        if(key.includes("stores")) iconType = "store"

        if(key.includes("mototaxis")) iconType = "motorcycle"

        if(iconType) return iconType
    }

    socket.on("around-locations", locations => {
        map.removeMarkersFromGroup()

        const choseTypeService = localStorage.getItem("self-typeService");


        const iconType = getIconType(choseTypeService)


        if(locations.length){
            
            locations.forEach(location => {
                console.log("location: ", location)
                map.addMarkerToGroup({
                    lat: location.lat,
                    lng: location.lng,
                    name: location.id,
                    iconType: iconType
                })
            })
        }
    })
}
