# Game study presentations

## Run on a remote server

Install Docker Engine with the Docker Compose plugin, then clone or copy this
repository to the server. From the repository directory, run:

```sh
docker compose up -d --build
```

Allow inbound TCP port **8080** in the server firewall and, if applicable, the
cloud security group. Open:

- `http://SERVER_IP:8080/lesson1` — first presentation
- `http://SERVER_IP:8080/lesson2` — second presentation
- `http://SERVER_IP:8080/lesson1/game.html` — first lesson's game
- `http://SERVER_IP:8080/lesson1/teacher.html` — first lesson's teacher notes
- `http://SERVER_IP:8080/lesson2/teacher.html` — second lesson's teacher notes

The root URL redirects to lesson 1. Lesson directory URLs automatically gain a
trailing slash so relative links and images resolve correctly.

### Change the port

The default host port is 8080. To use a different port, create a `.env` file in
the repository directory containing, for example:

```dotenv
PORT=9090
```

Then run `docker compose up -d --build` and open `http://SERVER_IP:9090/lesson1`.

### Updates and operations

After updating the lesson files, rebuild:

```sh
docker compose up -d --build
```

For a new lesson directory, add a matching `COPY` line to `Dockerfile` before
rebuilding (for example, `COPY lesson3/ /usr/share/nginx/html/lesson3/`).

View logs or stop the service:

```sh
docker compose logs -f
docker compose down
```

The service restarts automatically after a server reboot when Docker starts.
Presentation files are bundled into the image; no server-side database is needed.
Votes and other browser-saved state remain local to each browser.
