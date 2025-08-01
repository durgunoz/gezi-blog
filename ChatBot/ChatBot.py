import requests
from dotenv import load_dotenv
import os
import psycopg2
import json

# Ortam değişkenlerini yükle
load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

conversation_memory = {}
MAX_MEMORY_LENGTH = 10

def get_user_profile(user_id):
    try:
        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT "Age", "Gender", "Nationality", "Occupation", "City"
                    FROM "UserProfiles"
                    WHERE "Id" = %s
                """, (user_id,))
                row = cur.fetchone()
        if row:
            return {
                "age": row[0],
                "gender": row[1],
                "nationality": row[2],
                "occupation": row[3],
                "city": row[4]
            }
    except Exception as e:
        print(f"Database error: {str(e)}")
    return None

def init_conversation(user_id, profile):
    custom_prompt = """
Sen kısa, net ve kararlı bir seyahat asistanısın.

Kurallar:
- Cevapların 3 cümleyi geçmesin.
- Sadece Türkçe konuş.
- Gereksiz soru sorma. Öneriye odaklan.
- Her cevabın somut bir yer ismi ve neden içersin.
- Kullanıcının yaşadığı şehirdeki yerleri önermemelisin.
"""
    conversation_memory[user_id] = [
        {"role": "system", "content": custom_prompt},
        {"role": "user", "content": "Selam! Bir tatil planlamak istiyorum."}
    ]

def shorten_response(text, max_sentences=3):
    sentences = text.strip().split('.')
    short = '.'.join([s.strip() for s in sentences if s.strip()][:max_sentences])
    return short + '.' if short and not short.endswith('.') else short

def filter_questions(text, max_questions=1):
    questions = [s for s in text.split('.') if '?' in s]
    if len(questions) > max_questions:
        text = '.'.join([s for s in text.split('.') if '?' not in s])
    return text.strip()

def chat(user_id, user_message):
    if user_message.strip().lower() in ["reset", "sıfırla"]:
        profile = get_user_profile(user_id)
        if not profile:
            return "Kullanıcı profili bulunamadı."
        init_conversation(user_id, profile)
        return "Sohbet sıfırlandı. Nasıl bir tatil düşünüyorsun?"

    if user_id not in conversation_memory:
        profile = get_user_profile(user_id)
        if not profile:
            return "Kullanıcı profili bulunamadı."
        init_conversation(user_id, profile)

    conversation_memory[user_id].append({"role": "user", "content": user_message})

    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",
                "messages": conversation_memory[user_id]
            },
            stream=True
        )

        assistant_reply = ""
        for line in response.iter_lines():
            if line:
                data = json.loads(line.decode("utf-8"))
                if "message" in data and "content" in data["message"]:
                    assistant_reply += data["message"]["content"]

        assistant_reply = filter_questions(assistant_reply)
        assistant_reply = shorten_response(assistant_reply)

        conversation_memory[user_id].append({"role": "assistant", "content": assistant_reply})

        if len(conversation_memory[user_id]) > MAX_MEMORY_LENGTH:
            initial_prompt = conversation_memory[user_id][0]
            last_user_input = {"role": "user", "content": user_message}
            conversation_memory[user_id] = [initial_prompt, last_user_input]

        return assistant_reply
    except Exception as e:
        return f"Hata oluştu: {str(e)}"
