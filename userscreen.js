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
import { Picker } from "@react-native-picker/picker";
import { collection, query, where, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../config/firebase";

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
             "IgG3": { "min": 0.119, "max": 0.740 },
             "IgG4": { "min": 0.0, "max": 0.208 }
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
          "IgG3": { "min": 0.119, "max": 0.740 },
          "IgG4": { "min": 0.0, "max": 0.208 }
      } 
    },
          { 
      "ageGroup": "2-<4 years", 
      "ranges": { 
        "IgG": { "min": 2.95, "max": 11.56 }, 
        "IgA": { "min": 0.27, "max": 2.46 }, 
        "IgM": { "min": 0.37, "max": 1.84 }, 
        "IgG1": { "min": 1.58, "max": 7.21 }, 
        "IgG2": { "min": 0.39, "max": 1.76 },
        "IgG3": { "min": 0.119, "max": 0.740 },
        "IgG4": { "min": 0.0, "max": 0.208 }
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
         "IgG3": { "min": 0.200, "max": 10.53 },
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
            IgG1: { min: 4.35, max: 10.84 },
            IgG2: { min: 1.43, max: 4.53 },
            IgG3: { min: 0.27, max: 1.46 },
            IgG4: { min: 0.01, max: 0.47 },
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
        "IgG4": { "min": 0.01, "max": 0.47 } 
      } 
    }, 
    { 
      "ageGroup": "3-4 months", 
      "ranges": { 
        "IgG": { "min": 2.00, "max": 12.00 }, 
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
      "ageGroup": "24-36 months", 
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
        "IgG": { "min": 6.39, "max": 13.44 }, 
        "IgA": { "min": 0.70, "max": 3.12 }, 
        "IgM": { "min": 0.56, "max": 3.52 }, 
        "IgG1": { "min": 4.22, "max": 12.92 }, 
        "IgG2": { "min": 1.17, "max": 7.47 }, 
        "IgG3": { "min": 0.41, "max": 1.29 }, 
        "IgG4": { "min": 0.10, "max": 0.67 } 
      } 
    }, 
    { 
      "ageGroup": "6-8 years", 
      "ranges": { 
        "IgG": { "min": 7.00, "max": 14.00 }, 
        "IgA": { "min": 0.80, "max": 3.20 }, 
        "IgM": { "min": 0.60, "max": 2.80 }, 
        "IgG1": { "min": 5.00, "max": 14.00 }, 
        "IgG2": { "min": 1.20, "max": 8.00 }, 
        "IgG3": { "min": 0.50, "max": 2.00 }, 
        "IgG4": { "min": 0.20, "max": 1.00 } 
      } 
    }, 
    { 
      "ageGroup": "8-10 years", 
      "ranges": { 
        "IgG": { "min": 7.50, "max": 15.80 }, 
        "IgA": { "min": 0.70, "max": 3.00 }, 
        "IgM": { "min": 0.55, "max": 2.50 }, 
        "IgG1": { "min": 5.00, "max": 12.00 }, 
        "IgG2": { "min": 1.40, "max": 6.00 }, 
        "IgG3": { "min": 0.50, "max": 2.00 }, 
        "IgG4": { "min": 0.20, "max": 1.00 } 
      } 
    }, 
    { 
      "ageGroup": "10-12 years", 
      "ranges": { 
        "IgG": { "min": 7.50, "max": 15.80 }, 
        "IgA": { "min": 0.70, "max": 3.00 }, 
        "IgM": { "min": 0.55, "max": 2.50 }, 
        "IgG1": { "min": 5.00, "max": 12.00 }, 
        "IgG2": { "min": 1.40, "max": 6.00 }, 
        "IgG3": { "min": 0.50, "max": 2.00 }, 
        "IgG4": { "min": 0.20, "max": 1.00 } 
      } 
    }, 
    { 
    "ageGroup": "12-14 years", 
    "ranges": { 
    "IgG": { "min": 7.00, "max": 15.80 }, 
    "IgA": { "min": 0.70, "max": 3.20 }, 
    "IgM": { "min": 0.56, "max": 3.52 }, 
    "IgG1": { "min": 5.00, "max": 14.00 }, 
    "IgG2": { "min": 1.20, "max": 8.00 }, 
    "IgG3": { "min": 0.50, "max": 2.00 }, 
    "IgG4": { "min": 0.10, "max": 1.00 } 
    } 
    }, 
 
    { 
      "ageGroup": "Adult", 
      "ranges": { 
        "IgG": { "min": 7.67, "max": 15.90 }, 
        "IgA": { "min": 0.61, "max": 3.56 }, 
        "IgM": { "min": 0.37, "max": 2.86 }, 
        "IgG1": { "min": 3.41, "max": 8.94 }, 
        "IgG2": { "min": 1.71, "max": 6.32 }, 
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
        "IgG (Min-Max)": "1.41-6.91",  
        "IgA (Min-Max)": "0.07-0.63",  
        "IgM (Min-Max)": "0.18-1.36"  
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
       ageGroup: "13-24 Ay",  
         ranges: {  
        "IgG (Min-Max)": "4.32-9.90",  
        "IgA (Min-Max)": "0.15-0.52",  
        "IgM (Min-Max)": "0.32-1.48"  
        },  
        },
        {  
        ageGroup: "25-36 Ay",  
         ranges: {  
        "IgG (Min-Max)": "4.37-13.20",  
        "IgA (Min-Max)": "0.24-0.84",  
        "IgM (Min-Max)": "0.47-1.44"  
        },  
        },
        {  
       ageGroup: "4-5 yas",  
         ranges: {   
        "IgG (Min-Max)": "5.24-14.00",  
        "IgA (Min-Max)": "0.55-1.35",  
        "IgM (Min-Max)": "0.68-2.05"  
        },  
        }, 
        {  
        ageGroup: "6-8 yas",  
         ranges: { 
        "IgG (Min-Max)": "8.58-16.00",  
        "IgA (Min-Max)": "0.81-2.64",  
        "IgM (Min-Max)": "0.47-1.98"  
        },  
        }, 
        {  ageGroup: "9-11 yas",  
         ranges: {   
          "IgG (Min-Max)": "6.45-15.20",  
                "IgA (Min-Max)": "0.78-3.34",  
                "IgM (Min-Max)": "0.38-1.63"  
                },  
                 },
                {  
                ageGroup: "12-16 yas",  
         ranges: {   
                "IgG (Min-Max)": "8.77-16.20",  
                "IgA (Min-Max)": "0.87-2.34",  
                "IgM (Min-Max)": "0.47-2.85"  
                }, 
                 },  
                {  
                ageGroup: "17-18 yas",  
         ranges: {  
                "IgG (Min-Max)": "7.58-17.60",  
                "IgA (Min-Max)": "1.11-3.50",  
                "IgM (Min-Max)": "0.61-1.80"  
                        
                       
                      
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
            IgA: { min: 0.05, max: 0.06 },
            IgM: { min: 0.17, max: 0.30 },
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
    IgA: { min: 0.06, max: 0.58 },
    IgM: { min: 0.18, max: 1.45 },
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
    IgA: { min: 0.06, max: 0.86 },
    IgM: { min: 0.26, max: 1.46 },
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
    IgA: { min: 0.18, max: 1.54 },
    IgM: { min: 0.23, max: 1.80 },
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
    IgA: { min: 0.11, max: 0.94 },
    IgM: { min: 0.26, max: 2.01 },
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
    IgM: { min: 0.43, max: 3.80 },
    IgG1: { min: 3.40, max: 14.70 },
    IgG2: { min: 0.43, max: 3.80 },
    IgG3: { min: 0.14, max: 1.25 },
    IgG4: { min: 0.20, max: 1.71 },
  },
},

      {
  ageGroup: "37-48 months",
  ranges: {
    IgG: { min: 5.39, max: 12.00 },
    IgA: { min: 0.41, max: 1.15 },
    IgM: { min: 0.26, max: 1.88 },
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
    IgA: { min: 0.23, max: 2.05 },
    IgM: { min: 0.35, max: 2.20 },
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
    IgA: { min: 0.36, max: 2.68 },
    IgM: { min: 0.34, max: 2.57 },
    IgG1: { min: 5.27, max: 15.90 },
    IgG2: { min: 0.67, max: 4.60 },
    IgG3: { min: 0.28, max: 1.86 },
    IgG4: { min: 0.42, max: 1.86 },
  },
},
      {
  ageGroup: "9-10 years",
  ranges: {
    IgG: { min: 6.46, max: 16.20 },
    IgA: { min: 0.54, max: 2.68 },
    IgM: { min: 0.33, max: 2.05 },
    IgG1: { min: 8.30, max: 18.40 },
    IgG2: { min: 0.70, max: 5.43 },
    IgG3: { min: 0.33, max: 1.86 },
    IgG4: { min: 0.05, max: 2.02 },
  },
},
     {
  ageGroup: "11-12 years",
  ranges: {
    IgG: { min: 5.79, max: 16.10 },
    IgA: { min: 0.27, max: 1.98 },
    IgM: { min: 0.40, max: 2.06 },
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
    IgA: { min: 0.52, max: 2.05 },
    IgM: { min: 0.33, max: 2.05 },
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
    IgM: { min: 0.40, max: 1.58 },
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
    IgA: { min: 0.46, max: 2.21 },
    IgM: { min: 0.75, max: 1.99 },
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
          ageGroup: "0–30 days",
          ranges: {
            IgG: { min: 3.93, max: 14.80 },
            IgA: { min: 0.07, max: 0.09 },
            IgM: { min: 0.05, max: 0.51 },
            IgG1: "N/A",
            IgG2: "N/A",
            IgG3: "N/A",
            IgG4: "N/A",
          },
        },
     {
    ageGroup: "1–3 months",
    ranges: {
      IgG: { min: 2.17, max: 9.81 },
      IgA: { min: 0.07, max: 0.25 },
      IgM: { min: 0.15, max: 0.69 },
      IgG1: "N/A",
      IgG2: "N/A",
      IgG3: "N/A",
      IgG4: "N/A",
    },
  }, 
   {
    ageGroup: "4–6 months",
    ranges: {
      IgG: { min: 2.7, max: 11.1 },
      IgA: { min: 0.07, max: 0.53 },
      IgM: { min: 0.27, max: 1.3 },
      IgG1: "N/A",
      IgG2: "N/A",
      IgG3: "N/A",
      IgG4: "N/A",
    },
  }, 
     {
    ageGroup: "7–12 months",
    ranges: {
      IgG: { min: 2.42, max: 9.77 },
      IgA: { min: 0.07, max: 1.14 },
      IgM: { min: 0.24, max: 1.62 },
      IgG1: "N/A",
      IgG2: "N/A",
      IgG3: "N/A",
      IgG4: "N/A",
    },
  },
  {
    ageGroup: "13–24 months",
    ranges: {
      IgG: { min: 3.89, max: 12.6 },
      IgA: { min: 0.11, max: 1.03 },
      IgM: { min: 0.39, max: 1.95 },
      IgG1: "N/A",
      IgG2: "N/A",
      IgG3: "N/A",
      IgG4: "N/A",
    },
  }, 
     {
    ageGroup: "25–36 months",
    ranges: {
      IgG: { min: 4.86, max: 17.9 },
      IgA: { min: 0.07, max: 1.35 },
      IgM: { min: 0.43, max: 2.36 },
      IgG1: { min: 4.03, max: 15.2 },
      IgG2: { min: 1.84, max: 6.96 },
      IgG3: { min: 0.29, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
    },
  }, 
  {
    ageGroup: "3–5 years",
    ranges: {
      IgG: { min: 4.57, max: 11.2 },
      IgA: { min: 0.36, max: 1.92 },
      IgM: { min: 0.59, max: 1.98 },
      IgG1: { min: 5.13, max: 15.2 },
      IgG2: { min: 1.51, max: 6.96 },
      IgG3: { min: 0.45, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
    },
  },
  {
    ageGroup: "6–8 years",
    ranges: {
      IgG: { min: 4.83, max: 15.8 },
      IgA: { min: 0.45, max: 2.76 },
      IgM: { min: 0.5, max: 2.42 },
      IgG1: { min: 5.81, max: 15.2 },
      IgG2: { min: 2.13, max: 6.96 },
      IgG3: { min: 0.66, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
    },
  },
    {
    ageGroup: "9–11 years",
    ranges: {
      IgG: { min: 6.42, max: 22.9 },
      IgA: { min: 0.33, max: 2.62 },
      IgM: { min: 0.37, max: 2.13 },
      IgG1: { min: 6.6, max: 15.3 },
      IgG2: { min: 2.65, max: 6.96 },
      IgG3: { min: 0.84, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
    },
  },
     {
    ageGroup: "12–16 years",
    ranges: {
      IgG: { min: 6.36, max: 16.1 },
      IgA: { min: 0.36, max: 3.05 },
      IgM: { min: 0.42, max: 1.97 },
      IgG1: { min: 6.48, max: 15.3 },
      IgG2: { min: 2.7, max: 6.96 },
      IgG3: { min: 0.81, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
    },
  }, 
     {
    ageGroup: "16–18 years",
    ranges: {
      IgG: { min: 6.88, max: 24.3 },
      IgA: { min: 0.46, max: 3.85 },
      IgM: { min: 0.61, max: 3.23 },
      IgG1: { min: 6.74, max: 15.3 },
      IgG2: { min: 3.75, max: 6.96 },
      IgG3: { min: 0.95, max: 2.0 },
      IgG4: { min: 0.08, max: 1.52 },
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
    return (
      (test.getFullYear() - birth.getFullYear()) * 12 +
      (test.getMonth() - birth.getMonth())
    );
  };

  const classifyTestResult = (testName, value, ageInMonths, guide) => {
    const ageGroup = guide.ageGroups.find((group) => {
      const [minAge, maxAge] = group.ageGroup
        .replace("months", "")
        .replace("years", "")
        .replace("–", "-")
        .split("-")
        .map((a) => parseFloat(a.trim()) * (a.includes("years") ? 12 : 1));
      return ageInMonths >= minAge && (isNaN(maxAge) || ageInMonths <= maxAge);
    });

    if (!ageGroup) return { status: "Yaş grubu bulunamadı", range: null };

    const range = ageGroup.ranges[testName];
    if (!range) return { status: "Referans aralığı yok", range: null };

    if (value < range.min) return { status: "Düşük", range };
    if (value > range.max) return { status: "Yüksek", range };
    return { status: "Normal", range };
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
      <View style={styles.container}>
        <Text style={styles.header}>Hoş Geldiniz</Text>

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
          renderItem={({ item }) => {
            const ageAtTest = calculateAge(userBirthDate, item.date);
            return (
              <TouchableOpacity
                style={styles.testContainer}
                onPress={() => handleTestClick(item)}
              >
                <Text style={styles.testName}>{item.testName}</Text>
                <Text style={styles.testValue}>Değer: {item.value}</Text>
                <Text style={styles.testDate}>
                  Tarih: {item.date} ({ageAtTest})
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
