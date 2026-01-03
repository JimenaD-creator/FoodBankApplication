# Food Bank Mobile Application

## Project Overview

The **Food Bank Mobile Application** is a React Native (Expo) mobile app designed to support food distribution programs for vulnerable communities. Its main purpose is to facilitate the **registration, validation, and management of socio-nutritional information** in a secure, ethical, and efficient way.

The application was developed as part of an academic project, with a strong emphasis on **data protection, ethical responsibility, and cybersecurity best practices**, following recognized standards such as OWASP Mobile Top 10 and ISO/IEC 27001 principles.

---

## 🎯 Objectives

- Simplify the registration of beneficiaries through a structured socio-nutritional survey.
- Ensure **secure handling of sensitive personal and socioeconomic data**.
- Support offline data storage and later synchronization.
- Apply ethical, legal, and technical normativity in software development.
- Reduce security risks commonly found in mobile applications.

---

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo)
- **Backend & Database:** Firebase (Authentication & Firestore)
- **Secure Storage:** Expo SecureStore
- **Network Monitoring:** @react-native-community/netinfo
- **Version Control:** Git & GitHub

---

## 🔐 Security Measures Implemented

- **Encrypted Local Storage**  
  Sensitive form data and drafts are stored using Expo SecureStore to prevent unauthorized access on the device.

- **Secure Authentication**  
  User authentication is handled through Firebase Authentication.

- **Secure Communication (HTTPS/TLS)**  
  All communication with Firebase services is conducted over HTTPS, ensuring encrypted data transmission.

- **Offline-First Strategy**  
  When no internet connection is available, data is securely stored locally and synchronized once connectivity is restored.

- **Risk Mitigation Based on OWASP Mobile Top 10**  
  The project addresses risks such as insecure data storage, insecure communication, and improper authentication.

---

## 🧭 Ethical and Legal Considerations

The application was designed with respect for:
- User privacy
- Informed consent
- Data minimization
- Transparency in data usage

These principles align with data protection regulations such as GDPR concepts and Mexico’s Federal Law on the Protection of Personal Data, as well as ethical responsibilities in software engineering for social impact projects.

---

## 🚀 Installation & Setup

1. Clone the repository:
   ```bash
   git clone 

