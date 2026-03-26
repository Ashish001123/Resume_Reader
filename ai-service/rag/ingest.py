from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv
load_dotenv()

def index_resume(file_path: str):

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "]
    )

    chunks = splitter.split_documents(docs)

    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-large"
    )

    QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embedding_model,
        url="http://localhost:6333",
        collection_name="resume_collection"
    )

    print("✅ Resume indexed successfully")

if __name__ == "__main__":
    index_resume("../resume.pdf") 