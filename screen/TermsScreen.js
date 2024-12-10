import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const TermsScreen = ({ navigation }) => {
  return (
    <ImageBackground
     // source={require('../assets/kullanici.jpeg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Kullanıcı İzinleri</Text>
        <Text style={styles.text}>
          Uygulamamız, belirli verilerinizi toplayabilir ve işleyebilir. Gizlilik
          politikalarımıza uygun şekilde bu veriler kullanılacaktır. Lütfen devam
          etmeden önce şartları ve koşulları kabul ettiğinizden emin olun.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#666' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 15,
    backgroundColor: '#ff7899',
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TermsScreen;
