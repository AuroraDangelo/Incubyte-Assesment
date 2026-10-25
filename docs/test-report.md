# Test report

_Generated: 2026-10-24 17:27 UTC_

## Backend (Vitest + Supertest)
```
The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v2.1.8 C:/Users/PRIYANSHU MISHRA/Downloads/car-dealership/car-dealership/backend
      Coverage enabled with v8

 ✓ src/config.test.ts > loadConfig > provides safe development defaults
 ✓ src/config.test.ts > loadConfig > reads overrides from the environment
 ✓ src/config.test.ts > loadConfig > refuses to boot in production without JWT_SECRET
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > decrements stock by one by default
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > supports buying several units at once
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > refuses to oversell and leaves stock unchanged
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > refuses to buy an out-of-stock vehicle
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > rejects zero, negative and fractional quantities
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > throws NotFoundError for unknown vehicles
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > increases stock by the given amount
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > requires a positive whole quantity
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > throws NotFoundError for unknown vehicles
 ✓ src/services/authService.test.ts > AuthService > register > creates a user with the default "user" role and never exposes the password hash
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > stores a vehicle and assigns a unique id
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects missing make
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects negative price
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects fractional quantity
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects negative quantity
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects non-numeric price
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > list / get > lists every vehicle including out-of-stock ones
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > list / get > throws NotFoundError for an unknown id
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > update > applies a partial update and leaves other fields untouched
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > update > rejects an empty update and unknown ids
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > remove > deletes a vehicle
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > remove > throws NotFoundError when deleting something that does not exist
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > matches make case-insensitively and partially
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > matches model and category
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > filters by price range (inclusive)
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > combines filters with AND
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > treats SQL wildcard characters in input literally
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > rejects a nonsensical price range
 ✓ src/services/authService.test.ts > AuthService > register > normalises e-mail addresses to lower case
 ✓ src/services/authService.test.ts > AuthService > register > rejects a duplicate e-mail
 ✓ src/services/authService.test.ts > AuthService > register > rejects invalid e-mail
 ✓ src/services/authService.test.ts > AuthService > register > rejects short password
 ✓ src/services/authService.test.ts > AuthService > register > rejects empty name
 ✓ src/services/authService.test.ts > AuthService > login > returns a signed JWT carrying the user id and role
 ✓ src/services/authService.test.ts > AuthService > login > rejects a wrong password and an unknown e-mail with the same error
 ✓ src/app.test.ts > HTTP API > auth > POST /register returns 201 and no password data 458ms
 ✓ src/services/authService.test.ts > AuthService > login > verifies tokens back into an auth context
 ✓ src/app.test.ts > HTTP API > auth > ignores a client-supplied role (no privilege escalation) 326ms
 ✓ src/app.test.ts > HTTP API > auth > POST /register -> 400 on invalid body, 409 on duplicate
 ✓ src/app.test.ts > HTTP API > auth > POST /login returns token + user, 401 for bad credentials 384ms
 ✓ src/app.test.ts > HTTP API > protection > get /api/vehicles requires a token
 ✓ src/app.test.ts > HTTP API > protection > get /api/vehicles/search requires a token
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles requires a token
 ✓ src/app.test.ts > HTTP API > protection > put /api/vehicles/1 requires a token
 ✓ src/app.test.ts > HTTP API > protection > delete /api/vehicles/1 requires a token
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles/1/purchase requires a token
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles/1/restock requires a token
 ✓ src/app.test.ts > HTTP API > protection > rejects a malformed token
 ✓ src/app.test.ts > HTTP API > vehicles > POST creates (201) and validates (400)
 ✓ src/app.test.ts > HTTP API > vehicles > GET lists all vehicles
 ✓ src/app.test.ts > HTTP API > vehicles > GET /search filters by make, category and price range
 ✓ src/app.test.ts > HTTP API > vehicles > PUT updates (200) and 404s for unknown ids
 ✓ src/app.test.ts > HTTP API > vehicles > DELETE is admin-only
 ✓ src/app.test.ts > HTTP API > vehicles > rejects a non-numeric id with 400
 ✓ src/app.test.ts > HTTP API > inventory > purchase decrements stock, then 409 when sold out
 ✓ src/app.test.ts > HTTP API > inventory > restock is admin-only and increases stock
 ✓ src/app.test.ts > HTTP API > inventory > purchase/restock 404 for unknown vehicles
 ✓ src/app.test.ts > HTTP API > returns 400 for a malformed JSON body
 ✓ src/app.test.ts > HTTP API > GET /api/health is public
 ✓ src/app.test.ts > HTTP API > unknown routes return a JSON 404

 Test Files  5 passed (5)
      Tests  63 passed (63)
   Start at  22:57:25
   Duration  7.79s (transform 738ms, setup 0ms, collect 3.45s, tests 7.50s, environment 8ms, prepare 1.18s)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    91.5 |    92.53 |   96.07 |    91.5 |                   
 src               |   75.22 |    91.66 |    90.9 |   75.22 |                   
  app.ts           |     100 |      100 |     100 |     100 |                   
  config.ts        |     100 |      100 |     100 |     100 |                   
  db.ts            |     100 |      100 |     100 |     100 |                   
  errors.ts        |     100 |      100 |     100 |     100 |                   
  types.ts         |       0 |        0 |       0 |       0 | 1-27              
  validation.ts    |     100 |       80 |     100 |     100 | 9                 
 src/middleware    |   88.88 |    94.73 |     100 |   88.88 |                   
  auth.ts          |     100 |      100 |     100 |     100 |                   
  errorHandler.ts  |   72.72 |     87.5 |     100 |   72.72 | 14-16             
 src/repositories  |   94.31 |       92 |   92.85 |   94.31 |                   
  ...Repository.ts |   80.76 |    71.42 |      80 |   80.76 | 37-41             
  ...Repository.ts |     100 |      100 |     100 |     100 |                   
 src/routes        |     100 |    84.61 |     100 |     100 |                   
  authRoutes.ts    |     100 |    77.77 |     100 |     100 | 10,20             
  vehicleRoutes.ts |     100 |    88.23 |     100 |     100 | 43-47             
 src/services      |     100 |     97.5 |     100 |     100 |                   
  authService.ts   |     100 |      100 |     100 |     100 |                   
  ...oryService.ts |     100 |      100 |     100 |     100 |                   
  ...cleService.ts |     100 |    94.11 |     100 |     100 | 65                
-------------------|---------|----------|---------|---------|-------------------
```

## Frontend (Vitest + React Testing Library)
```

 RUN  v2.1.8 C:/Users/PRIYANSHU MISHRA/Downloads/car-dealership/car-dealership/frontend

 ✓ src/api.test.ts > buildSearchQuery > drops empty filters and encodes values
 ✓ src/api.test.ts > buildSearchQuery > returns an empty string when nothing is set
 ✓ src/api.test.ts > api client > sends the bearer token and JSON body
 ✓ src/api.test.ts > api client > uses /search when filters are present and the plain list otherwise
 ✓ src/api.test.ts > api client > throws ApiError carrying the server message and status
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > shows make, model, category, formatted price and stock 301ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > calls onPurchase when the Purchase button is clicked
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > disables Purchase and shows "Sold out" when quantity is zero
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > hides admin controls from regular users
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > shows edit / restock / delete to admins and wires the callbacks
 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > submits login credentials 851ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > submits a new vehicle with numeric price and quantity 879ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > pre-fills the form when editing and labels the button "Save changes"
 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > switches to the registration form and submits name, e-mail and password 681ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > blocks submit and shows an error for invalid numbers 593ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > closes on Escape
 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > shows the server error message when login fails 374ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  22:57:38
   Duration  6.02s (transform 560ms, setup 3.25s, collect 1.79s, tests 4.29s, environment 8.93s, prepare 702ms)

```
