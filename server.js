import { createServer } from "https"
import { parse } from "url"
import next from "next"
import fs from "fs"
const DEV = process.env.NODE_ENV !== "production"
const app = next({ dev: DEV })
const handle = app.getRequestHandler()
const httpsOptions = {
  key: fs.readFileSync("../localhost-cert/localhost.key"),
  cert: fs.readFileSync("../localhost-cert/localhost.crt"),
}
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log("> Server started on https://localhost:3000")
  })
})