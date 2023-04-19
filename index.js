const mqtt = require("mqtt");
const dotenv = require("dotenv");
dotenv.config();

var Mask1,Mask2,Mask3,Mask4;

if (process.env.MQTT_BROKER_URL) {
    let client = mqtt.connect("mqtt://" + process.env.MQTT_BROKER_URL);
    client.on("connect", async () => {
      console.info("Connected to MQTT Broker.", client.options.host, client.connected);
      if (process.env.TOPICS_LIST) {
        let topicsArray = process.env.TOPICS_LIST.split(",");
  
        topicsArray.forEach((element) => {
          client.subscribe(element);
          console.info("Subscribed to ", element);
        });
      }
  
      client.on("message", async (topic, message) => {
        const buf = Buffer.from(message);
        const packet = buf.toString('hex')
        const payloadObj = {"uniqueId":null,"timestamp":null,"latitude":0,"longitude":0,"speed":0,"isHA":false,"isHB":false,"distance":0,"event_flag":1024,"fl_level":0,"gpsStatus":'A',"gpsSignal":0,"direction":0,"extBatVol":0,"intBatVol":0,"satellites":0,"HDOP":0,"temperature":0,"delta_distance":0,"xval":0,"yval":0,"zval":0, "altitude":0};
        switch (topic) {
            case "BCE/D":
              console.log("Received Payload",packet);
              if(packet){
                        
                    //get the imei                          
                    let hexImei = packet.split("").splice(0, SLICE).join("")
                    hexImei = 'it_'+parseInt("0x" + hexImei.match(/../g).reverse().join("")).toString()
                    payloadObj.uniqueId=hexImei
                    //  get the len
                                                    
                    let len = packet.split("").splice(SLICE, 4).join("")
                    len = parseInt("0x" + len.match(/../g).reverse().join("")).toString()

                    //get the service FlashStack
                                                        SLICE += 4
                    let SerFalsk = packet.split("").splice(SLICE, 2).join("")
                    SerFalsk = parseInt("0x" + SerFalsk.match(/../g).reverse().join("")).toString()

                    //get the Service 0xA5 confirmation key
                                                        SLICE += 2
                    let SerConKey = packet.split("").splice(SLICE, 2).join("")
                    SerConKey = parseInt("0x" + SerConKey.match(/../g).reverse().join("")).toString()

                    // the structure length
                                                        SLICE += 2
                    let Struc_Len = packet.split("").splice(SLICE, 2).join("")
                    Struc_Len = parseInt("0x" + Struc_Len.match(/../g).reverse().join("")).toString()

                    // the time
                                                    SLICE += 2
                    let Time = packet.split("").splice(SLICE, 8).join("")
                    Time = Time.match(/../g).reverse().join("")
                    Time = Time.substring(0, Time.length-1);
                    Time = parseInt("0x" + Time).toString() * parseInt("0x02") + parseInt("0x47798280")
                    payloadObj.timestamp = Time

                                                SLICE += 8
                    Mask1 = packet.split("").splice(SLICE, 4).join("")

                    Mask1 = parseInt("0x" + Mask1.match(/../g).reverse().join("")).toString(2).padStart(8, '0')
                    while (Mask1.length < 16){Mask1 = '0'+Mask1.toString()}
                    Mask1 = Mask1.match(/./g).reverse().join("").toString()



                    if (Mask1.toString().charAt(15) === '1'){ 
                                                    SLICE += 4
                        Mask2 = packet.split("").splice(SLICE, 4).join("")
                        Mask2 = parseInt("0x" + Mask2.match(/../g).reverse().join("")).toString(2).padStart(8, '0')
                        while (Mask2.length < 16){Mask2 = '0'+Mask2.toString()}
                        Mask2 = Mask2.match(/./g).reverse().join("").toString()
                        

                        if (Mask2.toString().charAt(15) === '1'){
                            // the mask 3 because most significant bit in Mask2 set to 1 (2 bytes)
                                                        SLICE += 4
                            Mask3 = packet.split("").splice(SLICE, 4).join("")
                            
                            Mask3 = parseInt("0x" + Mask3.match(/../g).reverse().join("")).toString(2).padStart(8, '0')
                            while (Mask3.length < 16){Mask3 = '0'+Mask3.toString()}
                            Mask3 = Mask3.match(/./g).reverse().join("").toString()



                            if (Mask3.toString().charAt(15) === '1'){
                                // the mask 4 because most significant bit in Mask3 set to 1 (2 bytes)
                                                            SLICE += 4
                                Mask4 = packet.split("").splice(SLICE, 4).join("")
                                Mask4 = parseInt("0x" + Mask4.match(/../g).reverse().join("")).toString(2).padStart(8, '0')
                                while (Mask4.length < 16){Mask4 = '0'+Mask4.toString()}
                                Mask4 = Mask4.match(/./g).reverse().join("").toString()



                                if (Mask4.toString().charAt(15) === '1'){
                                    // the mask 5 because most significant bit in Mask4 set to 1 (2 bytes)
                                                                SLICE += 4
                                    Mask5 = packet.split("").splice(SLICE, 4).join("")
                                    Mask5 = parseInt("0x" + Mask5.match(/../g).reverse().join("")).toString(2).padStart(8, '0')
                                    while (Mask5.length < 16){Mask5 = '0'+Mask5.toString()}
                                    Mask5 = Mask5.match(/./g).reverse().join("").toString()


                                }
                            }
                        }
                    }

                    SLICE = SLICE + 4
                    if(Mask1.toString().length > 1){

                        if (Mask1.toString().charAt(0) === '1'){
                            // ---------les coord de group 1 ------------- 17 bytes (bit - 0)
                        
                            coord_group1 = packet.split("").splice(SLICE, 34).join("")
                            
                            // ***  la longitude 4 bytes
                            longitude = coord_group1.split("").splice(0, 8).join("")
                            longitude = longitude.match(/../g).reverse().join("")
                            longitude = Buffer.from(longitude,'hex').readFloatBE(0)
                            payloadObj.longitude=longitude
                        
                            // la latitude 4 bytes
                            latitude = coord_group1.split("").splice(8, 8).join("")
                            latitude = latitude.match(/../g).reverse().join("")
                            latitude = Buffer.from(latitude,'hex').readFloatBE(0)
                            payloadObj.latitude = latitude
          
                            // la vitesse 1 byte
                            speed = coord_group1.split("").splice(16, 2).join("")
                            speed = parseInt("0x" + speed.match(/../g).reverse().join("")).toString()
                            payloadObj.speed = speed

                            //  satellites ....?
                            satellites = coord_group1.split("").splice(18, 1).join("")
                            satellites = parseInt("0x" + satellites).toString()
                            payloadObj.satellites = satellites
                            
                            // le hdop ....?
                            hdop = coord_group1.split("").splice(19, 1).join("")
                            hdop = (parseInt(parseInt("0x" + hdop)/2)).toString()
                            payloadObj.HDOP = hdop

                            // la course 1 byte 
                            course = coord_group1.split("").splice(20, 2).join("")
                            course = parseInt("0x" + course.match(/../g).reverse().join("")).toString()

                            //l'altitude 2 bytes
                            altitude = coord_group1.split("").splice(22, 4).join("")
                            altitude = parseInt("0x" + altitude.match(/../g).reverse().join("")).toString()
                            payloadObj.altitude = altitude

                            // le odo 4 bytes
                            odo = coord_group1.split("").splice(26, 8).join("")
                            odo = parseInt("0x" + odo.match(/../g).reverse().join("")).toString()
                        }
    
                        SLICE = SLICE + 34
                        
                        // ***
                        if (Mask1.toString().charAt(1) === '1'){
                            //the Digital inputs status (bit 1)
                                                        
                            Dis = packet.split("").splice(SLICE, 4).join("")
                            Dis = parseInt("0x" + Dis.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
                        if (Mask1.toString().charAt(2) === '1'){
                                    //ADC1 (bit 2)                       
                            Adc1 = packet.split("").splice(SLICE, 4).join("")
                            Adc1 = parseInt("0x" + Adc1.match(/../g).reverse().join("")).toString()
                            SLICE += 4
                        }
                        
                        if (Mask1.toString().charAt(3) === '1'){
                                //ADC2 (bit 3)
                                                        
                            Adc2 = packet.split("").splice(SLICE, 4).join("")
                            Adc2 = parseInt("0x" + Adc2.match(/../g).reverse().join("")).toString()
                            
                            SLICE += 4
                        }
                        
                        if (Mask1.toString().charAt(4) === '1'){
                                //ADC3 (bit 4)                        
                            Adc3 = packet.split("").splice(SLICE, 4).join("")
                            Adc3 = parseInt("0x" + Adc3.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
                        
                        if (Mask1.toString().charAt(5) === '1'){
                            //ADC4 (bit 5)                 
                            Adc4 = packet.split("").splice(SLICE, 4).join("")
                            Adc4 = parseInt("0x" + Adc4.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
                        
                        if (Mask1.toString().charAt(6) === '1'){
                            //ADC5 (bit 6)                         
                            Adc5 = packet.split("").splice(SLICE, 4).join("")
                            Adc5 = parseInt("0x" + Adc5.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
                        if (Mask1.toString().charAt(7) === '1'){
                            //ADC6 (bit 7)
                                                            
                            Adc6 = packet.split("").splice(SLICE, 4).join("")
                            Adc6 = parseInt("0x" + Adc6.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
                        if (Mask1.toString().charAt(8) === '1'){
                            //ADC7 (bit 8)
                                                        
                            Adc7 = packet.split("").splice(SLICE, 4).join("")
                            Adc7 = parseInt("0x" + Adc7.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
                        if (Mask1.toString().charAt(9) === '1'){
                            //ADC8 (bit 9)
                                                        
                            Adc8 = packet.split("").splice(SLICE, 4).join("")
                            Adc8 = parseInt("0x" + Adc8.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
    
                        if (Mask1.toString().charAt(10) === '1'){
                            //Counter Frequency Group1 (bit 10)
                                                        
                            ConFrG1 = packet.split("").splice(SLICE, 8).join("")
                            c1 = packet.split("").splice(0, 4).join("")
                            c1 = parseInt("0x" + c1.match(/../g).reverse().join("")).toString()

                            c2 = packet.split("").splice(4, 4).join("")
                            c2 = parseInt("0x" + c2.match(/../g).reverse().join("")).toString()

                            SLICE += 8
                        }
    
                        if (Mask1.toString().charAt(11) === '1'){
                            //Counter Frequency Group2 (bit 11)
                                                        
                            ConFrG2 = packet.split("").splice(SLICE, 8).join("")
                            c3 = packet.split("").splice(0, 4).join("")
                            c3 = parseInt("0x" + c3.match(/../g).reverse().join("")).toString()

                            c4 = packet.split("").splice(4, 4).join("")
                            c4 = parseInt("0x" + c4.match(/../g).reverse().join("")).toString()

                            SLICE += 8
                        }
                        
                        if (Mask1.toString().charAt(12) === '1'){
                            //Filtered adc 1 (bit 12)
                                                        
                            Fil_adc1 = packet.split("").splice(SLICE, 4).join("")
                            Fil_adc1 = parseInt("0x" + Fil_adc1.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
    
                        if (Mask1.toString().charAt(13) === '1'){
                            //Filtered adc 2 (bit 13)               
                            Fil_adc2 = packet.split("").splice(SLICE, 4).join("")
                            Fil_adc2 = parseInt("0x" + Fil_adc2.match(/../g).reverse().join("")).toString()

                            SLICE += 4
                        }
                        
                        if (Mask1.toString().charAt(14) === '1'){
                            //GSM Info Group (bit 14)                           
                            GsmInfGr = packet.split("").splice(SLICE, 18).join("")
                        
                            mcc = GsmInfGr.split("").splice(0, 4).join("")
                            mcc = parseInt("0x" + mcc.match(/../g).reverse().join("")).toString()
                        
                            mnc = GsmInfGr.split("").splice(4, 2).join("")
                            mnc = parseInt("0x" + mnc.match(/../g).reverse().join("")).toString()
                        
                            lac = GsmInfGr.split("").splice(6, 4).join("")
                            lac = parseInt("0x" + lac.match(/../g).reverse().join("")).toString()
                        
                            cell_id = GsmInfGr.split("").splice(10, 4).join("")
                            cell_id = parseInt("0x" + cell_id.match(/../g).reverse().join("")).toString()
                        
                            ta = GsmInfGr.split("").splice(14, 2).join("")
                            ta = parseInt("0x" + ta.match(/../g).reverse().join("")).toString()
                        
                            gsm_lvl = GsmInfGr.split("").splice(16, 2).join("")
                            gsm_lvl = parseInt("0x" + gsm_lvl.match(/../g).reverse().join("")).toString()
                        
                            SLICE += 18
                        }
                        
            }



            if(Mask2.toString().length > 1){
                
                if (Mask2.toString().charAt(0) === '1'){
                    //J1939 Wheel speed (bit 0)                     
                    WheelSpeed = packet.split("").splice(SLICE, 4).join("")
                    WheelSpeed = parseInt("0x" + WheelSpeed.match(/../g).reverse().join("")).toString()

                    SLICE += 4
                }

                if (Mask2.toString().charAt(1) === '1'){
                    //J1939 Acceleration pedal position (bit 1)                        
                    AccelPedal = packet.split("").splice(SLICE, 2).join("")
                    AccelPedal = parseInt("0x" + AccelPedal.match(/../g).reverse().join("")).toString()

                    SLICE += 2
                }

                if (Mask2.toString().charAt(2) === '1'){
                    //J1939 Total fuel used (bit 2)               
                    TotalFuel = packet.split("").splice(SLICE, 8).join("")
                    TotalFuel = parseInt("0x" + TotalFuel.match(/../g).reverse().join("")).toString()

                    SLICE += 8
                }

                if (Mask2.toString().charAt(3) === '1'){
                    // J1939 Fuel level (bit 3)                      
                    FuelLevel = packet.split("").splice(SLICE, 2).join("")
                    FuelLevel = parseInt("0x" + FuelLevel.match(/../g).reverse().join("")).toString()
                    payloadObj.fl_level = FuelLevel
                    SLICE += 2
                }

                if (Mask2.toString().charAt(4) === '1'){
                    // J1939 Engine Speed (bit 4)                        
                    EngineSpeed = packet.split("").splice(SLICE, 4).join("")
                    EngineSpeed = parseInt("0x" + EngineSpeed.match(/../g).reverse().join("")).toString()

                    SLICE += 4
                }

                if (Mask2.toString().charAt(5) === '1'){
                    //  J1939 Total engine hours (bit 5)                     
                    TotalEngineHours = packet.split("").splice(SLICE, 8).join("")
                    TotalEngineHours = parseInt("0x" + TotalEngineHours.match(/../g).reverse().join("")).toString()

                    SLICE += 8
                }

                if (Mask2.toString().charAt(6) === '1'){
                    //  J1939 Total vehicle distance (bit 6)
                                                
                    TotalVehicleDist = packet.split("").splice(SLICE, 8).join("")
                    TotalVehicleDist = parseInt("0x" + TotalVehicleDist.match(/../g).reverse().join("")).toString()
                    payloadObj.distance= TotalVehicleDist
                    SLICE += 8
                }

                if (Mask2.toString().charAt(7) === '1'){
                    //  1939 Engine Coolant temperature (bit 7)
                                                
                    TotalCoolantTemp = packet.split("").splice(SLICE, 2).join("")
                    TotalCoolantTemp = parseInt("0x" + TotalCoolantTemp.match(/../g).reverse().join("")).toString()

                    SLICE += 2
                }

                if (Mask2.toString().charAt(8) === '1'){
                    //  J1939 Fuel level2 (bit 8)                       
                    FuelLevel2 = packet.split("").splice(SLICE, 2).join("")
                    FuelLevel2 = parseInt("0x" + FuelLevel2.match(/../g).reverse().join("")).toString()

                    SLICE += 2
                }

                if (Mask2.toString().charAt(9) === '1'){
                    //  J1939 Engine load (bit 9)                  
                    EngineLoad = packet.split("").splice(SLICE, 2).join("")
                    EngineLoad = parseInt("0x" + EngineLoad.match(/../g).reverse().join("")).toString()

                    SLICE += 2
                }

                if (Mask2.toString().charAt(10) === '1'){
                    //   J1939 Service distance (bit 10)                          
                    ServiceDist = packet.split("").splice(SLICE, 2).join("")
                    ServiceDist = parseInt("0x" + ServiceDist.match(/../g).reverse().join("")).toString()

                    SLICE += 2
                }

                if (Mask2.toString().charAt(11) === '1'){
                    //   J1939 TCO1(8 bytes structure of few sensors) (bit 12)                      
                    Tco1 = packet.split("").splice(SLICE, 16).join("")
                    Tco1 = parseInt("0x" + Tco1.match(/../g).reverse().join("")).toString()

                    SLICE += 16
                }

                if (Mask2.toString().charAt(12) === '1'){
                    // J1939 Ambient Air Temperature             
                    AmbiArTemp = packet.split("").splice(SLICE, 4).join("")
                    AmbiArTemp = parseInt("0x" + AmbiArTemp.match(/../g).reverse().join("")).toString()
                    payloadObj.temperature = AmbiArTemp
                    SLICE += 4
                }}

            }

            console.log("Payload=", payloadObj);
                client.publish(
                process.env.PUBLISH_TOPIC,
                JSON.stringify(payloadObj),
                );
            break;
        
            default:
                console.log("Topic Changed=", topic);
                break;
            }
          });
        });
      } else {
        console.log("MQTT VARIABLES NOT SET!");
      }
