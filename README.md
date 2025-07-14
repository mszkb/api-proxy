# API Proxy

Ein fein granulierter API-Proxy mit Transformationen, Delays und Loops - ähnlich wie IFTTT oder Zapier, aber mit mehr Kontrolle über die Datenverarbeitung.

## Features

### 🎯 Drei Basis-Bausteine

1. **Input** - Kontinuierliches Pollen externer APIs
2. **Transform** - Datenverarbeitung und -transformation
3. **Output** - Senden von Daten an externe APIs

### 🔧 Transformationen

- **Map** - Datenstrukturen umwandeln
- **Filter** - Daten basierend auf Bedingungen filtern
- **Reduce** - Daten aggregieren
- **Custom** - Benutzerdefinierte Transformationen

### ⚡ Erweiterte Features

- Retry-Logik mit konfigurierbaren Delays
- Template-basierte Datenformatierung
- Umfangreiche Logging und Monitoring
- REST API für alle Operationen

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run start:dev

# Production Build
npm run build
npm run start:prod
```

## API Dokumentation

Die vollständige API-Dokumentation ist über Swagger UI verfügbar:

**Entwicklung:** http://localhost:3000/api

Die Dokumentation enthält:
- Alle verfügbaren Endpoints
- Request/Response Schemas
- Beispiele für alle Parameter
- Interaktive Tests direkt im Browser

## API Endpoints

### Input Management

```bash
# Input hinzufügen
POST /input
{
  "id": "weather-api",
  "url": "https://api.weatherapi.com/v1/current.json",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  },
  "interval": "*/30 * * * * *",
  "enabled": true
}

# Inputs auflisten
GET /input

# Input-Daten abrufen
GET /input/{id}/data

# Neueste Daten
GET /input/{id}/latest

# Input entfernen
DELETE /input/{id}
```

### Transform Management

```bash
# Transform hinzufügen
POST /transform
{
  "id": "filter-temp",
  "name": "Temperature Filter",
  "type": "filter",
  "config": {
    "condition": {
      "field": "temp_c",
      "operator": "greater",
      "value": 20
    }
  },
  "enabled": true
}

# Transformationen auflisten
GET /transform

# Transform-Daten abrufen
GET /transform/{id}/data

# Transform testen
POST /transform/{id}/apply
{
  "temp_c": 25,
  "condition": "sunny"
}

# Transform entfernen
DELETE /transform/{id}
```

### Output Management

```bash
# Output hinzufügen
POST /output
{
  "id": "slack-notification",
  "name": "Slack Notification",
  "url": "https://hooks.slack.com/services/YOUR_WEBHOOK",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "template": "{\"text\": \"Temperature: ${temp_c}°C, Condition: ${condition}\"}",
  "enabled": true,
  "retryCount": 3,
  "retryDelay": 1000
}

# Outputs auflisten
GET /output

# Output-Daten abrufen
GET /output/{id}/data

# Output testen
POST /output/{id}/test
{
  "temp_c": 25,
  "condition": "sunny"
}

# Output entfernen
DELETE /output/{id}
```

## Transform-Typen

### Map Transform
```json
{
  "type": "map",
  "config": {
    "field": "temperature"
  }
}
```

### Filter Transform
```json
{
  "type": "filter",
  "config": {
    "condition": {
      "field": "temp_c",
      "operator": "greater",
      "value": 20
    }
  }
}
```

### Reduce Transform
```json
{
  "type": "reduce",
  "config": {
    "operation": "sum",
    "field": "value",
    "initialValue": 0
  }
}
```

### Custom Transform
```json
{
  "type": "custom",
  "config": {
    "expression": "Temperature is ${temp_c}°C with ${condition} conditions"
  }
}
```

## Beispiel-Workflow

1. **Input konfigurieren** - Wetter-API alle 30 Sekunden abfragen
2. **Transform hinzufügen** - Nur Temperaturen über 20°C filtern
3. **Output konfigurieren** - Benachrichtigung an Slack senden

```bash
# 1. Input erstellen
curl -X POST http://localhost:3000/input \
  -H "Content-Type: application/json" \
  -d '{
    "id": "weather-input",
    "url": "https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=Berlin",
    "method": "GET",
    "interval": "*/30 * * * * *",
    "enabled": true
  }'

# 2. Transform erstellen
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

# 3. Output erstellen
curl -X POST http://localhost:3000/output \
  -H "Content-Type: application/json" \
  -d '{
    "id": "slack-alert",
    "name": "Slack Hot Weather Alert",
    "url": "https://hooks.slack.com/services/YOUR_WEBHOOK",
    "method": "POST",
    "template": "{\"text\": \"🔥 Hot weather alert: ${temp_c}°C in Berlin!\"}",
    "enabled": true
  }'
```

## Entwicklung

```bash
# Development Server mit Hot Reload
npm run start:dev

# Debug Mode
npm run start:debug

# Code formatieren
npm run format

# Linting
npm run lint

# Tests
npm run test
```

## Nächste Schritte

- [ ] Pipeline-Konfiguration (Input → Transform → Output)
- [ ] Webhook-Support für Inputs
- [ ] Websocket-Support
- [ ] Delay und Loop-Funktionalität
- [ ] Dashboard/UI
- [ ] Datenbank-Integration
- [ ] Authentication & Authorization

## Technologie-Stack

- **Backend**: NestJS (Node.js)
- **HTTP Client**: Axios
- **Scheduling**: @nestjs/schedule
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript

## Lizenz

ISC 