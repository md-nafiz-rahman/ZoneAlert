# ZoneAlert 

A React Native mobile app that tracks ULEZ and congestion charge zones for UK drivers.

## The Problem

Drivers entering London's ULEZ or Congestion Charge zones can face daily charges of up to £15. Many drivers don't realise they've entered a zone until it's too late, resulting in unexpected fines.

## The Solution

ZoneAlert runs in the background while you drive and sends push notifications the moment you enter a charging zone, tailored specifically to your vehicle.

## Features

- Vehicle lookup by registration plate via DVLA API
- Automatic ULEZ compliance check based on fuel type and Euro emission standard
- Real time GPS tracking with live coordinates
- Smart zone detection for ULEZ and Congestion Charge zones
- Push notifications on zone entry only when relevant to your vehicle
- Compliant vehicles are notified they are exempt, no unnecessary alerts

## How It Works

1. Enter your vehicle registration
2. The app checks your vehicle details against DVLA records
3. Press Start Tracking to begin GPS monitoring
4. When you enter a charging zone the app checks your vehicle's compliance
5. You receive a push notification with the relevant charge information

## Tech Stack

- React Native with Expo
- TypeScript
- expo-location for GPS tracking
- expo-notifications for push notifications
- DVLA Vehicle Enquiry API (currently mocked while API registration is closed)

## ULEZ Compliance Rules

| Fuel Type | Minimum Standard |
|-----------|-------------------|
| Petrol | Euro 4 |
| Diesel | Euro 6 |
| Electric | Always exempt |

## Future Features

- Real DVLA API integration when registration reopens
- Accurate TfL GeoJSON zone boundaries instead of bounding box approximation
- Clean Air Zone coverage beyond London
- Auto-pay integration with TfL account
- Journey history and charge log

## Why I Built This

I work as a delivery driver in south London and noticed there was no simple app that notifies driver real time when they are entering ULEZ or CCZ zones. Most drivers either don't know their compliance status or don't realise they've entered a zone until it's too late.

## Setup

```bash
git clone https://github.com/md-nafiz-rahman/ZoneAlert.git
cd ZoneAlert
npm install
npx expo start
```