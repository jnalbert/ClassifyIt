import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as mobilenet from '@tensorflow-models/mobilenet'

import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as jpeg from 'jpeg-js'
import * as ImagePicker from 'expo-image-picker'

import { fetch } from '@tensorflow/tfjs-react-native'

class PictureScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTfReady: false,
      isModelReady: false,
      predictions: null,
      image: null
    };
  }

  async componentDidMount() {
    await tf.ready(); // preparing TensorFlow
    this.setState({ isTfReady: true,});

    this.model = await mobilenet.load({
      version: 2,
      alpha: 0.5
    }); // preparing MobileNet model
    this.setState({ isModelReady: true });

    this.getCameraRollPermissionAsync(); // get permission for accessing camera on mobile device
    this.getCameraPermissionsAsync();
  }

  getCameraRollPermissionAsync = async () => {
    if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            alert('You must grant permission to your camera roll and camera')
        }
    }
  }

  getCameraPermissionsAsync = async () => {
      if (Constants.platform.ios) {
          const { status } = await Permissions.askAsync(Permissions.CAMERA)
          if (status !== 'granted') {
            alert('You must grant permission to your camera roll and camera')
          }
      }
  }

  imageToTensor(rawImageData) {
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }

    return tf.tensor3d(buffer, [height, width, 3])
  }

  classifyImage = async () => {
    try {
      const imageAssetPath = Image.resolveAssetSource(this.state.image)
      const response = await fetch(imageAssetPath.uri, {}, { isBinary: true })
      const rawImageData = await response.arrayBuffer()
      const imageTensor = this.imageToTensor(rawImageData)
      const predictions = await this.model.classify(imageTensor)
      this.setState({ predictions: predictions })
    } catch (error) {
      console.log('Exception Error: ', error)
    }
  }

  selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3]
      })

      if (!response.cancelled) {
        const source = { uri: response.uri }
        this.setState({ image: source })
        this.classifyImage()
      }
    } catch (error) {
      console.log(error)
    }
  }

  takeImage = async () => {
    try {
        let response = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3]
        })
  
        if (!response.cancelled) {
          const source = { uri: response.uri }
          this.setState({ image: source })
          this.classifyImage()
        }
      } catch (error) {
        console.log(error)
      }
    }

  renderPrediction = (prediction) => {
    return (
      <View style={styles.welcomeContainer}>
        <Text key={prediction.className} style={styles.text}>
          Prediction: {prediction.className} {', '} Probability: {prediction.probability * 100}%
        </Text>
      </View>
    )
  }

  render() {
    const { isTfReady, isModelReady, predictions, image } = this.state

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
            TensorFlow.js ready? {isTfReady ? <Text>✅</Text> : ''}
          </Text>

          <View style={styles.loadingModelContainer}>
            <Text style={styles.text}>MobileNet model ready? </Text>
            {isModelReady ? (
              <Text style={styles.text}>✅</Text>
            ) : (
              <ActivityIndicator size='small' />
            )}
          </View>
        </View>

        {isModelReady && (
            <View style={styles.chossingContainer}>
                <TouchableOpacity
                style={styles.chooseImageTouch}
                onPress={isModelReady ? this.selectImage: undefined}>
                    <Text style={styles.transparentTextChoose}>Tap to choose image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={styles.takeImageTouch}
                onPress={isModelReady ? this.takeImage : undefined}>
                    <Text style={styles.transparentTextTake}>Tap to take image</Text>
                </TouchableOpacity>
            </View>
        )}
        <View
        style={styles.imageWrapper}>
            {image && <Image source={image} style={styles.imageContainer}/>}
        </View>
        <View style={styles.predictionWrapper}>
          {isModelReady && image && (
            <Text style={styles.text}>
              Predictions: {predictions ? '' : 'Predicting...'}
            </Text>
          )}
          {isModelReady &&
            predictions &&
            predictions.map(p => this.renderPrediction(p))}
        </View>
        </View>
        </ScrollView>
      </View>
    )
  }
}

PictureScreen.navigationOptions = {
  header: null,
};

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

export default PictureScreen;