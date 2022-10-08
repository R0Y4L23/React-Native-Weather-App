import React,{useState,createContext,useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
export const Context=createContext();
export const ContextProvider = (props) => {
    const [info,setInfo]=useState([])
    const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('places')
      return jsonValue != null ? JSON.parse(jsonValue) :[{"name":"New York"},{"name":"Barasat"}];
     } 
     catch(e) 
     {
         console.log(e)
     }
   }  
   const doit=async (a)=>{
       console.log(a)
       setInfo(await getData())
   }
    useEffect(()=>{
        doit(0)
    },[])
    return (
        <Context.Provider value={{info,setInfo,doit}}>
            {props.children}
        </Context.Provider>
    )
}