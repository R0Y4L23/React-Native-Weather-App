import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { StyleSheet, Text, View, Button, TextInput, FlatList, Image, Modal, Pressable, ImageBackground, ToastAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { Context, ContextProvider } from './Context.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function App() {
  const styles = StyleSheet.create({
    droidSafeArea: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    input: {
      height: 40,
      margin: 12,
      width: 300,
      paddingLeft: 120,
      borderWidth: 1,
    },
  });
  const Edit = () => {
    const [name, setName] = useState("");
    const { info, doit } = useContext(Context)
    const storeData = async (value) => {
      try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('places', jsonValue)
      } catch (e) {
        console.log(e)
      }
    }
    const addLocation = async () => {
      if (name != "") {
        let a = info
        a.push({ "name": name })
        await storeData(a)
        doit(0);
        ToastAndroid.show("Place Added")
      }
      else {
        ToastAndroid.show("Please enter name of place")
      }
      setName("")
    }
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image style={{ height: 178, width: 178 }} source={require('./assets/logo_w.png')} />
        <Text style={{ fontSize: 30 }}>Enter name of a place</Text>
        <TextInput style={styles.input} onChangeText={setName} value={name} placeholder="Name" />
        <Button title=" Add Weather " onPress={addLocation} />
        <Text style={{ color: "grey", fontSize: 12, marginTop: 20 }}>Swipe Right to View Weather</Text>
      </View>
    );
  }
  const displayScreen = ({ route }) => {
    const { info, setInfo } = useContext(Context)
    const windowWidth = Dimensions.get('window').width;
    const [place, setPlace] = useState(route.params.name)
    const [loc, setLoc] = useState({ "name": "Loading...", "country": "Loading...", "lat": "Loading...", "lon": "Loading..." })
    const [today, setToday] = useState([{ "date": "Loading...", "hour": [{ "temp_c": "Loading...", "time": "Loading............", "pressure_mb": "Loading...", "wind_kph": "Loading..." }], "day": { "avgtemp_c": "Loading...", "avghumidity": "Loading...", "uv": "Loading...", "condition": { "text": "Loading...", "icon": "https://cdn.weatherapi.com/weather/64x64/day/230.png" } } }])
    const [modalVisible, setModalVisible] = useState(false);
    var d = new Date();
    const [hr, setHr] = useState(d.getHours());
    const storeData = async (value) => {
      try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('places', jsonValue)
      } catch (e) {
        console.log(e)
      }
    }
    const Delete = async (id) => {
      let ar = info;
      ar = ar.filter((item) => { return !(item.name == id) })
      setInfo(ar);
      await storeData(ar)
    }
    useEffect(() => {
      const options = {
        method: 'GET',
        url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
        params: { q: `${place}`, days: '3' },
        headers: {
          'x-rapidapi-key': '1a9ce17f80msh1b10f0b2ba1aadep13c266jsnc56dee1cf4ec',
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
      };
      axios.request(options).then(function (response) {
        setLoc(response.data.location);
        setToday(response.data.forecast.forecastday);
      }).catch(function (error) {
        console.error(error);
      });
    }, [place])
    const [index, setIndex] = useState(0);
    const indexRef = useRef(index);
    indexRef.current = index;
    const onScroll = useCallback((event) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / slideSize;
      const roundIndex = Math.round(index);
      const distance = Math.abs(roundIndex - index);
      const isNoMansLand = 0.4 < distance;
      if (roundIndex !== indexRef.current && !isNoMansLand) {
        setIndex(roundIndex);
      }
    }, []);
    useEffect(() => {
    }, [index]);
    return (
      <ImageBackground source={(hr >= 6 && hr < 18) ? require("./assets/day2.jpg") : require("./assets/night2.jpg")} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ justifyContent: "center", alignContent: "center" }}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setModalVisible(!modalVisible);
              }}>
              <View style={{ backgroundColor: "green" }}>
                <Text style={{ fontSize: 30, textAlign: "center" }}><Entypo name="location-pin" size={24} color="black" />Location Details</Text>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <Text><FontAwesome name="search" size={24} color="black" />Searched For : {route.name}</Text>
                  <Text><FontAwesome name="location-arrow" size={24} color="black" />Location Name : {loc.name}</Text>
                  <Text><Ionicons name="earth" size={24} color="black" />Country : {loc.country}</Text>
                  <Text><Entypo name="arrow-long-right" size={24} color="black" />Latitude : {loc.lat}</Text>
                  <Text><Entypo name="arrow-long-up" size={24} color="black" />Longitude : {loc.lon}</Text>
                </View>
                <Pressable
                  style={{ backgroundColor: "red", alignSelf: "center", width: windowWidth, height: 40 }}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={{ textAlign: "center", paddingTop: 10 }}>Hide</Text>
                </Pressable>
              </View>
            </Modal>
          </View>
          <FlatList
            data={today}
            renderItem={({ item }) => {
              return (
                <View style={{ width: windowWidth }}>
                  <View style={{ height: 120, marginTop: 15 }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={{ flex: 5 }}>
                        <Text style={{ fontSize: 50, textAlign: "center" }}><FontAwesome name="thermometer" size={60} color="black" /> {item.day.avgtemp_c}<Text style={{ fontSize: 20 }}>°C</Text></Text>
                      </View>
                      <View style={{ flex: 5 }}>
                        <Text style={{ fontSize: 15, textAlign: "center", marginTop: 10 }}><MaterialCommunityIcons name="weather-cloudy" size={24} color="black" />Date: {item.date}</Text>
                        <Text style={{ fontSize: 15, textAlign: "center", marginTop: 15 }}><Entypo name="text" size={24} color="black" />Condition: {item.day.condition.text}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 120 }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={{ flex: 5 }}><Image style={{ width: 125, height: 125, alignSelf: "center", bottom: 24 }} source={{ uri: `https:${item.day.condition.icon}` }} resizeMode={'cover'} /></View>
                      <View style={{ flex: 5 }}>
                        <Text style={{ fontSize: 20, textAlign: "center", marginTop: 20 }}><MaterialCommunityIcons name="air-humidifier" size={24} color="black" />Humidity: {item.day.avghumidity}</Text>
                        <Text style={{ fontSize: 20, textAlign: "center", marginTop: 15 }}><Feather name="sunrise" size={24} color="black" />UV: {item.day.uv}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ fontSize: 20, textAlign: "center", marginTop: 10, marginBottom: 15 }}>Hourly Details</Text>
                  <FlatList
                    data={item.hour}
                    renderItem={({ item, index }) => {
                      return (
                        <ImageBackground source={index >= 12 ? (index >= 18 ? (require(`./assets/six_eleven_n.jpg`)) : (require(`./assets/twelve_five.jpg`))) : (index >= 6 ? (require(`./assets/six_eleven.jpg`)) : (require(`./assets/twelve_five_n.jpg`)))} style={{ marginBottom: 20, borderRadius: 25, justifyContent: "center", width: 340, height: 200, alignSelf: 'center', paddingTop: 20 }} >
                          <View style={{ width: 340, height: 160 }}>
                            <View style={{ flex: 1, flexDirection: "row" }}>
                              <View style={{ flex: 6 }}>
                                <Text style={{ fontSize: 65, top: 22, color: "grey" }}><FontAwesome name="thermometer" size={65} color="white" />{item.temp_c} <Text style={{ fontSize: 20 }}>°C</Text></Text>
                              </View>
                              <View style={{ flex: 4 }}>
                                <Text style={{ textAlign: "center", marginBottom: 10, color: "grey" }}><FontAwesome name="clock-o" size={24} color="yellow" />{"\n"}{item.time.slice(11, 17)}</Text>
                                <Text style={{ textAlign: "center", marginBottom: 10, color: "grey" }}><MaterialCommunityIcons name="weight" size={24} color="yellow" /> Pressure : {"\n"}{item.pressure_mb} mb</Text>
                                <Text style={{ textAlign: "center", color: "grey" }}><Feather name="wind" size={24} color="yellow" /> Wind Speed : {"\n"}{item.wind_kph} kph</Text>
                              </View>
                            </View>

                          </View>
                        </ImageBackground>)
                    }}
                    keyExtractor={(item) => item.time}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )
            }}
            keyExtractor={item => item.date}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
          />
          <Pressable onPress={() => setModalVisible(true)} style={{ backgroundColor: "#F194FF", alignSelf: "center", width: windowWidth, height: 38 }}>
            <Text style={{ textAlign: "center", paddingTop: 10 }}>LOCATION DETAILS</Text>
          </Pressable>
          <Button title="Delete" onPress={() => { Delete(route.params.name) }} />
        </View>
      </ImageBackground>
    );
  }
  const DrawerStack = () => {
    const { info } = useContext(Context);
    const Drawer = createDrawerNavigator();
    return (
      <Drawer.Navigator>
        <Drawer.Screen name="Add New Place" component={Edit} />
        {info.map((item, index) => { return (<Drawer.Screen name={item.name} component={displayScreen} key={index} initialParams={item} />) })}
      </Drawer.Navigator>
    );
  }
  return (
    <View style={styles.droidSafeArea}>
      <ContextProvider>
        <NavigationContainer>
          <DrawerStack />
        </NavigationContainer>
      </ContextProvider>
    </View>
  );
}