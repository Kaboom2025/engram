"""Hybrid retrieval engine — orchestrates vector, graph, temporal search + fusion."""

from __future__ import annotations

import asyncio
import time

from engram.config import EngramConfig
from engram.ingestion.embedder import Embedder
from engram.retrieval.classifier import classify_query
from engram.retrieval.context_assembler import assemble_context
from engram.retrieval.fusion import fuse_candidates
from engram.retrieval.graph_search import graph_search
from engram.retrieval.temporal_search import temporal_search
from engram.retrieval.vector_search import vector_search
from engram.storage.kuzu_backend import KuzuBackend
from engram.storage.lancedb_backend import LanceDBBackend
from engram.types import MemoryContext


class RetrievalEngine:
    def __init__(
        self,
        config: EngramConfig,
        graph: KuzuBackend,
        vector: LanceDBBackend,
        embedder: Embedder,
    ) -> None:
        self.config = config
        self.graph = graph
        self.vector = vector
        self.embedder = embedder

    async def search(
        self,
        query: str,
        user_id: str,
        tenant_id: str = "default",
        session_id: str | None = None,
        top_k: int = 10,
        token_budget: int = 4000,
    ) -> MemoryContext:
        """Full hybrid retrieval pipeline."""
        start = time.monotonic()

        # Step 1: Classify query to set weights
        weights = classify_query(query)

        # Step 2: Parallel retrieval fanout
        vector_results, graph_results, temporal_results = await asyncio.gather(
            vector_search(
                query=query,
                user_id=user_id,
                tenant_id=tenant_id,
                vector_store=self.vector,
                embedder=self.embedder,
                top_k=50,
            ),
            graph_search(
                query=query,
                user_id=user_id,
                tenant_id=tenant_id,
                graph=self.graph,
                max_hops=self.config.max_hops,
            ),
            temporal_search(
                query=query,
                user_id=user_id,
                tenant_id=tenant_id,
                graph=self.graph,
                config=self.config,
                session_id=session_id,
            ),
        )

        # Step 3: Weighted RRF fusion
        fused = fuse_candidates(vector_results, graph_results, temporal_results, weights)

        # Step 4: Context assembly (token-budget packing)
        context = await assemble_context(
            ranked_nodes=fused[:top_k * 3],  # consider more than top_k for budget packing
            graph=self.graph,
            token_budget=token_budget,
        )

        # Add retrieval metadata
        elapsed_ms = (time.monotonic() - start) * 1000
        context.retrieval_metadata.update({
            "retrieval_ms": round(elapsed_ms, 1),
            "weights": {"vector": weights.vector, "graph": weights.graph, "temporal": weights.temporal},
            "sources": {
                "vector": len(vector_results),
                "graph": len(graph_results),
                "temporal": len(temporal_results),
            },
        })

        return context
