import { createServer } from "http";
import { Server } from "socket.io";

import Redis from "ioredis";

const redisPubConn = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,

});

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

function locationEvents(io, socket){

  async function registerLocation ({name, lat, lng, key}){
    console.log("registrar", key);
    await redisPubConn.geoadd(key, [lng, lat, name]);
    socket.emit("add-marker", {
      id: name,
      name,
      lat,
      lng,
      key
    });
  }

  async function getAroundLocations ({ lat, lng, radiusInKm, key }){
    console.log("buscar players proximo");

    if(lat && lng && radiusInKm && key){
      
      const aroundMembersLocationsAndDistances = await redisPubConn.georadius(
        key,
        lng,
        lat,
        radiusInKm,
        "km",
        "WITHDIST",
        "WITHCOORD"
      );
      
      const membersAround = aroundMembersLocationsAndDistances.map(memberInfo => {
        const memberId = memberInfo[0]
        const memberDistance = memberInfo[1]
        const [memberLng, memberLat] = memberInfo[2];
        const result = {
          id: memberId,
          distance: memberDistance,
          lat: memberLat,
          lng: memberLng,
        }
        
        return result
  
      })
      console.log("membersAround", membersAround);
      // redisPubConn.GEORADIUS()
  
      socket.emit("around-locations", membersAround);
    }

    
  };

  socket.on("register-location", registerLocation)
  socket.on("get-around-locations", getAroundLocations)
}

io.on("connection", (socket) => {
  console.log("nova conexão: ", socket.id);
  locationEvents(io, socket)
});

httpServer.listen(3010);


process.on("SIGINT", () => {
  console.log("servidor terminado");
  httpServer.close(() => process.exit());
});
process.on("SIGTERM", () => {
  httpServer.close(() => process.exit());
});
process.on("uncaughtException", (error, origin) => {
  console.log(`\n UNCAUGHTEXCEPTION: ORIGIN ${origin} -- ERROR: ${error}`);
});
process.on("unhandledRejection", (error) => {
  console.log(`\n unhandled Promise Rejection: ${error}`);
})