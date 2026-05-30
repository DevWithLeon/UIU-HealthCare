from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Initialize AI models and Vector Store
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = None
retrieval_chain = None

def initialize_kb():
    global vector_store, retrieval_chain
    try:
        if not os.path.exists("medical_book.txt"):
            print("medical_book.txt not found. Please run download_book.py first.")
            return

        loader = TextLoader("medical_book.txt", encoding="utf-8")
        docs = loader.load()
        
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        vector_store = FAISS.from_documents(splits, embeddings)
        
        from langchain_groq import ChatGroq
        
        # Use Groq API instead of Google GenAI
        llm = ChatGroq(model="llama3-8b-8192", groq_api_key=os.getenv("GROQ_API_KEY"))
        system_prompt = (
            "You are a medical assistant chatbot. Use the following pieces of retrieved medical context to answer the question. "
            "If the question is NOT related to medicine, health, or first aid, politely decline to answer. "
            "If you don't know the answer, say that you don't know. "
            "Use three sentences maximum and keep the answer concise.\n\n"
            "{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})
        retrieval_chain = create_retrieval_chain(retriever, question_answer_chain)
        print("Knowledge base initialized successfully!")
    except Exception as e:
        print(f"Error initializing KB: {e}")

@app.on_event("startup")
async def startup_event():
    initialize_kb()

@app.post("/chat")
async def chat(request: ChatRequest):
    if not retrieval_chain:
        raise HTTPException(status_code=500, detail="Knowledge base not initialized.")
    
    try:
        response = retrieval_chain.invoke({"input": request.message})
        return {"response": response["answer"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
