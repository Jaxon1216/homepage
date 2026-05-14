# Repository AGENTS

## 默认协作约定

- 默认使用中文沟通。
- 除非用户明确要求，不要创建 commit、不要 push。

## Commit 约定

- 提交信息风格遵循本仓库既有历史，优先使用：`feat:`、`fix:`、`chore:`、`docs:`。
- 标题保持简洁，一行概括本次改动的主要目的，避免写成长段描述。
- 优先描述“为什么改”或“这次改动的核心结果”，不要堆砌实现细节。

### 参考格式

- `feat: add xxx`
- `fix: resolve xxx issue`
- `chore: refresh xxx`
- `docs: add xxx post`

## 提交前检查

- 先看 `git status`，确认只提交本次相关文件。
- 先看 `git diff --staged --stat` / `git diff`，确认提交内容和范围准确。
- 提交信息尽量和最近 commit 风格保持一致。
