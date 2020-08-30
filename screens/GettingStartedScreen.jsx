import * as React from 'react';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

const GettingStartedScreen = () => {
  return (
    <View style={styles.containerText}>
      <View style={styles.containerTop}>    
      </View>
      <View style={styles.containerText}>
        <Text style={styles.BoldText}>This is your one stop shop for all image classification needs</Text>  
        <Text style={styles.title}></Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.text}>First: let the nural network load (takes 15-20 seconds please be paitient.</Text>
        <Text style={styles.text}>Second: You can either chose an image form your photos or take one.</Text>
        <Text style={styles.text}>Third: The AI will recognize your image and give you the top three predictions of what it thinks it is.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    paddingTop: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  BoldText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center"
  },
  containerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    textAlign: "center",
    fontSize: 16,
    padding: 5
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
});

export default GettingStartedScreen;