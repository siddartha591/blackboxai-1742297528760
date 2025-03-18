#!/bin/bash

# Create necessary directories
cd client
mkdir -p src/components/{incidents,stats,charts,maps}
mkdir -p src/hooks
mkdir -p src/styles
mkdir -p public

# Move new files to replace old ones
mv src/App.new.js src/App.js || true
mv src/styles/index.new.css src/index.css || true
mv tailwind.config.new.js tailwind.config.js || true

# Install required dependencies
npm install --save \
  @tailwindcss/forms \
  chart.js \
  react-chartjs-2 \
  leaflet \
  react-leaflet \
  @fortawesome/fontawesome-svg-core \
  @fortawesome/free-solid-svg-icons \
  @fortawesome/react-fontawesome

# Update package.json scripts
sed -i 's/"start": "react-scripts start"/"start": "BROWSER=none react-scripts start"/' package.json

# Start the development server
echo "Setup complete! Starting development server..."
npm start