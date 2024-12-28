import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "react-native-vector-icons";
import { Picker } from "@react-native-picker/picker";
import { collection, query, where, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../config/firebase";
import { signOut } from "firebase/auth"; // Firebase signOut fonksiyonunu import et
import { auth } from "../config/firebase"; // Firebase yapılandırma dosyanızdan auth import edin

const guidelinesData = {
  guidelines: [
    {
      name: "Kılavuz 1",
      ageGroups: [
        {
          ageGroup: "0-<5 months",
          ranges: {
            IgG: { min: 1.0, max: 1.34 },
            IgA: { min: 0.07, max: 0.37 },
            IgM: { min: 0.26, max: 1.22 },
            IgG1: { min: 0.56, max: 2.15 },
            IgG2: { min: 0.0, max: 0.82 },
            IgG3: { min: 0.076, max: 8.23 },
            IgG4: { min: 0.0, max: 0.198 },
          },
        },
                {
          "ageGroup": "5-<9 months",
          "ranges": {
            "IgG": { "min": 1.64, "max": 5.88 },
            "IgA": { "min": 0.16, "max": 0.5 },
            "IgM": { "min": 0.32, "max": 1.32 },
            "IgG1": { "min": 1.02, "max": 3.69 },
            "IgG2": { "min": 0.0, "max": 0.89 },
            "IgG3": { "min": 0.119, "max": 0.740 },
            "IgG4": { "min": 0.0, "max": 0.208 }
          }
        },
        // Diğer yaş grupları buraya eklenecek...
        {
        "ageGroup": "9-<15 months",
          "ranges": {
             "IgG": { "min": 2.46, "max": 9.04 }, 
             "IgA": { "min": 0.27, "max": 0.66 }, 
             "IgM": { "min": 0.4, "max": 1.43 }, 
             "IgG1": { "min": 1.6, "max": 5.62 }, 
             "IgG2": { "min": 0.24, "max": 0.98 },
             "IgG3": { "min": 0.173, "max": 0.637 },
             "IgG4": { "min": 0.0, "max": 0.220 }
          }
        },
          { 
        "ageGroup": "15-<24 months", 
        "ranges": { 
          "IgG": { "min": 3.13, "max": 11.7 }, 
          "IgA": { "min": 0.36, "max": 0.79 }, 
          "IgM": { "min": 0.46, "max": 1.52 }, 
          "IgG1": { "min": 2.09, "max": 7.24 }, 
          "IgG2": { "min": 0.35, "max": 1.05 },
          "IgG3": { "min": 0.219, "max": 0.550 },
          "IgG4": { "min": 0.0, "max": 0.230 }
      } 
    },
          { 
      "ageGroup": "24-48 months", // 2-<4 years
      "ranges": { 
        "IgG": { "min": 2.95, "max": 11.56 }, 
        "IgA": { "min": 0.27, "max": 2.46 }, 
        "IgM": { "min": 0.37, "max": 1.84 }, 
        "IgG1": { "min": 1.58, "max": 7.21 }, 
        "IgG2": { "min": 0.39, "max": 1.76 },
        "IgG3": { "min": 0.170, "max": 0.847 },
        "IgG4": { "min": 0.004, "max": 0.491 }
      } 
    },
            { 
      "ageGroup": "4-<7 years", 
      "ranges": { 
        "IgG": { "min": 3.86, "max": 14.7 }, 
        "IgA": { "min": 0.29, "max": 2.56 }, 
        "IgM": { "min": 0.37, "max": 2.24 }, 
        "IgG1": { "min": 2.09, "max": 9.02 }, 
        "IgG2": { "min": 0.44, "max": 3.16 },
         "IgG3": { "min": 0.108, "max": 0.949 },
        "IgG4": { "min": 0.008, "max": 0.819 }
      } 
    }, 
    { 
      "ageGroup": "7-<10 years", 
      "ranges": { 
        "IgG": { "min": 4.62, "max": 16.82 }, 
        "IgA": { "min": 0.34, "max": 2.74 }, 
        "IgM": { "min": 0.38, "max": 2.51 }, 
        "IgG1": { "min": 2.53, "max": 10.19 }, 
        "IgG2": { "min": 0.54, "max": 4.35 },
         "IgG3": { "min": 0.085, "max": 10.26 },
        "IgG4": { "min": 0.010, "max": 1.087 }
      } 
    }, 
    { 
      "ageGroup": "10-<13 years", 
      "ranges": { 
        "IgG": { "min": 5.03, "max": 15.8 }, 
        "IgA": { "min": 0.42, "max": 2.95 }, 
        "IgM": { "min": 0.41, "max": 2.55 }, 
        "IgG1": { "min": 2.8, "max": 10.3 }, 
        "IgG2": { "min": 0.66, "max": 5.02 },
         "IgG3": { "min": 0.115, "max": 10.53 },
        "IgG4": { "min": 0.010, "max": 1.219 }
      } 
    }, 
    { 
      "ageGroup": "13-<16 years", 
      "ranges": { 
        "IgG": { "min": 5.09, "max": 15.8 }, 
        "IgA": { "min": 0.52, "max": 3.19 }, 
        "IgM": { "min": 0.45, "max": 2.44 }, 
        "IgG1": { "min": 2.89, "max": 9.34 }, 
        "IgG2": { "min": 0.82, "max": 5.16 },
         "IgG3": { "min": 0.200, "max": 10.32 },
        "IgG4": { "min": 0.007, "max": 1.217 }
      } 
    }, 
    { 
      "ageGroup": "16-<18 years", 
      "ranges": { 
        "IgG": { "min": 4.87, "max": 13.27 }, 
        "IgA": { "min": 0.6, "max": 3.37 }, 
        "IgM": { "min": 0.49, "max": 2.01 }, 
        "IgG1": { "min": 2.83, "max": 7.72 }, 
        "IgG2": { "min": 0.98, "max": 4.86 },
         "IgG3": { "min": 0.313, "max": 0.976 },
        "IgG4": { "min": 0.003, "max": 1.110 }
      } 
    }, 
    { 
      "ageGroup": ">18 years", 
      "ranges": { 
        "IgG": { "min": 7.67, "max": 15.9 }, 
        "IgA": { "min": 0.61, "max": 3.56 }, 
        "IgM": { "min": 0.37, "max": 2.86 }, 
        "IgG1": { "min": 3.41, "max": 8.94 }, 
        "IgG2": { "min": 1.71, "max": 6.32 },
         "IgG3": { "min": 0.184, "max": 10.60 },
        "IgG4": { "min": 0.024, "max": 1.210 }
      } 
    } 
     
      ],
    },
    {
      name: "Kılavuz 2",
      ageGroups: [
        {
          ageGroup: "0-1 months",
          ranges: {
            IgG: { min: 7.00, max: 13.00 },
            IgA: { min: 0.00, max: 0.11 },
            IgM: { min: 0.05, max: 0.30 },
            IgG1: { min: 2.18, max: 4.96 },
            IgG2: { min: 0.40, max: 1.67 },
            IgG3: { min: 0.04, max: 0.23 },
            IgG4: { min: 0.01, max: 1.20 },
          },
        },
         { 
      "ageGroup": "1-3 months", 
      "ranges": { 
        "IgG": { "min": 2.80, "max": 7.50 }, 
        "IgA": { "min": 0.06, "max": 0.50 }, 
        "IgM": { "min": 0.15, "max": 0.70 }, 
        "IgG1": { "min": 2.18, "max": 4.96 }, 
        "IgG2": { "min": 0.40, "max": 1.67 }, 
        "IgG3": { "min": 0.04, "max": 0.23 }, 
        "IgG4": { "min": 0.01, "max": 1.20 } 
      } 
    }, 
    { 
      "ageGroup": "3-4 months", 
      "ranges": { 
        "IgG": { "min": 2.80, "max": 7.50 }, 
        "IgA": { "min": 0.06, "max": 0.50 }, 
        "IgM": { "min": 0.15, "max": 0.70 }, 
        "IgG1": { "min": 1.43, "max": 3.94 }, 
        "IgG2": { "min": 0.23, "max": 1.47 }, 
        "IgG3": { "min": 0.04, "max": 1.00 }, 
        "IgG4": { "min": 0.01, "max": 1.20 } 
      } 
    }, 
    { 
      "ageGroup": "4-6 months", 
      "ranges": { 
        "IgG": { "min": 2.00, "max": 12.00 }, 
        "IgA": { "min": 0.08, "max": 0.90 }, 
        "IgM": { "min": 0.10, "max": 0.90 }, 
        "IgG1": { "min": 1.43, "max": 3.94 }, 
        "IgG2": { "min": 0.23, "max": 1.47 }, 
        "IgG3": { "min": 0.04, "max": 1.00 }, 
        "IgG4": { "min": 0.01, "max": 1.20 } 
      } 
    }, 
    { 
      "ageGroup": "6-7 months", 
      "ranges": { 
        "IgG": { "min": 2.00, "max": 12.00 }, 
        "IgA": { "min": 0.08, "max": 0.90 }, 
        "IgM": { "min": 0.10, "max": 0.90 }, 
        "IgG1": { "min": 1.9, "max": 3.88 }, 
        "IgG2": { "min": 0.37, "max": 0.6 }, 
        "IgG3": { "min": 0.12, "max": 0.62 }, 
        "IgG4": { "min": 0.01, "max": 1.20 } 
      } 
    }, 
    {
      "ageGroup": "7-9 months",
      "ranges": {
        "IgG": { "min": 3.00, "max": 15.00 },
        "IgA": { "min": 0.16, "max": 1.00 },
        "IgM": { "min": 0.25, "max": 1.15 },
        "IgG1": { "min": 1.9, "max": 3.88 }, 
        "IgG2": { "min": 0.37, "max": 0.6 }, 
        "IgG3": { "min": 0.12, "max": 0.62 }, 
        "IgG4": { "min": 0.01, "max": 1.20 } 
      }
    },
    {
      "ageGroup": "9-13 months",
      "ranges": {
        "IgG": { "min": 3.00, "max": 15.00 },
        "IgA": { "min": 0.16, "max": 1.00 },
        "IgM": { "min": 0.25, "max": 1.15 },
        "IgG1": { "min": 2.86, "max": 6.8 },
        "IgG2": { "min": 0.3, "max": 3.27 },
        "IgG3": { "min": 0.13, "max": 0.82 },
        "IgG4": { "min": 0.01, "max": 1.2 }
      }
    },
    {
      "ageGroup": "13-24 months",
      "ranges": {
        "IgG": { "min": 4.00, "max": 13.00 },
        "IgA": { "min": 0.2, "max": 2.3 },
        "IgM": { "min": 0.3, "max": 1.20 },
        "IgG1": { "min": 2.86, "max": 6.8 },
        "IgG2": { "min": 0.3, "max": 3.27 },
        "IgG3": { "min": 0.13, "max": 0.82 },
        "IgG4": { "min": 0.01, "max": 1.2 }
      }
    },
    { 
      "ageGroup": "24-36 months", 
      "ranges": { 
        "IgG": { "min": 4.00, "max": 13.00 },
        "IgA": { "min": 0.2, "max": 2.3 },
        "IgM": { "min": 0.3, "max": 1.20 }, 
        "IgG1": { "min": 3.81, "max": 8.84 }, 
        "IgG2": { "min": 0.70, "max": 4.43 }, 
        "IgG3": { "min": 0.17, "max": 0.90 }, 
        "IgG4": { "min": 0.01, "max": 1.12 } 
      } 
    }, 
    { 
      "ageGroup": "3-4 years", 
      "ranges": { 
        "IgG": { "min": 6.00, "max": 15.00 }, 
        "IgA": { "min": 0.50, "max": 1.50 }, 
        "IgM": { "min": 0.22, "max": 1.00 }, 
        "IgG1": { "min": 3.81, "max": 8.84 }, 
        "IgG2": { "min": 0.70, "max": 4.43 }, 
        "IgG3": { "min": 0.07, "max": 0.90 }, 
        "IgG4": { "min": 0.02, "max": 1.12 } 
      } 
    }, 
    { 
      "ageGroup": "4-6 years", 
      "ranges": { 
        "IgG": { "min": 6.00, "max": 15.00 }, 
        "IgA": { "min": 0.50, "max": 1.50 }, 
        "IgM": { "min": 0.22, "max": 1.00 }, 
        "IgG1": { "min": 2.92, "max": 8.16 }, 
        "IgG2": { "min": 0.83, "max": 5.13 }, 
        "IgG3": { "min": 0.08, "max": 1.11 }, 
        "IgG4": { "min": 0.02, "max": 1.12 }
      } 
    }, 
    { 
      "ageGroup": "6-8 years", 
      "ranges": { 
        "IgG": { "min": 6.39, "max": 13.44 }, 
        "IgA": { "min": 0.70, "max": 3.12 }, 
        "IgM": { "min": 0.56, "max": 3.52 }, 
        "IgG1": { "min": 4.22, "max": 8.02 }, 
        "IgG2": { "min": 1.13, "max": 4.80 }, 
        "IgG3": { "min": 0.15, "max": 1.33 }, 
        "IgG4": { "min": 0.10, "max": 1.38 } 
      } 
    }, 
    { 
      "ageGroup": "8-10 years", 
      "ranges": { 
       "IgG": { "min": 6.39, "max": 13.44 }, 
        "IgA": { "min": 0.70, "max": 3.12 }, 
        "IgM": { "min": 0.56, "max": 3.52 }, 
        "IgG1": { "min": 4.56, "max": 9.38 }, 
        "IgG2": { "min": 1.63, "max": 5.13 }, 
        "IgG3": { "min": 0.26, "max": 1.13 }, 
        "IgG4": { "min": 0.10, "max": 0.95 } 
      } 
    }, 
    { 
      "ageGroup": "10-12 years", 
      "ranges": { 
        "IgG": { "min": 6.39, "max": 13.44 }, 
        "IgA": { "min": 0.70, "max": 3.12 }, 
        "IgM": { "min": 0.56, "max": 3.52 }, 
        "IgG1": { "min": 4.56, "max": 9.52 }, 
        "IgG2": { "min": 1.47, "max": 4.93 }, 
        "IgG3": { "min": 0.12, "max": 1.79 }, 
        "IgG4": { "min": 0.10, "max": 1.53 } 
      } 
    }, 
    { 
    "ageGroup": "12-14 years", 
    "ranges": { 
      "IgG": { "min": 6.39, "max": 13.44 }, 
      "IgA": { "min": 0.70, "max": 3.12 }, 
      "IgM": { "min": 0.56, "max": 3.52 }, 
      "IgG1": { "min": 3.47, "max": 9.93 }, 
      "IgG2": { "min": 1.40, "max": 4.40 }, 
      "IgG3": { "min": 0.23, "max": 1.17 }, 
      "IgG4": { "min": 0.10, "max": 1.43 } 
    } 
    }, 
 
    { 
      "ageGroup": "Adult", 
      "ranges": { 
        "IgG": { "min": 6.39, "max": 13.44 }, 
        "IgA": { "min": 0.70, "max": 3.12 }, 
        "IgM": { "min": 0.56, "max": 3.52 },
        "IgG1": { "min": 4.22, "max": 12.92 }, 
        "IgG2": { "min": 1.17, "max": 7.47 }, 
        "IgG3": { "min": 0.41, "max": 1.29 }, 
        "IgG4": { "min": 0.10, "max": 0.67 } 
      } 
    } 
      ],
    },
    {
      name: "Kılavuz 3",
      ageGroups: [
        {
          ageGroup: "1-3 months",
          ranges: {
            IgG: { min: 2.27, max: 7.70 },
            IgA: { min: 0.06, max: 0.47 },
            IgM: { min: 0.19, max: 0.87 },
          },
        },
       {  
        ageGroup: "4-6 Ay",  
         ranges: {
        "IgG (Min-Max)": "1.41-6.91",  //1.41-6.91
        "IgA (Min-Max)": "0.07-0.63",  //0.07-0.63
        "IgM (Min-Max)": "0.18-1.36"  //0.18-1.36
        },  
         },
        {  
        ageGroup: "7-12 Ay",  
         ranges: {  
        "IgG (Min-Max)": "3.50-10.10",  
        "IgA (Min-Max)": "0.12-1.14",  
        "IgM (Min-Max)": "0.28-1.15"  
        },  
        },
        {  
       ageGroup: "13-24 months",  
         ranges: {  
          IgG: { min: 4.32, max: 9.90 },
          IgA: { min: 0.15, max: 0.52 },
          IgM: { min: 0.32, max: 1.48 },
        },  
        },
        {  
          ageGroup: "25-36 months",
          ranges: {
            IgG: { min: 4.37, max: 13.20 },
            IgA: { min: 0.24, max: 0.84 },
            IgM: { min: 0.47, max: 1.44 },
          }, 
        },
        {  
          ageGroup: "48-60 months", // 4-5 years = 48-60 months
          ranges: {
            IgG: { min: 5.24, max: 14.00 },
            IgA: { min: 0.55, max: 1.35 },
            IgM: { min: 0.68, max: 2.05 },
          }, 
        }, 
        {  
          ageGroup: "72-96 months", // 6-8 years = 72-96 months
          ranges: {
            IgG: { min: 8.58, max: 16.00 },
            IgA: { min: 0.81, max: 2.64 },
            IgM: { min: 0.47, max: 1.98 },
          },  
        }, 
        {    ageGroup: "108-132 months", // 9-11 years = 108-132 months
          ranges: {
            IgG: { min: 6.45, max: 15.20 },
            IgA: { min: 0.78, max: 3.34 },
            IgM: { min: 0.38, max: 1.63 },
          },  
                 },
                {  
                  ageGroup: "144-192 months", // 12-16 years = 144-192 months
                  ranges: {
                    IgG: { min: 8.77, max: 16.20 },
                    IgA: { min: 0.87, max: 2.34 },
                    IgM: { min: 0.47, max: 2.85 },
                  }, 
                 },  
                {  
                  ageGroup: "204-216 months", // 17-18 years = 204-216 months
                  ranges: {
                    IgG: { min: 7.58, max: 17.60 },
                    IgA: { min: 1.11, max: 3.50 },
                    IgM: { min: 0.61, max: 1.80 },
                  },
                    },
      ],
    },
    {
      name: "Kılavuz 4",
      ageGroups: [
        {
          ageGroup: "0-30 days",
          ranges: {
            IgG: { min: 4.92, max: 11.90 },
            IgA: { min: 0.05, max: 0.058 },
            IgM: { min: 0.173, max: 0.296 },
            IgG1: { min: 4.30, max: 8.97 },
            IgG2: { min: 0.87, max: 2.63 },
            IgG3: { min: 0.18, max: 0.78 },
            IgG4: { min: 0.17, max: 0.81 },
          },
        },
       {
  ageGroup: "1-5 months",
  ranges: {
    IgG: { min: 2.70, max: 7.92 },
    IgA: { min: 0.058, max: 0.58 },
    IgM: { min: 0.184, max: 1.45 },
    IgG1: { min: 1.60, max: 5.74 },
    IgG2: { min: 0.32, max: 1.08 },
    IgG3: { min: 0.13, max: 0.53 },
    IgG4: { min: 0.02, max: 0.48 },
  },
},  
       {
  ageGroup: "6-8 months",
  ranges: {
    IgG: { min: 2.68, max: 8.98 },
    IgA: { min: 0.058, max: 0.858 },
    IgM: { min: 0.264, max: 1.46 },
    IgG1: { min: 2.79, max: 8.20 },
    IgG2: { min: 0.36, max: 1.46 },
    IgG3: { min: 0.14, max: 1.00 },
    IgG4: { min: 0.02, max: 0.52 },
  },
},
        {
  ageGroup: "9-12 months",
  ranges: {
    IgG: { min: 4.21, max: 11.00 },
    IgA: { min: 0.184, max: 1.54 },
    IgM: { min: 0.235, max: 1.80 },
    IgG1: { min: 3.28, max: 12.50 },
    IgG2: { min: 0.25, max: 1.61 },
    IgG3: { min: 0.18, max: 1.10 },
    IgG4: { min: 0.02, max: 0.20 },
  },
},
       {
  ageGroup: "13-24 months",
  ranges: {
    IgG: { min: 3.65, max: 12.00 },
    IgA: { min: 0.115, max: 0.943 },
    IgM: { min: 0.256, max: 2.01 },
    IgG1: { min: 3.44, max: 14.35 },
    IgG2: { min: 0.31, max: 2.64 },
    IgG3: { min: 0.16, max: 1.32 },
    IgG4: { min: 0.02, max: 0.99 },
  },
},
        {
  ageGroup: "25-36 months",
  ranges: {
    IgG: { min: 4.30, max: 12.90 },
    IgA: { min: 0.23, max: 1.30 },
    IgM: { min: 0.36, max: 1.99 },
    IgG1: { min: 3.40, max: 14.70 },
    IgG2: { min: 0.43, max: 3.80 },
    IgG3: { min: 0.14, max: 1.25 },
    IgG4: { min: 0.20, max: 1.71 },
    geoMean: { min: 0.3, max: 0.7 },
    normalMean: { min: 0.4, max: 0.76 },
    confidenceInterval: { min: 0.48, max: 0.82 },
  },
},

      {
  ageGroup: "37-48 months",
  ranges: {
    IgG: { min: 5.39, max: 12.00 },
    IgA: { min: 0.407, max: 1.15 },
    IgM: { min: 0.261, max: 1.88 },
    IgG1: { min: 4.39, max: 13.33 },
    IgG2: { min: 0.60, max: 4.10 },
    IgG3: { min: 0.15, max: 1.20 },
    IgG4: { min: 0.04, max: 1.85 },
  },
},
       {
  ageGroup: "49-72 months",
  ranges: {
    IgG: { min: 5.28, max: 14.90 },
    IgA: { min: 0.23, max: 2.051 },
    IgM: { min: 0.333, max: 2.07 },
    IgG1: { min: 4.68, max: 13.33 },
    IgG2: { min: 0.85, max: 4.40 },
    IgG3: { min: 0.15, max: 1.07 },
    IgG4: { min: 0.08, max: 2.27 },
  },
},
        {
  ageGroup: "7-8 years",
  ranges: {
    IgG: { min: 5.27, max: 15.90 },
    IgA: { min: 0.361, max: 2.68 },
    IgM: { min: 0.305, max: 2.20 },
    IgG1: { min: 4.20, max: 14.70 },
    IgG2: { min: 0.67, max: 4.60 },
    IgG3: { min: 0.21, max: 1.86 },
    IgG4: { min: 0.02, max: 1.98 },
  },
},
      {
  ageGroup: "9-10 years",
  ranges: {
    IgG: { min: 6.46, max: 16.20 },
    IgA: { min: 0.54, max: 2.68 },
    IgM: { min: 0.337, max: 2.57 },
    IgG1: { min: 3.80, max: 18.40 },
    IgG2: { min: 0.70, max: 5.43 },
    IgG3: { min: 0.20, max: 1.86 },
    IgG4: { min: 0.05, max: 2.02 },
  },
},
     {
  ageGroup: "11-12 years",
  ranges: {
    IgG: { min: 5.79, max: 16.10 },
    IgA: { min: 0.27, max: 1.98 },
    IgM: { min: 0.30, max: 1.87 },
    IgG1: { min: 5.99, max: 15.60 },
    IgG2: { min: 1.11, max: 5.15 },
    IgG3: { min: 0.29, max: 2.00 },
    IgG4: { min: 0.04, max: 1.60 },
  },
},
{
  ageGroup: "13-14 years",
  ranges: {
    IgG: { min: 7.41, max: 16.50 },
    IgA: { min: 0.524, max: 2.25 },
    IgM: { min: 0.44, max: 2.06 },
    IgG1: { min: 4.90, max: 15.60 },
    IgG2: { min: 1.00, max: 5.73 },
    IgG3: { min: 0.28, max: 2.23 },
    IgG4: { min: 0.10, max: 1.44 },
  },
}, 
       {
  ageGroup: "15-16 years",
  ranges: {
    IgG: { min: 6.66, max: 13.70 },
    IgA: { min: 0.48, max: 1.58 },
    IgM: { min: 0.33, max: 2.05 },
    IgG1: { min: 4.98, max: 14.60 },
    IgG2: { min: 1.10, max: 3.98 },
    IgG3: { min: 0.30, max: 1.20 },
    IgG4: { min: 0.09, max: 1.87 },
  },
},
     {
  ageGroup: "Older than 16 years",
  ranges: {
    IgG: { min: 8.30, max: 18.20 },
    IgA: { min: 0.465, max: 2.21 },
    IgM: { min: 0.75, max: 1.985 },
    IgG1: { min: 5.28, max: 13.84 },
    IgG2: { min: 1.47, max: 6.10 },
    IgG3: { min: 0.21, max: 1.52 },
    IgG4: { min: 0.15, max: 2.02 },
  },
},
      ],
    },
    {
      name: "Kılavuz 5",
      ageGroups: [
        {
          ageGroup: "0-1 months", // 0–30 days
          ranges: {
            IgG: { min: 3.99, max: 14.80 },
            IgA: { min: 0.0667, max: 0.0875 },
            IgM: { min: 0.051, max: 0.509 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
        {
          ageGroup: "1-3 months",
          ranges: {
            IgG: { min: 2.17, max: 9.81 },
            IgA: { min: 0.0667, max: 0.246 },
            IgM: { min: 0.152, max: 0.685 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
        {
          ageGroup: "4-6 months",
          ranges: {
            IgG: { min: 2.7, max: 11.1 },
            IgA: { min: 0.0667, max: 0.53 },
            IgM: { min: 0.269, max: 1.3 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
        {
          ageGroup: "7-12 months",
          ranges: {
            IgG: { min: 2.42, max: 9.77 },
            IgA: { min: 0.668, max: 1.14 },
            IgM: { min: 0.242, max: 1.62 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
        {
          ageGroup: "13-24 months",
          ranges: {
            IgG: { min: 3.89, max: 12.6 },
            IgA: { min: 0.131, max: 1.03 },
            IgM: { min: 0.386, max: 1.95 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
        {
          ageGroup: "25-36 months",
          ranges: {
            IgG: { min: 4.86, max: 19.70 },
            IgA: { min: 0.67, max: 1.35 },
            IgM: { min: 0.427, max: 2.36 },
            IgG1: { min: 3.09, max: 14.50 },
            IgG2: { min: 0.876, max: 2.89 },
            IgG3: { min: 0.198, max: 0.75 },
            IgG4: { min: 0.0786, max: 0.575 },
          },
        },
        {
          ageGroup: "37-60 months", // 3–5 years
          ranges: {
            IgG: { min: 4.57, max: 11.2 },
            IgA: { min: 0.357, max: 1.92 },
            IgM: { min: 0.587, max: 1.98 },
            IgG1: { min: 2.73, max: 6.79 },
            IgG2: { min: 0.733, max: 2.71 },
            IgG3: { min: 0.208, max: 0.932 },
            IgG4: { min: 0.0786, max: 1.22 },
          },
        },
        {
          ageGroup: "61-96 months", // 6–8 years
          ranges: {
            IgG: { min: 4.83, max: 15.8 },
            IgA: { min: 0.448, max: 2.76 },
            IgM: { min: 0.503, max: 2.42 },
            IgG1: { min: 2.92, max: 7.81 },
            IgG2: { min: 0.881, max: 4.08 },
            IgG3: { min: 0.189, max: 1.35 },
            IgG4: { min: 0.0786, max: 1.57 },
          },
        },
        {
          ageGroup: "97-132 months", // 9–11 years
          ranges: {
            IgG: { min: 6.42, max: 22.9 },
            IgA: { min: 0.326, max: 2.62 },
            IgM: { min: 0.374, max: 2.13 },
            IgG1: { min: 1.53, max: 4.10 },
            IgG2: { min: 0.81, max: 4.42 },
            IgG3: { min: 0.341, max: 2.0 },
            IgG4: { min: 0.0786, max: 0.938 },
          },
        },
        {
          ageGroup: "133-192 months", // 12–16 years
          ranges: {
            IgG: { min: 6.36, max: 16.1 },
            IgA: { min: 0.364, max: 3.05 },
            IgM: { min: 0.424, max: 1.97 },
            IgG1: { min: 3.44, max: 9.58 },
            IgG2: { min: 1.59, max: 4.06 },
            IgG3: { min: 0.352, max: 1.5 },
            IgG4: { min: 0.0786, max: 1.19 },
          },
        },
        {
          ageGroup: "193-216 months", // 16–18 years
          ranges: {
            IgG: { min: 6.88, max: 24.3 },
            IgA: { min: 0.667, max: 3.85 },
            IgM: { min: 0.607, max: 3.23 },
            IgG1: { min: 4.03, max: 15.2 },
            IgG2: { min: 1.84, max: 6.96 },
            IgG3: { min: 0.293, max: 2.0 },
            IgG4: { min: 0.0786, max: 1.57 },
    },
  },
      ],
    },
  ],
};





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
