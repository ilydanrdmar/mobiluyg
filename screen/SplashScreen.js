import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Terms');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup
  }, [navigation]);

  return (
    <ImageBackground
 //     source={require('../assets/giris.png')}
      style={styles.splashBackground}
    >
      <View style={styles.splashContainer}>
        <Image
        //  source={{ uri: 'https://example.com/logo.png' }}
          style={styles.logo}
        />
        <Text style={styles.appName}>Egzersiz Uygulaması</Text>
        <Text style={styles.slogan}>Daha sağlıklı bir yaşam için ilk adımı atın.</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  splashBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SplashScreen;
