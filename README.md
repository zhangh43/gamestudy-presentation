# Game study presentations

## 第三、第四课

- [第三课：英语记单词](lesson3/index.html) — 近义词连连看、单词打地鼠。
- [第四课：语文古诗词](lesson4/index.html) — 古诗词填空、诗词接龙（同一首诗接下句）。
- 教师参考：[第三课](lesson3/teacher.html)、[第四课](lesson4/teacher.html)。

两课均为 6 页精简课件，沿用第二课的视觉风格。每课默认 40 分钟：
示例与任务 6 分钟、项目制作与互测 24 分钟、展示答辩 10 分钟（5 组，每组 2 分钟）。
第 5 页有手动启动的制作计时器。

可以直接用浏览器打开 `lesson3/index.html` 或 `lesson4/index.html`，无需联网。
复制课件时请保留对应的 `lesson3/` 或 `lesson4/` 文件夹及同级 `shared/` 文件夹。
左右方向键翻页，空格下一页，`F` 全屏，`Home` / `End` 跳到首页 / 末页；
右上角可打开教师参考与快捷键说明。浏览器打印可导出全部幻灯片。

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
- `http://SERVER_IP:8080/lesson3` — third presentation: English vocabulary
- `http://SERVER_IP:8080/lesson4` — fourth presentation: Chinese poetry
- `http://SERVER_IP:8080/lesson1/game.html` — first lesson's game
- `http://SERVER_IP:8080/lesson1/teacher.html` — first lesson's teacher notes
- `http://SERVER_IP:8080/lesson2/teacher.html` — second lesson's teacher notes
- `http://SERVER_IP:8080/lesson3/teacher.html` — third lesson's teacher notes
- `http://SERVER_IP:8080/lesson4/teacher.html` — fourth lesson's teacher notes

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
rebuilding (for example, `COPY lesson5/ /usr/share/nginx/html/lesson5/`).

View logs or stop the service:

```sh
docker compose logs -f
docker compose down
```

The service restarts automatically after a server reboot when Docker starts.
Presentation files are bundled into the image; no server-side database is needed.
Votes and other browser-saved state remain local to each browser.
