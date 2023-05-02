//import { createParser } from "eventsource-parser";
import { createParser } from "https://cdn.jsdelivr.net/npm/eventsource-parser@1.0.0/+esm";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { errorMessages } from "./messages.js";
import { streamMethod } from "./stream.js";
import { set_storage } from "./storage.js";

export const get_response = async (
  accessToken,
  query,
  controller,
  convoInfo
) => {
  let cleared = false;
  let timeout,
    response = "";
  let timestamp = Date.now();

  try {
    if (query == null || query.trim() === "") throw new Error("prompt");

    timeout = setTimeout(() => controller.abort("timeout"), 3000);
    const modelName = await getModelName(accessToken, controller);
    clearTimeout(timeout);
    timeout = setTimeout(() => controller.abort("timeout"), 15000);

    await fetch_method(
      controller,
      accessToken,
      query,
      modelName,
      convoInfo,
      (segment) => {
        if (segment === "[DONE]") return;
        try {
          const data = JSON.parse(segment);
          if (!cleared) {
            clearTimeout(timeout);
            /*setConvoInfo({
              convoId: data.conversation_id,
              parentMessageId: data.message.id,
            });*/
            set_storage("convoInfo", [data.conversation_id, data.message.id]);
            cleared = true;
          }

          response = data.message.content.parts[0];

          let now = Date.now();
          if (now - timestamp > 100) {
            set_storage("query", [query, response + errorMessages.closed]);
            timestamp = now;
          } else {
            //setResponse(response);
            console.log("Response:", response);
          }
        } catch (err) {
          return;
        }
      }
    );
    clearTimeout(timeout);

    await set_storage("query", [query, response]);
  } catch (err) {
    console.log(err);
    clearTimeout(timeout);

    if (controller == null || err.message === "prompt") {
      await set_storage("query", [query, errorMessages.prompt]);
      console.log("response:", errorMessages.prompt);
      //setResponse(errorMessages.prompt);
    } else if (controller.signal.reason === "user") {
      await set_storage("query", [query, response + errorMessages.abort]);
      console.log("response:", response + errorMessages.abort);
      //setResponse(response + errorMessages.abort);
    } else if (controller.signal.reason === "timeout") {
      await set_storage("query", [query, response + errorMessages.timeout]);
      console.log("response:", response + errorMessages.timeout);
      //setResponse(response + errorMessages.timeout);
    } else if (err.message === "fetch") {
      await set_storage("query", [query, response + errorMessages.denied]);
      console.log("response:", response + errorMessages.denied);
      //setResponse(response + errorMessages.denied);
    } else if (err.message === "not-found") {
      await set_storage("query", [query, errorMessages.notFound]);
      console.log("response:", errorMessages.notFound);
      //setResponse(errorMessages.notFound);
    } else {
      await set_storage("query", [query, response + errorMessages.standard]);
      console.log("response:", esponse + errorMessages.standard);
      //setResponse(response + errorMessages.standard);
    }
  } finally {
    return;
  }
};

async function getModelName(accessToken, controller) {
  console.log("accessToken:", accessToken);
  const models = await fetch(`https://chat.openai.com/backend-api/models`, {
    method: "GET",
    signal: controller == null ? null : controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const modelsJson = await models.json();
  console.log("modelsJson:", modelsJson);
  return modelsJson.models[0].slug;
}

async function fetch_method(
  controller,
  accessToken,
  query,
  modelName,
  convoInfo,
  callback
) {
  const resp = await fetch("https://chat.openai.com/backend-api/conversation", {
    method: "POST",
    signal: controller == null ? null : controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: "next",
      conversation_id: convoInfo.convoId ? convoInfo.convoId : null,
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [query],
          },
        },
      ],
      model: modelName,
      parent_message_id: convoInfo.parentMessageId
        ? convoInfo.parentMessageId
        : uuidv4(),
    }),
  });

  if (resp.status === 404) {
    throw new Error("not-found");
  }

  if (!resp.ok) {
    throw new Error("fetch");
  }

  const parser = createParser((event) => {
    if (event.type === "event") {
      callback(event.data);
    }
  });

  for await (const segment of streamMethod(resp.body)) {
    const decoded = new TextDecoder().decode(segment);
    parser.feed(decoded);
  }
}
