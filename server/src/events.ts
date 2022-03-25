import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { HookEvent } from "./types";
import { getAccessToken } from "./utils";
import { generateCallMsg, generateConfirmMsg } from "./messages";
import config from "config";

export const cancel = async (event: HookEvent) => {
  const deletedMessage = event.content.message;
  deletedMessage.subtype = "deleted";
  deletedMessage.id = undefined;
  await sendMessage(deletedMessage, {
    company_id: event.content.message.context.company_id,
    workspace_id: event.content.message.context.workspace_id,
    channel_id: event.content.message.context.channel_id,
    thread_id: event.content.message.context.thread_id,
  });
};

export const confirm = async (event: HookEvent) => {
  const room = event.content.message.context.room || "";

  const msg = {
    subtype: "application",
    blocks: generateCallMsg(event.content.user, room),
    user_id: event.user_id,
    context: { allow_delete: "everyone" },
  };

  cancel(event);

  await sendMessage(msg, {
    company_id: event.content.message.context.company_id,
    workspace_id: event.content.message.context.workspace_id,
    channel_id: event.content.message.context.channel_id,
    thread_id: event.content.message.context.thread_id,
  });
};

export const askConfirm = async (event: HookEvent) => {
  let room = uuidv4();
  if (event.content.command) room = event.content.command;

  const msg = {
    subtype: "application",
    blocks: generateConfirmMsg(event.content.user, room),
    ephemeral: {
      id: uuidv4(),
      recipient: event.user_id,
      recipient_context_id: event.connection_id,
    },
    context: {
      room: room,
      company_id: event.content.channel.company_id,
      workspace_id: event.content.channel.workspace_id,
      channel_id: event.content.channel.id,
      thread_id: event.content.thread?.id,
    },
  };

  await sendMessage(msg, {
    company_id: event.content.channel.company_id,
    workspace_id: event.content.channel.workspace_id,
    channel_id: event.content.channel.id,
    thread_id: event.content.thread?.id,
  });
};

//Send message
const sendMessage = async (
  message: any,
  options: {
    company_id: string;
    workspace_id: string;
    channel_id: string;
    thread_id?: string;
  }
) => {
  const url =
    config.get("credentials.endpoint") +
    (options.thread_id
      ? `/api/messages/v1/companies/${options.company_id}/threads/${options.thread_id}/messages`
      : `/api/messages/v1/companies/${options.company_id}/threads`);

  let data: any = {
    resource: message,
  };
  if (!options.thread_id) {
    data = {
      resource: {
        participants: [
          {
            type: "channel",
            id: options.channel_id,
            company_id: options.company_id,
            workspace_id: options.workspace_id,
          },
        ],
      },
      options: {
        message,
      },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
};
