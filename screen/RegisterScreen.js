import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase"; // Firebase yapılandırmasını doğru yolda import edin
import { doc, setDoc } from "firebase/firestore"; // Firestore işlemleri için gerekli metodlar
import DateTimePicker from "@react-native-community/datetimepicker"; // Doğum tarihi seçimi için

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState(""); // İsim bilgisi (fullName yerine patientName olarak değiştirildi)
  const [birthDate, setBirthDate] = useState(new Date()); // Doğum tarihi
  const [showDatePicker, setShowDatePicker] = useState(false); // Tarih picker'ını gösterme durumu

  const handleSubmit = async () => {
    if (email && password && patientName && birthDate) {
      try {
        // Firebase ile kullanıcı oluşturma
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User created:", user);

        // Firestore'a kullanıcı bilgileri ekle ve rolü ata
        const docRef = doc(db, `users/${user.uid}`); // Kullanıcı bilgilerini UID'ye göre kaydediyoruz


        await setDoc(docRef, {
          email: user.email,
          patientName: patientName, // FullName yerine patientName olarak kaydediyoruz
          birthDate: birthDate.toISOString().split("T")[0], // Doğum tarihi
          role: "user", // Varsayılan rol
        });

        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        navigation.navigate("Login");
      } catch (err) {
        console.log("Got error:", err.message);
        alert(err.message); // Hata mesajını kullanıcıya göster
      }
    } else {
      alert("Lütfen tüm alanları doldurun.");
    }
  };

  return (
    <ImageBackground style={styles.background}>
      <View style={styles.container}>
        {/* Geri Dön Butonu */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.header}>Register</Text>

          {/* İsim */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="user" size={20} color="#ff7899" />
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              value={patientName}
              onChangeText={(value) => setPatientName(value)}
            />
          </View>

          {/* Doğum Tarihi */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="calendar-alt" size={20} color="#ff7899" />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.input}>{birthDate.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>
          </View>

          {/* Doğum Tarihi Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setBirthDate(selectedDate);
              }}
            />
          )}

          {/* Email */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={20} color="#ff7899" />
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={(value) => setEmail(value)}
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={20} color="#ff7899" />
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              value={password}
              onChangeText={(value) => setPassword(value)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginRedirect}
            onPress={() => navigation.navigate("Login")}
          >
            <Text>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#ff7899",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  form: {
    width: "80%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ff7899",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ff7899",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#ff7899",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginRedirect: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLink: {
    color: "#ff7899",
    fontWeight: "bold",
  },
});

export default RegisterScreen;