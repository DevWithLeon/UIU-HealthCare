import wikipedia
import os

def download_medical_data():
    topics = ["First aid", "Cardiopulmonary resuscitation", "Paracetamol", "Ibuprofen", "Common cold", "Fever", "Infection", "Antibiotic", "Influenza", "Headache", "Abdominal pain"]
    content = ""
    for topic in topics:
        try:
            print(f"Downloading {topic}...")
            page = wikipedia.page(topic)
            content += f"\n\n= {topic} =\n\n" + page.content
        except Exception as e:
            print(f"Failed to download {topic}: {e}")
            
    with open("medical_book.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print("Medical book downloaded successfully!")

if __name__ == "__main__":
    download_medical_data()
