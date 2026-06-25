from pydantic import BaseModel
from typing import Any, Optional, List, Union


class CalculateRequest(BaseModel):
    input: str
    mode: Optional[str] = "auto"  # auto | expression | natural_language
    variable: Optional[str] = "x"
    extra: Optional[dict] = {}


class Step(BaseModel):
    index: int
    description: str
    expression: Optional[str] = None
    latex: Optional[str] = None


class CalculateResponse(BaseModel):
    success: bool
    operation: str
    input: str
    result: Optional[str] = None
    result_latex: Optional[str] = None
    result_numeric: Optional[str] = None
    steps: List[Step] = []
    graph_data: Optional[dict] = None
    error: Optional[str] = None
    domain: Optional[str] = None
    parsed: Optional[dict] = None


class GraphRequest(BaseModel):
    expression: str
    graph_type: str = "2d"  # 2d | 3d | parametric | polar
    x_range: Optional[List[float]] = [-10, 10]
    y_range: Optional[List[float]] = None
    z_range: Optional[List[float]] = None
    variable: Optional[str] = "x"
    variable2: Optional[str] = "y"
    points: Optional[int] = 500
    title: Optional[str] = None


class GraphResponse(BaseModel):
    success: bool
    graph_json: Optional[dict] = None
    error: Optional[str] = None


class ParseRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class ParseResponse(BaseModel):
    success: bool
    operation: Optional[str] = None
    expression: Optional[str] = None
    variable: Optional[str] = None
    extra: Optional[dict] = {}
    raw_input: Optional[str] = None
    error: Optional[str] = None
