# 🧪 Калькулятор сплавов

Веб-приложение для расчёта состава сплавов и количества слитков из руды. Поддерживает системные и пользовательские рецепты, сохранение и удаление рецептов, переключение между светлой и тёмной темой, а также вкладку для пересчёта руды в слитки.

---

## 🔧 Функциональность

### 📌 Основные возможности

- Выбор рецепта сплава из выпадающего списка.
- Отображение компонентов с возможностью прибавления/убавления количества.
- Автоматический расчёт процентного состава, объёма в mB и количества слитков.
- Подсветка валидных/невалидных компонентов в зависимости от допустимых границ.
- Подсчёт итогового объёма и количества слитков.

### ➕ Добавление пользовательских рецептов

- Ввод названия и от 1 до 4 компонентов.
- Указание допустимого процентного диапазона каждого компонента.
- Сохранение в `user_recipes.json` на сервере.

### ❌ Удаление рецептов

- Удаляются только пользовательские рецепты.
- Системные рецепты защищены от удаления.

### ⚖️ Конвертер руды в слитки

- Поддержка 3 видов руды: бедная (24 mB), нормальная (36 mB), богатая (48 mB).
- Расчёт количества слитков из введённого количества руды.
- Красивое форматирование результатов.

### 🌙 Переключение темы

- Светлая и тёмная тема.
- Переключатель в верхней панели.
- Сохраняется в `localStorage`.

---

## 💻 Технологии

- **Backend**: Python 3.11+, FastAPI
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Шаблоны**: Jinja2
- **Файл данных**: `user_recipes.json` (локальное хранение пользовательских рецептов)

---

## 🚀 Установка и запуск

1. Клонируй репозиторий:

```bash
git clone https://github.com/your_username/alloy-calculator.git
cd alloy-calculator


