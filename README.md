# Webcam Driver

A web-based car driving game controlled by head movements & keyboard arrows. Face tracking is provided via MediaPipe face detection, & Babylon.js provides the game engine.

## Features

- **Face-controlled driving**: Use head movements to steer your car
- **Real-time detection**: Powered by MediaPipe's BlazeFace model
- **3D Graphics**: Built with Babylon.js for immersive gameplay
- **Responsive UI**: Works on both desktop and mobile devices
- **Keyboard override**: Switch between webcam and keyboard controls

## How it works

The application uses your webcam to detect face movements and translates them into car steering inputs:
- Move your head left/right to steer
- The game displays your webcam feed with face detection overlay
- Visual indicators show current input directions

## Getting Started

### Prerequisites

- Node.js (23.11.0 or higher)
- A webcam
- Modern web browser with WebRTC support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webcam-driver
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser and navigate to the provided localhost URL

### Building for Production

```bash
yarn build
```

The built files will be available in the `dist` directory.

## Usage

1. Allow webcam access when prompted
2. Position your face in the webcam view
3. The system will calibrate your head position
4. Move your head left/right to control the car
5. Use keyboard arrow keys to override webcam input if needed

## Technology Stack

- **TypeScript** - Main programming language
- **Vite** - Build tool and development server
- **Babylon.js** - 3D graphics and game engine
- **MediaPipe** - Face detection and tracking

## Project Structure

```
src/
├── detection/          # Face detection and input processing
├── libs/              # Utility libraries
├── assets/            # Game assets and textures
├── css/               # Stylesheets
├── main.ts            # Application entry point
└── carGame.ts         # 3D car game implementation
```

## Credits

Original car game code provided by [Babylon.js Workshop](https://doc.babylonjs.com/guidedLearning/workshop/Car_Driven/)

## License

This project is open source and free to use.
