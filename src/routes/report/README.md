# Report Routes

## Route List
- GET /api/reports
- GET /api/reports/:id
- POST /api/reports
- PUT /api/reports/:id
- DELETE /api/reports/:id

## Input Examples

### GET /api/reports
Input
- Params: none
- Query: none
- Body: none

### GET /api/reports/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none

### POST /api/reports
Input
- Params: none
- Query: none
- Body
```json
{
  "userId": 1,
  "imageUrl": "https://example.com/report.jpg",
  "latitude": 23.2599,
  "longitude": 77.4126,
  "addressText": "Near City Park",
  "garbageType": "plastic",
  "severity": "high",
  "status": "pending",
  "aiConfidenceScore": 0.91,
  "resolvedAt": "2026-04-08T10:00:00.000Z"
}
```

### PUT /api/reports/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body
```json
{
  "status": "assigned",
  "severity": "medium",
  "aiConfidenceScore": 0.94
}
```

### DELETE /api/reports/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
