The system is a monorepo with two main packages:

- `backend` (Node.js/Express): Runs on the Pi. It manages drivers, schedules jobs, accesses the NAS, and serves the API. It maintains a SQLite database (low memory) on the Pi's local storage solely for indexing.
- `frontend` (Next.js): The dashboard you access from your browser. It's a pure client, fetching all data from the backend API.
- `NAS` (Network Attached Storage): Stores all raw, unmodified data. The backend mounts this (e.g., via nfs or smb) to a local path like /mnt/nas.

Data Flow:
- A Driver (e.g., spotifyDriver) is triggered by the Job Scheduler.
- The Driver fetches new data (e.g., new endsong.json files).
- It saves the raw file to /mnt/nas/lifelog/raw/spotify/timestamp.json.
- It parses the raw file into the Unified LogEvent format.
- It inserts these LogEvent objects into the SQLite Index DB on the Pi. The LogEvent contains a reference path to the raw file on the NAS.
- The Frontend queries the API (e.g., "show me music from last week").
- The API queries the SQLite Index DB (which is fast) to get the relevant LogEvents.
- The Frontend renders the data.