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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase"; 
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (email && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Kullanıcı bilgilerini Firestore'dan alma
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
  
          // Kullanıcı rolü kontrolü
          if (userData.role === "admin") {
            // Admin kullanıcıyı AdminScreen'e yönlendirme
            navigation.replace("AdminScreen");
          } else if (userData.role === "user") {
            // Normal kullanıcı için hasta verilerini al
            const patientsRef = collection(db, "patients");
            const q = query(patientsRef, where("patientName", "==", userData.fullName));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              const patientDoc = querySnapshot.docs[0].data();
  
              // UserScreen'e yönlendirme ve veriyi aktarma
              navigation.replace("UserScreen", { patientData: patientDoc });
            } else {
              alert("No matching tahlil data found.");
            }
          } else {
            alert("Unknown role. Please contact support.");
          }
        } else {
          alert("User not found.");
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("Lütfen tüm alanları doldurun.");
    }
  };
  

  return (
    <ImageBackground style={styles.background}>
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.header}>Login</Text>

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
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* "Hesabın yok mu? Kaydol" kısmı */}
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerText}>Hesabın yok mu? <Text style={styles.registerLink}>Kaydol</Text></Text>
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
  registerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#ff7899",
  },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
