import { HookEvent } from "./types";
import { t } from "./i18n";
import config from "config";

const server = ((config.get("jitsi.server") || "") as string).replace(
  /\/$/,
  ""
);

//Jitsi button to send in a message
export const generateCallMsg = (
  user: HookEvent["content"]["user"],
  room: string
) => {
  const lang = user?.preferences.locale || "";
  return [
    {
      type: "twacode",
      elements: [
        {
          type: "system",
          content: t(lang, "invite_text", [
            [user?.first_name, user?.last_name].join(" "),
          ]),
        },
        {
          type: "system",
          content: {
            type: "button",
            inline: "true",
            style: "primary",
            action_id: "show_link",
            content: `${server}/${room}`,
          },
        },
        { type: "br" },
        {
          type: "url",
          user_identifier: true,
          url: `${server}/${room}`,
          content: {
            type: "button",
            content: t(lang, "join_call"),
          },
        },
      ],
    },
  ];
};

// Ephemeral confirm message
export const generateConfirmMsg = (
  user: HookEvent["content"]["user"],
  room: string
) => {
  const lang = user?.preferences.locale || "";
  return [
    {
      type: "twacode",
      elements: [
        {
          type: "system",
          content: t(lang, "confirm_text", [room]),
        },
        { type: "br" },
        {
          type: "button",
          style: "default",
          action_id: "cancel",
          content: t(lang, "cancel"),
        },
        {
          type: "button",
          action_id: "confirm",
          content: t(lang, "confirm"),
        },
      ],
    },
  ];
};
