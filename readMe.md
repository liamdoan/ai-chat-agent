Demo at: https://ai-chat-agent-frontend.vercel.app/

This project aims to replicate the core experience of `ChatGPT`/`Google Gemini` AI web app:

- Leverages `Google Gemini 2.0 Flash` model to generate responses based on user inputs,
  supporting text and image prompts.
- Maintain conversational history to allow context-aware responses.

## Focus

### Gemini Ai Service (`/src/core/aiLibrary/gemini.ts`):

This handles interaction between the app and `Gemini 2.0 Flash` model.

- Send user prompts (text, or text + image) to Gemini for response generation.
- Auto retry requests if the model is overloaded or temporarily fails.
- Stream response to UI innreal time.
- Maintain conversation history and context.

### Frontend focus:

- Utilize `BrowserRouter`.
- Leverage custom hook, aim to minimize business logic from UI logic in components.
- Seamless UI, properly handle loading states.
- Centralize messages, avoid seperate texts/message in components.

### Backend focus:

- API to fetch chat info data.
- Future integration: authorization and authentication

### Stacks in this demo

- Frontend: `React + Vite`
- Backend: `NodeJS + Express`
- DB: `MongoDB`

`Future: manage AUTH methods, only authenticated user can access their own data.`

`This project is ready to integrate with` [MERN full Auth model](https://github.com/liamdoan/react-MERN-auth-module) `project.`
