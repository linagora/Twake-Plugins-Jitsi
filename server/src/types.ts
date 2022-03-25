export type HookEvent = {
  type: "action" | "interactive_message_action" | "hook";
  name?: string;
  connection_id?: string;
  user_id?: string;
  content: {
    command?: string;
    channel?: any;
    thread?: any;
    message?: any;
    user?: {
      preferences: {
        locale: string;
      };
      first_name: string;
      last_name: string;
    };
  };
};
