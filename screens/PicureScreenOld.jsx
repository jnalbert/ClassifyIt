import React from 'react';
import { StyleSheet, StatusBar, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';

import { Text, View } from '../components/Themed';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as moblileNet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as jpeg from 'jpeg-js'

import { fetch } from '@tensorflow/tfjs-react-native'


const PicureScreenOld = () => {
  const [state, setState] = useState({
    isTfReady: false,
    isModelReady: false,
    image: undefined ,
    predictions: undefined,
    model: null
  })

  useEffect( () => {
    // await tf.ready()
    // setState({...state, isTfReady: true})

    // this.myModle = await moblileNet.load();
    // setState({...state, isModelReady: true});
    loadeModelAsync();

    getPermisionsCameraRollAsync();
    getPermissionsCameraAsync();
  }, [])



  async function loadeModelAsync() {
    // load TF
    await tf.ready();
    setState({...state, isTfReady: true});

    // load model
    this.myModle = await moblileNet.load();
    setState({...state, isModelReady: true})
  }

// getting permmisions
  const getPermisionsCameraRollAsync = async () => {
    if (Constants.platform?.ios) {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if ( status !=='granted') {
        alert('You must grant permission to your camera roll and camera')
      }
    }
  }

  const getPermissionsCameraAsync = async () => {
    if (Constants.platform?.ios) {
      const {status} = await Permissions.askAsync(Permissions.CAMERA)
      if (status !== 'granted') {
        alert('You must grant permission to your camera roll and camera')
      }
    }
  }

  const imageToTensor = (rawImageData) => {
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0;
    for (let i = 0; buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }
    return tf.tensor3d(buffer, [width, height, 3]);
  }

  async function classifyImage() {
    try {
          const imageAssetPath = Image.resolveAssetSource(state.image)
          console.log(imageAssetPath.uri)
          const response = await fetch(imageAssetPath.uri,  {}, { isBinary: true });
          const rawImageData = await response.arrayBuffer();
          const imageTensor = imageToTensor(rawImageData);
          const prediction = await this.myModle.classify(imageTensor);
          setState({...state, predictions: prediction})
    } catch (Err) {
      console.log(Err);
      
    }
  }


 

  // const loadTFAsync = async () => {
  //   await tf.ready()
  //   setState({...state, isTfReady: true})
  // }


  const selectImage = async () => {
    try {
      let CameraRollResults = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3]
      });
      if (!CameraRollResults.cancelled) {
        const source = {uri: CameraRollResults.uri}
        setState({ ...state, image: source })
        classifyImage()
      }
      console.log(CameraRollResults)
    } catch (Err) {
      console.log(Err)
    }
  }

  const takeImage = async () => {
    try {
      let CameraResults = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3]
      });
      if (!CameraResults.cancelled) {
        const source = { uri: CameraResults.uri }
        setState({ ...state, image: source })
        classifyImage();
      }
      console.log(CameraResults)
    } catch (Err) {
      console.log(Err)
    }
  }



  const renderPrediction = (prediction) => {
    <View style={styles.container}>
      <Text key={prediction.className} style={styles.text}>
        Prediction: {prediction.className} {', '} Probability: {prediction.probability}
      </Text>
    </View>
  }

  return (

      <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.welcomeContainer}>
          <Image
            source={
              __DEV__
                ? require('../assets/images/tfjs.jpg')
                : require('../assets/images/tfjs.jpg')
            }
          
            style={styles.welcomeImage} 
          />

        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>
            TensorFlow.js ready? {state.isTfReady ? <Text>✅</Text> : ''}
          </Text>

          <View style={styles.loadingModelContainer}>
            <Text style={styles.text}>MobileNet model ready? </Text>
            {state.isModelReady ? (
              <Text style={styles.text}>✅</Text>
            ) : (
              <ActivityIndicator size='small' />
            )}
          </View>
        </View>
        
        {state.isModelReady && (
          <View style={styles.chossingContainer}>
            <TouchableOpacity
              style={styles.chooseImageTouch}
              onPress={state.isModelReady ? selectImage : undefined}>
              <Text style={styles.transparentTextChoose}>Tap to choose image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.takeImageTouch}
              onPress={state.isModelReady ? takeImage : undefined}>
              <Text style={styles.transparentTextTake} >Tap to take image</Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          style={styles.imageWrapper}>
          {state.image && <Image source={state.image} style={styles.imageContainer} />}   
        </View>
        <View style={styles.predictionWrapper}>
          {state.isModelReady && state.image && (
            <Text style={styles.text}>
              Predictions: {state.predictions ? '' : 'Predicting...'}
            </Text>
          )}
          {state.isModelReady &&
            state.predictions &&
            state.predictions.map((p) => renderPrediction(p))}
        </View>
        </View>
        </ScrollView>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
    // backgroundColor: '#171f24'
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  contentContainer: {
    paddingTop: 30,
  },
  loadingContainer: {
    marginTop: 15,
    marginBottom: 10,
    justifyContent: 'center'
  },
  text: {
    fontSize: 16
  },
  loadingModelContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  imageWrapper: {
    width: 280,
    height: 280,
    padding: 10,
    borderColor: '#cf667f',
    borderWidth: 3,
    borderStyle: 'solid',
    marginTop: 40,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    width: 300,
    height: 300,
    position: 'absolute',
    top: -5,
    left: -15,
    bottom: 10,
    right: 10,
  },
  predictionWrapper: {
    marginTop: 20,
    height: 100,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center'
  },
  transparentText: {
    opacity: 0.7
  },
  transparentTextChoose: {
    opacity: 0.7
  },
  transparentTextTake: {
    opacity: 0.7
  },
  footer: {
    marginTop: 40
  },
  poweredBy: {
    fontSize: 20,
    color: '#e69e34',
    marginBottom: 6
  },
  tfLogo: {
    width: 125,
    height: 70
  },
  chossingContainer: {
    paddingTop: 40,
    height: 55,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chooseImageTouch: {
  width: 165,
  height: 50,
  padding: 10,
  borderColor: '#cf667f',
  borderWidth: 3,
  marginBottom: 10,
  margin: 5,
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center'
  },
  takeImageTouch: {
    width: 165,
    height: 50,
    padding: 5,
    borderColor: '#cf667f',
    borderWidth: 3,
    marginBottom: 10,
    margin: 5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default PicureScreenOld; 



