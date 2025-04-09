# 💈 Barber App - SMS Reminder Scheduler

This is a custom React Native + Firebase app built for barbers and hairstylists to manage daily appointment schedules and automatically send personalized **WhatsApp or SMS reminders** to clients each day.

## 🚀 Features

- 📅 View and manage daily client appointments
- 🔍 Search and select phone contacts
- ⏰ Pick custom time for each appointment
- 🔁 Swipe to duplicate an appointment for the same time next week
- 🔒 Lock appointments after sending messages to prevent edits
- ✅ Send WhatsApp or SMS reminders to each client with a personalized message template
- 🧠 Auto-sorting appointments by time
- 💬 Dynamic message preview and custom template editing
- 🧾 Track how many messages were sent (X/Y)
- 🖼️ Modern and mobile-friendly UI with Tailwind-style design 

## 🔧 Technologies Used

- **React Native (Expo)**
- **Firebase**: Authentication, Realtime Database
- **Twilio**: For sending WhatsApp and SMS messages (server-side)
- **React Native Gesture Handler**: For swipeable cards
- **@react-native-community/datetimepicker**: Time selection
- **Styled Components / Tailwind-RN / Bootstrap-style styling**

## 📱 Screens Overview

### Main Schedule
- Shows all appointments for selected date.
- Swipe on any client to quickly add the same time next week.
- Buttons to edit time, delete, or manually send SMS.


### Navigation
- Side navigation bar:  
  - `Schedule` (main)
  - `Settings`
  - `Logout`

## 🧪 Development Setup

### Prerequisites
- Node.js + Expo CLI installed globally
- Android/iOS device or emulator
- Firebase project (with Realtime DB + Auth enabled)
- Twilio WhatsApp sender (optional)


