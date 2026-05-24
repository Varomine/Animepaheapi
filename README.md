# AnimePahe Scraper API 

## Features

- Search anime by query
- Get all episodes for a given anime session
- Retrieve source links for a specific episode
- Resolve `.m3u8` URLs from Kwik or embedded players
- FastAPI backend for easy integration with frontends or other tools
- Async, efficient, and capable of bypassing Cloudflare restrictions

---
## 📡 API Endpoints

Once deployed, your API will have these endpoints:

- `GET /` - API information
- `GET /health` - Health check
- `GET /search?q=naruto` - Search anime
- `GET /episodes?session=<session>` - Get episodes
- `GET /sources?anime_session=<session>&episode_session=<session>` - Get sources
- `GET /m3u8?url=<kwik-url>` - Resolve M3U8 URL
- `GET /player.html` - Video player demo



## 📝 Environment Variables

No environment variables needed! The app works out of the box.


**Note:** M3U8 resolution takes 2-3 seconds, well within the timeout.

## Example JSON

```http
GET /search?q=naruto
```

Output:

```json
[
  {
    "id": 1571,
    "title": "Naruto",
    "url": "https://animepahe.com/anime/77bbe16e-fd87-13d9-a18c-4edb06884a33",
    "year": 2002,
    "poster": "https://i.animepahe.com/posters/85d36625d8fe4e51d4deb9ea4a543d71ed6397b5c439d4fc6dd0bc62861e03d2.jpg",
    "type": "TV",
    "session": "77bbe16e-fd87-13d9-a18c-4edb06884a33"
  },
  {
    "id": 1,
    "title": "Naruto Shippuden",
    "url": "https://animepahe.com/anime/623e7c17-bfe4-d666-58eb-a6a934012011",
    "year": 2007,
    "poster": "https://i.animepahe.com/posters/f4c50c796beaddb3cb27f88bea181ce858768de4e6c59e37519fc15870472db8.jpg",
    "type": "TV",
    "session": "623e7c17-bfe4-d666-58eb-a6a934012011"
  },
  {
    "id": 1012,
    "title": "Naruto Spin-Off: Rock Lee & His Ninja Pals",
    "url": "https://animepahe.com/anime/4bdd6e0c-ac0c-3908-9587-874b4bf29117",
    "year": 2012,
    "poster": "https://i.animepahe.com/posters/5d01b49ef31cdc6f5a4ba1e220244d3fb5e2fe4c122473c06f453da21c1ec1fa.jpg",
    "type": "TV",
    "session": "4bdd6e0c-ac0c-3908-9587-874b4bf29117"
  }
]
```

---

```http
GET /episodes?session=77bbe16e-fd87-13d9-a18c-4edb06884a33
```

Output:

```json
[
  {
    "id": 15779,
    "number": 1,
    "title": "Episode 1",
    "snapshot": "https://i.animepahe.com/snapshots/6693c23144b7f3d2bc73242740527ea77baa1d2649180bdb63f35b6a0ef9188b.jpg",
    "session": "18ea551da39ccf31e77f9702365193b45636c5ffe7168f209830a56607f2a9d3"
  },
  {
    "id": 15780,
    "number": 2,
    "title": "Episode 2",
    "snapshot": "https://i.animepahe.com/snapshots/44025fa8399d9d68584903c2b5b23c579fd1d73f33570d2d95e783895d97f757.jpg",
    "session": "38517b2d536b4c2a2c0c082f1995eb26b04c8af98889afebdb26f344a33c324b"
  }
]
```

---

```http
GET /sources?anime_session=77bbe16e-fd87-13d9-a18c-4edb06884a33&episode_session=18ea551da39ccf31e77f9702365193b45636c5ffe7168f209830a56607f2a9d3
```

Output:

```json
[
  {
    "url": "https://kwik.cx/e/4q3V1NDdRVy9",
    "quality": "800p",
    "fansub": "df68",
    "audio": "jpn"
  },
  {
    "url": "https://kwik.cx/e/GDFF1EyEUCLD",
    "quality": "360p",
    "fansub": "df68",
    "audio": "jpn"
  }
]
```

---

```http
GET /m3u8?url=https://kwik.cx/e/4q3V1NDdRVy9
```

Output:

```json
{
  "m3u8": "https://vault-01.uwucdn.top/stream/01/03/b92a392054c041a3f9c6eecabeb0e127183f44e547828447b10bca8d77523e6f/uwu.m3u8",
  "referer": "https://kwik.cx/e/4q3V1NDdRVy9",
  "headers": {
    "Referer": "https://kwik.cx/e/4q3V1NDdRVy9",
    "Origin": "https://kwik.cx"
  },
  "proxy_url": "/proxy?url=https%3A%2F%2Fvault-01.uwucdn.top%2Fstream%2F01%2F03%2Fb92a392054c041a3f9c6eecabeb0e127183f44e547828447b10bca8d77523e6f%2Fuwu.m3u8&referer=https%3A%2F%2Fkwik.cx%2Fe%2F4q3V1NDdRVy9"
}
```





