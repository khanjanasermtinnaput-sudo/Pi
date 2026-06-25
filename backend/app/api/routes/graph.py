from fastapi import APIRouter, HTTPException
from app.models.schemas import GraphRequest, GraphResponse
from app.engines import graph_engine

router = APIRouter()


@router.post("/graph", response_model=GraphResponse)
async def generate_graph(request: GraphRequest):
    try:
        req_dict = {
            "expression": request.expression,
            "graph_type": request.graph_type,
            "x_range": request.x_range or [-10, 10],
            "y_range": request.y_range,
            "points": request.points or 500,
            "title": request.title,
            "extra": {},
        }

        graph_data = graph_engine.dispatch_graph(req_dict)
        return GraphResponse(success=True, graph_json=graph_data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
