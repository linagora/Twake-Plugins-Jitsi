import express from "express";
import config from "config";
import { HookEvent } from "./types";
import { askConfirm, cancel, confirm } from "./events";

const prefix_conf = config.get("server.prefix");
const prefix =
  (prefix_conf ? "/" : "") +
  ((prefix_conf || "") as string).replace(/(^\/|\/$)/g, "");

const app = express();
app.use(express.json());

app.use(prefix + "/assets", express.static(__dirname + "/../assets"));

// Entrypoint for every events comming from Twake
app.post(prefix + "/hook", async (req, res) => {
  const event = req.body as HookEvent;

  if (event.type === "action" && event.name === "open") {
    //Open confirmation message
    return res.send(await askConfirm(event));
  } else if (
    event.type === "interactive_message_action" &&
    event.name === "cancel"
  ) {
    //Close the confirmation message
    return res.send(await cancel(event));
  } else if (
    (event.type === "interactive_message_action" && event.name === "confirm") ||
    (event.type === "action" && event.name === "command")
  ) {
    //Send the jitsi link in the chat for real
    return res.send(await confirm(event));
  }

  res.send({ error: "Not implemented" });
});

const port = config.get("server.port");
app.listen(port, (): void => {
  console.log(`Plugin started on port ${port}`);
});
