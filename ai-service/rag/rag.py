from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from dotenv import load_dotenv

load_dotenv()

embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

def search_docs(query: str):
    try:
        vector_db = QdrantVectorStore.from_existing_collection(
            embedding=embedding_model,
            url="http://localhost:6333",
            collection_name="resume_collection"   
        )

        results = vector_db.similarity_search(query, k=4)

        if not results:
            return "No resume data found."

        return "\n".join([doc.page_content for doc in results])

    except Exception as e:
        print("❌ RAG ERROR:", e)
        return "No resume data found."