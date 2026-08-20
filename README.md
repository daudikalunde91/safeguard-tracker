# SafeGuard Tracker

Smart Device Location Tracker (SDLT)

1. Project Overview

Project Name: Smart Device Location Tracker (SDLT)

Purpose: Kutengeneza mfumo wa Android unaoruhusu mtumiaji kufuatilia location ya simu yake kwa muda halisi kupitia dashboard ya web. Mfumo utarekodi history ya location, battery status, speed, na geofence alerts huku ukifanya kazi hata app ikiwa background.

2. Objectives

Track GPS location kwa real-time.

Kuonyesha location kwenye ramani.

Kuhifadhi history ya safari.

Kufuatilia battery na speed.

Kutuma alerts.

Kusaidia vifaa vingi kwenye akaunti moja.

3. Target Platforms

Platform

Technology

Android App

Kotlin

Web Dashboard

HTML, CSS, JavaScript

Backend

Node.js + Express

Database

SQLite

Maps

Leaflet + OpenStreetMap

Real-time

Socket.IO

4. User Roles

Owner

Register account.

Login.

Pair device.

View live location.

View history.

Manage devices.

Configure geofence.

View battery and speed.

5. Functional Requirements

Authentication

Email registration.

Login.

Forgot password.

JWT authentication.

Remember session.

Device Registration

Pair kupitia QR Code au Device Code.

Rename device.

Remove device.

Live Location

GPS updates kila sekunde 10–30.

Live marker movement.

Last seen.

Accuracy display.

Background Tracking

Foreground Service.

Auto restart baada ya reboot.

Continue tracking background.

Location History

Daily history.

Weekly history.

Monthly history.

Route playback.

Export data.

Device Information

Battery percentage.

Charging status.

Speed.

Altitude.

Network status.

Geofence

Create circular zones.

Enter alert.

Exit alert.

Notification.

Notifications

Device offline.

Low battery.

Geofence alerts.

Tracking stopped.

6. Non-functional Requirements

HTTPS.

Fast response.

Offline cache.

Responsive dashboard.

Dark mode.

Secure storage.

Interface Structure

Mobile App Navigation

Screen List

Splash Screen

5

Elements

App logo

Loading animation

Login Screen

5

Components

Email

Password

Show password

Login

Register

Forgot password

Register Screen

5

Fields

Name

Email

Password

Confirm Password

Permission Screen

5

Request

Fine Location

Background Location

Notifications

Dashboard

6

Cards

Live Location

Battery

Speed

Last Update

Tracking Status

Bottom Navigation

Map

History

Devices

Settings

Live Map Screen

6

Features

Fullscreen map

Moving marker

Accuracy circle

Center button

History Screen

6

Sections

Today

Yesterday

Last 7 Days

Route Playback

Devices Screen

4

Each card shows

Device name

Battery

Online status

Last seen

Settings Screen

5

Options

Notifications

Tracking interval

Dark mode

Logout

Web Dashboard Structure

8

Sidebar

Dashboard

Live Map

Devices

History

Geofence

Settings

Logout

Dashboard Layout

Top Cards

Card

Data

Devices

Total devices

Online

Active devices

Battery

Average battery

Alerts

Active alerts

Main Area

Live map

Device list

Recent activities

Color System

Purpose

Color

Primary

#2563EB

Secondary

#0F172A

Accent

#06B6D4

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Background

#020617

Surface

#111827

Text

#F8FAFC

Typography

Font: Inter

Headings: Bold

Body: Regular

Buttons: SemiBold

Component Library

Buttons

Primary

Secondary

Danger

Icon Button

Cards

Device Card

Status Card

Battery Card

Alert Card

Inputs

TextField

Password Field

Search Bar

Toggle Switch

Map Components

Live Marker

Accuracy Circle

Route Polyline

Geofence Circle

Notification System

Event

Notification

Device Online

Green toast

Device Offline

Red toast

Low Battery

Yellow notification

Enter Geofence

Blue notification

Exit Geofence

Orange notification

Complete Screen Inventory

Screen

Purpose

Splash

App loading

Login

Authentication

Register

Account creation

Forgot Password

Password reset

Permissions

Request permissions

Dashboard

Overview

Live Map

Real-time tracking

History

Route history

Route Playback

Replay movement

Devices

Device management

Pair Device

Connect device

Geofence

Manage zones

Notifications

Alert history

Profile

User account

Settings

App configuration           iwe na language 2 kingereza na kiswahili user achague

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c4e4205-839e-488e-8312-219b02d1be15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
