# ShareApp - Architecture & How It Works

## 1. What is this Project? (In Simple Words)
ShareApp is an offline, peer-to-peer (P2P) file sharing mobile app built with React Native (similar to SHAREit or Apple AirDrop). 

It lets two phones transfer photos, videos, and large files directly to each other using local Wi-Fi or a Mobile Hotspot. 
- **Zero Internet Required:** It does not use mobile data or internet bandwidth.
- **Fast:** Transfers happen at local Wi-Fi router speeds (much faster than Bluetooth).
- **Secure:** Transfers are encrypted so no one on the same Wi-Fi can spy on or steal your files.

---

## 2. Prerequisites (What You Need to Run & Use It)

### For Users / Testing Devices:
1. **Two Devices:** Two phones (Android or iOS).
2. **Same Network Connection:** Both phones must be on the same local network:
   - Option A: Both connected to the same Wi-Fi router.
   - Option B: One phone turns on its Personal Hotspot, and the other phone connects to it.
3. **App Permissions:**
   - **Camera:** Required on the sender device to scan the receiver's QR code.
   - **Local Network / Wi-Fi:** Required to find other devices on the network.
   - **Storage / Files:** Required to select files to send and save received files to the device.

### For Developers (Setup & Build):
1. **Node.js** (v18 or higher) and **Yarn** or **npm**.
2. **React Native Environment:** Android Studio (SDK 34+) or Xcode (for iOS).
3. **Security Certificates (`tls_certs/` folder):**
   - The app comes with pre-generated TLS certificates (`server-keystore.p12` and `server-cert.pem`).
   - These are required to encrypt socket data between the two phones.

---

## 3. How It Works (The Whole Flow)

The app works in **4 simple stages**:

```
[Phone A: Receiver]                             [Phone B: Sender]
        |                                               |
  1. Opens "Receive"                                1. Opens "Send"
     - Starts Local Server                             - Searches radar for nearby devices
     - Shows QR Code & broadcasts on Wi-Fi             - Or opens Camera to scan QR
        |                                               |
        |<============= 2. CONNECTS VIA TLS ===========>|
        |      (Phones establish secure handshake)      |
        |                                               |
        |<------------- 3. FILE INFO SENT --------------|
        |      ("I'm sending movie.mp4, 50MB,           |
        |       split into 8KB pieces")                 |
        |                                               |
        |-------------- "SEND PIECE #1" --------------->|
        |<------------- [SENDS PIECE #1] ---------------|
        |-------------- "SEND PIECE #2" --------------->|
        |<------------- [SENDS PIECE #2] ---------------|
        |               (Repeats until 100%)            |
        |                                               |
  4. Combines all pieces                                4. Transfer Complete!
     - Saves to Downloads/ShareApp
     - Ready to open or view
```

### Stage 1: Finding Each Other (Discovery)
- **Receiver:** Taps "Receive". The phone creates a local server on port `4000`, displays a QR code containing its IP address, and sends out a quiet signal (UDP broadcast) on Wi-Fi saying *"I am here!"*.
- **Sender:** Taps "Send". The phone searches the Wi-Fi network for the receiver's signal (radar screen). If it cannot find it automatically, the user simply scans the QR code on the receiver's screen.

### Stage 2: Making a Secure Handshake (Connection)
- The sender phone connects to the receiver phone using a direct TCP socket.
- Both devices check security certificates (`TLS`) to make sure the connection is encrypted.
- Both screens immediately switch to the active **Connection Screen** showing connected device details.

### Stage 3: Slicing and Sending the File (Transfer Flow)
Sending a giant file all at once can freeze phones or lose data if interrupted. To prevent this:
1. **Slicing:** The sender splits the selected file into small **8 KB chunks**.
2. **Metadata First:** The sender tells the receiver: *"I am sending a file named photo.jpg, size 4 MB, consisting of 500 small pieces."*
3. **Step-by-step Delivery (Ping-Pong):**
   - Receiver: *"Send piece 0."*
   - Sender: *Sends piece 0.*
   - Receiver: *"Got piece 0. Now send piece 1."*
   - Sender: *Sends piece 1.*
4. This guarantees that **no data is lost** and allows both phones to display smooth, real-time progress bars.

### Stage 4: Putting the File Back Together (Reassembly & Saving)
- When the receiver gets the final chunk, it combines all 8 KB pieces back into the original file.
- The file is saved to the phone's storage in the `Download/ShareApp` folder.
- The app automatically registers the file with Android's Media Gallery so photos and videos immediately show up in the phone's Gallery or Files app.
- An **"Open"** button appears, letting the user view the file with one tap.

---

## 4. Why are the `tls_certs` Files Needed?

In the `tls_certs/` folder, you will find files like `server-keystore.p12` and `server-cert.pem`.

* **Plain TCP (Without Certs):** Anyone on the same Wi-Fi (like in an office or coffee shop) using basic tools could snoop on and download the pictures and files you are transferring.
* **TLS TCP (With Certs):** The files are scrambled using military-grade encryption during transfer. Even if someone intercepts the Wi-Fi packets, all they see is random unreadable gibberish.
* **Why Self-Signed?** Because normal SSL providers (like Google or Let's Encrypt) only work for website domains on the internet. Since this app works completely **offline** on local IP addresses, we generate our own secure certificates directly inside the app.

---

## 5. Summary of Tech Stack

| Component | Library Used | What It Does |
| :--- | :--- | :--- |
| **Encrypted TCP Connection** | `react-native-tcp-socket` | Fast, encrypted direct communication between phones |
| **Radar Discovery** | `react-native-udp` | Finds nearby phones on the Wi-Fi without typing IPs |
| **QR Code Scanner** | `react-native-vision-camera` | Instant camera-based connection |
| **QR Code Generator** | `react-native-qrcode-svg` | Generates connection QR codes on screen |
| **State & Progress** | `zustand` | Tracks bytes sent/received and file chunks in real-time |
| **File I/O & MediaStore** | `react-native-fs` & `react-native-blob-util` | Reads, slices, saves, and indexes files into the phone's Gallery/Downloads |
