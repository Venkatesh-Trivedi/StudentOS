# Architecture Rules

- UI components must not directly manage permanent storage.
- Feature logic should remain inside its feature folder.
- Shared components must not contain subject-specific business logic.
- Data models should be typed.
- Business rules should be testable without rendering the UI.
- One feature should not silently edit another feature's data.
- Do not add a dependency unless it solves a real current problem.