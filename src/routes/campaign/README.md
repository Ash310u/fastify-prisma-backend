# Campaign Routes

## Route List

### Campaign
- GET /api/campaigns
- GET /api/campaigns/:id
- POST /api/campaigns
- PUT /api/campaigns/:id
- DELETE /api/campaigns/:id

### Campaign Join
- GET /api/campaign-joins
- GET /api/campaign-joins/:id
- POST /api/campaign-joins
- PUT /api/campaign-joins/:id
- DELETE /api/campaign-joins/:id

## Auth Notes
- All campaign and campaign-join routes require `Authorization: Bearer <token>`.

## Input Examples

### GET /api/campaigns
Input
- Params: none
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### GET /api/campaigns/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### POST /api/campaigns
Input
- Params: none
- Query: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```
- Body
```json
{
  "createdBy": 1,
  "title": "Clean City Drive",
  "description": "Weekend cleanup campaign",
  "city": "Bhopal",
  "date": "2026-04-20T07:30:00.000Z",
  "participantCount": 50
}
```

### PUT /api/campaigns/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```
- Body
```json
{
  "title": "Mega Clean City Drive",
  "participantCount": 75
}
```

### DELETE /api/campaigns/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### GET /api/campaign-joins
Input
- Params: none
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### GET /api/campaign-joins/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### POST /api/campaign-joins
Input
- Params: none
- Query: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```
- Body
```json
{
  "campaignId": 1,
  "userId": 3
}
```

### PUT /api/campaign-joins/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```
- Body
```json
{
  "campaignId": 2,
  "userId": 3
}
```

### DELETE /api/campaign-joins/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```
