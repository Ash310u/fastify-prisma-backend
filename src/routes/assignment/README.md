# Assignment Routes

## Route List
- GET /api/assignments
- GET /api/assignments/:id
- POST /api/assignments
- PUT /api/assignments/:id
- DELETE /api/assignments/:id

## Input Examples

### GET /api/assignments
Input
- Params: none
- Query: none
- Body: none

### GET /api/assignments/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none

### POST /api/assignments
Input
- Params: none
- Query: none
- Body
```json
{
  "reportId": 1,
  "authorityId": 2,
  "resolvedAt": "2026-04-08T12:00:00.000Z",
  "beforeImageUrl": "https://example.com/before.jpg",
  "afterImageUrl": "https://example.com/after.jpg"
}
```

### PUT /api/assignments/:id
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
  "afterImageUrl": "https://example.com/after-new.jpg",
  "resolvedAt": "2026-04-09T09:30:00.000Z"
}
```

### DELETE /api/assignments/:id
Input
- Params
```json
{
  "id": 1
}
```
- Query: none
- Body: none
