#! /bin/bash

# Load API key from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
else
  echo ".env.local file not found!"
  exit 1
fi

if [ -z "$WEATHER_API_KEY" ]; then
  echo "Weather_API_Key not set in .env.local!"
  exit 1
fi
if [ -z "$DISCORD_WEBHOOK_ID" ]; then
  echo "Discord_Webhook_ID not set in .env.local!"
  exit 1
fi
if [ -z "$DISCORD_WEBHOOK_TOKEN" ]; then
  echo "Discord_Webhook_Token not set in .env.local!"
  exit 1
fi

# 1. Input für Wetter-API (alle 30 Sekunden)
curl -X POST http://localhost:3000/input \
  -H "Content-Type: application/json" \
  -d '{
    "id": "weather-api",
    "url": "https://api.weatherapi.com/v1/current.json?key='$WEATHER_API_KEY'&q=Vienna",
    "method": "GET",
    "interval": "*/30 * * * * *",
    "enabled": true,
    "body": {
        "param": "value"
    }
    }'

# 2. Transform für Temperatur-Filter
curl -X POST http://localhost:3000/transform \
  -H "Content-Type: application/json" \
  -d '{
    "id": "hot-weather-filter",
    "name": "Hot Weather Filter",
    "type": "filter",
    "config": {
      "condition": {
        "field": "temp_c",
        "operator": "greater",
        "value": 25
      }
    },
    "enabled": true
  }'

# 3. Output für Discord
curl -X POST http://localhost:3000/output \
  -H "Content-Type: application/json" \
  -d '{
    "id": "discord-alert",
    "name": "Discord Weather Alert",
    "url": "https://discord.com/api/webhooks/'$DISCORD_WEBHOOK_ID'/'$DISCORD_WEBHOOK_TOKEN'",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "template": "{\"content\": \"🔥 Heißes Wetter in Berlin: ${temp_c}°C!\"}",
    "enabled": true,
    "retryCount": 3,
    "retryDelay": 1000
  }'

# 4. Pipe für Discord-Workflow
curl -X POST http://localhost:3000/pipe \
  -H "Content-Type: application/json" \
  -d '{
    "id": "weather-discord-pipe",
    "name": "Weather Discord Alert Pipeline",
    "description": "Sendet Discord-Benachrichtigungen bei heißem Wetter",
    "steps": [
      { "type": "input", "id": "weather-api", "enabled": true },
      { "type": "transform", "id": "hot-weather-filter", "delay": 1000, "enabled": true },
      { "type": "output", "id": "discord-alert", "enabled": true }
    ],
    "enabled": true,
    "timeout": 30000
  }'