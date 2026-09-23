# 📲 ShareApp — Secure Offline File Sharing

> Think AirDrop meets SHAREit — but open, encrypted, and built with React Native.

ShareApp lets two phones beam photos, videos, and large files **directly to each other** — no internet, no cloud, no middleman. Just local Wi-Fi or a mobile hotspot, and your file lands on the other device in seconds.

---

## ⚡ Why It's Different

|                               |                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------- |
| 🌐 **Zero Internet Required** | Works entirely offline — no mobile data, no Wi-Fi router with internet needed |
| 🚀 **Blazing Fast**           | Transfers at local Wi-Fi speeds — miles ahead of Bluetooth                    |
| 🔒 **Encrypted End-to-End**   | TLS-secured sockets mean no one on the same network can snoop your files      |

---

## 🧰 Before You Start

### For Users

| Requirement                            | Why                                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| 📱 Two devices (Android or iOS)        | Sender + Receiver                                                 |
| 📶 Same local network                  | Either a shared Wi-Fi router, **or** one phone's Personal Hotspot |
| 📷 Camera access                       | To scan the connection QR code                                    |
| 🗂️ Local network + storage permissions | To discover devices and save incoming files                       |

### For Developers

- **Node.js** v18+ and **Yarn**/**npm**
- **Android Studio** (SDK 34+) or **Xcode**
- Pre-generated TLS certificates in `tls_certs/` (`server-keystore.p12`, `server-cert.pem`) — these encrypt every byte sent between phones

---

## 🔄 How It Works — 4 Simple Stages

|          Stage          | Receiver                                                                             | Sender                                                                          |
| :---------------------: | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
|    1️⃣ **Discovery**     | Taps _Receive_ → starts local server → shows QR code                                 | Taps _Send_ → scans for nearby devices, or scans receiver's QR                  |
| 2️⃣ **Secure handshake** | ⬌ Certificates verified over TLS — both screens switch to the live Connection view ⬌ |                                                                                 |
| 3️⃣ **Chunked transfer** | Requests piece 1 → gets it → requests piece 2 → ... _(repeats until 100%)_           | Sends metadata first ("movie.mp4, 50MB, 8KB pieces"), then each requested piece |
|       4️⃣ **Done**       | File saved to Gallery ✅                                                             | Transfer complete ✅                                                            |

### 1️⃣ Discovery — "I'm here!"

The **receiver** starts a local server on port `4000`, shows a QR code with its IP address, and quietly broadcasts its presence over Wi-Fi (UDP).
The **sender** either picks up that signal automatically ("radar" view) or scans the QR code directly — no typing IPs by hand.

### 2️⃣ Secure Handshake

Sender and receiver open a direct TCP socket and verify each other using TLS certificates. The moment they connect, both screens switch to a live **Connection Screen**.

### 3️⃣ Slicing & Sending

Sending a huge file in one shot risks freezing the app or losing data mid-transfer — so instead:

1. The file is broken into **8 KB chunks**.
2. Metadata goes first: _"Here comes photo.jpg, 4 MB, 500 pieces."_
3. Chunks are sent in a request–confirm rhythm (_"send piece 1" → sent → "send piece 2"..._), guaranteeing **zero data loss** and a smooth, real-time progress bar.

### 4️⃣ Reassembly

The receiver stitches all the chunks back into the original file, saves it to `Download/ShareApp`, and — for photos/videos — automatically registers it with the phone's Gallery. One tap opens it, no digging through folders.

---

## 🔐 Why TLS Certificates Matter

| Without TLS                                                                         | With TLS                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| ❌ Anyone on the same Wi-Fi (office, café) can snoop your transfer with basic tools | ✅ Data is scrambled — intercepted packets are unreadable gibberish |

**Why self-signed certs?** Normal SSL providers only issue certificates for internet domains. Since ShareApp runs entirely offline on local IPs, it generates and ships its own certificates baked right into the app.

---

## 🛠️ Tech Stack at a Glance

| What It Does                           | Library                                      |
| -------------------------------------- | -------------------------------------------- |
| 🔌 Encrypted phone-to-phone connection | `react-native-tcp-socket`                    |
| 📡 Finds nearby devices automatically  | `react-native-udp`                           |
| 📷 Scans connection QR codes           | `react-native-vision-camera`                 |
| 🔳 Generates connection QR codes       | `react-native-qrcode-svg`                    |
| 📊 Tracks live transfer progress       | `zustand`                                    |
| 💾 Reads, slices & saves files         | `react-native-fs` / `react-native-blob-util` |
