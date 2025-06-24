# viewmytile

## Crispy UI to check your Tiles

This is a simple React app to visualize tiles from a URL. It supports various tile formats and allows you to customize the display with options like color maps, rescaling, and more.

It is assuming that you have a titiler server running at `http://127.0.0.1:8000`.

## Features

- Input URL for tile source
- Select color map from a dropdown
- Toggle rescaling of tile values
- Display tile information including count and nodata value

Check video demo [here](https://www.loom.com/share/57b70906cc9d4fe9904aad44d0e319ef?sid=a44ca4e2-5c1b-48c3-b0d5-8c20f680dd5f)


## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Rotten-Grapes-Pvt-Ltd/viewmytile.git
   cd viewmytile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start titiler server:

   ```bash
   pip install titiler.application uvicorn
   uvicorn titiler.application.main:app --reload
   ```

4. Start the React app:
   ```bash
   npm start
   ```
