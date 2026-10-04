# Generated from the shared API contract.
from typing import TypedDict, NotRequired, Literal

ContentSourceItem = TypedDict("ContentSourceItem", {"label": str, "url": str, "recorded_at": str, "precision": Literal["day", "month"]})

ContentCostAmount = TypedDict("ContentCostAmount", {"currency": Literal["INR"], "minor_unit": Literal["paise"], "amount_minor": int, "decimal": str})

ContentCost = TypedDict("ContentCost", {"amount": ContentCostAmount, "category": str, "scope": str, "kind": str, "counted": bool, "precision": Literal["day", "month", "billing_cycle", "undated", "cumulative"], "from": str | None, "to": str | None, "coverage": str})

ContentWork = TypedDict("ContentWork", {"date": str, "date_semantics": Literal["Local calendar day in Asia/Kolkata, not an instant"], "state": Literal["worked", "no_work"], "crew": int | None, "crew_precision": Literal["exact", "minimum", "unknown"], "activities": list[str]})

ContentSummaryTotal = TypedDict("ContentSummaryTotal", {"currency": Literal["INR"], "minor_unit": Literal["paise"], "amount_minor": int, "decimal": str})

ContentSummaryMonthlyItemAmount = TypedDict("ContentSummaryMonthlyItemAmount", {"currency": Literal["INR"], "minor_unit": Literal["paise"], "amount_minor": int, "decimal": str})

ContentSummaryMonthlyItem = TypedDict("ContentSummaryMonthlyItem", {"month": str, "amount": ContentSummaryMonthlyItemAmount})

ContentSummaryCategoriesItemAmount = TypedDict("ContentSummaryCategoriesItemAmount", {"currency": Literal["INR"], "minor_unit": Literal["paise"], "amount_minor": int, "decimal": str})

ContentSummaryCategoriesItem = TypedDict("ContentSummaryCategoriesItem", {"id": str, "label": str, "amount": ContentSummaryCategoriesItemAmount})

ContentSummaryStage = TypedDict("ContentSummaryStage", {"datum": Literal["basement_floor"], "lintel_ft_approx": float, "walls_ft_approx": float, "roof_cast": bool, "basement_ft_stated": float | None, "slab_in_stated": float | None, "roof_work": str | None, "roof_work_as_of": str | None})

ContentSummary = TypedDict("ContentSummary", {"total": ContentSummaryTotal, "monthly": list[ContentSummaryMonthlyItem], "categories": list[ContentSummaryCategoriesItem], "work_entries": int, "worker_days_minimum": int, "worker_days_is_lower_bound": bool, "stage": ContentSummaryStage})

Content = TypedDict("Content", {"id": str, "kind": Literal["page", "summary", "cost", "work"], "title": str, "description": str, "canonical": str, "last_updated": str, "revision": str, "language": Literal["en"], "visibility": Literal["public"], "source": list[ContentSourceItem], "review": Literal["owner_reviewed", "source_checked"] | None, "text": str, "cost": NotRequired[ContentCost], "work": NotRequired[ContentWork], "summary": NotRequired[ContentSummary]})

ContentPageItemsItem = TypedDict("ContentPageItemsItem", {"id": str, "kind": Literal["page", "summary", "cost", "work"], "title": str, "description": str, "canonical": str, "last_updated": str, "revision": str})

ContentPage = TypedDict("ContentPage", {"items": list[ContentPageItemsItem], "next_cursor": str | None, "snapshot": str, "limit": int})

SiteLinks = TypedDict("SiteLinks", {"developers": str, "guide": str, "markdown": str, "openapi": str, "catalog": str, "mcp": str, "auth": str})

Site = TypedDict("Site", {"name": Literal["Agam"], "origin": str, "description": str, "api_version": str, "published_at": str, "authentication": Literal["none; public read only"], "pricing": Literal["Free informational access; no checkout"], "capabilities": list[str], "links": SiteLinks})

Problem = TypedDict("Problem", {"type": str, "title": str, "status": int, "detail": str, "instance": str, "code": str, "request_id": str})
