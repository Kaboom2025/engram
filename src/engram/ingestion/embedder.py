"""Embedding generation — local (sentence-transformers) or cloud (OpenAI)."""

from __future__ import annotations

import asyncio
from functools import partial

from engram.config import EngramConfig


class Embedder:
    def __init__(self, config: EngramConfig) -> None:
        self.config = config
        self._model = None
        self._client = None

    def _ensure_local_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.config.embedding_model)

    async def embed(self, text: str) -> list[float]:
        """Embed a single text string."""
        if self.config.local:
            return await self._embed_local(text)
        return await self._embed_cloud(text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts."""
        if self.config.local:
            return await self._embed_local_batch(texts)
        return await self._embed_cloud_batch(texts)

    async def _embed_local(self, text: str) -> list[float]:
        def _encode():
            self._ensure_local_model()
            return self._model.encode(text, normalize_embeddings=True).tolist()

        return await asyncio.get_event_loop().run_in_executor(None, _encode)

    async def _embed_local_batch(self, texts: list[str]) -> list[list[float]]:
        def _encode():
            self._ensure_local_model()
            embeddings = self._model.encode(texts, normalize_embeddings=True, batch_size=64)
            return [e.tolist() for e in embeddings]

        return await asyncio.get_event_loop().run_in_executor(None, _encode)

    async def _embed_cloud(self, text: str) -> list[float]:
        results = await self._embed_cloud_batch([text])
        return results[0]

    async def _embed_cloud_batch(self, texts: list[str]) -> list[list[float]]:
        import openai

        if self._client is None:
            self._client = openai.AsyncOpenAI(
                api_key=self.config.extraction_api_key or self.config.api_key
            )

        response = await self._client.embeddings.create(
            model=self.config.cloud_embedding_model,
            input=texts,
        )
        return [item.embedding for item in response.data]
