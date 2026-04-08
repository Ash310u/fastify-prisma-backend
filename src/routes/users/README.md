# User Routes

## Route List
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Input Examples

### GET /api/users
Input
- Params: none
- Query: none
- Body: none

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
