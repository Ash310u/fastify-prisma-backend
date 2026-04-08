# User Routes

## Route List
- GET /api/users
- GET /api/users/:id
- GET /api/users/:id/insights
- POST /api/users
- POST /api/users/session
- GET /api/users/session
- PUT /api/users/:id
- DELETE /api/users/:id

## Auth Notes
- `POST /api/users` and `POST /api/users/session` are public routes.
- All other user routes require `Authorization: Bearer <token>`.

## Input Examples

### GET /api/users
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

### GET /api/users/:id
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

### GET /api/users/:id/insights
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

### POST /api/users
Input
- Params: none
- Query: none
- Body
```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "passwordHash": "hashed_password_value",
  "role": "citizen",
  "city": "Bhopal",
  "impactScore": 12.5
}
```

### POST /api/users/session
Input
- Params: none
- Query: none
- Body
```json
{
  "email": "aarav@example.com",
  "passwordHash": "hashed_password_value"
}
```

### GET /api/users/session
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

### PUT /api/users/:id
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
  "city": "Indore",
  "role": "authority",
  "impactScore": 18.25
}
```
- Headers
```json
{
  "Authorization": "Bearer <token>"
}
```

### DELETE /api/users/:id
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
