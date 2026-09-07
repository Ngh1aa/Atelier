# Atelier project instructions

- Trả lời bằng tiếng Việt, ngắn gọn. Thực hiện công việc khi được yêu cầu.
- Trước khi sửa, đọc flow hiện tại và tìm component/utility để tái sử dụng.
- Giữ brand, style và kiến trúc hiện tại trừ khi user yêu cầu thay đổi.
- Không làm mất thay đổi của user. Không commit/push nếu chưa được yêu cầu.
- Kiểm tra phù hợp với thay đổi; nêu rõ những phần chưa verify.

## UI/UX skills

- Cấu hình project: `.uiux-profile.json`.
- Skill đã cài cho Codex: `.agents/skills/<skill-name>/SKILL.md`.
- Bản upstream đầy đủ: `.agents/skills_UIUX`; catalog: `.agents/skills/SKILL-CATALOG.md`.
- Với công việc UI/UX, đọc `project-context/SKILL.md` và
  `adaptive-skill-routing-and-context-budget/SKILL.md` trước, rồi chọn skill phù hợp.
- Với redesign lớn, dùng `website-delivery-pipeline/SKILL.md` và các entrypoint
  trong `.agents/skills/LATEST-3-PROMPT-REDESIGN-PIPELINE.md`.
- Chỉ đọc các skill liên quan task, không nạp toàn bộ thư viện vào context.
- Yêu cầu hiện tại của user và source thực tế được ưu tiên hơn mặc định của skill.
- Cài lại bằng `python scripts/setup-uiux-skills.py`. Revision được ghi trong
  `.uiux-profile.json`; kiểm tra thay đổi upstream trước khi cập nhật revision.
