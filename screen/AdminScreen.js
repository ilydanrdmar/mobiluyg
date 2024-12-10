import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Button,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion } from "firebase/firestore";

const AdminScreen = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [newTestValue, setNewTestValue] = useState("");
  const [newTestDate, setNewTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchPatientName, setSearchPatientName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPatientDoc, setCurrentPatientDoc] = useState(null);

  const addPatientTest = async () => {
    if (!newPatientName || !newTestName || !newTestValue || !newTestDate) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const parsedValue = parseFloat(newTestValue.replace(",", "."));
    if (isNaN(parsedValue)) {
      alert("Geçerli bir değer girin!");
      return;
    }

    const newTest = {
      testName: newTestName,
      value: parsedValue,
      date: newTestDate.toISOString().split("T")[0],
    };

    try {
      const patientCollection = collection(db, "patients");
      const q = query(patientCollection, where("patientName", "==", newPatientName));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(patientCollection, { patientName: newPatientName, tests: [newTest] });
        alert("Hasta ve tahlil başarıyla eklendi!");
      } else {
        const patientDoc = snapshot.docs[0];
        const patientRef = patientDoc.ref;
        await updateDoc(patientRef, { tests: arrayUnion(newTest) });
        alert("Tahlil başarıyla eklendi!");
      }
      setNewPatientName("");
      setNewTestName("");
      setNewTestValue("");
      setNewTestDate(new Date());
    } catch (error) {
      console.error("Hata: ", error);
    }
  };

  const searchPatientTests = async () => {
    if (!searchPatientName) {
      alert("Lütfen bir hasta adı girin!");
      return;
    }
    try {
      const patientCollection = collection(db, "patients");
      const q = query(patientCollection, where("patientName", "==", searchPatientName));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        alert("Hasta bulunamadı!");
        setSearchResults([]);
      } else {
        const patientDoc = snapshot.docs[0];
        setCurrentPatientDoc(patientDoc);
        const patientData = patientDoc.data();
        setSearchResults(patientData.tests || []);
      }
    } catch (error) {
      console.error("Arama sırasında hata oluştu: ", error);
    }
  };

  const deleteTest = async (testToDelete) => {
    if (!currentPatientDoc) return;

    try {
      const updatedTests = searchResults.filter((test) => test.testName !== testToDelete.testName || test.date !== testToDelete.date);
      const patientRef = currentPatientDoc.ref;

      await updateDoc(patientRef, { tests: updatedTests });
      setSearchResults(updatedTests);
      alert("Tahlil başarıyla silindi!");
    } catch (error) {
      console.error("Silme sırasında hata oluştu: ", error);
    }
  };

  const renderDashboard = () => (
    // <ImageBackground
    //   source={require("../assets/adminarka.png")}
    //   style={styles.background}
    // >
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <Text style={styles.header}>ADMİN DASHBOARD</Text>
        <TouchableOpacity style={styles.card} onPress={() => setActiveSection("createGuide")}>
          <Text style={styles.cardText}>Kılavuz Oluştur</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setActiveSection("searchPatients")}>
          <Text style={styles.cardText}>Hasta Arama</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => alert("Diğer İşlevler")}>
          <Text style={styles.cardText}>Diğer İşlevler</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    // </ImageBackground>
  );

  const renderCreateGuide = () => (
    // <ImageBackground source={require("../assets/heklearka.png")} style={styles.backgroundhasta}>
    <View style={styles.backgroundhasta}>
      <Text style={styles.header}>Hasta Takibi</Text>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsAddingPatient(!isAddingPatient)}>
        <Text style={styles.toggleButtonText}>{isAddingPatient ? "Hasta Görüntüleme Modu" : "Hasta Ekle Modu"}</Text>
      </TouchableOpacity>
      {isAddingPatient ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Hasta Adı Soyadı" value={newPatientName} onChangeText={setNewPatientName} />
          <Picker selectedValue={newTestName} style={styles.picker} onValueChange={(itemValue) => setNewTestName(itemValue)}>
            <Picker.Item label="Tahlil Türü Seçin" value="" />
            <Picker.Item label="IgA" value="IgA" />
            <Picker.Item label="IgM" value="IgM" />
            <Picker.Item label="IgG" value="IgG" />
            <Picker.Item label="IgG1" value="IgG1" />
            <Picker.Item label="IgG2" value="IgG2" />
            <Picker.Item label="IgG3" value="IgG3" />
            <Picker.Item label="IgG4" value="IgG4" />
          </Picker>
          <TextInput style={styles.input} placeholder="Değer" value={newTestValue} onChangeText={setNewTestValue} keyboardType="decimal-pad" />
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>{newTestDate.toISOString().split("T")[0]}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newTestDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setNewTestDate(selectedDate);
              }}
            />
          )}
          <Button title="Ekle" onPress={addPatientTest} />
        </View>
      ) : (
        <View>
          <TextInput style={styles.input} placeholder="Hasta Adı Giriniz" value={searchPatientName} onChangeText={setSearchPatientName} />
          <Button title="Ara" onPress={searchPatientTests} />
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.testName}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.testName}>{item.testName}</Text>
                  <Text style={styles.result}>Tarih: {item.date} - Değer: {item.value.toFixed(2)}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTest(item)}>
                    <Text style={styles.deleteButtonText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noResult}>{searchPatientName ? "Sonuç Bulunamadı" : "Bir hasta adı girin."}</Text>
          )}
        </View>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection("dashboard")}>
        <Text style={styles.backButtonText}>Dashboard'a Dön</Text>
      </TouchableOpacity>
    </View>
    // </ImageBackground>
  );

  return <View style={styles.container}>{activeSection === "dashboard" ? renderDashboard() : renderCreateGuide()}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  background: { flex: 1 },
  backgroundhasta: { flex: 1 },
  dashboardContainer: { padding: 16, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", color: "#000", marginVertical: 20 },
  card: { marginVertical: 10, padding: 20, backgroundColor: "#007BFF", borderRadius: 10 },
  cardText: { color: "#fff", fontSize: 18 },
  toggleButton: { padding: 15, backgroundColor: "#007BFF", borderRadius: 5, marginBottom: 20, alignItems: "center" },
  toggleButtonText: { color: "#fff", fontSize: 16 },
  form: { padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  input: { height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 5 },
  testName: { fontSize: 16, fontWeight: "600" },
  result: { fontSize: 14, color: "#555" },
  deleteButton: { backgroundColor: "red", padding: 10, borderRadius: 5, marginTop: 10 },
  deleteButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  noResult: { marginTop: 20, textAlign: "center" },
  backButton: { marginTop: 20, padding: 15, backgroundColor: "#007BFF", borderRadius: 5 },
  backButtonText: { color: "#fff", fontSize: 16 },
  datePickerButton: { padding: 10, backgroundColor: "#007BFF", borderRadius: 5, marginBottom: 10 },
  datePickerText: { color: "#fff" },
});

export default AdminScreen;
