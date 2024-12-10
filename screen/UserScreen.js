import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../config/firebase";

// Referans aralıkları (örnek JSON)
const referenceRanges = {
  IgA: {
    "0-1": [0, 11],
    "1-4": [6, 50],
    "5-10": [20, 230],
    "10+": [50, 312],
  },
  IgM: {
    "0-1": [5, 30],
    "1-4": [15, 70],
    "5-10": [25, 120],
    "10+": [36, 352],
  },
  IgG: {
    "0-1": [200, 750],
    "1-4": [280, 950],
    "5-10": [380, 1250],
    "10+": [450, 1650],
  },
  IgG1: {
    "0-1": [218, 496],
    "1-4": [286, 680],
    "5-10": [422, 938],
    "10+": [422, 1292],
  },
  IgG2: {
    "0-1": [40, 167],
    "1-4": [70, 443],
    "5-10": [113, 513],
    "10+": [117, 747],
  },
  IgG3: {
    "0-1": [4, 23],
    "1-4": [13, 82],
    "5-10": [15, 133],
    "10+": [23, 129],
  },
  IgG4: {
    "0-1": [1, 120],
    "1-4": [1, 212],
    "5-10": [1, 153],
    "10+": [10, 67],
  },
};

const UserScreen = ({ route, navigation }) => {
  const { patientData } = route.params; // LoginScreen'den gelen veriyi al
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Yaşı hesaplayan fonksiyon
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Eğer doğum günü bu yıl içinde henüz gerçekleşmemişse yaşı bir azalt
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  // Yaşı hesaplayarak sınıflandırma yapan fonksiyon
  const classifyResult = (testName, value, birthDate) => {
    const age = calculateAge(birthDate); // Doğum tarihinden yaşı hesapla
    const ageGroup =
      age <= 1 ? "0-1" : age <= 4 ? "1-4" : age <= 10 ? "5-10" : "10+";
    const referenceRange = referenceRanges[testName]?.[ageGroup];

    if (!referenceRange) return "Referans aralığı bulunamadı";

    if (value < referenceRange[0]) return "Düşük";
    if (value > referenceRange[1]) return "Yüksek";
    return "Normal";
  };

  const fetchTests = async () => {
    if (!patientData?.patientName) {
      setError("Hasta bilgileri eksik. Lütfen geri dönün.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientsRef = collection(db, "patients");
      const q = query(
        patientsRef,
        where("patientName", "==", patientData.patientName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const patientDoc = querySnapshot.docs[0].data();
        setTests(patientDoc.tests || []);
      } else {
        setError("Tahlil bilgisi bulunamadı.");
      }
    } catch (err) {
      console.error("Tahlilleri çekerken hata: ", err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
  //    source={require("../assets/tahlilarka.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Geri Dön Butonu */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.header}>Hoş Geldiniz</Text>
        <Text style={styles.header2}>
          {patientData?.fullName
            ? `${patientData.fullName}, tahlil sonuçlarınızı görüntülemek için tıklayın!`
            : "TAHLİL SONUÇLARINIZI GÖRÜNTÜLEMEK İÇİN TIKLAYIN"}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.stylishButton}
            onPress={fetchTests}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Yükleniyor..." : "Tahlillerimi Görüntüle"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#000080" />}
        {error && !loading && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && tests.length > 0 && (
          <FlatList
            data={tests}
            keyExtractor={(item, index) => `${item.testName}-${index}`}
            renderItem={({ item }) => {
              const classification = classifyResult(
                item.testName,
                item.value,
                patientData.birthDate
              );
              const classificationColor =
                classification === "Düşük"
                  ? "red"
                  : classification === "Yüksek"
                  ? "orange"
                  : "green";

              return (
                <View style={styles.testContainer}>
                  <Text style={styles.testName}>{item.testName}</Text>
                  <Text style={styles.testValue}>
                    Değer: {item.value} -{" "}
                    <Text style={{ color: classificationColor }}>
                      {classification}
                    </Text>
                  </Text>
                  <Text style={styles.testDate}>Tarih: {item.date}</Text>
                </View>
              );
            }}
          />
        )}

        {!loading && !error && tests.length === 0 && (
          <Text style={styles.noDataText}>Tahlil sonucu bulunamadı.</Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#004080",
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  header: {
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 75,
    color: "#000080",
  },
  header2: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 55,
    color: "#000080",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  stylishButton: {
    backgroundColor: "#004080",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  testContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  testName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  testValue: {
    fontSize: 14,
    marginTop: 5,
  },
  testDate: {
    fontSize: 14,
    marginTop: 5,
    color: "grey",
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "grey",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "red",
  },
});

export default UserScreen;
