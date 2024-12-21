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
  const [age, setAge] = useState("");
  const [testValues, setTestValues] = useState({ IgA: "", IgM: "", IgG: "" });
  const [results, setResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentPatientBirthDate, setCurrentPatientBirthDate] = useState("");

  // Utility: Calculate Age in Months
  const calculateAgeInMonths = (birthDate, testDate) => {
    const birth = new Date(birthDate);
    const test = new Date(testDate);
    if (isNaN(birth.getTime()) || isNaN(test.getTime())) return null;

    const yearsInMonths = (test.getFullYear() - birth.getFullYear()) * 12;
    const monthsDifference = test.getMonth() - birth.getMonth();
    const daysDifference = test.getDate() - birth.getDate();

    let totalMonths = yearsInMonths + monthsDifference;
    if (daysDifference < 0) {
      totalMonths--;
    }
    return totalMonths;
  };

  // Utility: Classify Test Results
  const classifyTestResult = (testName, value, ageInMonths, guide) => {
    const ageGroup = guide.ageGroups.find((group) => {
      const match = group.ageGroup.match(/^(\d+)\s*(?:-<|<|–|>|-)?\s*(\d+)?\s*(months)?$/);
      if (!match) return false;

      const [_, minAge, maxAge] = match.map((age) => parseInt(age, 10));
      return ageInMonths >= minAge && ageInMonths <= maxAge;
    });

    if (!ageGroup) return { status: "Yaş grubu bulunamadı", range: null };

    const range = ageGroup.ranges[testName];
    if (!range) return { status: "Referans aralığı yok", range: null };

    if (value < range.min) return { status: "Düşük", range };
    if (value > range.max) return { status: "Yüksek", range };
    return { status: "Normal", range };
  };

  // Handle Test Click to Show Modal
  const handleTestClick = (test) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

   const addPatientTest = async () => {
    if (!newPatientName.trim() || !newTestName || !newTestValue.trim() || !newTestDate) {
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
      const q = query(patientCollection, where("patientName", "==", newPatientName.trim()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Eğer hasta bulunmazsa yeni bir hasta ekleniyor
        await addDoc(patientCollection, { 
          patientName: newPatientName.trim(), 
          tests: [newTest]
        });
        alert("Hasta ve tahlil başarıyla eklendi!");
      } else {
        // Hasta zaten varsa, mevcut testler alınır
        const patientDoc = snapshot.docs[0];
        const patientRef = patientDoc.ref;
  
        const currentTests = patientDoc.data().tests || [];
        
        let comparison;
        if (currentTests.length === 0) {
          // İlk test ekleniyorsa başlangıç olarak kabul edilir
          comparison = { icon: "Başlangıç", color: "gray" };
        } else {
          const lastTest = currentTests[currentTests.length - 1]; // Son test alınır
          comparison = compareValues(parsedValue, lastTest.value); // Sonraki test ile karşılaştırılır
        }
  
        // Eklenen testin karşılaştırma bilgilerini ekle
        newTest.comparison = comparison;
  
        // Testi Firestore'a ekleyin
        await updateDoc(patientRef, { tests: arrayUnion(newTest) });
        alert("Tahlil başarıyla eklendi!");
      }
  
      // Test sonrası input alanlarını sıfırlayın
      setNewPatientName("");
      setNewTestName("");
      setNewTestValue("");
      setNewTestDate(new Date());
    } catch (error) {
      console.error("Hata: ", error);
      alert("Tahlil eklenirken bir hata oluştu.");
    }
  };

    const deleteTest = async (testToDelete) => {
    if (!currentPatientDoc) {
      alert("Hasta seçilmedi!");
      return;
    }
  
    try {
      const patientRef = currentPatientDoc.ref;
      const patientData = currentPatientDoc.data();
      const updatedTests = (patientData.tests || []).filter(
        (test) =>
          test.testName !== testToDelete.testName ||
          test.value !== testToDelete.value ||
          test.date !== testToDelete.date
      );
  
      await updateDoc(patientRef, { tests: updatedTests });
      alert("Tahlil başarıyla silindi!");
  
      // Arama sonuçlarını güncelle
      setSearchResults(updatedTests);
    } catch (error) {
      console.error("Tahlil silinirken bir hata oluştu: ", error);
      alert("Tahlil silinirken bir hata oluştu.");
    }
  };

 const searchPatientTests = async () => {
    if (!searchPatientName.trim()) {
      alert("Lütfen bir hasta adı girin!");
      return;
    }
    try {
      const patientCollection = collection(db, "patients");
      const q = query(patientCollection, where("patientName", "==", searchPatientName.trim()));
  
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        alert("Hasta bulunamadı!");
        setSearchResults([]);
      } else {
        const patientDoc = snapshot.docs[0];
        setCurrentPatientDoc(patientDoc);
        const patientData = patientDoc.data();
        const tests = patientData.tests || [];
  
        if (tests.length > 0) {
          let previousValue = null;
  
          const updatedResults = tests.map((test) => {
            let comparison = { icon: "Başlangıç", color: "gray" };
  
            if (previousValue !== null) {
              if (test.value > previousValue) {
                comparison = { icon: "⬆", color: "red" };
              } else if (test.value < previousValue) {
                comparison = { icon: "⬇", color: "green" };
              } else {
                comparison = { icon: "↔️", color: "blue" };
              }
            }
  
            previousValue = test.value;
  
            return {
              ...test,
              comparison,
            };
          });
  
          setSearchResults(updatedResults);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Arama sırasında hata oluştu: ", error);
      alert("Hasta arama sırasında bir hata oluştu.");
    }
  };

    const calculateReferences = () => {
    const ageNum = parseInt(age, 10);
  
    if (isNaN(ageNum)) {
      alert("Lütfen geçerli bir yaş girin.");
      return;
    }
  
    const calculatedResults = guidelinesData.guidelines.map((guide) => {
      const result = {
        name: guide.name,
        ageGroups: [],
      };
  
      guide.ageGroups.forEach((ageGroup) => {
        const [minAge, maxAge] = ageGroup.ageGroup
          .replace("months", "")
          .replace("years", "")
          .split("-<")
          .map((val) => parseInt(val.trim(), 10));
  
        if (ageNum >= minAge && (!maxAge || ageNum < maxAge)) {
          const tests = Object.keys(testValues).map((test) => {
            const value = parseFloat(testValues[test]);
            const ranges = ageGroup.ranges[test] || {};
  
            const minMaxStatus =
              ranges.min && ranges.max
                ? value < ranges.min
                  ? "⬇"
                  : value > ranges.max
                  ? "⬆"
                  : "↔"
                : "-";
  
            const geoMinMaxStatus =
              ranges.geoMin && ranges.geoMax
                ? value < ranges.geoMin
                  ? "⬇"
                  : value > ranges.geoMax
                  ? "⬆"
                  : "↔"
                : "-";
  
            const meanMinMaxStatus =
              ranges.meanMin && ranges.meanMax
                ? value < ranges.meanMin
                  ? "⬇"
                  : value > ranges.meanMax
                  ? "⬆"
                  : "↔"
                : "-";
  
            const intervalStatus =
              ranges.interval
                ? value < ranges.interval[0]
                  ? "⬇"
                  : value > ranges.interval[1]
                  ? "⬆"
                  : "↔"
                : "-";
  
            return {
              test,
              value,
              statuses: {
                minMax: minMaxStatus,
                geoMinMax: geoMinMaxStatus,
                meanMinMax: meanMinMaxStatus,
                interval: intervalStatus,
              },
            };
          });
  
          result.ageGroups.push({
            ageGroup: ageGroup.ageGroup,
            tests,
          });
        }
      });
  
      return result;
    });
  
    setResults(calculatedResults);
  };
  const renderDashboard = () => (
   // <ImageBackground source={require("../assets/adminarka.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <Text style={styles.header}>ADMİN DASHBOARD</Text>
        <TouchableOpacity style={styles.card} onPress={() => setActiveSection("createGuide")}>
          <Text style={styles.cardText}>Hasta Ekle/Arama</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setActiveSection("searchPatients")}>
          <Text style={styles.cardText}>Kılavuz Görüntüle</Text>
        </TouchableOpacity>
      </ScrollView>
    
  );
  const renderCreateGuide = () => (
   // <ImageBackground source={require("../assets/heklearka.png")} style={styles.background}>
      <View style={styles.pinkContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection("dashboard")}>
          <Text style={styles.backButtonText}>GERİ</Text>
        </TouchableOpacity>
        
        <Text style={styles.header}>Hasta Arama</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsAddingPatient(!isAddingPatient)}
        >
          <Text style={styles.toggleButtonText}>
            {isAddingPatient ? "Hasta Arama Modu" : "Hasta Ekle Modu"}
          </Text>
        </TouchableOpacity>
  
        {isAddingPatient ? (
          // Patient Add Form
          <View>
            <TextInput
              style={styles.input}
              placeholder="Hasta Adı Soyadı"
              value={newPatientName}
              onChangeText={setNewPatientName}
            />
            <Picker
              selectedValue={newTestName}
              style={styles.picker}
              onValueChange={(itemValue) => setNewTestName(itemValue)}
            >
              <Picker.Item label="Tahlil Türü Seçin" value="" />
              <Picker.Item label="IgA" value="IgA" />
              <Picker.Item label="IgM" value="IgM" />
              <Picker.Item label="IgG" value="IgG" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Değer"
              value={newTestValue}
              onChangeText={setNewTestValue}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {newTestDate.toISOString().split("T")[0]}
              </Text>
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
          // Patient Search Form
          <View>
            <TextInput
              style={styles.input}
              placeholder="Hasta Adı Giriniz"
              value={searchPatientName}
              onChangeText={setSearchPatientName}
            />
            <Button title="Ara" onPress={searchPatientTests} />
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `${item.testName}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleTestClick(item)}>
                    <View style={styles.listItem}>
                      <Text style={styles.testName}>{item.testName}</Text>
                      <Text style={styles.result}>
                        Tarih: {item.date}, Değer: {item.value.toFixed(2)}{" "}
                        <Text style={{ color: item.comparison?.color || "gray" }}>
                          {item.comparison?.icon || "Başlangıç"}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTest(item)}
                      >
                        <Text style={styles.deleteButtonText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noResult}>Sonuç Bulunamadı</Text>
            )}
          </View>
        )}
      </View>
    
  );
  

const renderSearchPatients = () => (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Yaş ve Test Rehberi</Text>
      <TextInput
        style={styles.input}
        placeholder="Yaşınızı Girin"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <View style={styles.testContainer}>
        {Object.keys(testValues).map((key) => (
          <View key={key} style={styles.testBox}>
            <Text style={styles.testLabel}>{key}</Text>
            <TextInput
              style={styles.testInput}
              placeholder={`Değer girin (${key})`}
              value={testValues[key]}
              onChangeText={(value) =>
                setTestValues((prev) => ({ ...prev, [key]: value }))
              }
              keyboardType="numeric"
            />
          </View>
        ))}
      </View>
      <Button title="Hesapla" onPress={calculateReferences} />
      <ScrollView style={{ flex: 1 }}>
  {results.length > 0 ? (
    results.map((guide) => (
      <View key={guide.name} style={styles.guideContainer}>
        <Text style={styles.guideHeader}>{guide.name}</Text>
        {guide.ageGroups.map((ageGroup) => (
          <View key={ageGroup.ageGroup} style={styles.ageGroupContainer}>
            <Text style={styles.ageGroupHeader}>
              Yaş Grubu: {ageGroup.ageGroup}
            </Text>
            {ageGroup.tests.map((test) => (
              <View key={test.test} style={styles.testDetails}>
                <Text style={styles.testHeader}>{test.test}</Text>
                <Text>Değer: {test.value.toFixed(2)}</Text>
                <Text>Min - Max: {test.statuses.minMax}</Text>
                <Text>Geo Min - Max: {test.statuses.geoMinMax}</Text>
                <Text>Mean Min - Max: {test.statuses.meanMinMax}</Text>
                <Text>Interval Min - Max: {test.statuses.interval}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ))
  ) : (
    <Text>Sonuç bulunamadı.</Text>
  )}
</ScrollView>




      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setActiveSection("dashboard")}
      >
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {activeSection === "dashboard" && renderDashboard()}
      {activeSection === "createGuide" && renderCreateGuide()}
      {activeSection === "searchPatients" && renderSearchPatients()}
      {modalVisible && selectedTest && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalHeader}>{`Test: ${selectedTest.testName}`}</Text>
              {guidelinesData.guidelines.map((guide, index) => {
                const ageInMonths = calculateAgeInMonths(
                  currentPatientBirthDate,
                  selectedTest.date
                );
                const evaluation = classifyTestResult(
                  selectedTest.testName,
                  selectedTest.value,
                  ageInMonths,
                  guide
                );
                return (
                  <View key={index}>
                    <Text style={styles.guideHeader}>{guide.name}</Text>
                    <Text>
                      {`Durum: ${evaluation.status} (Min: ${
                        evaluation.range?.min || "N/A"
                      }, Max: ${evaluation.range?.max || "N/A"})`}
                    </Text>
                  </View>
                );
              })}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};
