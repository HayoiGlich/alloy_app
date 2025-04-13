from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from presets import PRESETS
import pathlib
import json

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

USER_RECIPE_FILE = pathlib.Path("user_recipes.json")


def load_user_recipe() -> dict:
    try:
        # Пример: загрузка из JSON-файла
        with USER_RECIPE_FILE.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}  # Возвращаем пустой словарь вместо None


def save_user_recipe(data: dict):
    with USER_RECIPE_FILE.open("w", encoding="utf-8") as file:
        json.dump(data, file)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/get_presets")
async def get_presets():
    user_recipes = load_user_recipe()
    return {
        "all": {**PRESETS, **(user_recipes or {})},
        "user": user_recipes or {}}


@app.post("/save_recipe")
async def save_recipe(data: dict):
    name = data["name"]
    if name in PRESETS:
        return {"status": "error", "message": "Recipe name already exists."}

    user_recipes = load_user_recipe()
    user_recipes[name] = {"components": data["components"]}
    save_user_recipe(user_recipes)
    return {"status": "ok"}


@app.post("/delete_recipe")
async def delete_recipe(data: dict):
    name = data["name"]
    user_recipes = load_user_recipe()
    if name in user_recipes:
        del user_recipes[name]
        save_user_recipe(user_recipes)
    return {"status": "deleted"}


@app.post("/calculate")
async def calculate(data: dict):
    clicks = data["clicks"]
    preset = data["preset"]
    total_mb = sum(clicks) * 144
    result = []

    for i, comp in enumerate(preset["components"]):
        name, min_pct, max_pct = comp
        mb = clicks[i] * 144
        percent = (mb / total_mb) * 100 if total_mb > 0 else 0
        result.append({
            "name": name,
            "mb": mb,
            "percent": percent,
            "slitki": clicks[i],
            "valid": min_pct <= percent <= max_pct
        })

    return JSONResponse({
        "result": result,
        "total_mb": total_mb,
        "total_slitki": total_mb / 144
    })


@app.post("/calculate_ore")
async def calculate_ore(data: dict):
    poor = int(data.get("poor", 0))
    normal = int(data.get("normal", 0))
    rich = int(data.get("rich", 0))

    total_poor = (poor * 24) / 144
    total_normal = (normal * 36) / 144
    total_rich = (rich * 48) / 144
    total = total_poor + total_normal + total_rich

    return {
        "poor": total_poor,
        "normal": total_normal,
        "rich": total_rich,
        "total": total
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
