"""Tests for query classifier."""

from engram.retrieval.classifier import classify_query


def test_temporal_query():
    w = classify_query("When did we last discuss the backend?")
    assert w.temporal > w.vector
    assert w.temporal > w.graph


def test_factual_query():
    w = classify_query("What is the user's email address?")
    assert w.graph > w.vector
    assert w.graph > w.temporal


def test_preference_query():
    w = classify_query("Does the user prefer dark mode?")
    assert w.vector > w.graph
    assert w.vector > w.temporal


def test_default_query():
    w = classify_query("Tell me something interesting")
    assert w.vector == 0.35
    assert w.graph == 0.40
    assert w.temporal == 0.25


def test_recently_keyword():
    w = classify_query("What was recently added to the project?")
    assert w.temporal == 0.50
