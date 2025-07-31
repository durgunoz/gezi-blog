from fastapi import FastAPI, Request
from pydantic import BaseModel
from ChatBot import chat  # Chat fonksiyonu zaten orada

app = FastAPI()

class ChatInput(BaseModel):
    user_id: int
    message: str

@app.post("/chat")
def chat_handler(input: ChatInput):
    response = chat(user_id=input.user_id, user_message=input.message)
    return {"reply": response}
