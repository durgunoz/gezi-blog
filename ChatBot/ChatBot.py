import requests
from dotenv import load_dotenv
import os
import psycopg2
import json

# Ortam değişkenlerini yükle
load_dotenv()

# Veritabanı bağlantı bilgileri
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# Kullanıcıya ait geçmiş mesajları tutar
conversation_memory = {}

# Veritabanından kullanıcı profilini çek
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
        else:
            print(f"User not found with ID = {user_id}")
    except Exception as e:
        print(f"Database error: {str(e)}")
    return None

# Konuşmayı başlat
def init_conversation(user_id, profile):
    custom_prompt = f"""
Sen yardımcı ve samimi bir seyahat asistanısın.

Görevin, kullanıcıya kişiselleştirilmiş bir tatil planlamasında adım adım sorular sorarak rehberlik etmek.

Kullanıcı profili:
- Yaş: {profile['age']}
- Cinsiyet: {profile['gender']}
- Uyruk: {profile['nationality']}
- Meslek: {profile['occupation']}
- Yaşadığı şehir: {profile['city']}

🧠 Davranış Kuralları:
- Sohbete kullanıcıyı selamlayarak başla ve nasıl bir tatil aradığını sor (örneğin: deniz, doğa, kültür, macera, dinlenme).
- Hemen destinasyon önerme!
- Önce kullanıcının seyahat tercihlerini öğren (mevsim, iklim, bütçe, yalnız mı grup halinde mi seyahat ediyor vb.).
- Kullanıcının yaşadığı şehirdeki yerleri önermemelisin — ancak kullanıcı özellikle isterse olabilir.
- Kullanıcının şehrinden kolay ulaşılabilecek yerleri önceliklendir (vizesiz, direkt ulaşım vs.).
  Örneğin: İstanbul’da yaşayan bir Türk için Karadağ, Gürcistan, Arnavutluk, Kuzey Kıbrıs gibi yerler uygun.
- En iyi tatil yerini bulmak için birkaç kez üst üste soru sor.
- Konuşma doğal ve insan gibi akmalı, robot gibi olmasın.

🎯 Hedef:
Ancak kullanıcının isteklerini, süresini ve kısıtlarını öğrendikten sonra; ona 2-3 uygun destinasyon öner ve nedenlerini açıkla.
"""
    conversation_memory[user_id] = [
        {"role": "user", "content": custom_prompt},
        {"role": "user", "content": "Selam! Bir tatil planlamak istiyorum."}
    ]

# Chat fonksiyonu
def chat(user_id, user_message):
    if user_message.strip().lower() in ["reset", "sıfırla"]:
        # reset komutu geldiyse sıfırla ve yeniden başlat
        profile = get_user_profile(user_id)
        if not profile:
            return "Kullanıcı profili bulunamadı."
        init_conversation(user_id, profile)
        return "Sohbet sıfırlandı. Hazırsan nasıl bir tatil hayal ettiğini bana anlat!"

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

        conversation_memory[user_id].append({"role": "assistant", "content": assistant_reply})
        return assistant_reply
    except Exception as e:
        return f"An error occurred: {str(e)}"

# # CLI Test
# if __name__ == "__main__":
#     user_id = 2  # örnek kullanıcı ID
#     print("Welcome to your travel assistant chatbot! (Type 'exit' to quit, or 'reset' to restart)")

#     while True:
#         msg = input("You: ")
#         if msg.lower() in ["exit", "quit", "çık"]:
#             print("Goodbye! Safe travels. 🌍")
#             break
#         yanit = chat(user_id, msg)
#         print("Bot:", yanit)
