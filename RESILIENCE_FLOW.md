# Resilience Flow Diagram

## Request Flow with Resilience

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTION                               │
│                  (Submit Product Form)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Check Online  │
                    │    Status      │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
            OFFLINE                   ONLINE
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Queue Request │        │ Send Request │
        │  (localStorage)│        │  to Server   │
        └───────┬───────┘        └──────┬───────┘
                │                       │
                │                       ▼
                │              ┌────────────────┐
                │              │  Retry Logic   │
                │              │  (3 attempts)  │
                │              └────────┬───────┘
                │                       │
                │          ┌────────────┴────────────┐
                │          │                         │
                │      SUCCESS                   FAILURE
                │          │                         │
                │          ▼                         ▼
                │  ┌──────────────┐        ┌────────────────┐
                │  │ Cache Result │        │  Check Error   │
                │  │   (5 min)    │        │     Type       │
                │  └──────────────┘        └────────┬───────┘
                │                                   │
                │                      ┌────────────┴────────────┐
                │                      │                         │
                │                  4xx ERROR              5xx/NETWORK
                │                      │                         │
                │                      ▼                         ▼
                │              ┌──────────────┐        ┌────────────────┐
                │              │ Show Error   │        │ Use Stale Cache│
                │              │  (No Retry)  │        │  (if available)│
                │              └──────────────┘        └────────┬───────┘
                │                                               │
                │                                               ▼
                │                                      ┌────────────────┐
                │                                      │ Queue Request  │
                │                                      │  (if mutation) │
                │                                      └────────────────┘
                │                                               │
                └───────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ Show Success or  │
                          │  Queue Message   │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Wait for Online │
                          │   (if queued)    │
                          └──────────┬───────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Auto-Process    │
                          │     Queue        │
                          └──────────────────┘
```

## Cache Strategy Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        API REQUEST                               │
│                   (GET /api/vendor/*)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Check Cache   │
                    │  (localStorage)│
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           CACHE HIT                 CACHE MISS
           (< 5 min)                      │
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Return Cached │        │ Fetch from   │
        │     Data      │        │   Network    │
        └───────────────┘        └──────┬───────┘
                                        │
                           ┌────────────┴────────────┐
                           │                         │
                       SUCCESS                   FAILURE
                           │                         │
                           ▼                         ▼
                   ┌──────────────┐        ┌────────────────┐
                   │ Cache Result │        │ Check for Stale│
                   │  Return Data │        │     Cache      │
                   └──────────────┘        └────────┬───────┘
                                                    │
                                       ┌────────────┴────────────┐
                                       │                         │
                                  STALE FOUND                NO CACHE
                                       │                         │
                                       ▼                         ▼
                               ┌──────────────┐        ┌────────────────┐
                               │ Return Stale │        │  Return Error  │
                               │  + Warning   │        │   (Fallback)   │
                               └──────────────┘        └────────────────┘
```

## Service Worker Cache Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER REQUEST                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Service Worker │
                    │   Intercepts   │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           API REQUEST              STATIC ASSET
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Network First │        │ Cache First  │
        └───────┬───────┘        └──────┬───────┘
                │                       │
                ▼                       ▼
        ┌───────────────┐        ┌──────────────┐
        │ Try Network   │        │ Check Cache  │
        └───────┬───────┘        └──────┬───────┘
                │                       │
   ┌────────────┴────────────┐         │
   │                         │         │
SUCCESS                  FAILURE       │
   │                         │         │
   ▼                         ▼         ▼
┌──────────┐        ┌──────────────┐  │
│  Cache   │        │ Fallback to  │  │
│  Result  │        │    Cache     │  │
└──────────┘        └──────────────┘  │
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                    CACHE HIT                 CACHE MISS
                         │                         │
                         ▼                         ▼
                 ┌──────────────┐        ┌────────────────┐
                 │ Return Cache │        │ Fetch Network  │
                 │ + Background │        │  (if online)   │
                 │    Update    │        └────────────────┘
                 └──────────────┘
```

## Offline Queue Processing

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONNECTION RESTORED                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Check Queue    │
                    │ (localStorage) │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           QUEUE EMPTY              QUEUE HAS ITEMS
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │  Do Nothing   │        │ Process Each │
        └───────────────┘        │    Item      │
                                 └──────┬───────┘
                                        │
                                        ▼
                                ┌──────────────┐
                                │ Send Request │
                                └──────┬───────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                      SUCCESS                   FAILURE
                          │                         │
                          ▼                         ▼
                  ┌──────────────┐        ┌────────────────┐
                  │ Remove from  │        │  Keep in Queue │
                  │    Queue     │        │   (try later)  │
                  └──────┬───────┘        └────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Next Item or │
                  │   Complete   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Show Sync    │
                  │ Notification │
                  └──────────────┘
```

## Error Handling Decision Tree

```
                    ┌────────────────┐
                    │  Request Error │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           NETWORK ERROR            HTTP ERROR
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Check Online  │        │ Check Status │
        │    Status     │        │     Code     │
        └───────┬───────┘        └──────┬───────┘
                │                       │
   ┌────────────┴────────────┐         │
   │                         │         │
OFFLINE                  TIMEOUT       │
   │                         │         │
   ▼                         ▼         ▼
┌──────────┐        ┌──────────────┐  │
│  Queue   │        │    Retry     │  │
│ Request  │        │  (3 times)   │  │
└──────────┘        └──────────────┘  │
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                      4xx ERROR                5xx ERROR
                         │                         │
                         ▼                         ▼
                 ┌──────────────┐        ┌────────────────┐
                 │  Don't Retry │        │  Retry with    │
                 │  Show Error  │        │   Backoff      │
                 └──────────────┘        └────────┬───────┘
                                                  │
                                     ┌────────────┴────────────┐
                                     │                         │
                                 SUCCESS                   ALL FAILED
                                     │                         │
                                     ▼                         ▼
                             ┌──────────────┐        ┌────────────────┐
                             │ Cache Result │        │ Use Stale Cache│
                             │ Return Data  │        │  or Queue      │
                             └──────────────┘        └────────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Product Form │  │  Connection  │  │    Debug     │          │
│  │              │  │    Status    │  │    Panel     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────────┐
│         │    API CLIENT LAYER                 │                 │
│         │                  │                  │                 │
│  ┌──────▼───────┐  ┌───────▼──────┐  ┌───────▼──────┐          │
│  │ fetchWithCache│  │ offlineQueue │  │ CacheManager │          │
│  └──────┬───────┘  └───────┬──────┘  └───────┬──────┘          │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼──────┐                             │
│                    │ resilientFetch│                             │
│                    └───────┬──────┘                             │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│         STORAGE LAYER      │                                    │
│                            │                                    │
│  ┌─────────────────────────▼─────────────────────────┐          │
│  │              localStorage                          │          │
│  │  ┌──────────────┐  ┌──────────────┐              │          │
│  │  │ api_cache_*  │  │offline_queue │              │          │
│  │  └──────────────┘  └──────────────┘              │          │
│  └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│      SERVICE WORKER        │                                    │
│                            │                                    │
│  ┌─────────────────────────▼─────────────────────────┐          │
│  │              Cache Storage                         │          │
│  │  ┌──────────────┐  ┌──────────────┐              │          │
│  │  │vendor-pwa-v1 │  │runtime-cache │              │          │
│  │  └──────────────┘  └──────────────┘              │          │
│  └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│         NETWORK            │                                    │
│                            │                                    │
│  ┌─────────────────────────▼─────────────────────────┐          │
│  │         WooCommerce API Endpoints                  │          │
│  │  /api/vendor/products                              │          │
│  │  /api/vendor/categories                            │          │
│  │  /api/vendor/brands                                │          │
│  │  /api/vendor/locations                             │          │
│  └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Timeline

```
Time →

T0: User loads form
    │
    ├─→ Check cache (localStorage)
    │   └─→ Cache hit? Return immediately
    │
    ├─→ Fetch from API (parallel)
    │   ├─→ Categories
    │   ├─→ Brands
    │   ├─→ Locations
    │   └─→ Attributes
    │
    └─→ Cache results (5 min TTL)

T1: User fills form
    │
    └─→ Local state only (no network)

T2: User submits
    │
    ├─→ Check online status
    │   │
    │   ├─→ Online: Send request
    │   │   ├─→ Attempt 1 (0s)
    │   │   ├─→ Attempt 2 (1s delay)
    │   │   ├─→ Attempt 3 (2s delay)
    │   │   └─→ Success or Error
    │   │
    │   └─→ Offline: Queue request
    │       └─→ Save to localStorage
    │
    └─→ Show result to user

T3: Connection restored (if was offline)
    │
    ├─→ Detect online event
    │
    ├─→ Process queue
    │   ├─→ Send queued request 1
    │   ├─→ Send queued request 2
    │   └─→ ...
    │
    └─→ Show sync notification

T4: Cache expires (5 min later)
    │
    └─→ Next request fetches fresh data
```

## Summary

The resilience system has **4 main layers**:

1. **Application Layer**: Smart components that handle errors gracefully
2. **API Client Layer**: Retry logic, caching, and queue management
3. **Storage Layer**: localStorage for cache and queue persistence
4. **Service Worker Layer**: Browser-level caching and offline support

Each layer provides fallback mechanisms, ensuring the app **never completely breaks**.
