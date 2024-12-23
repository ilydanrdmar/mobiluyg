const UserScreen = ({ route, navigation }) => {
  const { patientData } = route.params;
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userBirthDate, setUserBirthDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
 

  const calculateAge = (birthDate, testDate) => {
    const birth = new Date(birthDate);
    const test = new Date(testDate);
    if (isNaN(birth.getTime()) || isNaN(test.getTime())) return "Geçersiz Tarih";

    let ageYears = test.getFullYear() - birth.getFullYear();
    let ageMonths = test.getMonth() - birth.getMonth();
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }
    return `${ageYears} yıl ${ageMonths} ay`;
  };

  const calculateAgeInMonths = (birthDate, testDate) => {
    const birth = new Date(birthDate);
    const test = new Date(testDate);
    if (isNaN(birth.getTime()) || isNaN(test.getTime())) return null;
  
    const yearsInMonths = (test.getFullYear() - birth.getFullYear()) * 12;
    const monthsDifference = test.getMonth() - birth.getMonth();
    const daysDifference = test.getDate() - birth.getDate();
  
    let totalMonths = yearsInMonths + monthsDifference;
    if (daysDifference < 0) {
      totalMonths--; // Eğer test günü doğum gününden önceyse, bir ay çıkar.
    }
    return totalMonths;
  };
  
  const classifyTestResult = (testName, value, ageInMonths, guide) => {
    const ageGroup = guide.ageGroups.find((group) => {
      // Düzenli ifadeyle yaş grubu ayrıştırma
      const match = group.ageGroup.match(
        /^(\d+)\s*(?:-<|<|–|>|-)?\s*(\d+)?\s*(months)?$/
      );
      if (!match) {
       
        return false;
      }
  
      let [_, minAge, maxAge] = match.map((age) => parseInt(age, 10));
  
      // Yaşın doğru gruba dahil olduğundan emin olun
      return ageInMonths >= minAge && ageInMonths <= maxAge;
    });
  
    if (!ageGroup) {
      
      return { status: "Yaş grubu bulunamadı", range: null };
    }
  
    const range = ageGroup.ranges[testName];
    if (!range) {
      console.log("Referans aralığı yok:", testName, ageGroup.ageGroup);
      return { status: "Referans aralığı yok", range: null };
    }
  
    if (value < range.min) return { status: "Düşük", range };
    if (value > range.max) return { status: "Yüksek", range };
    return { status: "Normal", range };
  };
  const handleLogout = async () => {
    try {
      await signOut(auth); // Kullanıcı oturumunu kapat
      console.log("Çıkış işlemi başarılı.");
      navigation.replace("Login"); // Kullanıcıyı Login ekranına yönlendir
    } catch (error) {
      console.error("Çıkış işlemi sırasında hata:", error.message);
    }
  };
  


  const fetchUserData = useCallback(async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("fullName", "==", patientData.patientName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUserBirthDate(querySnapshot.docs[0].data().birthDate);
      } else {
        setError("Kullanıcı bilgisi bulunamadı.");
      }
    } catch (err) {
      console.error("Kullanıcı verilerini çekerken hata: ", err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [patientData.patientName]);

  const fetchTests = async () => {
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
        const testData = querySnapshot.docs[0].data().tests || [];
        setTests(testData);
        setFilteredTests(testData);

        // Extract unique dates and test types for filtering
        const dates = [...new Set(testData.map((test) => test.date))];
        const testTypes = [...new Set(testData.map((test) => test.testName))];
        setAvailableDates(dates);
        setAvailableTests(testTypes);
        setFiltersVisible(true);
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

  const filterTests = () => {
    const filtered = tests.filter((test) => {
      return (
        (selectedDate ? test.date === selectedDate : true) &&
        (selectedTest ? test.testName === selectedTest : true)
      );
    });
    setFilteredTests(filtered);
  };

  const handleTestClick = (test) => {
    setSelectedTestDetails(test);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <ImageBackground style={styles.background}>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <MaterialIcons name="logout" size={24} color="#fff" />
    </TouchableOpacity>

    <View style={styles.container}>
      <Text style={styles.header}>Hoş Geldiniz</Text>

      <TouchableOpacity
        style={styles.stylishButton}
        onPress={() => navigation.navigate("UpdateInfo", { patientData })}
      >
        <Text style={styles.buttonText}>Bilgilerimi Güncelle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.stylishButton} onPress={fetchTests}>
        <Text style={styles.buttonText}>
          {loading ? "Yükleniyor..." : "Tahlillerimi Görüntüle"}
        </Text>
        </TouchableOpacity>
        

        {filtersVisible && (
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.label}>Tarih Seçin:</Text>
                <Picker
                  selectedValue={selectedDate}
                  onValueChange={(value) => {
                    setSelectedDate(value);
                    filterTests();
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Tüm Tarihler" value="" />
                  {availableDates.map((date, index) => (
                    <Picker.Item key={index} label={date} value={date} />
                  ))}
                </Picker>
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.label}>Test Türü Seçin:</Text>
                <Picker
                  selectedValue={selectedTest}
                  onValueChange={(value) => {
                    setSelectedTest(value);
                    filterTests();
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Tüm Test Türleri" value="" />
                  {availableTests.map((test, index) => (
                    <Picker.Item key={index} label={test} value={test} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        )}

<FlatList
  data={filteredTests}
  keyExtractor={(item, index) => `${item.testName}-${index}`}
  renderItem={({ item, index }) => {
    const ageAtTest = calculateAge(userBirthDate, item.date);

    // Aynı test türü için önceki testi bul
    const previousTest = filteredTests
      .slice(0, index)
      .reverse()
      .find((test) => test.testName === item.testName);

    // Değer karşılaştırması yap
    let comparison = "";
    let arrowStyle = {}; // Oku renklendirmek için stil

    if (previousTest) {
      if (item.value > previousTest.value) {
        comparison = "Yüksek";
        arrowStyle = { color: "red" };
      } else if (item.value < previousTest.value) {
        comparison = "Düşük";
        arrowStyle = { color: "green" };
      } else {
        comparison = "Aynı";
        arrowStyle = { color: "blue" };
      }
    } else {
      comparison = "Başlangıç";
    }

    return (
      <TouchableOpacity
        style={styles.testContainer}
        onPress={() => handleTestClick(item)}
      >
        <Text style={styles.testName}>{item.testName}</Text>
        <Text style={styles.testValue}>Değer: {item.value}</Text>
        <Text style={styles.testDate}>
          Tarih: {item.date} ({ageAtTest}){" "}
          <Text style={arrowStyle}>
            {comparison === "Yüksek" ? "⬆" : comparison === "Düşük" ? "⬇" : comparison === "Aynı" ? "↔️" : ""}
          </Text>{" "}
          {comparison}
        </Text>
      </TouchableOpacity>
    );
  }}
/>


        {modalVisible && selectedTestDetails && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <ScrollView>
                <Text style={styles.modalHeader}>
                  Test: {selectedTestDetails.testName}
                </Text>
                {guidelinesData.guidelines.map((guide, index) => {
                  const ageInMonths = calculateAgeInMonths(
                    userBirthDate,
                    selectedTestDetails.date
                  );
                  const evaluation = classifyTestResult(
                    selectedTestDetails.testName,
                    selectedTestDetails.value,
                    ageInMonths,
                    guide
                  );

                  return (
                    <View key={index}>
                      <Text style={styles.guideName}>{guide.name}</Text>
                      <Text>
                        Durum: {evaluation.status} (Min: {" "}
                        {evaluation.range?.min || "N/A"} - Max: {" "}
                        {evaluation.range?.max || "N/A"})
                      </Text>
                      
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 32,
    textAlign: "center",
    marginVertical: 20,
  },
  stylishButton: {
    backgroundColor: "#004080",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  logoutButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#1E90FF", // Kırmızımsı bir arka plan rengi
    padding: 10,
    borderRadius: 8,
    zIndex: 10, // Üstte kalmasını sağlar
  },
  testContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 10,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#004080",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UserScreen;
