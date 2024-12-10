import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'; // Icon kütüphanesi
import { signOut } from 'firebase/auth'; // Firebase signOut fonksiyonunu ekliyoruz
import { auth } from '../config/firebase'; // Firebase yapılandırma dosyanızdan auth import edin


const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase oturum kapatma
      console.log('Logout işlemi başarılı.');
      navigation.replace('Login'); // Kullanıcıyı Login ekranına geri yönlendir
    } catch (error) {
      console.error('Logout işlemi sırasında bir hata oluştu:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Breast Cancer</Text>
        <Text style={styles.subtitle}>
          Physical activities matter to your breast cancer care
        </Text>
      </View>

      {/* Icons Section */}
      <View style={styles.gridContainer}>
        {/* First Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.card}>
            <FontAwesome5 name="weight" size={40} color="#2196F3" />
            <Text style={styles.cardText}>Weight</Text>
            <Text style={styles.cardSubText}>0 Kg</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="directions-walk" size={40} color="#4CAF50" />
            <Text style={styles.cardText}>Activity</Text>
            <Text style={styles.cardSubText}>0 Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="accessibility" size={40} color="#9C27B0" />
            <Text style={styles.cardText}>Behaviour</Text>
            <Text style={styles.cardSubText}>0 Breaks</Text>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.card}>
            <FontAwesome5 name="smile" size={40} color="#FF9800" />
            <Text style={styles.cardText}>Mood</Text>
            <Text style={styles.cardSubText}>Content</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="hotel" size={40} color="#3F51B5" />
            <Text style={styles.cardText}>Sleep</Text>
            <Text style={styles.cardSubText}>0 Mins</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <FontAwesome5 name="running" size={40} color="#FF5722" />
            <Text style={styles.cardText}>Exercise</Text>
            <Text style={styles.cardSubText}>0</Text>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="assignment" size={40} color="#8BC34A" />
            <Text style={styles.cardText}>Questionnaire</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="article" size={40} color="#607D8B" />
            <Text style={styles.cardText}>News</Text>
            <Text style={styles.cardSubText}>Cancer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC0CB", // Light pink background
  },
  logoutButton: {
    position: 'absolute',
    top: 15,
    right: 10, // Sağ tarafa tam hizalama
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFC0CB", // Turkuaz renk
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it stays above other elements
  },
  header: {
    backgroundColor: "#FF69B4", // Darker pink for header
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
    textAlign: "center",
  },
  gridContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    margin: 10,
    width: 100,
    height: 120,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  cardSubText: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    textAlign: "center",
  },
});

export default HomeScreen;
