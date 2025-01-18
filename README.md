# 3D Comparison Widget for Synthesis

A React Three.js application for visualizing and comparing numerical quantities up to 10 in an interactive 3D environment.

<img width="1141" alt="SynthesisComparisonWidget" src="https://github.com/user-attachments/assets/2e352e62-f117-481d-9da0-adffee49107b" />

## Features

- Interactive 3D visualization with two comparable stacks
- Dynamic camera controls that adapt to different interaction modes
- Comparison lines with drawing capabilities
- Multiple lighting sources for enhanced visual effect
- Orbit controls with customizable constraints

## Technical Stack

- React
- Three.js via @react-three/fiber
- @react-three/drei for enhanced Three.js components
- Zustand for state management (via useComparisonStore)
- Tailwind CSS for styling

## Core Components

- `Stack`: Renders the 3D stack visualization
- `ComparisonLines`: Handles the drawing and display of comparison lines
- `ControlPanel`: User interface for controlling the visualization
- `ComparisonOperator`: Displays comparison operators between stacks
- `CameraController`: Manages camera behavior and transitions

## Camera Modes

- `none`: Free orbit camera movement with constraints
- `drawCompare`: Fixed position for comparison line drawing
- `addRemove`: Locked camera position for stack manipulation

## Requirements

- React 18+
- Three.js
- @react-three/fiber
- @react-three/drei
- Tailwind CSS
