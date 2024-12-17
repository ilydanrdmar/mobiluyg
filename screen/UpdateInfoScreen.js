import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import { auth, db } from "../config/firebase";
import { updateEmail, updatePassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

const UpdateInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;

  const [email, setEmail] = useState(patientData.email || "");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Mevcut şifre için alan
  const [fullName, setFullName] = useState(patientData.fullName || ""); // Ad
  const [birthDate, setBirthDate] = useState(patientData.birthDate || ""); // Doğum tarihi
  const [loading, setLoading] = useState(false);

  // Kullanıcıyı yeniden doğrula
  const reauthenticateUser = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("Kullanıcı oturumu bulunamadı.");
      }
      const userEmail = auth.currentUser.email;
      if (!userEmail || !currentPassword) {
        throw new Error("Mevcut şifre gereklidir.");
      }
      await signInWithEmailAndPassword(auth, userEmail, currentPassword);
    } catch (error) {
      throw new Error("Yeniden doğrulama başarısız. Lütfen şifrenizi kontrol edin.");
    }
  };

  // Kullanıcı bilgilerini güncelle
  const handleUpdate = async () => {
    if (!email || !fullName || !birthDate || !currentPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setLoading(true);

      // Kullanıcıyı yeniden doğrula
      await reauthenticateUser();

      // Firebase Authentication güncelleme
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, email);
        if (password) {
          await updatePassword(auth.currentUser, password);
        }
      }

      // Firestore'da güncelle
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        email,
        fullName,
        birthDate,
      });

      Alert.alert("Başarılı", "Bilgileriniz güncellendi.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", error.message || "Bilgiler güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
    //source={require("../assets/bilgiarkaa.png")}
     style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Bilgilerimi Güncelle</Text>

        {/* Mevcut Şifre */}
        <TextInput
          style={styles.input}
          placeholder="Mevcut Şifre"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholderTextColor="#000" // Placeholder yazısı siyah
        />

        {/* Yeni Ad */}
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#000" // Placeholder yazısı siyah
        />

        {/* Yeni Doğum Tarihi */}
        <TextInput
          style={styles.input}
          placeholder="Doğum Tarihi (YYYY-AA-GG)"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numeric"
          placeholderTextColor="#000" // Placeholder yazısı siyah
        />

        {/* Yeni E-posta */}
        <TextInput
          style={styles.input}
          placeholder="Yeni E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#000" // Placeholder yazısı siyah
        />

        {/* Yeni Şifre */}
        <TextInput
          style={styles.input}
          placeholder="Yeni Şifre (İsteğe bağlı)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#000" // Placeholder yazısı siyah
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Güncelleniyor..." : "Bilgileri Güncelle"}
          </Text>
        </TouchableOpacity>

        {/* Geri Dön Butonu */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>GERİ</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 30, 0.4)", // Arka planı hafif opak yapar
    borderRadius: 20,
    margin: 0,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#87C0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "rgb(115, 196, 205)", // Gökyüzü mavisi,
    color: "#000", // Girdi yazısı siyah
  },
  button: {
    backgroundColor: "#87CEEB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#87CEEB",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    marginTop:50,
    width:70,
    height:40,
  },
  backButtonText: {
    color: "#000", // Siyah renk
    fontSize: 16,
    fontWeight: "bold",
    
  },
});

export default UpdateInfoScreen;
