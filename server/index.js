import { createServer } from "http";
import { Server } from "socket.io";

import Redis from "ioredis";

// const redisPubConn = createClient({
//   url: `redis://172.23.0.2:6379`
// })
const redisPubConn = new Redis({
  host: "172.23.0.2",
  port: 6379,
});
// await redisPubConn.connect();

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

io.on("connection", (socket) => {
  console.log("nova conexão", socket.id);

  // socket.on("register", async ({ id, name, lat, lng }) => {
  //   console.log("solicitação de registro: ", name);


  //   await redisPubConn.geoadd("onlines:", [lng, lat, id]);

  //   socket.emit("add-marker", {
  //     id,
  //     name,
  //     lat,
  //     lng,
  //   });
  // });

  socket.on("register-location", async ({name, lat, lng, key}) => {
    console.log("registrar", key);
    await redisPubConn.geoadd(key, [lng, lat, name]);
    socket.emit("add-marker", {
      id: name,
      name,
      lat,
      lng,
      key
    });
  })


  socket.on("get-around-locations", async ({ lat, lng, radiusInKm, key }) => {
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

    
  });
});

httpServer.listen(3010);
