# Text Improver with Gemini Chrome Extension

A Chrome extension that uses Google's Gemini AI to improve text directly in your browser.

## Features

- Select any text on a webpage to improve it
- Simple interface with Replace and Cancel buttons
- Uses Google's Gemini AI for text improvement
- Secure API key storage

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Setup

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the extension icon in Chrome
3. Enter your Gemini API key and click "Save"

## Usage

1. Select any text on a webpage
2. Click the "Replace" button to improve the text
3. Click "Cancel" to dismiss the buttons

## Files

- `manifest.json`: Extension configuration
- `popup.html`: API key input interface
- `popup.js`: Handles API key storage
- `content.js`: Handles text selection and improvement
- `styles.css`: Styling for the extension

## Note

Make sure to keep your Gemini API key secure and never share it with others. 