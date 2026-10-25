# Test report

_Generated: 2026-10-23 18:08 UTC_

## Backend (Vitest + Supertest)
```
(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.

 RUN  v5.0.5 /home/claude/car-dealership/backend
      Coverage enabled with v8

 ✓ src/app.test.ts > HTTP API > auth > POST /register returns 201 and no password data 515ms
 ✓ src/app.test.ts > HTTP API > auth > ignores a client-supplied role (no privilege escalation) 366ms
 ✓ src/app.test.ts > HTTP API > auth > POST /register -> 400 on invalid body, 409 on duplicate 255ms
 ✓ src/app.test.ts > HTTP API > auth > POST /login returns token + user, 401 for bad credentials 562ms
 ✓ src/app.test.ts > HTTP API > protection > get /api/vehicles requires a token 293ms
 ✓ src/app.test.ts > HTTP API > protection > get /api/vehicles/search requires a token 251ms
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles requires a token 240ms
 ✓ src/app.test.ts > HTTP API > protection > put /api/vehicles/1 requires a token 258ms
 ✓ src/app.test.ts > HTTP API > protection > delete /api/vehicles/1 requires a token 239ms
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles/1/purchase requires a token 246ms
 ✓ src/app.test.ts > HTTP API > protection > post /api/vehicles/1/restock requires a token 278ms
 ✓ src/app.test.ts > HTTP API > protection > rejects a malformed token 244ms
 ✓ src/app.test.ts > HTTP API > vehicles > POST creates (201) and validates (400) 247ms
 ✓ src/app.test.ts > HTTP API > vehicles > GET lists all vehicles 254ms
 ✓ src/app.test.ts > HTTP API > vehicles > GET /search filters by make, category and price range 259ms
 ✓ src/app.test.ts > HTTP API > vehicles > PUT updates (200) and 404s for unknown ids 249ms
 ✓ src/app.test.ts > HTTP API > vehicles > DELETE is admin-only 247ms
 ✓ src/app.test.ts > HTTP API > vehicles > rejects a non-numeric id with 400 265ms
 ✓ src/app.test.ts > HTTP API > inventory > purchase decrements stock, then 409 when sold out 254ms
 ✓ src/app.test.ts > HTTP API > inventory > restock is admin-only and increases stock 263ms
 ✓ src/app.test.ts > HTTP API > inventory > purchase/restock 404 for unknown vehicles 248ms
 ✓ src/app.test.ts > HTTP API > returns 400 for a malformed JSON body 243ms
 ✓ src/app.test.ts > HTTP API > GET /api/health is public 238ms
 ✓ src/app.test.ts > HTTP API > unknown routes return a JSON 404 253ms
 ✓ src/services/authService.test.ts > AuthService > register > creates a user with the default "user" role and never exposes the password hash 176ms
 ✓ src/services/authService.test.ts > AuthService > register > normalises e-mail addresses to lower case 162ms
 ✓ src/services/authService.test.ts > AuthService > register > rejects a duplicate e-mail 117ms
 ✓ src/services/authService.test.ts > AuthService > register > rejects invalid e-mail 5ms
 ✓ src/services/authService.test.ts > AuthService > register > rejects short password 4ms
 ✓ src/services/authService.test.ts > AuthService > register > rejects empty name 5ms
 ✓ src/services/authService.test.ts > AuthService > login > returns a signed JWT carrying the user id and role 257ms
 ✓ src/services/authService.test.ts > AuthService > login > rejects a wrong password and an unknown e-mail with the same error 271ms
 ✓ src/services/authService.test.ts > AuthService > login > verifies tokens back into an auth context 225ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > stores a vehicle and assigns a unique id 21ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects missing make 5ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects negative price 3ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects fractional quantity 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects negative quantity 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > create > rejects non-numeric price 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > list / get > lists every vehicle including out-of-stock ones 5ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > list / get > throws NotFoundError for an unknown id 3ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > update > applies a partial update and leaves other fields untouched 5ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > update > rejects an empty update and unknown ids 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > remove > deletes a vehicle 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > remove > throws NotFoundError when deleting something that does not exist 3ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > matches make case-insensitively and partially 5ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > matches model and category 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > filters by price range (inclusive) 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > combines filters with AND 4ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > treats SQL wildcard characters in input literally 5ms
 ✓ src/services/vehicleService.test.ts > VehicleService – catalogue > search > rejects a nonsensical price range 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > decrements stock by one by default 20ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > supports buying several units at once 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > refuses to oversell and leaves stock unchanged 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > refuses to buy an out-of-stock vehicle 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > rejects zero, negative and fractional quantities 8ms
 ✓ src/services/inventoryService.test.ts > InventoryService > purchase > throws NotFoundError for unknown vehicles 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > increases stock by the given amount 3ms
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > requires a positive whole quantity 4ms
 ✓ src/services/inventoryService.test.ts > InventoryService > restock > throws NotFoundError for unknown vehicles 4ms
 ✓ src/config.test.ts > loadConfig > provides safe development defaults 3ms
 ✓ src/config.test.ts > loadConfig > reads overrides from the environment 0ms
 ✓ src/config.test.ts > loadConfig > refuses to boot in production without JWT_SECRET 1ms

 Test Files  5 passed (5)
      Tests  63 passed (63)
   Start at  18:08:50
   Duration  9.88s (tests 91%, import 8%, worker 1%)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.51 |    87.09 |    98.5 |   96.62 |                   
 src               |     100 |    95.83 |     100 |     100 |                   
  app.ts           |     100 |      100 |     100 |     100 |                   
  config.ts        |     100 |      100 |     100 |     100 |                   
  db.ts            |     100 |      100 |     100 |     100 |                   
  errors.ts        |     100 |      100 |     100 |     100 |                   
  types.ts         |       0 |        0 |       0 |       0 |                   
  validation.ts    |     100 |       75 |     100 |     100 | 9                 
 src/middleware    |   90.47 |    92.85 |     100 |   89.47 |                   
  auth.ts          |     100 |      100 |     100 |     100 |                   
  errorHandler.ts  |   77.77 |    83.33 |     100 |      75 | 14-15             
 src/repositories  |   88.63 |    73.68 |   94.11 |   89.74 |                   
  ...Repository.ts |   58.33 |       50 |      80 |      60 | 37-40             
  ...Repository.ts |     100 |     90.9 |     100 |     100 | 61                
 src/routes        |     100 |    66.66 |     100 |     100 |                   
  authRoutes.ts    |     100 |       50 |     100 |     100 | 10-20             
  vehicleRoutes.ts |     100 |       75 |     100 |     100 | 43-47             
 src/services      |     100 |    95.83 |     100 |     100 |                   
  authService.ts   |     100 |      100 |     100 |     100 |                   
  ...oryService.ts |     100 |      100 |     100 |     100 |                   
  ...cleService.ts |     100 |    88.88 |     100 |     100 | 65                
-------------------|---------|----------|---------|---------|-------------------
```

## Frontend (Vitest + React Testing Library)
```

 RUN  v5.0.5 /home/claude/car-dealership/frontend

 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > submits login credentials 423ms
 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > switches to the registration form and submits name, e-mail and password 229ms
 ✓ src/components/AuthPage.test.tsx > <AuthPage /> > shows the server error message when login fails 140ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > submits a new vehicle with numeric price and quantity 477ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > pre-fills the form when editing and labels the button "Save changes" 86ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > blocks submit and shows an error for invalid numbers 202ms
 ✓ src/components/VehicleFormModal.test.tsx > <VehicleFormModal /> > closes on Escape 10ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > shows make, model, category, formatted price and stock 213ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > calls onPurchase when the Purchase button is clicked 47ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > disables Purchase and shows "Sold out" when quantity is zero 11ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > hides admin controls from regular users 11ms
 ✓ src/components/VehicleCard.test.tsx > <VehicleCard /> > shows edit / restock / delete to admins and wires the callbacks 77ms
 ✓ src/api.test.ts > buildSearchQuery > drops empty filters and encodes values 2ms
 ✓ src/api.test.ts > buildSearchQuery > returns an empty string when nothing is set 0ms
 ✓ src/api.test.ts > api client > sends the bearer token and JSON body 1ms
 ✓ src/api.test.ts > api client > uses /search when filters are present and the plain list otherwise 1ms
 ✓ src/api.test.ts > api client > throws ApiError carrying the server message and status 2ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  18:09:01
   Duration  7.01s (environment 55%, tests 31%, setup 8%, import 3%, worker 2%, transform 1%)

Environment  jsdom was created 4 times · 3.48s total, 55% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

```
