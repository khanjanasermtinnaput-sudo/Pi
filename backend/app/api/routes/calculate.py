from fastapi import APIRouter, HTTPException
from app.models.schemas import CalculateRequest, CalculateResponse, ParseRequest, ParseResponse
from app.engines import math_engine, parser

router = APIRouter()


@router.post("/calculate", response_model=CalculateResponse)
async def calculate(request: CalculateRequest):
    try:
        # Parse input into structured operation
        parsed = await parser.parse_input(request.input)
        # Override variable if specified
        if request.variable and request.variable != "x":
            parsed["variable"] = request.variable
        # Merge extra params from request
        if request.extra:
            parsed.setdefault("extra", {})
            parsed["extra"].update(request.extra)

        # Dispatch to math engine
        result = math_engine.dispatch(parsed)

        # Handle engine-level errors
        if isinstance(result, dict) and result.get("success") is False:
            return CalculateResponse(
                success=False,
                operation=parsed.get("operation", "unknown"),
                input=request.input,
                error=result.get("error", "Computation failed"),
                parsed=parsed,
            )

        return CalculateResponse(
            success=True,
            operation=result.get("operation", parsed.get("operation", "unknown")),
            input=request.input,
            result=result.get("result"),
            result_latex=result.get("result_latex"),
            result_numeric=result.get("result_numeric"),
            steps=[s for s in result.get("steps", [])],
            parsed=parsed,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/parse", response_model=ParseResponse)
async def parse_only(request: ParseRequest):
    try:
        result = await parser.parse_input(request.text)
        return ParseResponse(
            success=True,
            operation=result.get("operation"),
            expression=result.get("expression"),
            variable=result.get("variable"),
            extra=result.get("extra", {}),
            raw_input=request.text,
        )
    except Exception as e:
        return ParseResponse(success=False, raw_input=request.text, error=str(e))


@router.get("/constants")
async def get_constants():
    return {
        "physics": {k: str(v) for k, v in math_engine.PHYSICS_CONSTANTS.items()},
        "math": {"pi": "3.14159265358979...", "e": "2.71828182845905...", "phi": "1.61803398874989..."},
    }


@router.get("/formulas")
async def get_formulas():
    return {
        k: {"formula": v["formula"], "description": v["description"], "variables": v["variables"]}
        for k, v in math_engine.PHYSICS_FORMULAS.items()
    }
